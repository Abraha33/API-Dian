# API-DIAN

API fiscal interna para comercio colombiano.

## Estado

**Corte:** 2026-08-19  
**Rama:** `dev`

```text
F0–F3  producto/requisitos/arquitectura/datos    ✅
F4A/B  contratos + shortlist PT                   ✅
F4C    sandbox/contrato PT                        ▶ bloqueo externo
F5A    pruebas/runbooks genéricos                 ✅
F6A    core SQL + canonicalización + fake         ✅
F6B    auth/repos/worker fake vertical slice      ✅
F6C    adapter PT real                            ⏸ depende F4C
```

Fuentes principales:

- [`docs/f0-producto-v1-validado-2026-08-18.md`](./docs/f0-producto-v1-validado-2026-08-18.md)
- [`docs/v1-requisitos.md`](./docs/v1-requisitos.md)
- ADR-003..009
- [`docs/f6-checkpoint-01-core-persistence.md`](./docs/f6-checkpoint-01-core-persistence.md)
- [`docs/f6-checkpoint-02-fake-vertical-slice.md`](./docs/f6-checkpoint-02-fake-vertical-slice.md)
- [`ROADMAP.md`](./ROADMAP.md)

## Producto V1

```text
POS propio → API fiscal propia → 1 Proveedor Tecnológico habilitado → DIAN
```

No es API pública comercial V1.

Regla crítica:

```text
DESCONOCIDO != REEMITIR
```

## Arquitectura V1

```text
POS
 ↓
API role ──▶ PostgreSQL administrado ◀── Worker role ──▶ PT
                         │
                         └──── metadata ──▶ Object storage privado
```

- monolito modular NestJS/Fastify/TypeScript;
- Node 24;
- `pg`/node-postgres para acceso SQL explícito;
- PostgreSQL es autoridad;
- trabajo durable en PostgreSQL;
- sin Redis/BullMQ productivo;
- API HTTP persiste, no emite;
- solo worker muta PT;
- tenant context + RLS;
- roles DB `app_api` / `app_worker` / `app_migrator`;
- API y worker usan credenciales DB distintas;
- object storage no gobierna workflow;
- Prisma no forma parte del runtime ni del modelo fiscal.

## F6A + F6B implementados

El repo ya contiene un vertical slice interno ejecutable sin PT real:

- schema `app` y tablas fiscales núcleo;
- RLS/FORCE RLS + tenant-safe FKs;
- constraints de idempotencia y guards de estados;
- queue durable con `SKIP LOCKED`;
- kill switches fail-closed;
- canonicalización/hash V1;
- auth por credential opaca + HMAC/pepper;
- `POST /v1/fiscal-operations` atómico e idempotente;
- GET tenant-safe;
- worker separado con claim/lease;
- `provider_attempt` persistido antes del side effect;
- `FakeFiscalProvider` con fault injection;
- `UNKNOWN → RECONCILING` antes de cualquier nuevo submit;
- recuperación de crash sin reemisión ciega;
- `PROVEN_NOT_SENT` como única vía de retry seguro desde `SUBMITTING`;
- tests con logins PostgreSQL no privilegiados y separados para API/worker;
- CI Node 24 con audit, build, lint, unit, e2e y migraciones.

Detalle:

- [`docs/f6-checkpoint-01-core-persistence.md`](./docs/f6-checkpoint-01-core-persistence.md)
- [`docs/f6-checkpoint-02-fake-vertical-slice.md`](./docs/f6-checkpoint-02-fake-vertical-slice.md)

## Gate PT

Shortlist: The Factory HKA, DATAICO; Facture como reserva.

No se implementa adapter real hasta disponer de sandbox/contrato y demostrar cómo se reconcilia un resultado ambiguo. Un 404 por sí solo no autoriza reemitir.

El siguiente salto de riesgo es F4C → F5B → F6C. Mientras ese gate externo siga bloqueado, el trabajo interno debe limitarse a endurecimiento, observabilidad, operación y pruebas que no inventen semántica del PT.

## Setup local API

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

## Worker local F6B

El worker fake es solo para desarrollo/pruebas y se niega a arrancar con `NODE_ENV=production`.

```bash
cd apps/api
npm run start:worker
```

Use `WORKER_DATABASE_URL` con un login distinto del API y heredando únicamente `app_worker`.

Infra local histórica puede incluir Redis/MinIO; eso no representa la topología de producción V1.
