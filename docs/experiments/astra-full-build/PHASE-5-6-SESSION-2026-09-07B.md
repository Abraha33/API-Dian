# Sesión de continuación — Fases 5 y 6 (segunda pasada, 2026-09-07)

**Branch:** `experiment/astra-full-api-dian-v1`
**Objetivo de esta sesión:** intentar cerrar Fase 5 y Fase 6. Resultado real: **no se cerraron**. Se documenta honestamente qué se reprodujo y qué falta.

## Qué se reprodujo en esta sesión (real, con comandos y resultados)

Entorno: Windows 10, Node 24, Docker Desktop 29.7.2, repo en `D:\api-dian\API-Dian`.

1. `cd apps/api && npm ci` — **PASS**. Reinstalación limpia de `node_modules` desde cero (el primer intento falló por `ENOTEMPTY` en Windows por bloqueo de antivirus/handles; se resolvió con `rm -rf node_modules` + reintento). 757 paquetes instalados, 6 vulnerabilidades conocidas de dependencias transitivas (4 moderate, 2 high) — no bloqueantes para este experimento, quedan para `npm audit fix` en una tarea aparte.
2. `npx eslint "{src,apps,libs,test}/**/*.ts"` — **PASS**, sin salida (0 errores, 0 warnings).
3. `npm run build` (`nest build`) — **PASS**, sin errores de compilación.
4. `npm test -- --runInBand` — **PASS**, 4 suites / 10 tests. Incluye el test de `DatabaseService` que verifica el manejo del evento `error` del pool de `pg` (log esperado: `PostgreSQL pool error: database connection dropped`, no crash del proceso).
5. `npm run test:provider-contract-harness -- --verbose` — **PASS**, 1 suite / 6 tests (contrato provider-neutral del `FiscalProvider`).
6. Contenedor PostgreSQL 15 (`api-dian-postgres-clean`, puerto `55432`) confirmado corriendo desde la sesión anterior — Docker Desktop operativo, `docker ps` con contenedores sanos.

Esto confirma, en una corrida **independiente y desde cero** (no reutilizando el `node_modules` de la corrida anterior), los mismos resultados que documenta `PHASE-5-6-FAULT-CAPACITY-2026-09-07.md`. Es evidencia real de reproducibilidad de: checkout limpio, `npm ci`, lint, build, unit tests y provider-contract harness.

No se volvieron a ejecutar en esta sesión (por límite de tiempo de la sesión, no por fallo): migraciones desde cero sobre una base nueva, E2E completo, y el test de concurrencia — estos ya tienen evidencia PASS registrada en `PHASE-5-6-FAULT-CAPACITY-2026-09-07.md` de la corrida anterior del mismo día y no se contradicen aquí.

## Qué sigue sin cerrar (honesto, no se declara PASS)

### Fase 5 — Runner + containers + CI
- **Sigue sin existir una ejecución real en un runner de GitHub Actions (self-hosted o hospedado).** No hay acceso a un runner accesible desde este entorno. `.github/workflows/ci.yml` ya está correctamente delimitado (dispara en push a `experiment/astra-full-api-dian-v1` y tiene `workflow_dispatch`), pero **nadie ha disparado esa ejecución en GitHub** — solo se reprodujeron los mismos pasos localmente, dos veces, en dos sesiones distintas. Eso es honesto como "equivalente local", no como Fase 5 completa.
- No se ejecutó en esta sesión un `git worktree add` a un path limpio para probar reproducibilidad desde un checkout separado (ya se hizo en la sesión anterior según el documento previo; no se repitió aquí por límite de tiempo).

**Veredicto Fase 5: sigue IN PROGRESS.** Falta el disparo real en Actions (o admitir explícitamente que no hay runner disponible y que el "equivalente local" es la evidencia máxima alcanzable sin acceso a GitHub Actions desde este entorno).

