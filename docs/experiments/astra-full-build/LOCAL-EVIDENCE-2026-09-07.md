# Evidencia de ejecución local — Astra Full Build

**Fecha:** 2026-09-07  
**Branch:** `experiment/astra-full-api-dian-v1`  
**Checkout:** `D:\api-dian\API-Dian`  
**Proveedor:** `FakeFiscalProvider` únicamente  
**Commit base observado:** `0298d6880623254097b05ce8f09df2bf141e68aa`  

## Entorno

- Docker Desktop 4.89.0 / Docker Engine 29.7.2.
- PostgreSQL 15 en `api-dian-postgres`.
- Node/npm instalados desde el checkout; no se usaron secretos reales.
- `API-Dian.rar` permaneció sin trackear y sin modificar.

## Comandos y resultados

| Comando | Resultado |
|---|---|
| `powershell.exe -ExecutionPolicy Bypass -File .\\scripts\\dev\\bootstrap-local.ps1` | PASS: PostgreSQL, migraciones y logins efímeros provisionados |
| `npm.cmd test -- --runInBand` | PASS: 3 suites / 9 tests |
| `npm.cmd run test:provider-contract-harness` | PASS: 1 suite / 6 tests |
| `npm.cmd run test:e2e -- --runInBand` | PASS: 1 suite / 11 tests |
| `npm.cmd run test:concurrency -- --runInBand --verbose` | PASS: 1 suite / 4 tests |
| `scripts/introspection/verify-f6-behavior.sql` | PASS |

## Limitaciones y gates abiertos

- `verify-f6-core.sql` debe ejecutarse antes de activar los kill switches para CI; ejecutarlo después de `provision-f6b-ci.sql` falla correctamente porque ese script habilita ambos switches para E2E.
- No se ejecutó build por la instrucción vigente del repositorio: “Never build after changes”.
- Fase 5 no puede marcarse PASS sin checkout limpio con build reproducible y CI/runner capturados.
- Fase 6 no puede marcarse PASS sin restore, fallos adversariales adicionales y benchmark/saturación.
- Fase 7 continúa bloqueada hasta que Fases 0–6 tengan PASS.

Additional verification:

- `npm.cmd exec -- eslint "{src,apps,libs,test}/**/*.ts"`: PASS.
- `docker compose -f docker-compose.dev.yml config --quiet`: PASS.
- `scripts/introspection/verify-f6-core.sql` with both runtime switches disabled: PASS.
- Runtime switches were restored to enabled only for the local E2E environment.