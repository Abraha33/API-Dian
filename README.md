# API-DIAN

API fiscal interna para comercio colombiano.

## Estado

**Corte:** 2026-08-18

| Fase | Estado |
|---|---|
| F0 producto | ✅ |
| F1 requisitos | ✅ |
| F2 arquitectura | ✅ |
| F3 datos + seguridad | ✅ |
| F4 contratos + selección PT | ▶ siguiente |

Rama: `dev`.

Fuentes autoritativas:

- [`docs/f0-producto-v1-validado-2026-08-18.md`](./docs/f0-producto-v1-validado-2026-08-18.md)
- [`docs/v1-requisitos.md`](./docs/v1-requisitos.md)
- [`ADR/ADR-003-arquitectura-v1-monolito-postgres.md`](./ADR/ADR-003-arquitectura-v1-monolito-postgres.md)
- [`ADR/ADR-004-protocolo-side-effect-idempotencia-reconciliacion.md`](./ADR/ADR-004-protocolo-side-effect-idempotencia-reconciliacion.md)
- [`ADR/ADR-005-modelo-datos-tenancy-v1.md`](./ADR/ADR-005-modelo-datos-tenancy-v1.md)
- [`ADR/ADR-006-seguridad-auth-threat-model-v1.md`](./ADR/ADR-006-seguridad-auth-threat-model-v1.md)
- [`docs/f3-modelo-datos-v1.md`](./docs/f3-modelo-datos-v1.md)
- [`docs/f3-threat-model-v1.md`](./docs/f3-threat-model-v1.md)
- [`ROADMAP.md`](./ROADMAP.md)

## Producto V1

```text
POS propio → API fiscal propia → 1 Proveedor Tecnológico habilitado → DIAN
```

No es API pública comercial V1.

## Regla crítica

```text
DESCONOCIDO != REEMITIR
```

La garantía no es distributed exactly-once. Es idempotencia persistida, un solo camino de mutación, evidencia por intento y reconciliación antes de repetir.

## Arquitectura resumida

```text
POS
 ↓
API role ──▶ PostgreSQL administrado ◀── Worker role ──▶ PT
                         │
                         └──── metadata ──▶ Object storage privado
```

- monolito modular;
- Node 24 LTS + TypeScript/NestJS/Fastify al implementar;
- PostgreSQL autoridad;
- trabajo durable en PostgreSQL;
- sin Redis/BullMQ productivo;
- solo worker muta PT;
- tenant context + RLS;
- DB roles separados api/worker/migrator;
- object storage no es autoridad de workflow.

## Modelo de datos núcleo

`tenants`, `api_credentials`, `fiscal_operations`, `provider_attempts`, `work_items`, `evidence_records`, `artifacts`, `audit_events`.

Payload original + idempotency + semantic hash son inmutables. Evidencia/audit son append-only. Referencias usan tenant-safe FKs.

## Seguridad

Credencial propia por instalación POS, scoped a un tenant; tenant nunca se toma del body. Runtime normal no usa superuser/service-role/BYPASSRLS. PT secret solo existe en worker. Buckets privados y logs minimizados.

## Siguiente: F4

Definir contrato interno y `FiscalProvider`, después investigar y probar PTs habilitados vigentes. La capacidad de correlacionar/reconciliar un timeout ambiguo es gate de selección, no feature opcional.

No construir lógica fiscal productiva contra un PT antes de cerrar F4.

## Setup local existente

La app base está en `apps/api/`. El compose histórico puede contener Redis/MinIO; no representa producción V1.

```bash
cd apps/api
cp .env.example .env
npm ci
npm run build
npm run start:dev
```

Health:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
```
