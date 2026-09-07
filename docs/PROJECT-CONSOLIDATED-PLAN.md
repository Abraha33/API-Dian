# API DIAN — Consolidated Product Vision and Plan

> **Status:** CONSOLIDATED WORKING PLAN / DRAFT  
> **Branch:** `draft/architecture-product-v1`  
> **Purpose:** Preserve the current agreed product direction, sequencing, and architecture constraints before continuing in a new chat.  
> **Important:** This document supersedes the earlier interpretation that the product was primarily a POS. The POS is a consumer/product built on top of the fiscal platform, not the fiscal platform itself.

---

# 1. Product vision

The final goal is to build a **complete multi-tenant fiscal platform for Colombia** that progressively covers the electronic fiscal documents and sector-specific requirements required by DIAN.

The platform should begin with the most common commercial fiscal services, then expand into additional commercial documents and later into specialized sectors such as health and transportation.

The long-term direction is:

```text
                    MULTI-TENANT FISCAL PLATFORM
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
      Commerce               Health           Transportation
          │                    │                    │
     fiscal docs          sector docs          sector docs
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
                         FISCAL CORE
                               │
                         PT ADAPTER(S)
                               │
                      Technology Provider
                               │
                              DIAN
```

The first production stage must remain realistically operable by one person and minimize fixed infrastructure and operational complexity.

---

# 2. What the basic fiscal service actually is

The common fiscal core in the Colombian commercial market is **Electronic Sales Invoicing**.

The simplest useful fiscal product can be described as:

> A software system sends the commercial data of a sale and our fiscal API handles the lifecycle required to obtain and manage a valid electronic sales invoice before DIAN.

The basic commercial fiscal cycle includes:

- Electronic Sales Invoice (FEV);
- Credit Note;
- Debit Note;
- DIAN/provider status;
- XML;
- PDF / graphical representation;
- CUFE / QR where applicable;
- safe retries;
- idempotency;
- reconciliation;
- traceability / audit.

This is the first fiscal product to build.

---

# 3. First fiscal MVP

## Fiscal MVP V1

The initial MVP should focus on the minimum complete invoicing lifecycle:

1. Electronic Sales Invoice (FEV).
2. Credit Note.
3. Debit Note.
4. Submit / validate through the selected PT.
5. Query status.
6. Retrieve XML / PDF and other resulting artifacts.
7. Store canonical internal state and evidence.
8. Idempotency and duplicate prevention.
9. Safe retries.
10. `UNKNOWN` state and reconciliation when the external result is ambiguous.
11. Basic fiscal configuration per tenant.
12. Audit history.

The MVP should not attempt to cover the entire DIAN ecosystem at once.

---

# 4. Commercial expansion after the core MVP

After proving the core invoice lifecycle, add commercial fiscal services according to evidence and demand.

Candidates include:

- Electronic Equivalent POS Document (DEE POS);
- DEE POS adjustment note;
- support document for acquisitions from non-invoicing suppliers;
- electronic invoice reception;
- reception events;
- advanced contingency workflows;
- other commercial electronic documents required by DIAN;
- additional sector-neutral fiscal services.

The exact sequence must be based on a complete DIAN service catalog and demand analysis, not assumptions.

---

# 5. Specialized sectors

The long-term platform must be designed so that specialized sectors can be added without rebuilding the core.

## Health

Future work should identify all health-sector electronic invoicing requirements, additional data sets, attachments, validations, actors, and workflows.

## Transportation

Future work should identify all transportation-sector fiscal/electronic document requirements, additional data structures, regulatory flows, and integrations.

## Other sectors

Other regulated sectors should be added only after cataloging their actual DIAN/regulatory requirements and market demand.

---

# 6. Multi-tenant model

One platform should support many independent organizations, for example:

```text
Merchant A
Merchant B
Restaurant C
Clinic D
Transport Company E
Software Client F
```

Each tenant must keep isolated:

- users;
- fiscal configuration;
- document numbering;
- credentials/certificates according to the final model;
- documents;
- artifacts;
- branches;
- usage;
- audit history;
- billing/subscription data.

The infrastructure is shared where safe, but tenant data and authorization boundaries must be strict.

---

# 7. Product layers

The fiscal platform and the POS must be treated as different products/layers.

```text
Our POS ───────────────┐
Future external POS ──┤
ERP / other software ─┤
                      ↓
                OUR FISCAL API
                      ↓
                 FISCAL CORE
                      ↓
                  PT ADAPTER
                      ↓
                      PT
                      ↓
                     DIAN
```

## Fiscal platform

Owns the fiscal lifecycle and common infrastructure.

## POS

Our POS becomes the first consumer of the fiscal platform and may include:

- sales;
- cash;
- inventory;
- purchases;
- suppliers;
- purchases on credit;
- accounts payable;
- customer credit;
- accounts receivable;
- other merchant operational functions.

These POS/ERP-like functions are not the definition of the fiscal API itself.

---

# 8. Provider strategy

The platform should use an authorized Technology Provider initially where it reduces regulatory and operational complexity.

Desired boundary:

