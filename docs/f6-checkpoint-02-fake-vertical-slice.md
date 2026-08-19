# F6 Checkpoint 02 — Vertical slice interno con FakeFiscalProvider

**Corte:** 2026-08-19  
**Estado:** ✅ F6B cerrado

## Objetivo

Demostrar el protocolo fiscal completo sin depender todavía de un Proveedor Tecnológico real:

```text
credential POS
→ auth + tenant
→ POST idempotente
→ PostgreSQL (operation + audit + work)
→ worker separado
→ provider_attempt persistido
→ FakeFiscalProvider
→ ACCEPT / REJECT / UNKNOWN
→ reconcile
```

## Implementado

### API

- `pg`/node-postgres como acceso SQL explícito; Prisma fue retirado.
- `DATABASE_URL` pertenece al proceso API y debe usar un login que herede únicamente `app_api`.
- autenticación por credential opaca `Bearer` con HMAC-SHA256 + pepper;
- tenant derivado de la credential, no del payload;
- transacciones tenant-aware con contexto local para RLS;
- `POST /v1/fiscal-operations` persiste operación, auditoría y trabajo en una sola transacción;
- idempotencia por `(tenant_id, idempotency_key)` + hash semántico canonizado;
- replay del mismo comando sin duplicar side effects;
- conflicto si la misma key representa semántica distinta;
- `GET /v1/fiscal-operations/:id` tenant-safe por RLS.

### Worker

- proceso/composition root separado de la API;
- `WORKER_DATABASE_URL` usa login distinto que hereda únicamente `app_worker`;
- claim durable de trabajo con lease;
- `provider_attempt` se persiste antes de cualquier llamada mutante al provider;
- `FakeFiscalProvider.submit` y `reconcile` ejercitan resultados concluyentes y ambiguos;
- no hay retry HTTP transparente de mutaciones;
- si un submit queda ambiguo: `SUBMITTING → UNKNOWN → RECONCILING`;
- si el worker cae después de iniciar el intento, al recuperar el trabajo no reemite: marca ambigüedad y reconcilia;
- `SUBMITTING → READY` solo se permite si el último attempt prueba `PROVEN_NOT_SENT`;
- kill switch `provider_mutations_enabled=false` bloquea nuevos submits pero no bloquea recuperación/reconciliación;
- agotamiento de reconciliación termina en `NEEDS_ATTENTION`, no en reemisión ciega.

### Seguridad / separación de privilegios

- API y worker usan logins PostgreSQL distintos;
- pruebas e2e ejecutan API como `ci_api` y worker como `ci_worker`, ambos no privilegiados;
- SQL/RLS sigue siendo la autoridad de aislamiento;
- el proceso HTTP no posee permisos de worker;
- el fake worker se niega a arrancar en `NODE_ENV=production`.

## Casos adversariales verificados

- credential ausente/inválida;
- replay idempotente;
- misma key con comando distinto;
- acceso cross-tenant oculto;
- submit aceptado;
- timeout/resultado ambiguo;
- visibilidad remota tardía + reconcile;
- transporte probado como no enviado + retry seguro;
- kill switch de mutaciones;
- crash después de side effect remoto sin confirmación local;
- recuperación de `SUBMITTING` sin segundo submit.

## Evidencia CI

Validación final en PR efímero **#56**, run **#54**:

- Node 24;
- `npm ci`;
- `npm audit --omit=dev --audit-level=high`;
- build;
- lint;
- unit tests;
- migraciones/constraints/RLS;
- provisioning de roles de prueba;
- e2e con `ci_api` y `ci_worker` separados.

Todo PASS. El árbol validado fue promovido limpio a `dev` como commit `7a940ac46e8f977bf33374fb5d1c75ad56d192c1`; el PR se cerró sin merge para no arrastrar commits temporales de validación.

## Lo que F6B NO significa

- no existe adapter de PT real;
- no se ha seleccionado definitivamente PT;
- no hay sandbox/contrato probado;
- no se custodió certificado fiscal;
- no se autoriza emisión productiva;
- el fake provider no debe ejecutarse en producción.

## Gate siguiente

El siguiente salto que cambia riesgo fiscal es **F4C/F5B/F6C**:

1. conseguir sandbox + contrato del PT candidato;
2. ejecutar prueba de ambigüedad/reconciliación;
3. seleccionar PT solo con evidencia;
4. congelar mapping/versiones y contract tests;
5. implementar adapter real detrás de `FiscalProvider` sin modificar el protocolo interno ya probado.

Mientras F4C siga bloqueado, el trabajo interno permitido debe limitarse a endurecimiento, observabilidad, herramientas de operación y pruebas que no inventen comportamiento del PT.
