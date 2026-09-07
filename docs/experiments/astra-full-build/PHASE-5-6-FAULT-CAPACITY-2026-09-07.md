# Evidencia Fases 5-6 — fallos, recuperación y capacidad

**Fecha:** 2026-09-07  
**Branch:** `experiment/astra-full-api-dian-v1`  
**Proveedor:** `FakeFiscalProvider` únicamente  
**Base de datos efímera:** PostgreSQL 15 en `api-dian-postgres-clean`, puerto `55432`

## Fase 5 — checkout limpio y validación local

En un worktree limpio desde el commit de la rama se ejecutaron:

- `npm.cmd ci` — PASS.
- `npm.cmd run build` — PASS antes de la corrección posterior.
- `npm.cmd exec -- eslint "{src,apps,libs,test}/**/*.ts"` — PASS.
- `npm.cmd test -- --runInBand` — PASS, 3 suites / 9 tests.
- `npm.cmd run test:provider-contract-harness` — PASS, 1 suite / 6 tests.
- PostgreSQL nuevo, migraciones desde cero, `verify-f6-core.sql` antes de provisionar — PASS.
- `provision-f6b-ci.sql` y `verify-f6-behavior.sql` — PASS.
- E2E en checkout limpio — PASS, 11 tests.
- Concurrencia en checkout limpio — PASS, 4 tests.

La corrida local demuestra reproducibilidad de checkout, dependencias, migraciones y suites. No se declara todavía PASS de Fase 5 porque falta una ejecución capturada en el self-hosted runner/GitHub Actions.

## Fase 6 — defecto encontrado y corregido

El primer fault injection detuvo PostgreSQL mientras la API seguía viva. El proceso terminó por un evento `error` no manejado del pool de `pg`:

`Error: terminating connection due to administrator command`

Se aplicó TDD: el nuevo test primero falló porque `Pool.on('error', ...)` no estaba registrado. Luego `DatabaseService` registró un listener que reporta el error mediante Nest `Logger` sin propagarlo al proceso.

Evidencia posterior a la corrección:

- `npm.cmd exec jest -- --runInBand` — PASS, 4 suites / 10 tests.
- ESLint de los archivos afectados — PASS.
- E2E sobre DB nueva — PASS, 11/11.
- Concurrencia sobre DB nueva — PASS, 4/4.
- Fault injection real de DB: `before=200 during=unavailable after=200 process_alive=True`.

Esto cubre la recuperación del API ante la caída y reconexión de PostgreSQL sin crash del proceso. El restore también fue ejecutado con `pg_dump` y `psql` sobre una base nueva; la base restaurada reportó 4 tenants y 1 runtime control.

## Capacidad local observada

Carga sintética contra el API local, con respuestas HTTP 200:

| Concurrencia | Total | Throughput | p50 | p95 | Máximo |
|---:|---:|---:|---:|---:|---:|
| 25 | 50 | 100.87/s | 155.7 ms | 280.3 ms | 286.8 ms |
| 50 | 100 | 197.66/s | 162.2 ms | 239.4 ms | 243.3 ms |
| 100 | 200 | 258.93/s | 213.8 ms | 371.5 ms | 401.5 ms |
| 200 | 400 | 284.22/s | 456.3 ms | 684.0 ms | 726.3 ms |

La primera degradación del p95 se observó en concurrencia 200. El objetivo sintético de 50/s se superó en estas corridas, pero esto no es una certificación de capacidad: no se capturaron CPU, memoria, locks ni profundidad de cola de PostgreSQL.

## Gates que siguen abiertos

- Fase 5: falta evidencia ejecutada en self-hosted runner/GitHub Actions.
- Fase 6: faltan pruebas de fallo de webhook/rollback y una corrida adversarial documentada para 429/500/timeout del proveedor real. No se inventan semánticas del PT: los escenarios fake solo prueban la normalización provider-neutral.
- Fase 7 permanece bloqueada hasta que Fases 5 y 6 sean PASS.
- No se conectó HKA/PT real, no se usaron credenciales reales y no se gastó en cloud.
