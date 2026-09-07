# API-DIAN — Construcción V1 — Índice canónico

> **Estado:** PLAN OFICIAL
> **Fecha:** 2026-09-07
> **Branch de trabajo:** `draft/official-construction-plan-v1`
> **Base arquitectónica:** `draft/architecture-product-v1`
> **Regla:** no modificar `dev` directamente.

## Propósito

Este directorio define cómo se construirá API-DIAN V1 sin perder la capacidad de estudiar y validar cada aspecto de forma independiente.

La arquitectura final ya está cerrada. Este plan no reabre producto ni arquitectura; traduce esas decisiones a una estrategia de construcción, aprendizaje, pruebas e integración.

## Idea central

El orden de aprendizaje no es el mismo que el orden de integración.

Cada mini-proyecto puede conceptualizarse y probarse aisladamente con mocks/fakes, aunque sus dependencias reales todavía no estén construidas. Más tarde se integran respetando contratos e invariantes comunes.

```text
MINI-PROYECTO AISLADO
  conceptualización
        ↓
  testeo aislado
        ↓
  evidencia PASS
        ↓
        └──────────────┐
                       ↓
                integración local
                       ↓
              runner / CI / containers
                       ↓
               integración externa
                       ↓
             hardening / capacidad
                       ↓
                  piloto / prod
```

## Documentos canónicos de esta etapa

1. `OFFICIAL-CONSTRUCTION-PLAN.md` — fases oficiales.
2. `MINI-PROJECTS.md` — mapa de los 12 mini-proyectos independientes.
3. `STAGES-AND-GATES.md` — qué significa PASS en cada etapa.
4. `LOCAL-RUNNER-AND-CI.md` — estrategia local, contenedores, self-hosted runner y Actions.
5. `CODEX-GOAL.md` — goal maestro para Codex.
6. `PROMPT-MINI-PROJECTS-CHAT.md` — prompt para estudiar los mini-proyectos en otro chat.
7. `modules/` — ficha individual de cada mini-proyecto.

## Autoridades que no se sustituyen

- `docs/PROJECT-CONSOLIDATED-PLAN.md`
- `docs/architecture/final/`
- `docs/service-catalog/MASTER-FISCAL-SERVICE-CATALOG.md`
- `docs/service-catalog/RELEASE-ROADMAP.md`
- `docs/checkpoints/2026-09-07-DAWN-CHECKPOINT.md`

## Restricciones no negociables

- API pública multitenant para terceros.
- REST/HTTP + JSON + OpenAPI 3.1.
- PostgreSQL es autoridad.
- `UNKNOWN != REEMITIR`.
- provider-neutral.
- sandbox y producción separados.
- primera etapa comercial operable por una sola persona.
- 3 M docs/mes y ~50 docs/s son objetivos de capacidad a demostrar, no capacidad ya certificada.
- PT definitivo sigue `DEFERRED BY OWNER`.
- no ejecutar acciones externas irreversibles, gasto cloud, credenciales reales, piloto o producción sin autorización del owner.
