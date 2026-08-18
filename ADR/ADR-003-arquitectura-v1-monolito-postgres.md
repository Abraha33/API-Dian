# ADR-003: Arquitectura V1 — monolito modular, PostgreSQL autoritativo y topología mínima

- **Estado:** Aprobado
- **Fecha:** 2026-08-18
- **Reemplaza en arquitectura V1:** partes sustantivas de ADR-001 y ADR-002
- **Requisitos trazados:** `docs/v1-requisitos.md`

## Contexto

V1 es infraestructura fiscal interna del POS propio:

```text
POS propio → API fiscal propia → 1 PT habilitado → DIAN
```

Una sola persona desarrolla, mantiene y opera inicialmente el sistema. Los riesgos dominantes son duplicación fiscal, resultado remoto ambiguo, fuga entre tenants, pérdida de evidencia, dependencia del PT y complejidad operacional innecesaria.

La arquitectura debe favorecer razonamiento determinista y recuperación por encima de escalabilidad especulativa.

## Decisión

### 1. Estilo: monolito modular

V1 será un **monolito modular** en un único repositorio y una única frontera de dominio desplegable.

No se crean microservicios, gateway, service mesh, Kubernetes ni broker distribuido.

Los límites lógicos mínimos son:

```text
platform
  ├─ auth / autorización
  └─ tenant context

fiscal
  ├─ operaciones / documentos
  ├─ validación
  ├─ idempotencia
  └─ máquina de estados

provider
  ├─ FiscalProvider
  └─ un adaptador PT

reconciliation
  └─ consulta y resolución de resultados ambiguos

evidence
  ├─ intentos/respuestas PT
  ├─ auditoría
  └─ metadatos de XML/PDF

operations
  ├─ trabajo durable
  ├─ health/readiness
  └─ logs/métricas/alertas
```

Estos son límites de dependencia, no servicios de red independientes.

### 2. Runtime y framework

Se conserva **TypeScript estricto + NestJS + Fastify** para evitar churn sin beneficio demostrable. Nest mantiene soporte oficial para `FastifyAdapter`.

La línea de ejecución V1 se fija en **Node.js 24 LTS** al iniciar la implementación de F2/F3. Node 20 ya está EOL a la fecha de este ADR; no debe seguir siendo el runtime productivo por inercia histórica.

No se congela en este ADR una versión exacta de parche de Node/Nest; CI y despliegue deben pinnear versiones reproducibles cuando comience implementación.

### 3. PostgreSQL es la autoridad transaccional

V1 tendrá **un solo PostgreSQL administrado** como fuente autoritativa del estado interno.

En PostgreSQL viven, como mínimo:

- operaciones fiscales lógicas;
- idempotencia y fingerprint semántico;
- estado fiscal interno;
- intentos contra el PT;
- identificadores de correlación;
- trabajo durable/reintentos programados;
- metadata de auditoría/evidencia;
- referencias y checksums de artefactos.

Caches, memoria del proceso, object storage o una cola no pueden ser fuente única de verdad.

Supabase/PostgreSQL se mantiene como opción preferente por el trabajo ya realizado, pero la aprobación productiva del proveedor depende de F3: RLS/aislamiento, backup, restauración y coste operativo.

### 4. Async V1: cola durable en PostgreSQL, sin Redis/BullMQ

**Redis + BullMQ dejan de formar parte de la arquitectura productiva V1.**

El trabajo asíncrono necesario se modelará en una tabla durable de PostgreSQL, reclamada por workers mediante locking/lease transaccional. PostgreSQL documenta `FOR UPDATE ... SKIP LOCKED` como mecanismo apropiado para evitar contención entre consumidores de una tabla tipo cola.

El detalle SQL final pertenece a F3, pero deben cumplirse estas propiedades:

- un job no se pierde por reinicio de proceso;
- reclamar trabajo no equivale a completar el side effect;
- leases expirados son recuperables;
- el estado fiscal no depende del estado efímero del worker;
- los reintentos se programan de forma persistida.

Redis podrá reintroducirse en otra versión solo si existe carga medida o requisito que PostgreSQL no resuelva razonablemente.

### 5. Único camino para side effects fiscales

El proceso HTTP **no invoca mutaciones fiscales del PT directamente**.

Flujo base:

```text
POS
 ↓
HTTP API
 ↓  transacción local
PostgreSQL: operación + idempotencia + trabajo durable
 ↓
Worker del mismo monolito
 ↓
FiscalProvider
 ↓
PT
```

