# API-DIAN

API fiscal interna para comercio colombiano.

## Estado

**Corte:** 2026-08-19  
**Rama consolidada:** `dev`

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
- `pg` / node-postgres para acceso SQL explícito;
- PostgreSQL es autoridad;
- trabajo durable en PostgreSQL;
- sin Redis/BullMQ productivo;
- solo worker muta PT;
- tenant context + RLS;
- roles DB `app_api` / `app_worker` / `app_migrator`;
- API y worker usan credenciales DB diferentes;
- object storage no gobierna workflow;
- Prisma no participa en el runtime/camino fiscal V1.

## F6A + F6B implementados

El repositorio ya contiene una espina dorsal ejecutable de extremo a extremo contra `FakeFiscalProvider`:

- schema `app` y tablas fiscales núcleo;
- RLS/FORCE RLS + tenant-safe FKs;
- constraints de idempotencia y guards de estados;
- queue durable con `SKIP LOCKED`;
- kill switches fail-closed;
- canonicalización/hash V1;
- auth por credencial opaca + HMAC/pepper;
- intake atómico `operation + audit + work`;
- replay idempotente y conflicto semántico;
- GET tenant-safe;
- proceso worker separado;
- leases + `provider_attempt` previo al side effect;
- `FakeFiscalProvider` con fault injection;
- `UNKNOWN → RECONCILING` sin retry ciego;
- `PROVEN_NOT_SENT` como evidencia necesaria para volver a `READY` desde `SUBMITTING`;
- recuperación de crash hacia `UNKNOWN`;
- CI Node 24 con audit, build, lint, unit, migraciones y e2e usando logins DB `ci_api` / `ci_worker` separados.

Detalle: [`docs/f6-checkpoint-02-fake-vertical-slice.md`](./docs/f6-checkpoint-02-fake-vertical-slice.md).

## Gate PT

Shortlist: The Factory HKA, DATAICO; Facture como reserva.

No se implementa adapter real hasta disponer de sandbox/contrato y demostrar cómo se reconcilia un resultado ambiguo. Un 404 por sí solo no autoriza reemitir.

## Siguiente trabajo

El gran gate funcional pendiente es F4C. Mientras se resuelve, solo se avanza trabajo independiente del proveedor: observabilidad, runbooks, carga/concurrencia, limpieza técnica y harness del adapter sin inventar comportamiento del PT.

## Setup local — API

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

## Setup local — worker fake F6B

Use un login PostgreSQL diferente al de la API, heredando `app_worker` y no `app_api`.

```bash
cd apps/api
DATABASE_URL="$WORKER_DATABASE_URL" npm run start:worker
```

El worker con `FakeFiscalProvider` **rechaza `NODE_ENV=production`**. El adapter real pertenece a F6C y no debe simularse con URLs o respuestas inventadas.

Infra local histórica puede incluir Redis/MinIO; eso no representa la topología de producción V1.
