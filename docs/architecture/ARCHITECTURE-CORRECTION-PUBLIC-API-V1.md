# Architecture Correction — Public API V1

> **Status:** CANONICAL CORRECTION TO CURRENT DRAFT ARCHITECTURE  
> **Branch:** `draft/architecture-product-v1`

## Why this file exists

The detailed architecture was written before the product boundary was fully clarified.

It contains an obsolete statement that the initial system is not a public third-party API product.

That statement is wrong for the current product direction.

## Canonical correction

The commercial V1 is a **public multi-tenant fiscal API for third-party software**.

Intended V1 consumers include:

- third-party POS systems;
- ERP/accounting/administrative software;
- SaaS products;
- integrators;
- other business applications;
- our own POS as one additional client.

Our POS is not the fiscal platform itself and is not a prerequisite for selling the API.

## Superseded statements

Any earlier statement that says or implies one of the following is superseded:

- public third-party API is out of scope at launch;
- the fiscal API exists only to serve our POS;
- external POS/ERP clients are necessarily postponed to a later major version;
- POS commercial modules define the core fiscal product boundary.

## Required architecture refactor

Before architecture is promoted from DRAFT to final, the design must model these V1 requirements explicitly:

1. **Public API boundary** with stable/versioned contracts.
2. **Client application identity** separate from human users.
3. **Tenant and API-client authorization**.
4. **API credential lifecycle**: issuance, rotation, revocation and audit.
5. **Rate limiting / quotas / abuse controls**.
6. **Usage metering** for subscription/document packages.
7. **Webhooks/callbacks** where required by the final service catalog.
8. **Provider-neutral canonical schemas** so PT details do not leak into public contracts.
9. **Idempotency keys** supplied/managed across external clients.
10. **Multi-tenant isolation** suitable for direct merchants and software/integrator clients where the business model requires it.
11. **API observability** by tenant/client application.
12. **Backward-compatible API versioning/deprecation policy**.
13. **Developer integration surface**: documentation, sandbox/test mode, error model and request correlation.

## Relationship to POS

The POS may remain a separate product with its own offline, inventory, purchasing, cash and credit capabilities.

Those capabilities should not be treated as mandatory parts of the fiscal API core.

Conceptually:

```text
Third-party POS ───────┐
ERP / SaaS ────────────┤
Integrator ────────────┤
Our POS ───────────────┤
                      ↓
             PUBLIC FISCAL API
                      ↓
                 FISCAL CORE
                      ↓
                 PT ADAPTER
                      ↓
                     PT
                      ↓
                    DIAN
```

## Current architecture status

The architecture remains useful as a technical draft for:

- modular-monolith direction;
- PostgreSQL;
- multi-tenancy;
- transactional outbox;
- idempotency;
- reconciliation;
- PT adapter isolation;
- artifact/evidence storage;
- solo-operator constraints.

But its product boundary is not final until the service catalog is complete and the public-API refactor is performed.

## Gate

`ARCHITECTURE FINAL: BLOCKED`

Reason:

> Complete fiscal service catalog and public-API architecture refactor are still required.