La respuesta al comando del POS confirma recepción/persistencia local y entrega un identificador estable de operación. La finalización fiscal se obtiene desde el estado de la operación.

Una optimización futura podría esperar brevemente un resultado ya procesado, pero no puede cambiar esta semántica ni permitir que el request HTTP tenga una segunda ruta de emisión.

### 6. Roles de ejecución, no microservicios

El mismo código/artefacto puede arrancar en dos roles:

- `api`: recepción, validación inicial, consultas y health;
- `worker`: procesamiento fiscal, reconciliación y recuperación de artefactos.

Pueden ejecutarse como procesos/instancias separados para aislar fallos, pero comparten versión, modelo, base y despliegue. No se definen contratos de red internos entre ellos.

Inicialmente basta una instancia de cada rol, salvo medición que justifique otra cosa.

### 7. Artefactos

XML validado, PDF/representación y respuestas grandes que deban conservarse pueden ir a **object storage administrado**.

La base conserva siempre la referencia inequívoca, tipo, tamaño, checksum, tenant, operación y procedencia. El proveedor exacto de storage se decide en F3/F4 según coste, durabilidad, cifrado y operación; no se levanta MinIO en producción.

### 8. Observabilidad mínima

Se conserva Pino/logging estructurado. No se despliega una pila propia Prometheus/Grafana/ELK en V1 salvo necesidad posterior.

La plataforma productiva debe permitir como mínimo:

- logs estructurados y correlación;
- métricas de operaciones por estado;
- contador/edad del backlog de `UNKNOWN`/reconciliación;
- errores del PT separados de errores propios;
- health/readiness;
- alertas de alto valor.

El proveedor administrado concreto se decide con la topología de despliegue.

### 9. Servicios administrados y topología

La topología productiva objetivo es deliberadamente pequeña:

```text
                ┌──────────────┐
POS ───────────▶│ API runtime  │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ PostgreSQL   │  ← autoridad
                │ administrado │
                └──────┬───────┘
                       ▲
                       │
                ┌──────┴───────┐
                │ Worker       │──────▶ PT habilitado
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Object store │  ← artefactos, no estado
                └──────────────┘
```

Secret manager y observabilidad se consumen como capacidades administradas de la plataforma, no como servicios propios adicionales.

## Decisiones expresamente rechazadas en V1

- microservicios;
- Kubernetes;
- Redis/BullMQ como requisito base;
- RabbitMQ/Kafka/SQS por anticipación;
- segundo PT/failover;
- múltiples bases por módulo;
- event sourcing completo;
- cache como autoridad;
- side effects fiscales desde controllers HTTP;
- MinIO autogestionado en producción;
- stack de observabilidad autogestionado.

## Consecuencias

### Positivas

- una sola fuente de verdad;
- menos piezas para operar por una persona;
- recuperación tras crash basada en estado durable;
- un único camino de emisión fácil de auditar;
- reduce el riesgo de duplicados por retries concurrentes;
- permite separar API/worker sin pagar el coste cognitivo de microservicios.

### Costes/limitaciones

- PostgreSQL absorbe también coordinación de trabajo;
- el worker debe implementar locking, leases y backoff correctamente;
- throughput máximo será menor que con infraestructura especializada, pero V1 no tiene evidencia que justifique más;
- el POS debe tratar la finalización fiscal como estado, no como propiedad del lifecycle HTTP.

## Evidencia técnica vigente al corte

- Node.js recomienda usar únicamente ramas Active LTS o Maintenance LTS para producción; Node 24 figura LTS y Node 20 EOL al 2026-08-18: https://nodejs.org/en/about/previous-releases
- NestJS documenta `FastifyAdapter` como integración soportada: https://docs.nestjs.com/techniques/performance
- PostgreSQL documenta `SKIP LOCKED` para consumidores de tablas tipo cola: https://www.postgresql.org/docs/current/sql-select.html
- Supabase documenta backups administrados y PITR; la estrategia exacta se cierra en F3 y se prueba antes del piloto: https://supabase.com/docs/guides/platform/backups

## Gate para cambiar esta decisión

Solo se separa un servicio o se introduce broker/cache operacional cuando exista evidencia de al menos uno:

1. carga medida que exceda la solución PostgreSQL;
2. aislamiento de fallo que no pueda lograrse con roles del mismo monolito;
3. requisito contractual/regulatorio;
4. necesidad de escalar un componente con perfil radicalmente distinto;
5. coste total demostrado menor que mantener el diseño actual.
