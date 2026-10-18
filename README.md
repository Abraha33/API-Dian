# API-DIAN

API fiscal comercial multitenant para software colombiano de ERP, POS, SaaS e
integradores. El POS propio es el primer cliente y caso de operación; no es una
exclusión del producto comercial.

## Estado

**Estado documental:** `ACTIVE` — entrada operativa del repositorio
**Corte:** 2026-10-18
**Rama de trabajo:** `chore/agent-governance-2026-10-18`
**Definición de producto:** `FROZEN` — aprobada en [`docs/PRODUCT-DEFINITION-V1-FINAL.md`](./docs/PRODUCT-DEFINITION-V1-FINAL.md)
**Verificación local:** build, TypeScript, lint sin correcciones, unit, provider-contract y governance `PASS`; E2E y concurrencia `BLOCKED` por PostgreSQL local no disponible.
**CI remoto, auditoría de dependencias, Docker security y proveedor:** `UNVERIFIED`/`BLOCKED` en este corte.

```text
F0–F3  producto/requisitos/arquitectura/datos    ✅
F4A/B  contratos + shortlist PT                   ✅
F4C    sandbox/contrato PT                        ▶ bloqueo externo
F5A    pruebas/runbooks genéricos                 ✅
F6A    core SQL + canonicalización + fake         ✅
F6B    auth/repos/worker fake vertical slice      ✅
F6H    hardening interno + Docker                  ✅
F6C    adapter PT real                            ⏸ depende F4C
```

Las etiquetas de fase conservan el estado documental del baseline anterior; no
son una reejecución completa de todos los gates en este corte. Los gates locales
indicados arriba sí fueron ejecutados; CI remoto y PT permanecen `UNVERIFIED`.

Fuentes principales:

- [`docs/PRODUCT-DEFINITION-V1-FINAL.md`](./docs/PRODUCT-DEFINITION-V1-FINAL.md) — autoridad de producto V1 (`FROZEN`)
- [`docs/f0-producto-v1-validado-2026-08-18.md`](./docs/f0-producto-v1-validado-2026-08-18.md)
- [`docs/v1-requisitos.md`](./docs/v1-requisitos.md)
- ADR-003..009
- [`docs/f6-checkpoint-01-core-persistence.md`](./docs/f6-checkpoint-01-core-persistence.md)
- [`docs/f6-checkpoint-02-fake-vertical-slice.md`](./docs/f6-checkpoint-02-fake-vertical-slice.md)
- [`docs/runbook-fiscal-worker-v1.md`](./docs/runbook-fiscal-worker-v1.md)
- [`docs/DOCKER-PRODUCTION.md`](./docs/DOCKER-PRODUCTION.md) — packaging productivo y límites (`UNVERIFIED` sin build/deploy)
- [`ROADMAP.md`](./ROADMAP.md)

## Producto comercial V1 — MVP

```text
ERP/POS/SaaS/integrador → API fiscal comercial multitenant
                                  → 1 Proveedor Tecnológico habilitado → DIAN
```

El POS propio es el primer cliente y la primera superficie de validación. El
MVP cubre FEV, Nota Crédito, Nota Débito, DEE POS y ajustes del DEE POS, con
estado, webhooks de resultado para consumidores autorizados, contingencias,
idempotencia, auditoría, recuperación/reconciliación, soportes y operación
multiempresa. El acceso comercial puede ser controlado por onboarding y
contrato; eso no implica una API self-service ni un SDK público en el MVP.

HKA es candidato de validación, no proveedor seleccionado ni integrado. Su
sandbox, contrato, credenciales, protocolo de reconciliación y condiciones
operativas siguen `UNVERIFIED`.

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
- roles DB `app_api` / `app_worker` / `app_ops` / `app_ops_control` / `app_migrator`;
- API, worker y operaciones usan credenciales DB diferentes;
- object storage no gobierna workflow;
- Prisma no participa en el runtime/camino fiscal V1.

## F6A + F6B implementados

El repositorio ya contiene una espina dorsal ejecutable de extremo a extremo contra `FakeFiscalProvider`:

