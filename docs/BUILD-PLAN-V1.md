# API-DIAN — Plan maestro de construcción V1

**Estado:** FROZEN / baseline de construcción  
**Fecha:** 2026-08-19  
**Autoridad de producto:** `docs/PRODUCT-DEFINITION-V1-FINAL.md`  
**Autoridad de arquitectura:** `docs/SYSTEM-ARCHITECTURE-V1.md`  
**Propósito:** definir el orden en que se construye V1, sus dependencias y gates, sin convertir todavía cada bloque en tareas diarias.

> Este documento describe cómo debe construirse V1. No declara que una fase esté terminada porque exista código adelantado. El código existente será auditado posteriormente contra este plan y se clasificará como `CONSERVAR`, `ADAPTAR`, `REHACER` o `ELIMINAR`.

---

## 1. Regla de construcción

API-DIAN se construirá en unidades pequeñas y verificables siguiendo este ciclo:

```text
capacidad pequeña
→ prueba normal
→ prueba de fallo
→ integración
→ gates verdes
→ cerrar
→ siguiente capacidad
```

No se hará una construcción masiva tipo “implementar toda la API” y probar al final.

Principios de ejecución:

1. cada bloque debe dejar el sistema en estado verificable;
2. seguridad fiscal e integridad tienen prioridad sobre velocidad;
3. ninguna fase puede depender de comportamiento inventado del PT;
4. no se introduce infraestructura antes de que una necesidad real la justifique;
5. las pruebas de fallos se construyen junto con la capacidad, no al final;
6. los cambios deben ser pequeños, revisables y reversibles a nivel de código/despliegue cuando sea posible;
7. datos/evidencia fiscal no se “arreglan” mediante edición manual rutinaria;
8. una fase bloqueada externamente no autoriza a inventar trabajo especulativo.

---

## 2. Vista completa del build

```text
B0  Congelar producto y arquitectura                    ✅ PLANIFICADO/CERRADO
 ↓
B1  Preparar baseline ejecutable y gates
 ↓
B2  Multiempresa + autenticación + perfil fiscal versionado
 ↓
B3  Contrato fiscal interno + validación + aritmética exacta
 ↓
B4  Idempotencia + persistencia + máquina de estados
 ↓
B5  Trabajo durable + worker + protocolo de side effect
 ↓
B6  Reconciliación + FakeFiscalProvider + fault injection
 ↓
B7  Evidencia + auditoría + XML/PDF + operación segura
 ↓
B8  Gate externo: seleccionar y probar 1 PT real
 ↓
B9  Adapter real del PT + mapeos + contingencias
 ↓
B10 Plataforma productiva + backup/restore + observabilidad
 ↓
B11 Integración completa POS → API-DIAN
 ↓
B12 Pruebas adversariales E2E + recuperación + seguridad
 ↓
B13 Piloto controlado
 ↓
B14 Cierre V1 / readiness de lanzamiento
```

Las fases representan dependencias lógicas. Algunas actividades externas de B8 pueden iniciarse en paralelo antes de llegar al gate, pero **B9 no puede cerrarse antes de B8**.

---

## 3. B0 — Producto y arquitectura

### Objetivo

Definir qué se construye y cómo se construye antes de volver a programar.

### Entregables

- `PRODUCT-DEFINITION-V1-FINAL.md`;
- `SYSTEM-ARCHITECTURE-V1.md`;
- este `BUILD-PLAN-V1.md`.

### Gate de salida

- producto congelado;
- arquitectura congelada;
- fuera de alcance explícito;
- dependencia de un único PT explícita;
- `DESCONOCIDO != REEMITIR` preservado.

**Estado:** cerrado como planificación.

---

## 4. B1 — Baseline ejecutable y gates

### Objetivo

Crear una base de desarrollo reproducible antes de implementar comportamiento fiscal.

### Capacidades

- estructura de monolito modular;
- Node/TypeScript/NestJS/Fastify reproducibles;
- configuración local segura;
- PostgreSQL local para desarrollo/pruebas;
- migraciones versionadas;
- CI;
- lint/build/unit test mínimos;
- health/readiness básicos;
- política de secretos y `.env` local no productivo.

### No incluye

- PT real;
- lógica fiscal completa;
- infraestructura productiva definitiva.

### Gate de salida

Un checkout limpio puede instalarse, levantar DB, migrar, compilar y ejecutar tests mediante comandos documentados y reproducibles.

---

## 5. B2 — Multiempresa, identidad técnica y configuración fiscal

### Objetivo

