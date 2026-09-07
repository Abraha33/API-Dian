# PT Selection — Deferred Decision

> **Status:** DEFERRED BY OWNER
> **Branch:** `draft/architecture-product-v1`
> **Date:** 2026-09-06
> **Scope:** This document records the PT shortlist and explicitly separates PT selection from the already-closed product and architecture definition.

## Decision

The final Technology Provider (PT) will **not be selected yet**.

The product definition and architecture remain closed and provider-neutral. PT selection is a later commercial/operational decision and must not reopen the V1 product scope or architecture unless real PT constraints prove that a contractual or technical assumption is invalid.

## Current shortlist

The current candidates to evaluate later are:

1. **The Factory HKA** — current provisional first candidate.
2. **DATAICO** — strong candidate, especially because its public positioning appears compatible with software/integrator relationships managing multiple end customers.
3. **Alegra Proveedor Electrónico** — strong technical candidate with multi-company API concepts, sandbox and webhook capabilities.

No provider is approved, contracted or selected by this document.

## Why no final selection yet

All three candidates appear to satisfy the basic technical eligibility criteria sufficiently to remain in the shortlist, but the decisive commercial and operational information is not publicly complete.

The missing information must be obtained directly from each provider before a decision:

- permission to operate hundreds or thousands of end companies behind our public API;
- contractual relationship between PT, our platform and each end customer;
- ability to commercialize our own plans/document packages;
- price at approximately 10,000 / 100,000 / 1,000,000 / 10,000,000 documents per month;
- minimum monthly commitments;
- onboarding cost per company;
- certificate-related costs and responsibilities;
- API or integration fees;
- rate limits and concurrency limits;
- SLA and availability commitments;
- support channels and response times;
- sandbox conditions;
- supported fiscal document families;
- reconciliation/query capabilities for ambiguous states;
- migration/exit conditions and data/artifact portability.

## Selection scorecard for later use

| Criterion | Weight |
|---|---:|
| Multi-company / integrator commercial model | 25 |
| Total cost | 25 |
| API reliability, state query and reconciliation | 15 |
| End-customer onboarding model | 10 |
| SLA, capacity and rate limits | 10 |
| Future fiscal services / roadmap coverage | 10 |
| Technical support | 5 |
| **Total** | **100** |

## Current position

- **The Factory HKA:** provisional candidate #1, not approved.
- **DATAICO:** could become #1 if its commercial/wholesale model and total cost are materially better.
- **Alegra Proveedor Electrónico:** remains a strong comparison candidate, especially technically.

The winner must be selected using the same commercial questionnaire and comparable quotations from all finalists rather than by documentation quality or brand preference alone.

## Architecture rule

The public API contract stays **PT-neutral**.

```text
Third-party POS / ERP / SaaS
            ↓
      OUR PUBLIC API
            ↓
       FISCAL CORE
            ↓
  PROVIDER-NEUTRAL ADAPTER
            ↓
        SELECTED PT
            ↓
           DIAN
```

Changing PT later must not require third-party clients to change our public API contract.

## Owner authorization required later

Manual owner authorization is required before:

1. selecting the final PT;
2. signing any PT agreement;
3. accepting minimum commitments or paid plans;
4. paying setup, certificate, API or document fees;
5. providing real production credentials;
6. enabling a PT in production.

Until then, implementation may continue using the provider-neutral contract, fake/mock provider and sandbox-oriented architecture.

## Relationship to current project gates

This deferred decision does **not** change:

- `PRODUCT VISION: PASS`;
- `PUBLIC API V1 SCOPE: PASS`;
- `COMPLETE SERVICE CATALOG: PASS`;
- `ROADMAP: PASS`;
- `ARCHITECTURE FINAL: PASS`.

It does keep the following gate blocked until later:

- `PT selected/contracted/sandbox proven: BLOCKED`.

Production also remains blocked by implementation, dependency remediation, regulatory release validation, security/pentest, load testing, restore drill and controlled pilot.
