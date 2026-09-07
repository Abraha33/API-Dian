# API-DIAN — Índice canónico de construcción V1

> Estado: **OFICIAL / CANÓNICO para construcción**
> Fecha: 2026-09-07
> Branch de planificación: `plan/official-build-v1`
> Base arquitectónica: `draft/architecture-product-v1`

Este directorio define **cómo se construirá y validará API-DIAN V1**. Si un plan anterior contradice estos documentos, este directorio tiene prioridad para ejecución.

## Documentos autoritativos

1. `OFFICIAL-CONSTRUCTION-PLAN-V1.md` — fases oficiales del producto y orden de integración.
2. `INDEPENDENT-MODULES-V1.md` — módulos que pueden explorarse y probarse de forma aislada.
3. `LOCAL-FIRST-EXECUTION-MODEL.md` — estrategia local, contenedores, runner local y frontera de GitHub Actions.
4. `PRODUCTION-READINESS-GATES-V1.md` — condiciones objetivas para declarar el producto listo.
5. `/GOAL.md` — misión operativa para Codex.
6. `/AGENTS.md` — reglas de ejecución para agentes sobre este repositorio.

## Relación con la arquitectura

La arquitectura canónica sigue estando en `docs/architecture/final/`. Este plan **no reabre arquitectura**; la convierte en una ruta de construcción y prueba.

## Regla pedagógica

Para aprender y auditar cada aspecto, los módulos pueden estudiarse individualmente usando mocks, fakes y datos sintéticos. Para producción, todos deben integrarse y superar los gates finales.

## Regla de capacidad

`3 M docs/mes` y `~50 docs/s` son **objetivos de capacidad**, no capacidad demostrada. Solo podrán declararse soportados cuando el benchmark reproducible correspondiente pase.

## Regla operativa

La primera etapa comercial debe poder ser operada y mantenida por **una sola persona**. La complejidad adicional se introduce solo cuando una medición o dependencia real la justifique.

## Documentación histórica

Los archivos `docs/BUILD-PLAN-V1.md`, `docs/DAILY-BUILD-PLAN-V1.md`, `docs/BACKLOG-V1.md`, `docs/DEPENDENCY-MAP-V1.md` y documentos equivalentes previos quedan como referencia histórica/baseline. No deben usarse para contradecir este plan ni la arquitectura final.