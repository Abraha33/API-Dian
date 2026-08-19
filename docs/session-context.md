# Contexto de sesión — API-DIAN

## Estado

```text
F0–F3 ✅
F4A contratos ✅
F4B shortlist PT ✅
F4C sandbox/contrato PT ▶ bloqueo externo
F5A diseño pruebas/runbooks ✅
F5B pruebas reales PT ⏸ depende F4C
F6A core independiente PT ✅
F6B auth/repos/worker fake ✅
F6C adapter real ⏸ depende F4C
F7 readiness/piloto ⏸ depende F6C
```

Rama principal de trabajo consolidado: `dev`.

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
- `docs/f6-checkpoint-02-fake-vertical-slice.md`;
- `ROADMAP.md`.

## Invariantes

- PostgreSQL autoridad;
- API HTTP persiste, no emite;
- solo worker muta PT;
- `provider_attempt` antes del side effect remoto;
- ambigüedad → `UNKNOWN`;
- `UNKNOWN` reconcilia antes de cualquier nuevo submit;
- no retry HTTP transparente de mutaciones;
- retry de submit solo con evidencia concluyente de no envío;
- tenant por credential + RLS;
- evidencia append-only;
- API no tiene secreto PT;
- API y worker usan roles/credenciales DB separados;
- kill switch de submit no pausa reconcile/read.

## Contrato interno actual

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

- schema `app` y tablas fiscales núcleo;
- RLS/FORCE RLS + tenant-safe FKs;
- constraints de idempotencia y guards de estados;
- queue durable con `SKIP LOCKED`;
- kill switches fail-closed;
- canonicalización/hash V1;
- `FiscalProvider` mínimo;
- `FakeFiscalProvider` con fault injection;
- tests TypeScript y verificaciones PostgreSQL de comportamiento.

`runtime_controls` inicia:

```text
accept_new_operations = false
provider_mutations_enabled = false
```

## F6B implementado

Flujo ejecutable probado:

```text
credential
→ auth tenant
→ POST command
→ c14n/idempotency
→ operation + audit + work (1 tx)
→ worker claim/lease
→ provider_attempt persistido
→ FakeFiscalProvider
→ ACCEPT/REJECT/PROVEN_NOT_SENT/UNKNOWN
→ reconcile
```

Decisiones cerradas:

- cliente DB: `pg` / node-postgres;
- SQL explícito en repositories;
- Prisma retirado del scaffold activo;
- proceso API con login `app_api`;
- proceso worker con login `app_worker` distinto;
- fake worker prohibido en producción;
- crash en `SUBMITTING` se recupera a `UNKNOWN`, nunca a segundo submit;
- `SUBMITTING → READY` exige último attempt `PROVEN_NOT_SENT`;
- kill switch bloquea nuevos side effects pero permite reconciliación.

Evidencia:

- F6B1: PR #55, snapshot promovido `a2b5b2ede98024968372e5a3df97353b5bbc5117`;
- F6B2: PR #56, CI run #54 PASS completo, snapshot promovido `7a940ac46e8f977bf33374fb5d1c75ad56d192c1`.

## Runtime/CI

- Node 24;
- `npm audit --omit=dev --audit-level=high`;
- build/lint/unit;
- migraciones SQL;
- verificaciones estructurales/comportamiento;
- e2e con logins PostgreSQL no privilegiados y separados `ci_api`/`ci_worker`.

## PT

Candidatos: The Factory HKA, DATAICO; Facture reserva. No hay selección final hasta sandbox + contrato de ambigüedad/reconciliación.

No crear adapter productivo todavía.

## Siguiente trabajo permitido

Mientras F4C no se resuelva, avanzar solo trabajo independiente del PT que reduzca riesgo:

1. observabilidad y métricas internas;
2. runbook operativo del worker/kill switches;
3. pruebas de concurrencia y carga moderada;
4. limpieza de infraestructura histórica no usada;
5. harness de contract tests del adapter, sin inventar respuestas/endpoints PT.

El siguiente gran gate funcional sigue siendo F4C → F5B/F6C.
