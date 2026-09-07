# API DIAN — Handoff for Next Chat

Continue the project from this repository and branch:

- Repository: `Abraha33/API-Dian`
- Branch: `draft/architecture-product-v1`

Read first:

1. `docs/PROJECT-CONSOLIDATED-PLAN.md`
2. `docs/architecture/DRAFT-PRODUCT-ARCHITECTURE-V1.md`
3. `docs/architecture/phase-6/PHASE-6-DETAILED-DESIGN.md`
4. `docs/architecture/phase-6/PHASE-6-STATUS.md`

## Current product vision

We are building a **complete multi-tenant fiscal platform for Colombia**.

The platform starts with the basic commercial fiscal core and expands progressively into:

1. common commercial fiscal services;
2. additional commercial electronic documents;
3. health-sector fiscal requirements;
4. transportation-sector fiscal requirements;
5. other relevant regulated sectors.

The POS is a separate product/client that will consume the fiscal platform. Do not redefine the fiscal platform as a POS.

## Core fiscal MVP already agreed at high level

- Electronic Sales Invoice (FEV)
- Credit Note
- Debit Note
- status handling
- XML/PDF/CUFE/QR where applicable
- idempotency
- safe retries
- duplicate prevention
- `UNKNOWN` + reconciliation
- audit/evidence

## Important architecture direction

Current draft favors:

- managed modular monolith;
- PostgreSQL;
- strict multi-tenancy;
- background workers;
- transactional outbox;
- object storage;
- PT adapter boundary;
- one PT initially;
- no microservices/Kubernetes/Kafka at launch unless evidence requires them;
- solo-operator-friendly infrastructure.

This architecture is still **DRAFT** and must be updated after the service catalog is complete.

## Immediate next task

Do **not** start coding.

Do **not** continue generic architecture design yet.

The next task is:

> Build the complete evidence-based catalog of fiscal services that the final platform should support, then organize them into a release roadmap.

Research current official DIAN and regulatory sources first, then use market/provider evidence to understand practical demand and packaging.

Create a structured catalog covering at minimum:

### A. Commercial / general fiscal services

Identify every relevant service/document family, including the basic invoice lifecycle and all meaningful adjacent commercial services.

### B. Health

Identify health-sector electronic invoicing/fiscal extensions, required additional datasets/documents, actors, dependencies and workflows.

### C. Transportation

Identify transport-sector electronic invoicing/fiscal extensions, required additional datasets/documents, actors, dependencies and workflows.

### D. Other sectors

Identify other regulated sectors that should realistically appear in the long-term roadmap.

For every service capture:

- official service/document name;
- DIAN/regulatory source;
- sector;
- purpose;
- typical user;
- mandatory/optional conditions;
- demand evidence;
- PT dependency;
- implementation complexity;
- operational complexity;
- relationship to other document types;
- recommended priority;
- recommended release (`CORE V1`, `COMMERCIAL NEXT`, `HEALTH`, `TRANSPORT`, `LATER`).

## Required outputs

Create/update files under a suitable path such as:

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

Also create a simple summary for a junior/non-technical owner explaining:

1. what the basic service is;
2. what comes after it;
3. how the complete platform grows by sectors;
4. why each major service is placed in its release.

## Decision rule

Do not prioritize services because they are technically interesting or differentiating.

Prioritize by:

1. actual market need/demand;
2. regulatory relevance;
3. usefulness to merchants/sector users;
4. cost to build and operate;
5. complexity for one operator;
6. dependency on PT/external systems;
7. ability to reuse the common fiscal core.

## Goal of the next chat

Finish with a credible answer to:

> “What is the complete fiscal product we ultimately want, and in what exact order should we build its services?”

Once that is complete, return to the architecture and refactor the current draft around the final multi-sector service roadmap.
