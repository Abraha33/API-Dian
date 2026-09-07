# Roadmap API-DIAN

> Actualizado: 2026-09-07.
> Autoridad detallada de producto: `docs/service-catalog/RELEASE-ROADMAP.md`.
> Autoridad de construcción: `docs/construction-v1/OFFICIAL-CONSTRUCTION-PLAN.md`.

## Producto

```text
Software tercero / POS propio → API fiscal pública multitenant → 1 PT → DIAN
```

## Releases fiscales

- **V1:** FEV, NC, ND, contingencia mínima, lifecycle, artefactos, idempotencia, reconciliación, auth de aplicaciones, cuotas, uso, sandbox y webhooks.
- **V1.1:** DEE POS/ajuste y documento soporte a no obligados/ajuste.
- **V1.2:** recepción, validación y eventos del adquirente.
- **V2:** nómina, RADIAN y primer vertical salud bajo piloto.
- **Futuro:** transporte/RNDC y demás perfiles DEE por demanda.

## Roadmap de construcción V1

La construcción oficial ya no sigue el orden lineal antiguo. Se separa aprendizaje/testeo aislado de integración:

1. **Fase 0 — Producto y arquitectura:** PASS.
2. **Fase 1 — Conceptualización modular:** 12 mini-proyectos independientes.
3. **Fase 2 — Testeo aislado:** mocks/fakes y evidencia por módulo.
4. **Fase 3 — Integración local:** flujo E2E local con FakeFiscalProvider.
5. **Fase 4 — Plataforma local reproducible:** containers, self-hosted runner, CI y GitHub Actions.
6. **Fase 5 — Integraciones externas:** PT sandbox/cloud/DIAN solo cuando exista autorización/evidencia.
7. **Fase 6 — Hardening y capacidad:** seguridad, restore, fallos, observabilidad y benchmark.
8. **Fase 7 — Piloto controlado:** 1 → 3 → 5 → 10 clientes.
9. **Fase 8 — Producción comercial:** solo con gates PASS y autorización del owner.

## Mini-proyectos

Ver `docs/construction-v1/MINI-PROJECTS.md` y `docs/construction-v1/modules/`.

Incluyen API pública, PostgreSQL, multitenancy, seguridad, núcleo fiscal, idempotencia/reconciliación, workers/outbox, adapter PT, webhooks/evidencia/auditoría, metering/cuotas, contingencias/observabilidad y capacidad/performance.

## Infraestructura local

El owner dispone de self-hosted runner local. Contenedores, CI y Actions pertenecen a Fase 4; no se introducen como requisito para conceptualización o testeo aislado temprano.

## Gates actuales

| Gate | Estado |
|---|---|
| Definición de producto | PASS |
| Catálogo/roadmap fiscal | PASS |
| Arquitectura | PASS |
| Plan oficial de construcción | PASS |
| Conceptualización modular | READY TO START |
| Testeo aislado | PENDING |
| Integración local | PENDING |
| Plataforma local / runner / CI | PENDING |
| Adapter PT real | BLOCKED por selección/sandbox |
| Capacity Ready | BLOCKED hasta benchmark |
| Producción | BLOCKED |

Objetivo de capacidad inicial: ~3 M docs/mes y ~50 docs/s burst comercial, sujeto a evidencia reproducible y margen conservador.
