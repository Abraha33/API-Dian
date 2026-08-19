# API-DIAN — Arquitectura definitiva del sistema V1

**Estado:** FROZEN / baseline de arquitectura  
**Fecha:** 2026-08-19  
**Autoridad de producto:** `docs/PRODUCT-DEFINITION-V1-FINAL.md`  
**Propósito:** definir cómo se construirá V1 sin ampliar el producto congelado.

> Si una implementación existente contradice este documento, la implementación debe revisarse. Si este documento contradice `PRODUCT-DEFINITION-V1-FINAL.md`, prevalece el producto y la arquitectura debe corregirse.

---

## 1. Resultado de la revisión crítica

La arquitectura adelantada en ADR-003..009 es, en lo esencial, compatible con el producto congelado y **se conserva**. No existe evidencia que justifique rehacerla con microservicios, brokers, Kubernetes, múltiples bases, múltiples PT o una plataforma IAM compleja.

Se introducen dos aclaraciones arquitectónicas que deben quedar explícitas antes de continuar:

1. **perfil/configuración fiscal versionada por tenant**: la identidad fiscal y configuración usada para una operación debe poder reconstruirse históricamente; no basta con consultar la configuración “actual” del comercio;
2. **proveedor cloud no congelado**: se congelan capacidades requeridas —PostgreSQL administrado, backup/restore, object storage privado, secrets y observabilidad— pero no Supabase, AWS, Cloudflare u otro proveedor concreto hasta la fase de despliegue/coste.

---

## 2. Principios arquitectónicos V1

En orden de prioridad:

1. no producir duplicados fiscales por incertidumbre;
2. preservar integridad, evidencia y aislamiento entre empresas;
3. poder recuperar el sistema después de crashes, timeouts y restauraciones;
4. mantener una sola fuente de verdad transaccional;
5. minimizar piezas operativas para que una persona pueda operar V1;
6. desacoplar el POS del contrato propietario del PT;
7. permitir evolución posterior sin construirla anticipadamente;
8. optimizar rendimiento únicamente después de medir.

Invariante superior:

```text
DESCONOCIDO != REEMITIR
```

No se promete “exactly once” distribuido. La garantía buscada es:

```text
idempotencia persistida
+ un solo camino de mutación
+ evidencia por intento
+ UNKNOWN explícito
+ reconciliación antes de repetir
```

---

## 3. Estilo arquitectónico

V1 será un **monolito modular** en un único repositorio y una única frontera de dominio, con dos roles de ejecución del mismo artefacto:

```text
api
worker
```

No son microservicios. Comparten código, contratos, modelo y versión de despliegue; pueden ejecutarse como procesos/instancias separados para aislar fallos.

V1 no incorpora:

- microservicios;
- API gateway propio;
- Kubernetes;
- service mesh;
- Kafka/RabbitMQ;
- Redis/BullMQ como requisito productivo;
- event sourcing completo;
- múltiples bases por módulo;
- múltiples regiones;
- failover multi-PT.

---

## 4. Topología lógica

```text
                     ┌──────────────────────┐
                     │      POS propio      │
                     └──────────┬───────────┘
                                │ TLS + credential
                                ▼
                     ┌──────────────────────┐
                     │      API runtime     │
                     │ auth / intake / GET  │
                     └──────────┬───────────┘
                                │ app_api
                                ▼
                 ┌──────────────────────────────┐
                 │ PostgreSQL administrado     │
                 │ AUTORIDAD TRANSACCIONAL     │
                 └──────────────┬───────────────┘
                                ▲
                                │ app_worker
                     ┌──────────┴───────────┐
                     │    Worker runtime    │
                     │ submit / reconcile   │
                     │ artifacts / recovery │
                     └───────┬────────┬─────┘
                             │        │
                  TLS + PT   │        │ private
                  secret     │        ▼
                             │   ┌───────────────┐
                             │   │ Object store  │
                             │   │ XML/PDF/evid. │
                             │   └───────────────┘
                             ▼
                     ┌──────────────────────┐
                     │ 1 PT habilitado V1  │
                     └──────────┬───────────┘
                                ▼
                              DIAN

Secret manager + logs/métricas/alertas = capacidades administradas de plataforma.
```

Inicialmente basta una instancia API y una instancia worker si la plataforma lo permite. Escalar horizontalmente es posible después, pero no es requisito de lanzamiento.

---

## 5. Stack congelado para V1

### Runtime

- Node.js 24 LTS.
- TypeScript estricto.

### Aplicación

- NestJS.
- Fastify mediante adapter oficial.
- Pino/logging estructurado o integración equivalente ya usada por Nest/Fastify.

