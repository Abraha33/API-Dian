# API DIAN — Handoff for Next Chat

Continue from:

- Repository: `Abraha33/API-Dian`
- Branch: `draft/architecture-product-v1`

Read first:

1. `docs/PROJECT-CONSOLIDATED-PLAN.md`
2. `docs/architecture/ARCHITECTURE-CORRECTION-PUBLIC-API-V1.md`
3. `docs/architecture/DRAFT-PRODUCT-ARCHITECTURE-V1.md`
4. `docs/architecture/phase-6/PHASE-6-DETAILED-DESIGN.md`
5. `docs/architecture/phase-6/PHASE-6-STATUS.md`

## Canonical product direction

We are building a **complete multi-tenant fiscal platform for Colombia** whose commercial V1 is a **public fiscal API for third-party software**.

This is critical:

> The API is NOT an internal-only service for our own POS.

From V1, intended clients may include:

- third-party POS systems;
- ERP/accounting/administrative software;
- SaaS products;
- integrators;
- other business applications;
- our own POS as one additional client.

Our POS does not define the fiscal platform and is not required before the API can be sold commercially.

Any older statement that says or implies:

- `public third-party API is out of scope`;
- `the API is only for our POS`;
- `third-party consumers come only in a later version`;

is **SUPERSEDED** by this handoff and `docs/PROJECT-CONSOLIDATED-PLAN.md`.

## Long-term product vision

The platform expands progressively through:

1. basic/common commercial fiscal services;
2. additional commercial DIAN services;
3. health-sector fiscal requirements;
4. transportation-sector fiscal requirements;
5. other relevant regulated sectors.

## CORE V1 already agreed at high level

Public API capabilities include at minimum:

- client/app authentication;
- strict multi-tenancy;
- Electronic Sales Invoice (FEV);
- Credit Note;
- Debit Note;
- status handling;
- XML/PDF/CUFE/QR where applicable;
- idempotency;
- safe retries;
- duplicate prevention;
- `UNKNOWN` + reconciliation;
- audit/evidence;
- usage metering for commercial plans;
- stable/versioned API contracts.

## Provider model

Our API remains provider-neutral at its external boundary.

Initial direction:

```text
Third-party software / our POS
            ↓
     PUBLIC FISCAL API
            ↓
        FISCAL CORE
            ↓
        PT ADAPTER
            ↓
     AUTHORIZED PT
            ↓
           DIAN
```

Implement one PT initially, but prevent PT-specific details from leaking into the external API contract.

## Architecture warning

The existing detailed Phase 6 architecture was written before the public API decision was fully clarified.

It contains at least one obsolete statement saying the initial system is not a public third-party API product.

Do **not** treat that product-boundary statement as canonical.

The architecture must be refactored after the service catalog so that:

- public API clients are first-class;
- API keys/OAuth/client-app identity are modeled;
- rate limits/quotas/versioning are modeled;
- external API contracts are independent from PT schemas;
- tenant isolation works for software clients serving many businesses where applicable;
- our POS becomes only one consumer.

## Immediate next task

Do **not** start coding.

The next task is:

> Build the complete evidence-based catalog of fiscal services the final platform should support, then turn it into an exact release roadmap.

Research official DIAN/regulatory sources first, then use market/provider evidence for practical demand and packaging.

Cover:

### A. Commercial/general

Identify every relevant service/document family, including the basic invoice lifecycle and adjacent commercial services.

### B. Health

Identify health-sector electronic invoicing/fiscal extensions, datasets, actors, dependencies and workflows.

### C. Transportation

Identify transportation-sector fiscal/electronic requirements, datasets, actors, dependencies and workflows.

### D. Other sectors

Identify other regulated sectors that realistically belong in the long-term roadmap.

For every service record:

- official name;
- DIAN/regulatory source;
- sector;
- purpose;
- typical client/software user;
- mandatory/optional conditions;
- demand evidence;
- PT dependency;
- implementation complexity;
- operational complexity;
- dependencies;
- priority;
- recommended release.

## Required outputs

Create/update:

```text
docs/service-catalog/
├── MASTER-FISCAL-SERVICE-CATALOG.md
├── COMMERCIAL-SERVICES.md
├── HEALTH-SERVICES.md
├── TRANSPORT-SERVICES.md
├── OTHER-SECTORS.md
├── SERVICE-DEPENDENCY-MAP.md
├── SERVICE-PRIORITY-MATRIX.md
└── RELEASE-ROADMAP.md
```

Also provide a junior-friendly summary explaining:

1. what the basic public API service is;
2. what services come after it;
3. how the platform expands into health, transportation and other sectors;
4. why each service belongs in its release.

## Decision rule

Do not prioritize by novelty or differentiation.

Prioritize by:

1. market need/demand;
2. regulatory relevance;
3. usefulness to commercial/sector clients;
4. cost to build and operate;
5. complexity for one operator;
6. PT/external dependency;
7. reuse of the common fiscal core.

## Goal of the next chat

Finish with a credible answer to:

> “What is the complete public fiscal API product we ultimately want, and in what exact order should we build its services?”

Then refactor the current architecture around that final multi-sector public-API roadmap.