Garantizar que cada operación pertenece inequívocamente a una empresa y que la configuración fiscal usada puede reconstruirse históricamente.

### Capacidades

- `tenant`/empresa;
- credencial POS por instalación;
- rotación/revocación;
- tenant derivado de autenticación;
- RLS/aislamiento y foreign keys tenant-safe;
- roles DB separados;
- perfil/configuración fiscal versionado por tenant;
- snapshot/referencia histórica de configuración;
- pruebas negativas tenant A → tenant B.

### Gate de salida

- una credencial solo puede operar su tenant;
- UUID conocido de otro tenant no da acceso;
- cambiar un perfil fiscal no reinterpreta operaciones históricas;
- runtime no usa superuser/BYPASSRLS como acceso normal.

---

## 6. B3 — Contrato fiscal interno y validación

### Objetivo

Permitir que el POS exprese una intención fiscal estable sin conocer el contrato propietario del PT.

### Capacidades

- contrato versionado `schema_version`;
- FEV;
- Nota Crédito;
- Nota Débito;
- DEE POS;
- Nota de ajuste DEE POS;
- relaciones entre documentos;
- validación estructural y reglas locales conocidas;
- cantidades/importes/tasas con representación decimal exacta;
- canonicalización semántica determinista;
- errores internos estables;
- emisor/configuración resueltos desde tenant, no desde datos autoritativos enviados libremente por POS.

### Gate de salida

Entradas semánticamente equivalentes producen la misma representación canónica; entradas fiscalmente distintas se distinguen; el contrato no contiene campos propietarios de un PT concreto.

---

## 7. B4 — Idempotencia, persistencia y máquina de estados

### Objetivo

Convertir cada intención del POS en una única operación fiscal lógica durable.

### Capacidades

- `fiscal_operations`;
- `Idempotency-Key` persistida;
- semantic hash/version;
- snapshot inmutable del comando;
- transacción atómica de ingreso;
- máquina de estados central;
- control de concurrencia/state version;
- relaciones tenant-safe;
- auditoría mínima de creación/transición;
- consultas de operación.

### Gate de salida

Debe demostrarse:

```text
misma key + misma intención → misma operación
misma key + intención distinta → conflicto
```

Incluso bajo concurrencia.

No debe existir side effect fiscal remoto todavía para demostrar esta fase.

---

## 8. B5 — Trabajo durable, worker y frontera de side effect

### Objetivo

Crear el único camino autorizado para una futura mutación fiscal remota.

### Capacidades

- `work_items` durables en PostgreSQL;
- claim/lease transaccional;
- recuperación de lease expirado;
- roles `api` y `worker`;
- `provider_attempt` persistido antes del request remoto;
- correlación pre-send;
- separación entre estado fiscal y estado del scheduler;
- no transacción SQL abierta durante llamada remota;
- prohibición de retry HTTP transparente en mutaciones;
- kill switch básico de mutaciones.

### Gate de salida

Dos workers compitiendo no pueden iniciar dos intentos mutantes activos para una misma operación; un crash no autoriza reemisión automática.

---

## 9. B6 — Reconciliación y pruebas de incertidumbre

### Objetivo

Demostrar el invariante principal **antes** de tocar un PT real.

### Capacidades

- puerto mínimo `FiscalProvider`;
- `FakeFiscalProvider` determinista;
- aceptación/rechazo;
- `PROVEN_NOT_SENT`;
- timeout ambiguo;
- respuestas tardías/malformadas;
- indisponibilidad/rate limit;
- `UNKNOWN`;
- `RECONCILING`;
- resolución aceptado/rechazado/no encontrado concluyente/indeterminado;
- crash recovery;
- backoff acotado;
- `NEEDS_ATTENTION`;
- contract-test harness común para adapters.

### Gate de salida

Debe probarse que:

```text
timeout ambiguo
→ UNKNOWN
→ reconcile
→ nunca submit ciego
```

El sistema debe permanecer seguro incluso si nunca logra resolver la incertidumbre automáticamente.

---

## 10. B7 — Evidencia, artefactos y operación segura

### Objetivo

Poder reconstruir qué ocurrió y operar el sistema sin manipulación manual peligrosa.

### Capacidades

- provider responses/evidencia relevante;
- audit events append-only;
- metadatos/checksums de artefactos;
- recuperación independiente XML;
- recuperación independiente PDF;
- object storage abstracto/privado para artefactos cuando corresponda;
- logs estructurados minimizados;
- métricas de estados/backlog/UNKNOWN;
- kill switches completos;
- operator tooling mínimo y auditable;
- runbooks iniciales.

### Gate de salida

