# Contexto de sesión — API-DIAN

## Estado

```text
F0–F3 ✅
F4A contratos ✅
F4B shortlist PT ✅
F4C sandbox/contrato PT ▶ bloqueo externo
F5A diseño pruebas/runbooks ✅
F5B pruebas reales PT ⏸
F6A core independiente PT ✅
F6B auth/repos/worker fake ▶ siguiente interno
F6C adapter real ⏸ depende F4C
```

Rama: `dev`.

## Producto

```text
POS → API-DIAN → 1 PT habilitado → DIAN
```

No reabrir producto/alcance cerrado salvo evidencia nueva fuerte.

## Fuentes maestras

- baseline F0;
- `docs/v1-requisitos.md`;
- ADR-003/004 arquitectura + side effects;
- ADR-005/006 datos + seguridad;
- ADR-007/008 contratos + PT gates;
- ADR-009 pruebas/fault injection/kill switch;
- docs F3/F4/F5;
- `docs/f6-checkpoint-01-core-persistence.md`;
- `ROADMAP.md`.

## Invariantes

- PostgreSQL autoridad;
- API HTTP persiste, no emite;
- solo worker muta PT;
- `provider_attempt` antes de HTTP;
- ambigüedad → `UNKNOWN`;
- `UNKNOWN` reconcilia antes de cualquier nuevo submit;
- no retry HTTP transparente de mutaciones;
- tenant por credential + RLS;
- evidencia append-only;
- API no tiene secreto PT;
- kill switch de submit no pausa reconcile/read.

## Contrato

```text
POST /v1/fiscal-operations
Authorization: Bearer <credential>
Idempotency-Key: <key>
schema_version = 1.0
```

Tipos: FEV, CREDIT_NOTE, DEBIT_NOTE, ELECTRONIC_POS, POS_ADJUSTMENT.

Hash:

```text
validated DTO
→ semantic projection
→ fiscal-command-c14n/1
→ SHA-256
```

`FiscalProvider`: `submit`, `reconcile`, `getStatus`, `fetchXml`, `fetchPdf`; no `resend`.

## F6A implementado

Código/migraciones:

- `supabase/migrations/20260819041000_create_f6_core_schema.sql`;
- `supabase/migrations/20260819042000_harden_f6_runtime_roles.sql`;
- `scripts/introspection/verify-f6-core.sql`;
- `scripts/introspection/verify-f6-behavior.sql`;
- `apps/api/src/common/fiscal/canonicalization.ts` + tests;
- `apps/api/src/modules/provider/fiscal-provider.ts`;
- `apps/api/src/modules/provider/fake-fiscal-provider.ts` + tests.

PostgreSQL impone roles/privilegios, RLS/FORCE RLS, idempotencia, tenant-safe FKs, transiciones válidas, inmutabilidad, attempt abierto único y queue durable.

`runtime_controls` inicia:

```text
accept_new_operations = false
provider_mutations_enabled = false
```

## Runtime/CI

- Node 24 en CI y `Dockerfile.dev`;
- lockfile de dependencias remediado y comprometido;
- CI ejecuta `npm audit --omit=dev --audit-level=high` sin mutar dependencias;
- build/lint/unit/e2e + migraciones + verificaciones SQL.

Evidencia final: PR efímero #54, run #44, todo PASS; PR cerrado sin merge.

Prisma 5 permanece temporalmente como scaffold/build dependency, pero no existe uso de `PrismaClient` en dominio y no gobierna el modelo fiscal.

## PT

Candidatos: The Factory HKA, DATAICO; Facture reserva. No hay selección final hasta sandbox + contrato de ambigüedad/reconciliación.

No crear adapter productivo todavía.

## Siguiente — F6B

Construir vertical slice con fake provider:

```text
credential
→ auth tenant
→ POST command
→ c14n/idempotency
→ operation + audit + work (1 tx)
→ worker claim
→ provider_attempt
→ FakeFiscalProvider
→ ACCEPT/REJECT/UNKNOWN
→ reconcile
```

Primera decisión F6B: cliente PostgreSQL/repository layer. Debe permitir transacciones explícitas, queries parametrizadas y tenant context local; no introducir un ORM por comodidad si oculta RLS/SQL crítico.
