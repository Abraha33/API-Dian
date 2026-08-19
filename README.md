# API-DIAN

API fiscal interna para comercio colombiano.

## Estado

**Corte:** 2026-08-18/19  
**Rama:** `dev`

```text
F0–F3  producto/requisitos/arquitectura/datos    ✅
F4A/B  contratos + shortlist PT                   ✅
F4C    sandbox/contrato PT                        ▶ bloqueo externo
F5A    pruebas/runbooks genéricos                 ✅
F6A    core SQL + canonicalización + fake         ✅
F6B    auth/repos/worker fake vertical slice      ▶ siguiente
```

Fuentes principales:

- [`docs/f0-producto-v1-validado-2026-08-18.md`](./docs/f0-producto-v1-validado-2026-08-18.md)
- [`docs/v1-requisitos.md`](./docs/v1-requisitos.md)
- ADR-003..009
- [`docs/f6-checkpoint-01-core-persistence.md`](./docs/f6-checkpoint-01-core-persistence.md)
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
- PostgreSQL es autoridad;
- trabajo durable en PostgreSQL;
- sin Redis/BullMQ productivo;
- solo worker muta PT;
- tenant context + RLS;
- roles DB `app_api` / `app_worker` / `app_migrator`;
- object storage no gobierna workflow.

## F6A ya implementado

El repo contiene la primera espina dorsal ejecutable:

- schema `app` y tablas fiscales núcleo;
- RLS/FORCE RLS + tenant-safe FKs;
- constraints de idempotencia y guards de estados;
- queue durable con `SKIP LOCKED`;
- kill switches fail-closed;
- canonicalización/hash V1;
- `FiscalProvider` mínimo;
- `FakeFiscalProvider` con fault injection;
- tests TypeScript y verificaciones PostgreSQL de comportamiento;
- CI Node 24 con audit de dependencias productivas, build, lint, unit, e2e y migraciones.

Detalle: [`docs/f6-checkpoint-01-core-persistence.md`](./docs/f6-checkpoint-01-core-persistence.md).

## Gate PT

Shortlist: The Factory HKA, DATAICO; Facture como reserva.

No se implementa adapter real hasta disponer de sandbox/contrato y demostrar cómo se reconcilia un resultado ambiguo. Un 404 por sí solo no autoriza reemitir.

## Siguiente trabajo

F6B construye el flujo completo **contra `FakeFiscalProvider`**: auth por credential, tenant context, recepción atómica/idempotente, worker, attempts, `UNKNOWN` y reconciliación. La primera decisión es el cliente PostgreSQL/repository layer mínimo; SQL/RLS seguirá siendo la fuente de verdad.

## Setup local

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

Infra local histórica puede incluir Redis/MinIO; eso no representa la topología de producción V1.
