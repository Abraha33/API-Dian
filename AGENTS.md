# AGENTS.md — API-DIAN

## Mission

Construir y validar API-DIAN V1 desde la arquitectura canónica sin reabrir decisiones cerradas y preservando la operación inicial por una sola persona.

## Authority order

Read in this order before making implementation decisions:

1. `GOAL.md`
2. `docs/build/README.md`
3. `docs/build/OFFICIAL-CONSTRUCTION-PLAN-V1.md`
4. `docs/build/INDEPENDENT-MODULES-V1.md`
5. `docs/build/LOCAL-FIRST-EXECUTION-MODEL.md`
6. `docs/build/PRODUCTION-READINESS-GATES-V1.md`
7. `docs/architecture/final/README.md` and linked final architecture documents
8. `docs/service-catalog/MASTER-FISCAL-SERVICE-CATALOG.md`
9. `docs/service-catalog/RELEASE-ROADMAP.md`
10. `docs/HANDOFF-NEXT-CHAT.md`

Older build plans are historical when they conflict with the above.

## Canonical product rules

- Public multitenant fiscal API for third-party POS, ERP, SaaS, integrators and our own POS as one client.
- Public API: HTTP/REST-style + JSON + OpenAPI 3.1.
- Provider-neutral fiscal core.
- PostgreSQL is authority.
- API and worker are separate processes/deployments.
- Durable outbox/work queue before external side effects.
- Object storage for fiscal artifacts/evidence.
- Tenant + organization + application + environment isolation.
- `Idempotency-Key` mandatory on fiscal mutations.
- `UNKNOWN != REEMITIR`.
- First commercial stage must be operable by one person.

## Execution model

For each capability:

1. conceptualize;
2. define tests and PASS criteria;
3. implement/test locally;
4. integrate locally;
5. automate only after local behavior is reproducible;
6. use external PT/DIAN/cloud only when the corresponding gate requires it.

Use fakes/mocks instead of inventing external provider behavior.

## Local-first

The owner has a local/self-hosted runner. Local terminal execution remains the first evidence source. Do not make GitHub Actions a prerequisite for conceptual or isolated module work.

Existing `.github/workflows/ci.yml` is legacy/preexisting until the Automation stage audits and adapts it.

## Branch safety

- Never modify `dev` directly.
- Never merge protected branches automatically.
- Implementation should occur on a dedicated build branch created from the current canonical planning authority.
- Keep commits small, descriptive and reversible.

## External approval boundaries

Do not autonomously:

- choose/contract/pay a PT;
- spend real cloud money beyond already authorized resources;
- use production credentials;
- onboard real clients;
- publish/go live;
- merge to protected production branches;
- finalize health/transport sector scope without the pending research/owner decision.

## Capacity

Current target to prove, not promise:

- up to ~3M fiscal documents/month;
- ~50 docs/s commercial burst target;
- one-person operation;
- zero duplicates;
- zero cross-tenant data access.

Never convert estimates into capacity claims. `CAPACITY READY` requires reproducible benchmark evidence.

## Stop conditions

Do not stop for routine implementation choices that are already resolved by the canonical docs. Stop only for a real external blocker, destructive/production action, financial commitment, missing required secret/contract, or genuine contradiction between canonical authorities that cannot be conservatively resolved.

## Evidence

Every phase closure must include:

- exact tests executed;
- results;
- relevant configuration;
- known limitations;
- updated gate status;
- commit SHA;
- next safe step.