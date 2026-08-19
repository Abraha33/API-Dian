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
```

Rama principal de trabajo: `dev`.

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
- `provider_attempt` antes del HTTP mutante;
- ambigüedad → `UNKNOWN`;
- `UNKNOWN` reconcilia antes de cualquier nuevo submit;
- no retry HTTP transparente de mutaciones;
- tenant por credential + RLS;
- evidencia append-only;
- API no tiene secreto PT;
- API y worker usan identidades DB separadas;
- kill switch de submit no pausa reconcile/read;
- `SUBMITTING → READY` solo con evidencia `PROVEN_NOT_SENT`.

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

- schema `app` y tablas fiscales núcleo;
- RLS/FORCE RLS + tenant-safe FKs;
- constraints de idempotencia y guards de estados;
- queue durable con `SKIP LOCKED`;
- kill switches fail-closed;
- canonicalización/hash V1;
- `FiscalProvider` mínimo;
- `FakeFiscalProvider` con fault injection.

## F6B implementado

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

Detalles:

- `pg`/node-postgres es la capa de acceso; SQL/RLS sigue siendo autoridad;
- Prisma fue retirado;
- credential opaca validada con HMAC-SHA256 + pepper;
- tenant se deriva de la credential;
- API usa login que hereda `app_api`;
- worker usa login separado que hereda `app_worker`;
- replay idempotente no crea segundo trabajo;
- misma key + semántica diferente devuelve conflicto;
- crash durante submit no autoriza segundo submit;
- recuperación de `SUBMITTING` pasa a `UNKNOWN` y encola reconcile;
- `PROVEN_NOT_SENT` permite volver a `READY` de forma explícitamente probada;
- agotamiento de reconcile termina en `NEEDS_ATTENTION`;
- fake worker no arranca en producción.

Evidencia: PR efímero #56, run #54, todo PASS con `ci_api` y `ci_worker` no privilegiados. Snapshot promovido a `dev` como `7a940ac46e8f977bf33374fb5d1c75ad56d192c1`.

## Runtime/CI

- Node 24;
- `npm audit --omit=dev --audit-level=high`;
- build/lint/unit/e2e;
- migraciones + verificaciones SQL;
- e2e de API y worker contra PostgreSQL real y roles separados.

## PT

Candidatos: The Factory HKA, DATAICO; Facture reserva.

No hay selección final hasta sandbox + contrato de ambigüedad/reconciliación. Un 404 aislado no equivale a `NOT_FOUND_CONCLUSIVE`.

No crear adapter productivo todavía.

## Siguiente trabajo

### Bloqueante principal

F4C: conseguir sandbox/contrato y ejecutar `docs/f4-prueba-ambiguedad-pt-v1.md`.

### Mientras F4C siga bloqueado

Solo trabajo independiente del PT:

- observabilidad del worker/colas/UNKNOWN;
- herramientas operativas seguras para `NEEDS_ATTENTION`;
- métricas y readiness;
- pruebas de concurrencia/fault injection adicionales;
- empaquetado/deploy no productivo;
- documentación/runbooks.

No inventar mappings, códigos, retries, endpoints ni semántica de un PT todavía.