Un fallo de XML/PDF no puede provocar una nueva emisión y una operación crítica puede reconstruirse desde su estado, intentos, auditoría y evidencia.

---

## 11. B8 — Gate externo: selección de un PT real

### Objetivo

Elegir el único Proveedor Tecnológico de V1 mediante evidencia real, no marketing ni suposiciones.

### Actividades

- obtener sandbox/DEMO y credenciales;
- documentación técnica vigente;
- validar FEV, NC, ND, DEE POS y ajuste POS;
- validar modelo multiempresa/casa de software;
- confirmar firma/certificado;
- ejecutar prueba de timeout ambiguo;
- probar consulta/reconciliación;
- probar comportamiento ante duplicados;
- determinar significado real de “no encontrado/no enviado”;
- recuperar XML/PDF;
- revisar rate limits/timeouts;
- revisar SLA/soporte/escalamiento;
- contrato, protección de datos y precio real API.

### Gate crítico

El PT queda descartado si la estrategia práctica ante ambigüedad es “vuelva a enviar y mire qué pasa”.

### Gate de salida

Un candidato pasa los requisitos obligatorios y existe evidencia suficiente para construir su adapter sin inventar comportamiento.

---

## 12. B9 — Adapter PT real y dominio fiscal final

### Objetivo

Conectar el núcleo probado con el PT seleccionado sin contaminar el dominio con semántica propietaria.

### Capacidades

- exactamente un adapter real;
- autenticación PT;
- mapeos internos → payload PT;
- respuesta PT → resultados internos;
- correlación real;
- criterios reales `PROVEN_NOT_SENT`/`NOT_FOUND_CONCLUSIVE` cuando existan;
- recuperación XML/PDF real;
- perfiles/provider bindings reales;
- catálogos/reglas necesarias;
- contingencias V1 basadas en regulación vigente y capacidad del PT;
- contract tests comunes usando evidencia sandbox sanitizada.

### Gate de salida

El adapter pasa el suite común y ningún código fuera de `provider` necesita interpretar estados/códigos propietarios del PT.

---

## 13. B10 — Plataforma productiva y recuperación

### Objetivo

Convertir el sistema probado en un servicio desplegable, recuperable y operable por una persona.

### Capacidades

- selección del proveedor cloud por coste/riesgo;
- PostgreSQL administrado;
- backup/PITR adecuado;
- object storage privado;
- secret manager/configuración secreta;
- API runtime;
- worker runtime;
- TLS;
- observabilidad administrada;
- alertas accionables;
- deployment reproducible;
- rollback de aplicación;
- prueba real de restore;
- reconciliación de ventana divergente post-restore.

### Gate de salida

Un restore real se completa y se demuestra que la recuperación no provoca reemisiones ciegas de documentos que pudieron existir en el PT.

---

## 14. B11 — Integración POS → API-DIAN

### Objetivo

Integrar el consumidor técnico real de V1.

### Capacidades

- manejo seguro de credencial POS;
- generación/reutilización de idempotency key;
- envío del contrato fiscal;
- consulta de estado;
- UX/flujo ante `UNKNOWN` y `RECONCILING`;
- rechazo/errores accionables;
- recuperación XML/PDF;
- comportamiento offline/reintentos del POS compatible con idempotencia;
- no crear una nueva operación para “resolver” una operación desconocida.

### Gate de salida

El POS completa el ciclo fiscal de los documentos V1 sin conocer códigos ni endpoints propios del PT.

---

## 15. B12 — Validación adversarial integral

### Objetivo

Intentar romper V1 antes del piloto.

### Escenarios mínimos

- carreras de idempotencia;
- dos workers;
- crash en cada frontera crítica;
- timeout después de posible recepción PT;
- respuesta tardía;
- PT indisponible;
- storage indisponible;
- credential revocada;
- aislamiento A→B;
- payloads inválidos/excesivos;
- logs sin secretos;
- kill switches en operaciones en vuelo;
- reinicio con backlog;
- restore DB con divergencia frente al PT;
- degradación prolongada;
- pruebas de carga razonables basadas en volumen esperado, no benchmarking artificial.

### Gate de salida

Todos los invariantes de arquitectura y producto tienen pruebas reproducibles y no quedan fallos críticos abiertos.

---

## 16. B13 — Piloto controlado

### Objetivo

Validar V1 con riesgo acotado y datos reales antes de ampliar uso.

### Estrategia

- muy pocos comercios/tenants inicialmente;
- límites de volumen conscientes;
- soporte cercano;
- observación de latencia y error real;
- revisión diaria de UNKNOWN/reconciliaciones durante el piloto;
- medir carga del operador;
- registrar incidentes y cambios necesarios;
- no ampliar alcance funcional durante estabilización salvo requisito crítico.

