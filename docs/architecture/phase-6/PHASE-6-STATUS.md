# Phase 6 — Architecture Design Status

> **HISTÓRICO.** El bloqueo descrito aquí fue cerrado el 2026-09-07. Estado actual: `docs/architecture/final/ARCHITECTURE-STATUS.md`.

> **Status:** `PASS WITH RISKS / PRODUCT-BOUNDARY CORRECTION REQUIRED`
> **Nature:** DRAFT / NON-BINDING
> **Branch:** `draft/architecture-product-v1`

## Important correction

The detailed Phase 6 design was created before the product boundary was fully clarified.

The current canonical product decision is:

> **Commercial V1 is a public multi-tenant fiscal API for third-party software. Our own POS is only one possible client.**

Therefore, any Phase 6 statement saying or implying that a public third-party API is out of scope is superseded by:

- `docs/PROJECT-CONSOLIDATED-PLAN.md`
- `docs/HANDOFF-NEXT-CHAT.md`
- `docs/architecture/ARCHITECTURE-CORRECTION-PUBLIC-API-V1.md`

## Technical design work that remains useful

- modular-monolith direction;
- core domain/data-model work;
- fiscal state machine;
- idempotency and duplicate prevention;
- transactional outbox and worker lease model;
- PT adapter boundary;
- tenant isolation principles;
- audit/security baseline;
- artifact storage;
- backup/restore design;
- observability/deployment concepts.

## Required refactor before final architecture

The architecture must explicitly include:

- public/versioned API contracts;
- third-party client/app authentication;
- credential rotation/revocation;
- rate limits and quotas;
- usage metering;
- webhooks/callbacks where required;
- provider-neutral schemas;
- external idempotency contract;
- developer sandbox/test mode;
- public API error/correlation model;
- public API observability;
- compatibility/deprecation policy.

The POS-specific sales, inventory, purchases, cash and offline design should be treated as a separate product/client concern rather than the definition of the fiscal API core.

## Main risks still open

1. Complete fiscal service catalog is not finished.
2. Public API architecture refactor is not finished.
3. Real PT behavior is not validated.
4. Exact contingency rules still require DIAN/PT evidence.
5. Certificate/signing custody model is not final.
6. Production capacity is not benchmarked.
7. Backup/restore is not yet proven in the eventual production environment.
8. Security design still requires technical validation.

## Gate

`HISTORICAL ARCHITECTURE GATE: CLOSED BY FINAL PASS ON 2026-09-07`

The technical draft is useful, but architecture must not be promoted to final until the service catalog and public-API refactor are completed.

## Next phase

1. Complete the fiscal service catalog and release roadmap.
2. Refactor architecture around the public multi-tenant API product.
3. Then perform technical validation.
