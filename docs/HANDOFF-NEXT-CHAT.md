# API-DIAN — Handoff canónico de construcción V1

## Estado canónico

- Repositorio: `Abraha33/API-Dian`.
- Base de arquitectura: `draft/architecture-product-v1`.
- Plan oficial de construcción: `draft/official-construction-plan-v1`.
- No modificar `dev` directamente.
- Producto: API fiscal pública multitenant para software de terceros.
- Nuestro POS: un cliente posible, nunca el núcleo.
- `PRODUCT DEFINITION: PASS`.
- `SERVICE CATALOG: PASS`.
- `ARCHITECTURE FINAL: PASS`.
- `OFFICIAL CONSTRUCTION PLAN: PASS`.
- `CONCEPTUALIZATION: READY TO START`.
- `ISOLATED TESTING: PENDING`.
- `LOCAL INTEGRATION: PENDING`.
- `LOCAL PLATFORM/CI: PENDING`.
- `CAPACITY READY: BLOCKED` hasta benchmark real.
- `PRODUCTION READY: BLOCKED`.

## Nueva decisión canónica de construcción

El proyecto se construirá como **12 mini-proyectos explorables de forma independiente**.

El orden de aprendizaje no es el orden de integración.

Un módulo puede conceptualizarse y probarse sin que sus dependencias reales estén listas, usando mocks/fakes explícitos. La integración real se hace en una fase posterior.

## Fases oficiales

0. Producto y arquitectura — PASS.
1. Conceptualización modular.
2. Testeo aislado/laboratorio.
3. Implementación e integración local.
4. Plataforma local reproducible: containers + self-hosted runner + CI + GitHub Actions.
5. Integraciones externas controladas.
6. Hardening, seguridad, recuperación y capacidad.
7. Piloto controlado.
8. Producción comercial.

## Mini-proyectos oficiales

- MP01 Contrato API pública.
- MP02 Modelo de datos PostgreSQL.
- MP03 Multitenancy e identidad organizacional.
- MP04 Seguridad y credenciales.
- MP05 Núcleo fiscal.
- MP06 Idempotencia, estados y reconciliación.
- MP07 Outbox, cola y workers.
- MP08 Puerto/adaptador PT.
- MP09 Webhooks, artefactos y auditoría.
- MP10 Metering, cuotas y primitivas comerciales.
- MP11 Contingencias y observabilidad.
- MP12 Capacidad y performance.

## Leer primero

1. `GOAL.md`.
2. `docs/construction-v1/README.md`.
3. `docs/construction-v1/OFFICIAL-CONSTRUCTION-PLAN.md`.
4. `docs/construction-v1/MINI-PROJECTS.md`.
5. `docs/construction-v1/STAGES-AND-GATES.md`.
6. `docs/construction-v1/LOCAL-RUNNER-AND-CI.md`.
7. `docs/construction-v1/modules/`.
8. `docs/PROJECT-CONSOLIDATED-PLAN.md`.
9. `docs/architecture/final/`.
10. `docs/service-catalog/`.
11. `docs/checkpoints/2026-09-07-DAWN-CHECKPOINT.md`.

Para estudiar los mini-proyectos en un chat separado usar:
`docs/construction-v1/PROMPT-MINI-PROJECTS-CHAT.md`.

## Runner local

El owner dispone de un **self-hosted runner local**.

Decisión:
- Fase 1 no exige containers/CI/Actions.
- Fase 2 usa pruebas locales mínimas y fakes.
- Fase 3 integra localmente.
- Fase 4 consolida containers, Docker Compose, self-hosted runner, CI y GitHub Actions.

Esto evita introducir infraestructura antes de comprender/probar el dominio.

## Producto/arquitectura que no se reabre

- API pública multitenant.
- REST/HTTP + JSON + OpenAPI 3.1.
- PostgreSQL autoridad.
- API y worker separados.
- outbox/cola durable.
- provider-neutral.
- object storage para XML/PDF/evidencia.
- `UNKNOWN != REEMITIR`.
- tenant + organization + application + environment.
- primera etapa comercial operable por una sola persona.

## Capacidad

Objetivo inicial a demostrar, no capacidad certificada:
- hasta ~3 M documentos/mes;
- ~50 docs/s burst comercial;
- hasta ~100 clientes directos y ~250–500 organizaciones como envelope operativo propuesto.

`CAPACITY READY` requiere benchmark reproducible con configuración exacta. Para vender 50 docs/s se debe probar con margen por encima y sin duplicados/cross-tenant.

## Dependencias externas pendientes

### PT
`DEFERRED BY OWNER`.
No construir adapter real basándose en supuestos. Usar `FakeFiscalProvider` hasta contar con selección, contrato y sandbox.

### Cloud real
Google Cloud es referencia arquitectónica; Terraform será IaC. No provisionar gasto real sin autorización.

### Salud/transporte
`PENDING SECTOR RESEARCH`. No presentar sus flujos futuros como cerrados.

## Autorizaciones manuales futuras

Se requiere owner para:
- seleccionar/contratar PT;
- aprobar precios/planes;
- gastar en cloud/servicios;
- usar credenciales/certificados reales;
- piloto con clientes reales;
- producción;
- merge final a ramas protegidas;
- alcance final de verticales sectoriales.

## Próxima ejecución principal

La próxima fase oficial es **Fase 1 — Conceptualización modular**.

Puede ejecutarse mini-proyecto por mini-proyecto. No es necesario seguir el orden recomendado si el objetivo es aprendizaje.

Cuando un módulo obtenga `CONCEPT READY: PASS`, preparar su `ISOLATED TEST PLAN` y avanzar a Fase 2 para ese módulo sin bloquearse por los demás.

## Goal para Codex

Usar `GOAL.md` como misión completa. Codex debe avanzar autónomamente por trabajo local/reversible y detener únicamente acciones externas reales que requieran autorización.
