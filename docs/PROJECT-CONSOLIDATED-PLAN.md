# API DIAN — Consolidated Product Vision and Plan

> **Status:** FINAL PRODUCT AND ARCHITECTURE PLAN
> **Branch:** `draft/architecture-product-v1`
> **Canonical product direction:** this document supersedes earlier POS-first or internal-only interpretations.
> **Architecture authority:** `docs/architecture/final/`
> **Service authority:** `docs/service-catalog/`

---

# 1. Product vision

We are building a **complete multi-tenant fiscal platform for Colombia**, commercialized as an **API product for third-party software from V1**.

The API is not an internal service reserved for our own POS.

From the first commercial version, intended API consumers may include:

- third-party POS systems;
- ERP/accounting/administrative software;
- SaaS products;
- integrators;
- other business applications;
- our own POS, if/when we connect it.

Our POS is therefore **one possible client of the fiscal API, not the definition of the fiscal platform and not a prerequisite for selling the API**.

The long-term goal is to progressively cover:

1. common commercial fiscal services;
2. additional commercial DIAN document families;
3. health-sector fiscal requirements;
4. transportation-sector fiscal requirements;
5. other relevant regulated sectors.

```text
                 THIRD-PARTY SOFTWARE / OUR POS
                            │
                            ↓
                  PUBLIC COMMERCIAL API
                            │
                  MULTI-TENANT FISCAL CORE
                            │
                      PT ADAPTER(S)
                            │
                 AUTHORIZED TECHNOLOGY PT
                            │
                           DIAN
```

The first production stage must remain realistically operable by one person and minimize fixed infrastructure and operational complexity.

---

# 2. Basic fiscal service

The common commercial fiscal core is **Electronic Sales Invoicing**.

The simplest useful commercial API product is:

> A client software sends the commercial data of a sale to our public API; our platform manages the fiscal lifecycle required to obtain, track and return a valid electronic sales invoice before DIAN through the selected PT.

The basic commercial fiscal cycle includes:

- Electronic Sales Invoice (FEV);
- Credit Note;
- Debit Note;
- DIAN/PT status;
- XML;
- PDF / graphical representation;
- CUFE / QR where applicable;
- safe retries;
- idempotency;
- reconciliation;
- traceability / audit.

This is the first commercial API product to build.

---

# 3. CORE V1 — public commercial fiscal API

V1 must be usable by authorized external software clients, not only by our own applications.

Initial capabilities:

1. Authentication/authorization for client organizations and applications.
2. Multi-tenant isolation.
3. Electronic Sales Invoice (FEV).
4. Credit Note.
5. Debit Note.
6. Submission/validation through the selected PT.
7. Query status.
8. Retrieve XML/PDF/resulting artifacts.
9. Canonical internal fiscal state.
10. Idempotency and duplicate prevention.
11. Safe retry behavior.
12. `UNKNOWN` state and reconciliation for ambiguous outcomes.
13. Basic fiscal configuration per tenant.
14. Audit/evidence history.
15. Usage metering needed for commercial plans/document packages.
16. Stable public API contracts and versioning policy.

The API must be provider-neutral at its own boundary even if only one PT is implemented initially.

---

# 4. Commercial expansion after CORE V1

After the basic invoice lifecycle is proven, expand with services according to official requirements and market demand.

Candidates include:

- Electronic Equivalent POS Document (DEE POS);
- DEE POS adjustment note;
- support document for acquisitions from non-invoicing suppliers;
- electronic invoice reception;
- reception events;
- advanced contingency workflows;
- other general commercial electronic documents required by DIAN.

The exact sequence must come from the complete service catalog and demand analysis.

---

# 5. Specialized sectors

## Health

The long-term platform must support health-sector electronic invoicing requirements, extensions/additional datasets, actors, validations and workflows without rebuilding the common fiscal core.

## Transportation