```text
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

PT-specific details must not spread across the whole platform.

Initially implement only one PT unless real business requirements justify more.

The platform should own its canonical internal fiscal state even when the PT performs submission, validation, signing, or DIAN communication according to the selected commercial/technical model.

---

# 9. Architecture direction currently under evaluation

Current draft direction:

- managed modular monolith;
- PostgreSQL;
- strict multi-tenancy;
- background workers;
- transactional outbox;
- object storage for fiscal artifacts;
- provider adapter boundary;
- no microservices at launch;
- no Kubernetes at launch;
- no Kafka at launch;
- Redis only if measured load justifies it;
- managed infrastructure wherever practical;
- architecture must remain operable by one person initially.

The current detailed architecture documents were created before the final product vision was fully clarified and therefore remain **DRAFT**.

They must be reviewed and adjusted so the central abstraction is a **multi-sector fiscal platform**, not a POS-centric application.

Existing draft files:

```text
docs/architecture/DRAFT-PRODUCT-ARCHITECTURE-V1.md
docs/architecture/phase-6/PHASE-6-DETAILED-DESIGN.md
docs/architecture/phase-6/PHASE-6-STATUS.md
```

Do not promote these to final architecture until the service catalog and roadmap below are completed.

---

# 10. Correct execution plan

The correct sequence is:

```text
1. DEEP MARKET + DIAN RESEARCH
        ↓
2. COMPLETE FISCAL SERVICE CATALOG
        ↓
3. PRIORITIZE SERVICES BY DEMAND / COST / COMPLEXITY
        ↓
4. DEFINE CORE MVP
        ↓
5. DEFINE COMMERCIAL EXPANSION ROADMAP
        ↓
6. DEFINE HEALTH / TRANSPORT / OTHER SECTOR ROADMAP
        ↓
7. DEFINE PLATFORM RESPONSIBILITIES VS PT
        ↓
8. UPDATE / SELECT FINAL ARCHITECTURE
        ↓
9. DETAILED ARCHITECTURE DESIGN
        ↓
10. TECHNICAL VALIDATION
        ↓
11. BUILD
```

The previous seven-phase plan remains useful conceptually, but this sequence better reflects the actual product goal: **the product must emerge from the fiscal services the market and regulation require**.

---

# 11. Immediate next phase

The next task is **not coding**.

The next task is to build the **complete fiscal service catalog** for the platform.

It must identify, with current sources:

## Commercial / general

- all common invoice-related services;
- equivalent electronic documents;
- support documents;
- reception/events;
- contingencies;
- other general commercial fiscal services.

## Health

- sector-specific fiscal/electronic requirements;
- required document extensions/data sets;
- actors and workflows;
- dependencies.

## Transportation

- sector-specific fiscal/electronic requirements;
- required document extensions/data sets;
- actors and workflows;
- dependencies.

## Other sectors

- identify relevant regulated sectors and document families.

Each item should be classified by:

- official name;
- legal/regulatory source;
- target sector;
- typical user/client;
- demand evidence;
- mandatory vs optional;
- PT dependency;
- complexity;
- estimated implementation effort;
- operational burden;
- priority;
- recommended release.

---

# 12. Roadmap structure to produce next

The future service catalog should result in a roadmap such as:

```text
CORE V1
│
├── FEV
├── Credit Note
├── Debit Note
├── Status / artifacts
├── Idempotency
└── Reconciliation

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

This is illustrative only. The exact catalog and ordering must be established through research.

---

# 13. Architecture principles that should not be lost

Regardless of final implementation technology:

1. Multi-tenant from the beginning.
2. Tenant isolation must be testable.
3. Fiscal operations require stable internal identity.
4. Retries must never blindly create duplicates.
5. Ambiguous external outcomes must support reconciliation.
6. PT-specific logic must be isolated behind adapters.
7. Regulatory versions/rules must be replaceable without rewriting the whole platform.
8. Fiscal artifacts and evidence must be traceable.
9. The initial platform must remain operationally manageable by one person.
10. Scale complexity only after measured need.
11. The POS and future clients consume the fiscal platform; they do not define its core architecture.

---

# 14. Current project status

## Completed / substantially completed

- broad viability research;
- preliminary market/financial research;
- recognition of the basic commercial fiscal core;
- initial product vision;
- multi-tenant direction;
- provider-adapter principle;
- draft architecture;
- preliminary detailed architecture and validation work.

## Needs correction / consolidation

- complete fiscal service catalog;
- evidence-based release ordering;
- health scope;
- transportation scope;
- other-sector scope;
- architecture refactor around multi-sector fiscal core;
- final PT responsibility boundary;
- final regulatory/technical validation.

## Current status

> **PRODUCT VISION: DEFINED**  
> **CORE FISCAL MVP: DEFINED AT HIGH LEVEL**  
> **COMPLETE SERVICE CATALOG: NOT YET COMPLETE**  
> **FINAL ARCHITECTURE: NOT YET FINAL**  
> **BUILD READY: NO**

---

# 15. Definition of success

The planning/design phase is complete only when we can answer with evidence:

1. What fiscal services exist that are relevant to our target market?
2. Which are commercial/general?
3. Which belong to health?
4. Which belong to transportation?
5. Which belong to other regulated sectors?
6. Which services form the initial commercial MVP?
7. Which services come next and why?
8. What does our platform own?
9. What does the PT own?
10. How does the platform remain provider-neutral?
11. How does multi-tenancy work safely?
12. How do we add new document families and sectors without rebuilding the core?
13. What architecture best supports this roadmap at the lowest sustainable cost?
14. Can one person operate the first production stage?
15. What must be technically validated before build begins?

Only after those questions are closed should the architecture be promoted from draft to final and full implementation begin.
