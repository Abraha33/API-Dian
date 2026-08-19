# F6 — Checkpoint 01: Core persistence V1

**Fecha:** 2026-08-18/19  
**Estado:** ✅ Cerrado — F6A  
**Siguiente:** F6B — auth/repositories/worker con `FakeFiscalProvider`

## Objetivo cerrado

Materializar en código y PostgreSQL las invariantes independientes del PT antes de construir cualquier adapter fiscal real.

F6A no factura contra DIAN ni contra un PT. Construye la espina dorsal que debe hacer difícil producir duplicados, cruzar tenants o perder el estado de una operación.

## Implementado

### PostgreSQL

Migraciones:

- `supabase/migrations/20260819041000_create_f6_core_schema.sql`;
- `supabase/migrations/20260819042000_harden_f6_runtime_roles.sql`.

Tablas núcleo:

- `tenants`;
- `api_credentials`;
- `fiscal_operations`;
- `provider_attempts`;
- `work_items`;
- `evidence_records`;
- `artifacts`;
- `audit_events`;
- `runtime_controls`.

Controles materializados:

- roles `app_api`, `app_worker`, `app_migrator` sin superuser/BYPASSRLS;
- `app_migrator` dueño del schema/objetos, nunca runtime normal;
- `tenant_id` obligatorio y FK tenant-safe;
- RLS + FORCE RLS en dominio tenant-owned;
- `app_api` no puede avanzar estado fiscal;
- `app_worker` no puede crear comandos POS;
- `(tenant_id, idempotency_key)` único;
- `semantic_hash` SHA-256 y snapshot de request persistente;
- guards DB para campos inmutables y transiciones de estado;
- máximo un provider attempt mutante abierto por operación;
- work queue durable con `FOR UPDATE SKIP LOCKED`;
- máximo un trabajo activo equivalente por operación/tipo;
- evidence/audit sin UPDATE/DELETE para runtime;
- kill switches persistidos y `false` por defecto;
- bootstrap de credential mediante función controlada, sin SELECT directo de `api_credentials` para runtime.

### Canonicalización/idempotencia

Archivo: `apps/api/src/common/fiscal/canonicalization.ts`.

Versión:

```text
contract=1.0
c14n=1
hash=SHA-256
```

Implementa:

- Unicode NFC;
- claves de objetos ordenadas;
- arrays semánticos preservan orden;
- decimal strings equivalentes normalizadas;
- `trace_metadata` fuera del hash;
- rechazo de números JSON fraccionarios en proyección fiscal;
- dominio explícito del preimage para evitar hashes ambiguos entre versiones.

Tests demuestran que diferencias representacionales equivalentes producen el mismo hash y cambios fiscales producen uno distinto.

### `FiscalProvider` + fake

Archivos:

- `apps/api/src/modules/provider/fiscal-provider.ts`;
- `apps/api/src/modules/provider/fake-fiscal-provider.ts`.

Puerto mínimo:

```text
submit
reconcile
getStatus
fetchXml
fetchPdf
```

No existe `resend`.

`FakeFiscalProvider` cubre escenarios V1 relevantes, incluyendo aceptación/rechazo, `PROVEN_NOT_SENT`, timeout ambiguo, visibilidad tardía y fallo de artefacto desacoplado del hecho fiscal.

## Verificación PostgreSQL

Scripts:

- `scripts/introspection/verify-f6-core.sql`;
- `scripts/introspection/verify-f6-behavior.sql`.

Verifican, entre otros:

- roles y privilegios;
- propietarios de objetos;
- RLS/FORCE RLS;
- aislamiento A/B;
- rechazo de transición inválida;
- transición válida controlada;
- claims distintos de trabajos;
- índices/constraints críticos;
- kill switches fail-closed.

## Runtime y supply chain

Se migró CI/dev container a Node 24.

Durante la validación apareció evidencia real de vulnerabilidades altas en versiones transitivas bloqueadas del stack HTTP. No se aceptó el riesgo: se regeneró el lockfile dentro de los rangos ya declarados y se volvió a validar.

CI definitivo ejecuta:

```text
npm ci
npm audit --omit=dev --audit-level=high
build
lint
unit tests
e2e
migraciones PostgreSQL
verify-f6-core.sql
verify-f6-behavior.sql
```

CI no ejecuta `npm audit fix`: el lockfile debe llegar comprometido y reproducible.

## Evidencia de cierre

Validaciones efímeras, cerradas sin merge:

- PR #51: detectó y permitió corregir lint antes de declarar verde;
- PR #52: demostró compatibilidad completa con Node 24;
- PR #53: generó/validó el lockfile remediado y audit de producción;
- PR #54: validación final reproducible del árbol exacto promovido a `dev`.

Run final #44 (`CI Pipeline`):

```text
Install                        PASS
Production dependency audit    PASS
Build                          PASS
Lint                           PASS
Unit tests                     PASS
E2E tests                      PASS
Apply and verify F6 core SQL   PASS
```

El PR #54 se cerró sin merge; su único cambio era un marker de validación.

## Decisiones deliberadamente no tomadas

F6A no introduce:

- adapter HKA/DATAICO;
- credenciales PT;
- XML/UBL/firma real;
- numeración fiscal;
- API pública;
- Redis/BullMQ;
- panel administrativo;
- `resend`;
- acceso de controllers directo a estados/SQL arbitrario.

Prisma 5 continúa temporalmente como scaffold/build dependency histórica, pero no gobierna el modelo fiscal ni se usa como `PrismaClient` de dominio. F6B debe elegir explícitamente el cliente PostgreSQL/repository layer; no se ampliará Prisma por inercia.

## Definition of Done F6A

- [x] DDL aplica desde DB limpia.
- [x] Roles/RLS/propiedad se verifican automáticamente.
- [x] Aislamiento tenant básico se prueba contra PostgreSQL real.
- [x] Transición ilegal falla en DB.
- [x] Claim durable funciona sin entregar el mismo job.
- [x] Canonicalización/hash tiene tests.
- [x] Fake provider tiene tests de ambigüedad/artefactos.
- [x] Node 24 ejecuta el pipeline completo.
- [x] Dependencias de producción no presentan vulnerabilidades `high` según gate npm audit vigente al cierre.
- [x] CI final reproduce el resultado sin modificar el lockfile.

## Siguiente — F6B

Construir un vertical slice **sin PT real**:

```text
credential POS
→ auth/tenant
→ POST command
→ canonicalize + idempotency
→ transaction: operation + audit + work
→ worker claim
→ provider_attempt
→ FakeFiscalProvider
→ definitive result o UNKNOWN
→ reconcile
```

Antes de implementar ese slice se decide y prueba el cliente PostgreSQL/repository layer más pequeño que preserve transacciones, RLS y SQL explícito.