The platform must later support transportation-sector fiscal/electronic requirements and any specific data structures, actors, validations or integrations required by regulation.

## Other sectors

Other regulated sectors are added after identifying their official requirements and practical demand.

---

# 6. Multi-tenant model

A single platform should safely support many independent client organizations, for example:

```text
POS vendor A
ERP vendor B
Merchant C
Clinic D
Transport company E
SaaS integrator F
```

Each tenant must keep isolated:

- organizations/users/apps;
- API credentials;
- fiscal configuration;
- numbering;
- certificates/credentials according to the final model;
- documents;
- artifacts;
- usage;
- audit history;
- subscription/billing data.

Shared infrastructure is acceptable only with strict and testable tenant isolation.

---

# 7. Product layers

The canonical relationship is:

```text
Third-party POS ───────┐
ERP / accounting ─────┤
Other SaaS/integrator ─┤
Our POS ───────────────┤
                      ↓
             OUR PUBLIC FISCAL API
                      ↓
                 FISCAL CORE
                      ↓
                 PT ADAPTER
                      ↓
                     PT
                      ↓
                    DIAN
```

## Public fiscal API

This is the commercial product V1.

It owns:

- API authentication and client access;
- tenant/application boundaries;
- stable external contracts;
- fiscal lifecycle orchestration;
- canonical fiscal state;
- idempotency;
- retries;
- reconciliation;
- artifacts/evidence;
- usage metering;
- audit.

## Our POS

Our POS is a separate product/client and may later include sales, cash, inventory, purchases, suppliers, credit and other merchant operational functions.

Those POS/ERP capabilities are **not required to define or sell the fiscal API V1**.

---

# 8. Provider strategy

Use an authorized Technology Provider initially where it reduces regulatory and operational complexity.

```text
Public API
   ↓
Fiscal Core
   ↓
Provider-neutral interface
   ↓
Selected PT adapter
   ↓
Authorized PT
   ↓
DIAN
```

PT-specific schemas, endpoints and errors must remain isolated behind the adapter.

Implement only one PT initially unless evidence justifies more.

Our platform should own the canonical internal fiscal state even when the PT performs submission, signing, validation or DIAN communication according to the final model.

---

# 9. Final architecture direction

The final V1 architecture is:

- managed NestJS/Fastify modular monolith;
- PostgreSQL;
- strict multi-tenancy;
- public API boundary from V1;
- API client/app authentication;
- background workers;
- transactional outbox;
- object storage for fiscal artifacts;
- PT adapter boundary;
- no microservices at launch unless measured evidence requires them;
- no Kubernetes/Kafka at launch;
- managed Google Cloud reference deployment via Terraform;
- operable by one person initially.

The complete decision, data model, API contract, processing, security, infrastructure, scaling, costs, failures and validation are authoritative in `docs/architecture/final/`. Earlier Phase 6 and POS-centric architecture files are historical/superseded.

---

# 10. Correct execution plan

```text
1. DEEP MARKET + DIAN RESEARCH
        ↓
2. COMPLETE FISCAL SERVICE CATALOG
        ↓
3. PRIORITIZE SERVICES BY DEMAND / COST / COMPLEXITY
        ↓
4. DEFINE PUBLIC API CORE V1
        ↓
5. DEFINE COMMERCIAL EXPANSION ROADMAP
        ↓
6. DEFINE HEALTH / TRANSPORT / OTHER SECTOR ROADMAP
        ↓
7. DEFINE PLATFORM RESPONSIBILITIES VS PT
        ↓
8. REFACTOR / SELECT FINAL ARCHITECTURE FOR PUBLIC MULTI-TENANT API
        ↓
9. DETAILED ARCHITECTURE DESIGN
        ↓
10. TECHNICAL VALIDATION
        ↓
11. BUILD
```

The product must emerge from the fiscal services the market and regulation require.

---

# 11. Immediate next phase