- schema `app` y tablas fiscales núcleo;
- RLS/FORCE RLS + tenant-safe FKs;
- constraints de idempotencia y guards de estados;
- queue durable con `SKIP LOCKED`;
- kill switches fail-closed + historial append-only;
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
- observabilidad estructurada del worker y reporte operacional limitado;
- gates de concurrencia sobre idempotencia e `SKIP LOCKED`;
- CI Node 24 con audit, build, lint, unit, migraciones, e2e y concurrencia.

Detalle: [`docs/f6-checkpoint-02-fake-vertical-slice.md`](./docs/f6-checkpoint-02-fake-vertical-slice.md).

## Gate PT

HKA es el candidato inicial para validación; la candidatura no equivale a
selección ni integración.

No se implementa adapter real hasta disponer de sandbox/contrato y demostrar
cómo se reconcilia un resultado ambiguo. Un 404 por sí solo no autoriza
reemitir. Cualquier resultado actual del PT o de CI remoto que no tenga
evidencia reproducible en este corte debe tratarse como `UNVERIFIED`.

## Siguiente trabajo

El gate externo pendiente es F4C: validar HKA o el siguiente candidato con
evidencia real. Mientras se resuelve, solo se avanza trabajo independiente del
proveedor y se mantiene el core POS como primer cliente, sin inventar
comportamiento del PT ni declarar readiness comercial o productiva.

## Setup local recomendado — Windows PowerShell

El compose local levanta **solo PostgreSQL 15**. Redis, MinIO y el antiguo contenedor API con superusuario fueron retirados porque no pertenecen a la topología V1.

Desde la raíz del repositorio:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev\bootstrap-local.ps1
```

El bootstrap:

1. levanta PostgreSQL con `docker-compose.dev.yml`;
2. aplica todas las migraciones versionadas de `supabase/migrations`;
3. crea tres logins locales sin superuser/BYPASSRLS:
   - `api_dian_dev` → `app_api` solamente;
   - `api_dian_worker_dev` → `app_worker` solamente;
   - `api_dian_ops_dev` → `app_ops` + `app_ops_control` solamente;
4. genera contraseñas aleatorias y `AUTH_PEPPER`;
5. escribe `apps/api/.env` si no existe.

Si `apps/api/.env` ya existe, no se sobrescribe por defecto: las nuevas credenciales se escriben en `apps/api/.env.bootstrap` para revisión. Para reemplazarlo explícitamente:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\dev\bootstrap-local.ps1 -OverwriteEnv
```

`.env` y `.env.bootstrap` están excluidos de Git.

### Iniciar API

```powershell
cd apps\api
npm ci
npm run start:dev
```

Health:

```powershell
curl.exe http://localhost:3000/health
curl.exe http://localhost:3000/ready
```

### Iniciar worker fake F6B

En otra PowerShell:

```powershell
cd apps\api
npm run start:worker
```

El proceso worker carga el mismo `.env`, pero **prefiere `WORKER_DATABASE_URL` sobre `DATABASE_URL`**. Así el worker usa `api_dian_worker_dev` aunque la API use `api_dian_dev`. En despliegues donde cada proceso recibe un secreto independiente, `DATABASE_URL` sigue funcionando como fallback.

El worker con `FakeFiscalProvider` rechaza `NODE_ENV=production`. El adapter real pertenece a F6C y no debe simularse con URLs o respuestas inventadas.

### Reporte operacional

Con `OPS_DATABASE_URL` disponible:

```powershell
psql $env:OPS_DATABASE_URL -v ON_ERROR_STOP=1 -f scripts\ops\fiscal-ops-report.sql
```

El login de operaciones solo obtiene lectura operacional cross-tenant limitada y control de kill switches; no puede mutar operaciones fiscales ni leer payloads/credenciales.

## Seguridad del entorno local

No ejecute la API ni el worker con `postgres`, `app_migrator` o cualquier login `BYPASSRLS`. El superusuario del contenedor existe únicamente para bootstrap/migraciones locales y no es una credencial de runtime.
