# Fase 1 — Trazabilidad ejecutable

**Estado:** PASS (evidencia local, commit pendiente)

## Matriz requisito → implementación → prueba

| Requisito/invariante | Implementación objetivo | Prueba/evidencia |
|---|---|---|
| Intake REST multitenant e idempotente | `FiscalOperationsController`, `FiscalOperationsService`, `FiscalOperationsRepository` | `test/app.e2e-spec.ts`; concurrency gate |
| PostgreSQL como autoridad y RLS | `supabase/migrations/20260819041000_create_f6_core_schema.sql` y migraciones de hardening | `scripts/introspection/verify-f6-core.sql`, `verify-f6-behavior.sql` |
| API/worker separados | `src/main.ts`, `src/worker.ts`, `AppModule`, `WorkerAppModule` | E2E con logins `ci_api`/`ci_worker` |
| `UNKNOWN != REEMITIR` | `FiscalWorkerRepository` y `FiscalWorkerService` | E2E ambiguous submit, delayed visibility y crash recovery |
| Provider-neutral hasta PT real | `FiscalProvider`, `FakeFiscalProvider` | `test/provider-contract/provider-contract-harness.spec.ts` |
| Cero duplicados bajo concurrencia | índices/funciones SQL y clave de idempotencia | `test/fiscal-concurrency.concurrency-spec.ts` |
| Kill switches fail-closed | `app.runtime_controls` y auditoría SQL | `verify-f6-core.sql`, E2E kill-switch |

No se agregan decisiones de contrato PT real: esa información requiere documentación y sandbox del proveedor.