### Persistencia

- PostgreSQL administrado como autoridad.
- `pg` / node-postgres y SQL parametrizado explícito en el camino fiscal crítico.
- No se introduce ORM para ocultar locking, RLS, constraints o transacciones críticas.

### Trabajo asíncrono

- tabla durable en PostgreSQL;
- claim mediante locking/lease transaccional;
- `FOR UPDATE ... SKIP LOCKED` cuando corresponda al patrón de múltiples consumidores.

### Artefactos

- object storage administrado y privado;
- PostgreSQL conserva referencia, checksum, tamaño, tipo, tenant, operación y procedencia.

### CI/CD

- GitHub Actions puede conservarse;
- lockfile obligatorio;
- runtime e imagen reproducibles/pinneados;
- migraciones versionadas.

El proveedor cloud concreto **no queda congelado en arquitectura**. Se escogerá después por seguridad, restauración, coste, operación y compatibilidad con estas capacidades.

---

## 6. Límites de módulos

Los límites lógicos obligatorios son:

```text
platform
  ├─ authentication
  ├─ tenant context
  ├─ tenant lifecycle
  └─ fiscal profile/configuration

fiscal
  ├─ command contract
  ├─ validation
  ├─ semantic canonicalization
  ├─ idempotency
  ├─ document relationships
  ├─ state machine
  └─ contingency policy

provider
  ├─ FiscalProvider port
  └─ exactly one real PT adapter in V1

reconciliation
  ├─ ambiguous-result resolution
  └─ crash/restore recovery

evidence
  ├─ provider attempts
  ├─ raw/sanitized evidence
  ├─ audit
  └─ artifact metadata

operations
  ├─ durable work
  ├─ kill switches
  ├─ health/readiness
  ├─ operator tooling
  └─ logs/metrics/alerts
```

Reglas de dependencia:

- `fiscal` no conoce SDK, endpoints ni códigos propietarios del PT;
- solo `provider` traduce semántica interna ↔ PT;
- solo el worker inicia mutaciones contra `FiscalProvider`;
- reconciliación usa consultas separadas de mutación;
- controllers no escriben estados fiscales arbitrariamente;
- evidencia no depende de que la operación termine con éxito;
- tenant se resuelve antes de entrar al dominio fiscal.

---

## 7. Configuración fiscal versionada por empresa

Cada tenant necesita configuración propia sin forks de código.

Conceptualmente:

```text
tenant
  ↓
versioned fiscal profile
  ├─ identidad fiscal
  ├─ establecimiento/configuración necesaria
  ├─ numeración/prefijos/resoluciones cuando aplique
  ├─ provider binding
  └─ parámetros fiscales permitidos
```

Reglas:

1. el POS no es autoridad del emisor;
2. la API resuelve el perfil activo;
3. cada operación conserva la referencia/version/snapshot suficiente para reconstruir qué configuración se utilizó;
4. cambiar la configuración futura no reinterpreta operaciones históricas;
5. campos exactos dependen de regulación y contrato PT y se completan en la fase correspondiente.

Esta capacidad es necesaria para cumplir el baseline de producto multiempresa y trazable.

---

## 8. PostgreSQL como autoridad

PostgreSQL contiene como mínimo la verdad sobre:

- tenants;
- credenciales POS;
- perfiles/configuración fiscal versionada;
- operaciones fiscales lógicas;
- idempotencia/fingerprint;
- estado fiscal;
- relaciones entre documentos;
- intentos de proveedor;
- trabajos durables;
- evidencia/auditoría;
- metadatos de artefactos;
- controles operativos/kill switches;
- historial de cambios operativos relevantes.

Object storage, memoria del proceso, logs y cualquier cola auxiliar **no pueden ser la única fuente de verdad**.

---

## 9. Multi-tenancy y aislamiento

Toda entidad fiscal tenant-owned debe tener `tenant_id NOT NULL`.

Defensa en profundidad:

```text
POS credential
   ↓
resolved tenant
   ↓
repository/transaction tenant context
   ↓
tenant-safe foreign keys
   ↓
PostgreSQL RLS / FORCE RLS
```

El POS no selecciona `tenant_id` mediante body/query/header libre.

Roles mínimos:

- `app_api`;
- `app_worker`;
- `app_migrator` — nunca runtime;
- acceso operacional limitado separado cuando sea necesario.

Los roles runtime no son owner, superuser ni `BYPASSRLS`.

El worker puede reclamar metadata global de trabajos, pero procesa dominio fiscal bajo tenant explícito.

---

## 10. Autenticación V1

Actor técnico autenticado: instalación POS.

Credencial lógica:

```text
credential_id + secret aleatorio de alta entropía
```

Propiedades:

- una credencial pertenece a un solo tenant;
- secreto mostrado una vez;
- servidor conserva verifier/digest, no secreto plano;
- rotatable/revocable;
- `Authorization` header;
- TLS obligatorio;
- redacción sistemática de logs.

No se construyen en V1 OAuth server, SSO, mTLS PKI ni IAM humano empresarial.

La identidad de cajero/operador puede viajar como metadata de auditoría pero no decide tenant.

---

## 11. Contrato POS → API

Superficie V1 mínima:

```text
POST /v1/fiscal-operations
GET  /v1/fiscal-operations/{operation_id}
GET  /v1/fiscal-operations/{operation_id}/artifacts/xml
GET  /v1/fiscal-operations/{operation_id}/artifacts/pdf
```

Mutación requiere `Idempotency-Key`.

Tipos V1:

```text
FEV
CREDIT_NOTE
DEBIT_NOTE
ELECTRONIC_POS
POS_ADJUSTMENT
```

El contrato es semántico, versionado y propio. No replica UBL ni JSON del PT.

Dinero, tasas y cantidades sensibles viajan como decimales exactos, no `float` JSON como autoridad.

No existen endpoints públicos `retry`, `resend`, `force`, `provider` o `DIAN`.

---

## 12. Ingreso de una operación

Una única transacción local debe, conceptualmente:

```text
auth + tenant
→ validate
→ semantic projection
→ canonicalize
→ semantic hash
→ resolve idempotency
→ create/reuse fiscal operation
→ capture fiscal-profile version/snapshot ref
→ create durable work if new
→ append audit/evidence minimum
→ COMMIT
```

**Nunca se llama al PT antes de este commit.**

Misma key + misma intención semántica devuelve la misma operación lógica.

Misma key + intención diferente produce conflicto y nunca genera un segundo side effect.

---

## 13. Único camino de mutación fiscal

```text
HTTP API
   ↓ persist only
PostgreSQL
   ↓ durable work
Worker
   ↓
provider_attempt persistido
   ↓ COMMIT
FiscalProvider.submit()
   ↓
PT
```

Solo el worker puede ejecutar `submit()`.

No se mantiene transacción SQL abierta durante la llamada HTTP al PT.

No existen retries HTTP transparentes sobre mutaciones fiscales.

---

## 14. Protocolo de resultado remoto

Antes de una mutación remota se crea un `provider_attempt` durable con correlación y versión de adapter/mapping.

Resultados conceptuales de `submit()`:

```text
CONCLUSIVE_ACCEPTED
CONCLUSIVE_REJECTED
TRANSPORT_PROVEN_NOT_SENT
TRANSPORT_AMBIGUOUS
```

Ante timeout/reset/crash donde el side effect pudo ocurrir:

```text
SUBMITTING → UNKNOWN
```

No existe transición automática:

```text
UNKNOWN → SUBMITTING
```

---

## 15. Reconciliación

`reconcile()` es read-only respecto al hecho fiscal.

Resultados normalizados:

```text
FOUND_ACCEPTED
FOUND_REJECTED
NOT_FOUND_CONCLUSIVE
INDETERMINATE
```

Solo `NOT_FOUND_CONCLUSIVE` respaldado por evidencia técnica/contractual suficiente puede permitir evaluar un nuevo intento mutante.

Un HTTP 404, un texto “no enviado” o un error de transporte **no** se convierten por nombre en prueba segura de inexistencia.

Si la ambigüedad no puede resolverse con backoff acotado:

```text
UNKNOWN / RECONCILING → NEEDS_ATTENTION
```

Nunca se reemite solo para “salir de la duda”.

---

## 16. Estados

Estado fiscal y estado de scheduler son dimensiones separadas.

Estados fiscales mínimos internos:

```text
PERSISTED
READY
SUBMITTING
ACCEPTED
REJECTED_LOCAL
REJECTED_REMOTE
UNKNOWN
RECONCILING
NEEDS_ATTENTION
```

El POS recibe una vista normalizada y estable. Puede usar nombres contractuales equivalentes, pero debe distinguir explícitamente incertidumbre y reconciliación.

`work_items` puede tener estados operativos como pending/claimed/retry/done/dead sin modificar por sí solo el hecho fiscal.

---

## 17. FiscalProvider

Puerto mínimo V1:

```text
submit()
reconcile()
getStatus()
fetchXml()
fetchPdf()
```

No existe `resend()`.

V1 implementa exactamente **un adapter real** después de que el proveedor pase los gates técnicos/contractuales.

La abstracción existe para aislar el dominio, no para construir multi-PT anticipadamente.

