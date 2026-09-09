# DATAICO — Non-Fiscal Safety Gate

## Owner requirement

During the experimental integration with DATAICO, **no real fiscal document may be issued, transmitted, re-sent, or otherwise communicated to DIAN**.

This is a hard safety requirement.

## Current evidence

Public DATAICO documentation for Factura Electronica documents production-looking endpoints under `https://api.dataico.com/direct/dataico_api/v2/invoices` and explains activation/habilitation with DIAN before real electronic invoicing. Publicly reviewed documentation does not provide enough evidence to assert that this same endpoint/account context is a non-fiscal sandbox.

Therefore the experiment MUST fail closed.

## Hard rule

Until DATAICO explicitly confirms a sandbox/test environment that has **no fiscal effect** and does **not transmit documents to DIAN**, Phase 8 remains BLOCKED for all mutating fiscal calls.

### Forbidden until sandbox is verified

- POST invoice/document creation to DATAICO
- PUT re-send/send actions
- any request with `send_dian=true`
- any request that can create CUFE/CUDE or a legally valid fiscal document
- DIAN activation/habilitation on behalf of the owner's real company
- use of production numbering/resolutions
- use of production certificate/private key
- use of real taxpayer credentials beyond what is strictly necessary to request sandbox access

## Allowed before sandbox is verified

- read DATAICO public documentation
- design the provider adapter interface
- implement offline mappings using synthetic fixtures
- implement HTTP client code behind a disabled feature flag
- contract tests against local fakes/mocks
- schema validation against documented examples
- security tests that do not call DATAICO
- prepare environment-variable names with no real secret values

## Required technical guardrails

The real DATAICO adapter MUST be fail-closed by default:

- `DATAICO_REAL_CALLS_ENABLED=false` by default
- absence of explicit verified sandbox configuration => no outbound mutating requests
- production DATAICO host rejected in test mode
- mutating methods require both an explicit test-mode flag and a verified sandbox base URL
- no `send_dian=true` permitted in the experiment
- no production numeration/resolution accepted in test fixtures
- no production certificates/keys loaded
- secrets may only come from ignored local env/secret store, never Git, logs, Claude, Codex, or screenshots

## Gate to unblock Phase 8 mutation tests

Before any mutating request to DATAICO, collect written/official evidence answering:

1. Does DATAICO provide a sandbox/test account for API integrators?
2. What is the exact sandbox base URL?
3. Does that environment connect to DIAN habilitation, a DATAICO simulator, or production DIAN?
4. Can a request in that environment create a legally valid fiscal document?
5. What test taxpayer/company data should be used?
6. What test numeration/resolution should be used?
7. What test credentials/tokens are issued?
8. How can we prove from the response that the document has no fiscal effect?

Only after these questions are verified may the owner explicitly authorize test-only mutating calls.

## Status

`DATAICO NON-FISCAL SANDBOX VERIFIED: BLOCKED`

`PHASE 8 MUTATING CALLS: PROHIBITED`
