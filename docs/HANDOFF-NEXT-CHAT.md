# API-DIAN — Handoff de implementación V1

## Estado canónico

- Repositorio: `Abraha33/API-Dian`.
- Branch: `draft/architecture-product-v1`.
- Producto: API fiscal pública multitenant para software de terceros.
- Nuestro POS: un cliente posible, nunca el núcleo.
- `ARCHITECTURE FINAL: PASS`.
- `PRODUCTION READY: BLOCKED` por gates de implementación, no por falta de arquitectura.
- `CAPACITY READY: BLOCKED` hasta benchmark real; 3 M docs/mes y ~50 docs/s son objetivos a demostrar, no capacidad certificada.
- Selección de PT: **DEFERRED BY OWNER**. No reabrir producto/arquitectura por este punto; retomar desde `docs/provider-selection/PT-SELECTION-DEFERRED.md` cuando corresponda.
- Cobertura comercial: el producto completo debe cubrir, como mínimo, todas las familias/capacidades fiscales mostradas públicamente por Factus al 2026-09-07, sin copiar su contrato ni depender de Factus. Referencia: `docs/product/FACTUS-COVERAGE-BASELINE.md`.
- Salud, transporte y demás verticales no comerciales: **PENDING SECTOR RESEARCH**. Son capacidad futura prevista, pero sus necesidades fiscales concretas no se consideran cerradas hasta investigación oficial específica. Referencia: `docs/product/SECTOR-FISCAL-REQUIREMENTS-PENDING.md`.
- Restricción operativa: la primera etapa comercial debe ser mantenible por **una sola persona**. Envolvente objetivo inicial: hasta ~100 clientes directos, ~250–500 organizaciones fiscales y ~3 M documentos/mes; 3–5 M es stretch sujeto a benchmark, no promesa comercial.
- Checkpoint más reciente: `docs/checkpoints/2026-09-07-DAWN-CHECKPOINT.md`.
- Checkpoint de contexto previo: `docs/checkpoints/2026-09-07-PRE-IMPLEMENTATION-CHECKPOINT.md`.

## Leer primero

1. `docs/checkpoints/2026-09-07-DAWN-CHECKPOINT.md`.
2. `docs/checkpoints/2026-09-07-PRE-IMPLEMENTATION-CHECKPOINT.md`.
3. `docs/PROJECT-CONSOLIDATED-PLAN.md`.
4. `docs/service-catalog/MASTER-FISCAL-SERVICE-CATALOG.md`.
5. `docs/service-catalog/RELEASE-ROADMAP.md`.
6. `docs/architecture/final/README.md` y los documentos enlazados.
7. `docs/product/FACTUS-COVERAGE-BASELINE.md` para el baseline comercial de cobertura funcional.
8. `docs/product/SECTOR-FISCAL-REQUIREMENTS-PENDING.md` antes de definir salud, transporte u otro vertical regulado.
9. `docs/provider-selection/PT-SELECTION-DEFERRED.md` si la tarea involucra selección/contratación de PT.
10. ADR-010..014.

Los documentos anteriores al 2026-09-07 que digan API interna/POS-first son históricos y están supersedidos.

## V1 cerrada

FEV, nota crédito, nota débito, contingencia mínima aplicable, estado/artefactos, idempotencia, reconciliación, app auth, scopes/grants, sandbox, webhooks, cuotas, uso y auditoría. Un PT inicial, sin filtrar su contrato al público.

La identidad concreta del PT **no forma parte de la definición cerrada del producto**. La API pública y el núcleo fiscal deben permanecer neutrales al proveedor.

La API contempla **emisión/envío** de documentos hacia el ciclo DIAN desde V1. La **recepción de documentos y eventos del adquirente** está en V1.2. El producto completo también debe cubrir entrega de XML/PDF al adquirente, factura de mandato y las demás capacidades documentadas en `docs/product/FACTUS-COVERAGE-BASELINE.md`, respetando el roadmap y sin reabrir la arquitectura base.

Los verticales de salud, transporte y otros sectores **no deben presentarse como funcionalmente cerrados**. Antes de implementarlos se debe completar la investigación de actores, documentos, eventos, autoridades externas, datos, validaciones, dependencias PT, seguridad/retención y demanda comercial definida en `docs/product/SECTOR-FISCAL-REQUIREMENTS-PENDING.md`.

## Próxima ejecución

No reabrir arquitectura. Crear una branch de implementación desde la autoridad que indique el proyecto y ejecutar:

1. diff del schema actual contra `DATA-AND-MULTITENANCY.md`;
2. OpenAPI 3.1 completo y tests de contrato;
3. migraciones para organizations, applications, credentials/grants, document resources, webhooks, usage/quotas;
4. adaptación del core/worker/fake provider conservando invariantes existentes;
5. IaC de sandbox y pipeline;
6. tests de carga/fallos con objetivo inicial de hasta ~3 M docs/mes y bursts ~50 docs/s, conservando la restricción de operación por una sola persona;
7. demostrar capacidad con margen antes de venderla; idealmente probar significativamente por encima del límite comercial objetivo;
8. completar gates de seguridad, restore, observabilidad, rollback, piloto y operación por una sola persona;
9. selección PT y adapter real solo cuando el owner reactive esa decisión y exista evidencia comercial/técnica suficiente.

## Modelo financiero exploratorio

Existe un escenario conservador de aprendizaje en `docs/checkpoints/2026-09-07-DAWN-CHECKPOINT.md` basado en clientes directos, organizaciones derivadas y documentos promedio. **No es pricing aprobado ni forecast oficial.** Debe recalcularse con cotización real del PT, costos cloud medidos y validación contable/tributaria.

## No negociar

- `UNKNOWN` prohíbe retry ciego.
- PostgreSQL es autoridad.
- aislamiento tenant+organization+environment en todas las capas.
- secreto de API se muestra una vez y se almacena como hash.
- sandbox y producción no comparten proyectos, DB, bucket, llaves ni credenciales PT.
- producción requiere pentest, carga, restore y regulatory diff.
- 30 M / 300 M docs/mes son escenarios técnicos/futuros, no promesa de operación por una sola persona sin nueva evidencia y evolución operacional.
- 3 M docs/mes / ~50 docs/s son objetivos de diseño y benchmark, **no capacidad demostrada** hasta `CAPACITY READY: PASS`.
