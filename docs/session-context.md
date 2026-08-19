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
F6H hardening interno PT-independent ✅
F6C adapter real ⏸ depende F4C
F7 readiness/piloto ⏸ depende F6C
```

Rama principal de trabajo consolidado: `dev`.

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
- `docs/runbook-fiscal-worker-v1.md`;
- `ROADMAP.md`.

## Invariantes

- PostgreSQL autoridad;
- API HTTP persiste, no emite;
- solo worker muta PT;
- `provider_attempt` antes del side effect remoto;
- ambigüedad → `UNKNOWN`;
- `UNKNOWN` reconcilia antes de cualquier nuevo submit;
- no retry HTTP transparente de mutaciones;
- retry de submit solo con evidencia concluyente de no envío;
- tenant por credential + RLS;
- evidencia append-only;
- API no tiene secreto PT;
- API, worker y ops usan credenciales DB separadas;
- kill switch de submit no pausa reconcile/read;
- superusuario/app_migrator nunca es runtime normal, tampoco en desarrollo.

## Contrato interno actual

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

## F6A + F6B implementados

Flujo ejecutable probado:

```text
credential
→ auth tenant
→ POST command
→ c14n/idempotency
→ operation + audit + work (1 tx)
→ worker claim/lease
→ provider_attempt persistido
→ FakeFiscalProvider
→ ACCEPT/REJECT/PROVEN_NOT_SENT/UNKNOWN
→ reconcile
```

Decisiones cerradas:

- cliente DB: `pg` / node-postgres;
- SQL explícito en repositories;
- Prisma retirado del scaffold activo;
- proceso API con login `app_api`;
- proceso worker con login `app_worker` distinto;
- fake worker prohibido en producción;
- crash en `SUBMITTING` se recupera a `UNKNOWN`, nunca a segundo submit;
- `SUBMITTING → READY` exige último attempt `PROVEN_NOT_SENT`;
- kill switch bloquea nuevos side effects pero permite reconciliación.

Evidencia base:

- F6B1: PR #55, snapshot `a2b5b2ede98024968372e5a3df97353b5bbc5117`;
- F6B2: PR #56, CI run #54, snapshot `7a940ac46e8f977bf33374fb5d1c75ad56d192c1`;
- closeout F6B: `c176a223c1d9dd7908124847b8d4d3f123a48e12`.

## F6H — hardening posterior a F6B

### Operación/observabilidad

Consolidado en `dev`:

- worker emite `worker_job_completed`, `provider_submit_result`, `provider_reconcile_result`;
- sin payloads fiscales/credenciales en logs;
- `app_ops`: NOLOGIN, cross-tenant read-only con columnas limitadas;
- `app_ops_control`: NOLOGIN, solo kill switches;
- `runtime_control_events`: historial append-only de cambios;
- `scripts/ops/fiscal-ops-report.sql`;
- `docs/runbook-fiscal-worker-v1.md`.

Snapshot: `fb84c99be55694b3cd830a84d153ca3cf9b9bf12`.

### Concurrencia

Gate permanente validado en CI #66 y consolidado como `77d2ac797747a0ac7075d2ae4ed9bd8f2fd75cda`:

- 32 requests iguales/same key → 1 operación, 1 work, 1 audit;
- payloads distintos/same key → exactamente un 202 y un 409;
- 40 comandos distintos simultáneos → 40 operaciones únicas;
- 42 claims paralelos → cada work exactamente una vez, sin claim extra.

El harness usa servidor Fastify real en puerto efímero + `Promise.allSettled`; un fallo previo por `ECONNRESET` fue identificado como problema del harness, no PostgreSQL.

### Infra local

PR #60 / CI #69 validó:

- `docker-compose.dev.yml` reducido a PostgreSQL 15 solamente;
- Redis/MinIO retirados del setup local activo;
- eliminado runtime local de API con superusuario `postgres`;
- `scripts/dev/bootstrap-local.ps1` compatible con Windows PowerShell y validado por parser;
- bootstrap aplica migraciones y genera secretos;
- logins locales separados:
  - `api_dian_dev` → `app_api`;
  - `api_dian_worker_dev` → `app_worker`;
  - `api_dian_ops_dev` → `app_ops` + `app_ops_control`;
- CI ejecuta `scripts/dev/provision-local-runtime.sql` y `verify-local-runtime.sql` para impedir membresías cruzadas;
- worker prefiere `WORKER_DATABASE_URL` cuando existe, con `DATABASE_URL` como fallback de despliegue.

## Runtime/CI actual

- Node 24;
- `npm audit --omit=dev --audit-level=high`;
- compose local syntax check;
- PowerShell bootstrap syntax check;
- build/lint/unit;
- migraciones SQL + verificaciones estructurales/comportamiento;
- provisioning de runtime local least-privilege;
- ops control/report;
- e2e con `ci_api` / `ci_worker` separados;
- concurrency correctness gate con timeout explícito de 120 s.

## PT

Candidatos: The Factory HKA, DATAICO; Facture reserva. No hay selección final hasta sandbox + contrato de ambigüedad/reconciliación.

No crear adapter productivo todavía.

## Siguiente trabajo permitido

Observabilidad, runbook, concurrencia y limpieza local ya están cerrados.

Mientras F4C no se resuelva, el siguiente frente interno seguro es:

1. contract-test harness del adapter basado en fixtures abstractos;
2. checklist de evidencia que F4C debe proporcionar para llenar esos fixtures;
3. packaging/deployment mínimo solo si reduce riesgo sin introducir componentes productivos nuevos.

No inventar endpoints, códigos, reintentos, XML/PDF ni rate limits de un PT.

El siguiente gran gate funcional sigue siendo F4C → F5B/F6C.
