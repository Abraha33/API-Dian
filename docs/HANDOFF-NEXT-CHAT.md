# API-DIAN — Handoff de implementación V1

## Estado canónico

- Repositorio: `Abraha33/API-Dian`.
- Branch: `draft/architecture-product-v1`.
- Producto: API fiscal pública multitenant para software de terceros.
- Nuestro POS: un cliente posible, nunca el núcleo.
- `ARCHITECTURE FINAL: PASS`.
- `PRODUCTION READY: BLOCKED` por gates de implementación, no por falta de arquitectura.
- Selección de PT: **DEFERRED BY OWNER**. No reabrir producto/arquitectura por este punto; retomar desde `docs/provider-selection/PT-SELECTION-DEFERRED.md` cuando corresponda.

## Leer primero

1. `docs/PROJECT-CONSOLIDATED-PLAN.md`.
2. `docs/service-catalog/MASTER-FISCAL-SERVICE-CATALOG.md`.
3. `docs/service-catalog/RELEASE-ROADMAP.md`.
4. `docs/architecture/final/README.md` y los documentos enlazados.
5. `docs/provider-selection/PT-SELECTION-DEFERRED.md` si la tarea involucra selección/contratación de PT.
6. ADR-010..014.

Los documentos anteriores al 2026-09-07 que digan API interna/POS-first son históricos y están supersedidos.

## V1 cerrada

FEV, nota crédito, nota débito, contingencia mínima aplicable, estado/artefactos, idempotencia, reconciliación, app auth, scopes/grants, sandbox, webhooks, cuotas, uso y auditoría. Un PT inicial, sin filtrar su contrato al público.

La identidad concreta del PT **no forma parte de la definición cerrada del producto**. La API pública y el núcleo fiscal deben permanecer neutrales al proveedor.

## Próxima ejecución

No reabrir arquitectura. Crear una branch de implementación desde la autoridad que indique el proyecto y ejecutar:

1. diff del schema actual contra `DATA-AND-MULTITENANCY.md`;
2. OpenAPI 3.1 completo y tests de contrato;
3. migraciones para organizations, applications, credentials/grants, document resources, webhooks, usage/quotas;
4. adaptación del core/worker/fake provider conservando invariantes existentes;
5. IaC de sandbox y pipeline;
6. selección PT y adapter real solo cuando el owner reactive esa decisión y exista evidencia comercial/técnica suficiente.

## No negociar

- `UNKNOWN` prohíbe retry ciego.
- PostgreSQL es autoridad.
- aislamiento tenant+organization+environment en todas las capas.
- secreto de API se muestra una vez y se almacena como hash.
- sandbox y producción no comparten proyectos, DB, bucket, llaves ni credenciales PT.
- producción requiere pentest, carga, restore y regulatory diff.