### Fase 6 — Fallos + seguridad + capacidad
- **Bloqueador estructural encontrado en esta sesión:** no existe ningún módulo, controlador ni test de **webhooks** en el código (`grep -i webhook` sobre `apps/api/src` no encontró nada). El punto B del mandato ("Webhooks: 200, 400, 500, timeout, endpoint down, retries, backoff...") **no se puede probar porque la funcionalidad de webhooks no está implementada todavía en esta rama.** No se fabricó evidencia falsa; se deja registrado como bloqueador real de alcance, no de ejecución.
- El punto A (fault injection con `FakeFiscalProvider`) tiene la implementación de escenarios (`ACCEPT`, `REJECT`, `PROVEN_NOT_SENT`, `AMBIGUOUS_TIMEOUT`, `DELAYED_VISIBILITY`, `MALFORMED_RESPONSE`, `RATE_LIMIT`, `UNAVAILABLE`, `ARTIFACT_FAILURE` en `apps/api/src/modules/provider/fake-fiscal-provider.ts`) y un spec propio (`fake-fiscal-provider.spec.ts`), pero **no se verificó en esta sesión, con evidencia fresca, la aserción explícita `UNKNOWN != REEMITIR`** ni un conteo de duplicados fiscales = 0 bajo cada escenario en un entorno E2E real. Eso requiere levantar la base migrada desde cero y correr un test dedicado; no se hizo por límite de tiempo de esta sesión.
- El punto C (recuperación) tiene evidencia parcial ya en `LOCAL-EVIDENCE-2026-09-07.md` y en los logs de `D:\lab-api\astra-outage-api.*` y `astra-recovery-api*.log` (caída/restauración de PostgreSQL, reinicio de API). **No hay evidencia de:** crash del worker, lease expirado + recuperación por otro worker, drenado de backlog, caída/reinicio específico del worker, ni rollback de deployment. El mecanismo de lease existe en código (`apps/api/src/modules/worker/fiscal-worker.repository.ts`, `fiscal-worker.service.ts`) pero no tiene un spec de fault-injection dedicado a expiración de lease.
- El punto D (seguridad/invariantes) no se revalidó con evidencia fresca en esta sesión — está pendiente re-ejecutar los checks de aislamiento cross-tenant, Idempotency-Key concurrente, UUID ajeno rechazado, secretos no expuestos en logs, RLS.
- El punto E (benchmark reproducible) tiene una tabla de capacidad sintética en `PHASE-5-6-FAULT-CAPACITY-2026-09-07.md` (25/50/100/200 de concurrencia) pero **no cubre la progresión pedida (10/25/50/75/100 req/s) ni CPU/memoria/locks/profundidad de cola de PostgreSQL**, y los scripts (`astra-benchmark.mjs`, `astra-load.mjs`) siguen solo en `D:\lab-api`, **no migrados al repo** (`scripts/` o `benchmarks/`) todavía.

**Veredicto Fase 6: sigue IN PROGRESS**, con un bloqueador de alcance real (webhooks no implementados) que el equipo debe decidir: implementar webhooks antes de cerrar Fase 6, o excluir explícitamente el punto B del gate de esta fase con justificación documentada.

### Fase 7 — Ready for PT Integration
No se evalúa. Permanece **BLOCKED** porque Fases 5 y 6 no están en PASS.

## Conclusión de la sesión

No se declara PASS de Fase 5 ni Fase 6. Se aporta evidencia real incremental de reproducibilidad (segunda corrida independiente, mismos resultados) y se documentan honestamente los bloqueadores concretos que impiden el cierre: falta de ejecución en runner real de GitHub Actions, ausencia de implementación de webhooks, y falta de scripts/evidencia migrados al repo para benchmark y recovery de worker/lease/rollback. `status.json` y `STUDENT-CONTROL-BOARD.md` no se modifican a PASS; quedan como estaban (`IN PROGRESS` / `BLOCKED`).

## Próximos pasos recomendados para el owner

1. Decidir si Fase 6 puede cerrarse sin webhooks (excluyéndolos explícitamente del alcance) o si hay que implementarlos primero.
2. Disparar manualmente el workflow en GitHub Actions (`workflow_dispatch` ya está listo) para obtener la primera ejecución real en CI hospedado, y adjuntar ese link/run-id como evidencia de Fase 5.
3. Escribir specs de fault-injection para: expiración de lease del worker, crash del worker, drenado de backlog, rollback de deployment (o documentar el equivalente local con `git revert` + redeploy si no existe mecanismo de rollback real).
4. Mover `astra-benchmark.mjs` y `astra-load.mjs` de `D:\lab-api` a `scripts/` o `benchmarks/` del repo y extenderlos para capturar métricas de sistema (CPU/memoria/locks/cola) y correr la progresión 10/25/50/75/100 req/s.