The service catalog and architecture work described below are complete. The next task is implementation planning and execution from the final OpenAPI/data contracts, without reopening product scope.

Cover:

## Commercial / general

- invoice lifecycle;
- equivalent electronic documents;
- support documents;
- reception/events;
- contingencies;
- other general fiscal services.

## Health

- sector-specific fiscal/electronic requirements;
- additional datasets/extensions;
- actors;
- workflows;
- dependencies.

## Transportation

- sector-specific fiscal/electronic requirements;
- additional datasets/extensions;
- actors;
- workflows;
- dependencies.

## Other sectors

Identify additional relevant regulated document/service families.

Each service must be classified by:

- official name;
- legal/regulatory source;
- sector;
- typical user/client;
- mandatory vs optional conditions;
- demand evidence;
- PT dependency;
- implementation complexity;
- operational burden;
- priority;
- recommended release.

---

# 12. Intended roadmap shape

```text
CORE V1 — PUBLIC COMMERCIAL API
│
├── FEV
├── Credit Note
├── Debit Note
├── Status / artifacts
├── Idempotency
├── Reconciliation
├── API auth / tenant apps
└── Usage metering

COMMERCIAL EXPANSION
│
├── DEE POS
├── POS adjustment
├── Support Document
├── Reception / Events
├── Contingency
└── other validated commercial services

HEALTH
│
└── validated health-specific modules

TRANSPORTATION
│
└── validated transport-specific modules

OTHER SECTORS
│
└── added according to regulation and demand
```

The exact ordering is now established in `docs/service-catalog/RELEASE-ROADMAP.md`.

---

# 13. Architecture principles that must not be lost

1. Public API product from V1.
2. Third-party software is a first-class client from V1.
3. Our POS is a client, not the core product.
4. Multi-tenant from the beginning.
5. Tenant isolation must be testable.
6. Every fiscal operation has a stable identity.
7. Retries must never blindly create duplicates.
8. Ambiguous external outcomes require reconciliation.
9. PT-specific logic stays behind adapters.
10. Regulatory rules/versions must be evolvable.
11. Fiscal artifacts/evidence must be traceable.
12. Initial production must be manageable by one operator.
13. Scale complexity only after measured need.
14. The external API contract must be versioned and stable independently of the PT.

---

# 14. Current project status

## Defined

- final product direction: complete multi-tenant fiscal platform;
- commercial delivery model: public API for third-party software;
- basic fiscal core;
- long-term commercial → health → transport → other-sector expansion;
- multi-tenant direction;
- PT adapter principle.

## Still required for production, not architecture

- select and contract one PT and validate its sandbox/capability map;
- implement the final public contracts and new tenancy hierarchy;
- execute regulatory diff, pentest, load benchmark and restore drill;
- run a controlled pilot.

## Status

> **PRODUCT VISION: PASS**
> **PUBLIC API V1 SCOPE: PASS**
> **COMPLETE SERVICE CATALOG: PASS**
> **ROADMAP: PASS**
> **ARCHITECTURE FINAL: PASS**
> **IMPLEMENTATION READY: PASS WITH PREREQUISITES**
> **PRODUCTION READY: BLOCKED**

---

# 15. Definition of success

Planning/design is complete only when we can answer with evidence:

1. What fiscal services exist for our target markets?
2. Which are commercial/general?
3. Which belong to health?
4. Which belong to transportation?
5. Which belong to other sectors?
6. Which services form the public commercial API V1?
7. Which services come next and why?
8. What does our platform own?
9. What does the PT own?
10. How is the API provider-neutral?
11. How does multi-tenancy work safely?
12. How do third-party clients authenticate and integrate?
13. How do we add document families/sectors without rebuilding the core?
14. What architecture supports this roadmap at the lowest sustainable cost?
15. Can one person operate the first production stage?
16. What must be technically validated before build begins?

These questions were closed on 2026-09-07; architecture is final and implementation planning may begin.