---

## 18. Artefactos y evidencia

XML/PDF son independientes del hecho de emisión.

Si la emisión ya fue aceptada y falla la recuperación de PDF/XML:

```text
retry artifact retrieval
!=
retry fiscal emission
```

Object storage:

- privado;
- key interna/opaca;
- checksum SHA-256;
- tamaño/content-type;
- autorización tenant antes de entrega;
- URL firmada corta o streaming cuando se implemente.

Evidencia/auditoría relevante es append-only para roles runtime normales.

---

## 19. Seguridad de secretos y trust boundaries

Separación mínima:

```text
API runtime
  - DB credential app_api
  - auth verifier/pepper necesario
  - NO PT secret

Worker runtime
  - DB credential app_worker
  - PT secret
  - storage permissions necesarias

Migrator
  - DDL credential
  - nunca runtime
```

Hosts PT son configuración fija/allowlisted; no URLs suministradas por el POS.

No registrar por defecto:

- Authorization;
- secretos;
- payload fiscal completo;
- XML/PDF completo;
- credencial PT.

---

## 20. Operación y kill switches

Controles mínimos:

```text
accept_new_operations
provider_mutations_enabled
```

`accept_new_operations=false` detiene nuevos intents pero mantiene consultas/artefactos cuando sea posible.

`provider_mutations_enabled=false` impide iniciar nuevos submits, pero mantiene lectura y reconciliación.

Los controles son persistidos, auditables y fail-closed.

No se requiere panel administrativo V1; tooling pequeño, autenticado y auditable es preferible.

---

## 21. Observabilidad

V1 usa observabilidad administrada, no una pila propia compleja.

Mínimo:

- logs estructurados con correlation/operation IDs;
- volumen por estado;
- errores propios vs PT;
- cantidad y edad máxima de `UNKNOWN`;
- reconciliaciones pendientes;
- backlog durable;
- intentos por operación;
- health/readiness;
- estado de kill switches;
- pocas alertas accionables.

No se fija SLA público V1 ni umbrales artificiales antes de medir sandbox/piloto.

---

## 22. Backups, restore y disaster recovery

La base productiva requiere backup administrado y una capacidad de recuperación suficientemente fina para el riesgo fiscal. El proveedor exacto y el RPO/RTO se decidirán por coste/riesgo antes del piloto.

**Tener backups no equivale a recuperación probada.** Debe ejecutarse un restore real.

Riesgo crítico:

```text
T0 backup
T1 local intent
T2 PT side effect
T3 local result persisted
T4 disaster
restore T0
```

Después de restaurar, el PT puede contener documentos que la DB restaurada “olvidó”.

Por tanto:

```text
RESTORE
→ identify divergence window
→ pause dangerous mutations
→ reconcile external PT state
→ only then resume safely
```

Nunca se reemite masivamente lo que falta en la copia restaurada.

Object storage necesita estrategia compatible de durabilidad/recuperación; restaurar PostgreSQL no implica restaurar automáticamente objetos.

---

## 23. Contingencias fiscales

Las contingencias forman parte del dominio fiscal, no del scheduler ni del kill switch.

El POS puede reportar hechos operativos necesarios, pero no elige libremente códigos DIAN/PT.

La clasificación exacta se completa con regulación vigente y PT seleccionado.

```text
provider_mutations_enabled=false
!=
contingencia DIAN automática
```

---

## 24. Proveedor Tecnológico como gate

La arquitectura no selecciona HKA, DATAICO, Facture/ESTELA ni otro proveedor.

El adapter real solo se construye cuando un candidato demuestre, como mínimo:

- alcance documental V1;
- sandbox/API real;
- correlación durable;
- comportamiento ante timeout ambiguo;
- reconciliación;
- criterio seguro de inexistencia;
- comportamiento ante duplicados;
- XML/PDF;
- responsabilidad de firma/certificado;
- seguridad/tratamiento de datos;
- soporte/SLA/rate limits;
- modelo contractual y coste aceptables.

Seguridad de reconciliación tiene prioridad sobre precio.

---

## 25. Escalabilidad deliberadamente preparada, no construida

La arquitectura permite posteriormente:

- múltiples instancias API;
- múltiples workers mediante claim concurrente;
- añadir cache si medición lo exige;
- introducir broker si PostgreSQL deja de ser suficiente;
- separar un módulo si existe una razón medible;
- abrir API a terceros con una nueva revisión de auth/abuse;
- añadir segundo PT en otra versión.

Nada de esto se implementa en V1 sin evidencia.

Gate para aumentar complejidad:

1. carga medida excede la solución actual;
2. aislamiento de fallo no puede lograrse con roles del monolito;
3. requisito regulatorio/contractual;
4. perfiles de escala realmente incompatibles;
5. coste total demostrado menor con la nueva pieza.

---

## 26. Decisiones existentes: disposición final

| Decisión adelantada | Disposición |
|---|---|
| Monolito modular | **CONSERVAR** |
| API + worker mismo artefacto | **CONSERVAR** |
| Node 24 + TypeScript + NestJS/Fastify | **CONSERVAR** |
| PostgreSQL como autoridad | **CONSERVAR** |
| `pg` + SQL explícito crítico | **CONSERVAR** |
| Queue durable PostgreSQL | **CONSERVAR** |
| Redis/BullMQ fuera de producción | **CONSERVAR** |
| Tenant + RLS + roles separados | **CONSERVAR** |
| Idempotencia semántica persistida | **CONSERVAR** |
| `provider_attempt` previo al side effect | **CONSERVAR** |
| `UNKNOWN → reconcile` | **CONSERVAR** |
| `FiscalProvider` mínimo | **CONSERVAR** |
| Fake provider para pruebas | **CONSERVAR** como herramienta, nunca producción |
| Kill switches | **CONSERVAR** |
| Object storage privado | **CONSERVAR** |
| Supabase como proveedor productivo definitivo | **NO CONGELAR**; evaluar por capacidad/coste |
| Perfil fiscal/versionado por tenant | **ADAPTAR/COMPLETAR** explícitamente |
| Código existente completo | **AUDITAR EN BUILD PLAN**, no asumir listo |

---

## 27. Lo que esta arquitectura NO decide todavía

Se difiere deliberadamente:

- proveedor cloud productivo exacto;
- PT final;
- contrato/campos propietarios del PT;
- valores exactos de rate limits;
- SLO internos numéricos;
- RPO/RTO definitivos;
- retención legal exacta;
- campos regulatorios finales de perfiles fiscales;
- política exacta de contingencias;
- estrategia comercial/precios;
- capacidad/instancias exactas de producción.

Estas decisiones requieren evidencia posterior y no bloquean la descomposición del build.

---

## 28. Criterios arquitectónicos de aceptación

La implementación derivada de esta arquitectura deberá demostrar antes del piloto:

1. mismo comando repetido no crea segunda operación lógica;
2. misma key con intención diferente falla sin side effect;
3. crash/reinicio no pierde trabajo persistido;
4. timeout ambiguo produce `UNKNOWN`, no reemisión;
5. stale `SUBMITTING` se reconcilia antes de mutar otra vez;
6. dos workers no producen dos attempts mutantes activos;
7. tenant A no accede a B incluso con UUID conocido;
8. credencial revocada falla sin alterar histórico;
9. API no posee secreto PT;
10. evidencia relevante es reconstruible;
11. fallo XML/PDF no reabre emisión;
12. kill switch no borra ni falsea estado;
13. restore real se ejecuta y la ventana divergente se reconcilia;
14. adapter real pasa contract tests comunes;
15. perfil/configuración fiscal utilizado por una operación puede reconstruirse históricamente.

---

## 29. Evidencia tecnológica verificada al congelar este documento

A fecha 2026-08-19:

- Node.js mantiene la rama 24 como LTS; se congela la major 24, no un patch concreto.
- NestJS mantiene soporte documentado para `FastifyAdapter`.
- PostgreSQL documenta `SKIP LOCKED` como útil para evitar contención entre consumidores de una tabla tipo cola.
- proveedores PostgreSQL administrados como Supabase ofrecen backups y opciones PITR, pero el coste y la recuperación de object storage deben evaluarse; por ello no se congela proveedor.

Fuentes oficiales de referencia:

- https://nodejs.org/en/about/previous-releases
- https://docs.nestjs.com/techniques/performance
- https://www.postgresql.org/docs/current/sql-select.html
- https://supabase.com/docs/guides/platform/backups

---

## 30. Próximo entregable

Con producto y arquitectura congelados, el siguiente documento formal es:

```text
BUILD-PLAN-V1.md
```

Su función será convertir esta arquitectura en fases construibles y ordenar dependencias.

Después:

```text
BUILD-PLAN-V1.md
→ backlog por épicas/historias/tareas
→ mapa de dependencias
→ Definition of Done
→ plan diario
→ auditoría del código existente
→ implementación controlada
```

---

## Regla final

**V1 debe ser aburrida de operar, conservadora ante la incertidumbre y difícil de duplicar o cruzar entre empresas. La complejidad futura se prepara mediante límites claros; no se compra anticipadamente con infraestructura.**
