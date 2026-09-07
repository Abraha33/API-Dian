# API-DIAN — Handoff de construcción V1

## Estado canónico

- Repositorio: `Abraha33/API-Dian`.
- Branch arquitectónica base: `draft/architecture-product-v1`.
- Branch de organización del plan oficial: `plan/official-build-v1`.
- Producto: API fiscal pública multitenant para software de terceros.
- Nuestro POS: un cliente posible, nunca el núcleo.
- `PRODUCT DEFINITION: PASS`.
- `SERVICE CATALOG: PASS`.
- `ARCHITECTURE FINAL: PASS`.
- `BUILD PLAN V1: OFFICIAL`.
- `CAPACITY READY: BLOCKED` hasta benchmark real; 3 M docs/mes y ~50 docs/s son objetivos a demostrar, no capacidad certificada.
- `PRODUCTION READY: BLOCKED` por implementación y gates externos/finales.
- Selección de PT: **DEFERRED BY OWNER**.
- Salud, transporte y otros verticales: **PENDING SECTOR RESEARCH**.
- Restricción operativa: primera etapa comercial mantenible por **una sola persona**.

## Nuevo plan oficial de construcción

La construcción se organiza mediante:

1. `GOAL.md` — misión para Codex.
2. `AGENTS.md` — reglas del repositorio para agentes.
3. `docs/build/README.md` — índice canónico.
4. `docs/build/OFFICIAL-CONSTRUCTION-PLAN-V1.md` — 8 fases funcionales.
5. `docs/build/INDEPENDENT-MODULES-V1.md` — 12 módulos independientes.
6. `docs/build/LOCAL-FIRST-EXECUTION-MODEL.md` — estrategia local-first, runner y Actions.
7. `docs/build/PRODUCTION-READINESS-GATES-V1.md` — gates objetivos.
8. `docs/learning/MINI-PROJECTS-CHAT-PROMPT.md` — ruta educativa separada.

Si un plan de construcción anterior contradice estos documentos, el nuevo directorio `docs/build/` + `GOAL.md` + `AGENTS.md` tiene prioridad, siempre subordinado a la arquitectura final y al catálogo/roadmap canónicos.

## Modelo de trabajo acordado

Cada capacidad empieza así:

```text
ETAPA A — conceptualización
          ↓
ETAPA B — implementación + testeo local
          ↓
ETAPA C — integración local
          ↓
ETAPA D — automatización / contenedores / runner / GitHub Actions
          ↓
ETAPA E — PT/DIAN sandbox
          ↓
ETAPA F — seguridad / capacidad / restore / operación
          ↓
ETAPA G — piloto / producción
```

El owner dispone de runner local. Los módulos deben poder ejecutarse desde terminal antes de depender de GitHub Actions.

El workflow existente `.github/workflows/ci.yml` es preexistente y debe auditarse en Etapa D antes de considerarlo estrategia CI canónica.

## 8 fases funcionales

1. F1 Fundación técnica y entorno local.
2. F2 Identidad, multitenancy y seguridad.
3. F3 Núcleo fiscal V1.
4. F4 Procesamiento durable, idempotencia y reconciliación.
5. F5 Provider boundary y ciclo PT/DIAN.
6. F6 Producto API comercial.
7. F7 Seguridad, capacidad, recuperación y operación.
8. F8 Piloto y producción.

## 12 módulos independientes

M01 API pública / OpenAPI
M02 PostgreSQL y modelo de datos
M03 Multitenancy
M04 Seguridad/API credentials
M05 Núcleo fiscal
M06 Idempotencia/estado/reconciliación
M07 Worker/outbox/cola durable
M08 Provider Adapter/FakeProvider
M09 Webhooks
M10 Quotas/usage
M11 Contingencias/fault injection
M12 Observabilidad/capacidad/operación

Pueden explorarse de forma aislada usando mocks/fakes, pero producción exige integración completa.

## V1 cerrada

FEV, nota crédito, nota débito, contingencia mínima aplicable, estado/artefactos, idempotencia, reconciliación, app auth, scopes/grants, sandbox, webhooks, cuotas, uso y auditoría. Un PT inicial detrás de una frontera neutral al proveedor.

La API pública es HTTP/REST-style + JSON + OpenAPI 3.1.

La recepción de documentos y eventos del adquirente está en V1.2 según roadmap.

## Próxima ejecución de Codex

Usar `GOAL.md`.

Antes de código nuevo:

1. leer autoridades;
2. auditar el código existente contra F1–F8 y M01–M12;
3. clasificar `KEEP / ADAPT / REWRITE / REMOVE`;
4. producir `docs/build/CURRENT-IMPLEMENTATION-MAP.md`;
5. ejecutar baseline local;
6. crear/usar branch de implementación `build/v1-local` desde la autoridad canónica vigente;
7. comenzar F1;
8. no avanzar declarativamente de fase sin evidencia PASS.

## Capacidad

Objetivo actual:

- hasta ~3 M documentos/mes;
- ~50 docs/s burst comercial;
- idealmente demostrar margen por encima del objetivo;
- una sola persona como operador inicial.

Esto sigue siendo objetivo de benchmark, no capacidad certificada.

## Decisiones que siguen requiriendo owner

- escoger/contratar PT;
- precios/planes finales;
- gastos cloud reales;
- credenciales productivas;
- piloto con clientes reales;
- producción/go-live;
- merge a ramas protegidas;
- salud/transporte/otros verticales.

## No negociar

- `UNKNOWN != REEMITIR`.
- PostgreSQL es autoridad.
- aislamiento tenant + organization + environment en todas las capas.
- secretos se muestran una vez y se almacenan de forma segura, no en plaintext.
- sandbox y producción aislados.
- no introducir complejidad distribuida sin medición que la justifique.
- capacidad se demuestra, no se supone.