### Gate de salida

Existe evidencia de operación real estable, recuperación practicable y carga operativa sostenible para una persona.

---

## 17. B14 — Cierre de V1

### Objetivo

Declarar V1 terminada únicamente cuando el producto completo, no solo el código, cumple el baseline.

### Gate final

- documentos V1 operan desde el POS;
- un PT real integrado;
- incertidumbre gestionada de forma segura;
- multiempresa aislada;
- evidencia recuperable;
- XML/PDF recuperables;
- contingencias necesarias validadas;
- restore probado;
- alertas/runbooks operables;
- seguridad mínima verificada;
- operación unipersonal viable;
- ningún requisito fuera de V1 se coló por accidente.

---

## 18. Camino crítico

El camino que realmente puede bloquear el lanzamiento es:

```text
B1
→ B2
→ B3
→ B4
→ B5
→ B6
→ B7
→ B8 PT real
→ B9 adapter real
→ B10 producción/restore
→ B11 POS E2E
→ B12 adversarial
→ B13 piloto
→ B14 cierre
```

### Trabajo paralelo permitido

Mientras se construyen B1–B7 puede adelantarse **gestión externa** de B8: contacto con candidatos, acceso sandbox, contrato y documentación.

Esto reduce tiempo calendario sin contaminar código con supuestos.

No se permite construir B9 contra endpoints/respuestas inventadas solo para “avanzar”.

---

## 19. Política de reutilización del código existente

Después de cerrar backlog, dependencias, Definition of Done y plan diario, se hará una auditoría del código actual.

Cada capacidad del repositorio recibirá exactamente una disposición:

```text
CONSERVAR  = cumple producto + arquitectura + tests requeridos
ADAPTAR    = base válida, pero le falta parte del contrato/gate
REHACER    = implementación compromete invariantes o cuesta más corregirla
ELIMINAR   = fuera de V1, duplicada o crea complejidad injustificada
```

No se recompensa código por cantidad. Una pieza solo cuenta como avance cuando satisface el gate de la fase correspondiente.

---

## 20. Cómo se convertirá esto en trabajo diario

Este documento todavía no asigna “Día 1, Día 2…”. El siguiente nivel será:

```text
BUILD PLAN
  ↓
Fase
  ↓
Épica
  ↓
Historia/capacidad
  ↓
Tarea pequeña
  ↓
Dependencias
  ↓
Definition of Done
  ↓
Día de trabajo
```

Una unidad diaria ideal debe:

- ser entendible en pocos minutos;
- modificar una superficie acotada;
- tener una salida observable;
- incluir sus pruebas relevantes;
- no mezclar varias decisiones arquitectónicas;
- poder cerrarse sin dejar el repositorio deliberadamente roto.

No se forzará que cada pieza dure exactamente un día si dividirla aumenta riesgo. “Diario” significa ritmo de avance y checkpoints, no sacrificar atomicidad técnica.

---

## 21. Gates que nunca se saltan por velocidad

1. aislamiento tenant;
2. idempotencia persistida;
3. `provider_attempt` antes del side effect;
4. `UNKNOWN` ante ambigüedad;
5. reconcile antes de repetir;
6. evidencia suficiente;
7. no secretos en repo/logs;
8. tests relevantes verdes;
9. restore real antes de piloto;
10. PT real validado antes del adapter productivo.

---

## 22. Qué no construiremos “por si acaso”

Durante este plan siguen prohibidos sin evidencia:

- microservicios;
- Kubernetes;
- Redis/BullMQ productivo;
- broker distribuido;
- segundo PT;
- failover multi-PT;
- API pública;
- SDK/webhooks públicos;
- panel administrativo complejo;
- motor antifraude;
- ERP/contabilidad/CRM;
- conexión DIAN directa;
- generación propia de PDF;
- custodia propia de certificados como decisión automática.

---

## 23. Próximo entregable

Con este build plan congelado, el siguiente paso es crear el **backlog completo de V1**, descomponiendo B1–B14 en:

```text
épicas
→ historias/capacidades
→ tareas pequeñas verificables
```

Después se documentarán:

1. mapa de dependencias;
2. Definition of Done por tipo de tarea/capacidad;
3. plan diario;
4. auditoría del código existente;
5. reanudación de implementación.

---

## Regla final

**Construir de abajo hacia arriba, probar mientras se construye y no permitir que la incertidumbre fiscal se convierta en una segunda emisión.**
