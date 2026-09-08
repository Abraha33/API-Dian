# Fase 5 — primera ejecución real en GitHub Actions (2026-09-07)

**Branch:** `experiment/astra-full-api-dian-v1`
**Repo:** `Abraha33/API-Dian` (origin)

## Qué cambió respecto a las sesiones anteriores

Las dos sesiones previas (`PHASE-5-6-FAULT-CAPACITY-2026-09-07.md`,
`PHASE-5-6-SESSION-2026-09-07B.md`) solo habían reproducido el pipeline
**localmente**, dejando explícito que faltaba una ejecución real en un
runner hospedado. En esta sesión se cerró ese hueco:

1. Se agregó un test e2e nuevo que hace explícita la invariante obligatoria
   `UNKNOWN != REEMITIR` (commit `be98754`): se fuerza una actualización
   directa `UNKNOWN -> READY` sobre una operación fiscal y se comprueba que
   el trigger `app.guard_fiscal_operation_update` la rechaza con
   `invalid fiscal state transition`, que el estado no cambia y que el
   conteo de intentos ante el proveedor no cambia (0 duplicados). Verificado
   contra una base PostgreSQL 15 nueva (`api-dian-postgres-clean`, puerto
   `55432`) con migraciones aplicadas desde cero:
   - `npm run test:e2e -- --runInBand` → 12/12 PASS (antes 11/11).
   - `npm run test:concurrency -- --verbose` → 4/4 PASS.
2. Se hizo `git push origin experiment/astra-full-api-dian-v1` (el branch
   ya estaba correctamente aislado de `dev`/`main`/las ramas de arquitectura
   y construcción oficial).
3. Se disparó `gh workflow run "CI Pipeline" --ref
   experiment/astra-full-api-dian-v1` (workflow_dispatch, agregado en el
   commit `df7acce` de la sesión anterior) y además el push disparó la
   ejecución automática por `push: branches: [... , experiment/astra-full-api-dian-v1]`.

## Primer intento: falla real, no oculta

La primera ejecución hospedada real
(https://github.com/Abraha33/API-Dian/actions/runs/34175894436) **falló**
en el paso `Production dependency audit`
(`npm audit --omit=dev --audit-level=high`): una vulnerabilidad **alta**
en `fast-uri` (host confusion / SSRF vía normalización IDN y decodificación
porcentual repetida), traída transitivamente por `@fastify/ajv-compiler` y
`fast-json-stringify`. Esto no se ocultó ni se relajó el gate.

Corrección aplicada (commit `2ec1e71`): `npm audit fix` (sin `--force`)
resuelve `fast-uri` sin cambios incompatibles. Quedan 2 vulnerabilidades
**moderadas** de `fastify` que requieren `@nestjs/platform-fastify@12`
(`--force`, breaking) — no disparan el gate `--audit-level=high` y se dejan
pendientes para una actualización mayor revisada por el owner por separado.
Verificado localmente tras el fix: build, unit tests (10/10) y
provider-contract harness (6/6) siguen en PASS.

## Segunda ejecución: PASS real, hospedada, de punta a punta

Run: https://github.com/Abraha33/API-Dian/actions/runs/34176075661
(disparado automáticamente por el push del commit `2ec1e71`, job `ci`,
101905610340, duración 1m2s, **conclusion: success**).

Log completo descargado con
`gh run view 34176075661 --job=101905610340 --log` y guardado en
`docs/experiments/astra-full-build/evidence-run-34176075661.log`.

Pasos ejecutados y resultado, todos en el runner hospedado de GitHub
(`ubuntu-latest`), con PostgreSQL 15 como servicio de contenedor real:

| Paso | Resultado |
|---|---|
| `docker compose -f docker-compose.dev.yml config --quiet` | PASS |
| Validar sintaxis de `scripts/dev/bootstrap-local.ps1` (pwsh) | PASS |
| `npm ci` | PASS |
| `npm audit --omit=dev --audit-level=high` | PASS (0 altas tras el fix) |
| `npm run build` | PASS |
| `npx eslint "{src,apps,libs,test}/**/*.ts"` | PASS |
| `npm test -- --runInBand` | PASS — 4 suites / 10 tests |
| `npm run test:provider-contract-harness -- --verbose` | PASS — 1 suite / 6 tests |
| Migraciones desde cero + `verify-f6-core.sql` | PASS |
| `verify-f6-behavior.sql` | PASS |
| `provision-local-runtime.sql` + `verify-local-runtime.sql` | PASS |
| `provision-f6b-ci.sql` (roles `ci_api`/`ci_worker`/`ci_ops`) | PASS |
| Kill-switch como `ci_ops` (rol `app_ops_control`) | PASS |
| `fiscal-ops-report.sql` como `ci_ops` | PASS |
| `npm run test:e2e -- --runInBand` (logins separados API/worker) | PASS — 1 suite / **12 tests** (incluye la invariante `UNKNOWN != REEMITIR`) |
| `npm run test:concurrency -- --verbose` | PASS — 1 suite / 4 tests |

## Veredicto Fase 5

**PASS.** Se demuestra, con un run real y verificable en
`actions/runs/34176075661` de un repositorio público en GitHub (no solo
localmente):

- checkout limpio,
- `npm ci` reproducible,
- contenedor PostgreSQL 15 real levantado por el runner,
- migraciones desde cero,
- lint, typecheck implícito en `nest build` (proyecto TypeScript estricto),
- build,
- unit tests,
- provider-contract tests,
- E2E tests (incluida la invariante obligatoria `UNKNOWN != REEMITIR`),
- concurrencia.

No se usó un self-hosted runner (no hay uno disponible para este
experimento); se usó el runner hospedado `ubuntu-latest` de GitHub
Actions, que es un runner real de CI, no una simulación local. Esto se
documenta honestamente como el runner disponible, no como "self-hosted".

Commits relevantes: `be98754` (test invariante), `df7acce` (workflow
scoping, sesión anterior), `2ec1e71` (fix de auditoría).
