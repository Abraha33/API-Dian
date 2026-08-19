# Contexto de sesión — API-DIAN

## Baseline de producto congelado — 2026-08-19

La autoridad actual para definir **qué producto se construye** es:

- `docs/PRODUCT-DEFINITION-V1-FINAL.md`

Estado de planificación:

```text
PRODUCT-DEFINITION-V1-FINAL.md   ✅ FROZEN
SYSTEM-ARCHITECTURE-V1.md        ▶ SIGUIENTE
BUILD-PLAN-V1.md                 ⏸
Backlog detallado                ⏸
Plan de construcción diario      ⏸
Nueva implementación             ⏸ hasta completar la secuencia anterior
```

El código ya existente se conserva como **trabajo adelantado**, pero no es autoridad sobre el producto. Cuando se cierre arquitectura y planificación, cada pieza existente deberá clasificarse como `CONSERVAR`, `ADAPTAR`, `REHACER` o `ELIMINAR`.

Regla de proceso vigente:

```text
producto
→ arquitectura
→ plan de construcción
→ backlog y dependencias
→ plan diario
→ código
```

No continuar agregando implementación por inercia antes de completar esta secuencia.

---

## Estado técnico heredado

```text
F0–F3 ✅
F4A contratos ✅
F4B shortlist PT ✅
F4C sandbox/contrato PT ▶ bloqueo externo cuando corresponda ejecutar esa etapa
F5A diseño pruebas/runbooks ✅
F5B pruebas reales PT ⏸ depende F4C
F6A core independiente PT ✅
F6B auth/repos/worker fake ✅
F6H hardening interno PT-independent ✅
F6C adapter real ⏸ depende F4C
F7 readiness/piloto ⏸ depende F6C
```

Rama principal consolidada: `dev`.

## Producto

```text
POS → API-DIAN → 1 PT habilitado → DIAN
```

Mercado inicial: comercios colombianos.  
Consumidor técnico inicial: nuestro propio POS.  
V1 no nace como API pública para terceros.

No reabrir producto/alcance congelado salvo evidencia nueva suficientemente fuerte.

## Fuentes maestras

- `docs/PRODUCT-DEFINITION-V1-FINAL.md` — autoridad de producto;
- baseline F0;
- `docs/v1-requisitos.md`;
- ADR-003/004 arquitectura + side effects existentes;
- ADR-005/006 datos + seguridad existentes;
- ADR-007/008 contratos + PT gates existentes;
- ADR-009 pruebas/fault injection/kill switch existente;
- `docs/f4-matriz-seleccion-pt-v1.md`;
- `docs/f4-prueba-ambiguedad-pt-v1.md`;
- `docs/f4c-public-precheck-2026-08-19.md`;
- `docs/f4c-evidencia-publica-2026-08-19.md`;
- `docs/f4c-cuestionario-solicitud-sandbox-pt.md`;
- `docs/f6-checkpoint-01-core-persistence.md`;
- `docs/f6-checkpoint-02-fake-vertical-slice.md`;
- `docs/runbook-fiscal-worker-v1.md`;
- `docs/f6-provider-contract-harness.md`;
- `ROADMAP.md`.

Los documentos técnicos existentes son insumos para la siguiente fase de arquitectura; no pueden ampliar silenciosamente el alcance definido por `PRODUCT-DEFINITION-V1-FINAL.md`.

## Invariantes ya identificados

- `DESCONOCIDO != REEMITIR`;
- PostgreSQL como autoridad en la implementación existente;
- API HTTP persiste, no emite, en el diseño existente;
- solo worker muta PT, en el diseño existente;
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
- superusuario/app_migrator nunca es runtime normal;
- `PROVEN_NOT_SENT` y `NOT_FOUND_CONCLUSIVE` requieren prueba referenciada, no inferencia informal;
- evidencia pública decide orden de prueba, **no** sustituye PASS contractual.

Excepto `DESCONOCIDO != REEMITIR`, que ya es invariante de producto, los detalles técnicos anteriores deberán ratificarse o ajustarse durante `SYSTEM-ARCHITECTURE-V1.md`.

## Contrato interno implementado actualmente

```text
POST /v1/fiscal-operations
Authorization: Bearer <credential>
Idempotency-Key: <key>
schema_version = 1.0
```

Tipos implementados/contemplados: FEV, CREDIT_NOTE, DEBIT_NOTE, ELECTRONIC_POS, POS_ADJUSTMENT.

Hash existente:

```text
validated DTO
→ semantic projection
→ fiscal-command-c14n/1
→ SHA-256
```

`FiscalProvider` existente: `submit`, `reconcile`, `getStatus`, `fetchXml`, `fetchPdf`; no `resend`.

## Implementación adelantada existente

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

Incluye actualmente:

- `pg` / node-postgres y SQL explícito en repositories;
- logins separados `app_api`, `app_worker`, ops;
- FakeFiscalProvider prohibido en producción;
- crash en `SUBMITTING` → `UNKNOWN`;
- kill switches;
- telemetría estructurada;
- `runtime_control_events` append-only;
- pruebas de concurrencia;
- compose local PostgreSQL 15;
- bootstrap PowerShell;
- harness abstracto de contrato PT.

Pruebas históricas relevantes:

- 32 requests misma idempotency key → 1 operación/work/audit;
- carrera semántica misma key → un 202 + un 409;
- 40 operaciones distintas simultáneas → 40 operaciones;
- 42 claims paralelos → cada work una vez.

Este bloque **no autoriza continuar construyendo**. Se auditará contra la arquitectura definitiva cuando llegue esa fase.

## F4C — evidencia pública disponible

Orden racional de prueba actualmente documentado:

```text
1. HKA
2. DATAICO
3. Facture / ESTELA
```

Esto no constituye selección final de proveedor.

### HKA

La evidencia pública localizada encaja mejor con el requisito de manejar estados no concluyentes/reconsulta, pero todavía no demuestra el mapping real de códigos ni un criterio contractual de `NOT_FOUND_CONCLUSIVE`.

### DATAICO

Existe evidencia de API orientada a software/ERP/POS y estados pendientes/sincronización, pero `DIAN_NO_ENVIADO` no se mapeará por nombre a `PROVEN_NOT_SENT` y falta prueba contractual/sandbox de los criterios críticos.

### Facture / ESTELA

Permanece como reserva hasta obtener paquete técnico privado comparable.

## Gate de selección/integración PT

Cuando el plan de construcción llegue a esa etapa, F4C requerirá como mínimo:

```text
sandbox real
+ FEV
+ POS electrónico
+ auth
+ correlación durable
+ timeout controlado
+ reconcile
+ prueba duplicado
+ criterio seguro de inexistencia
+ XML/PDF
+ SLA/soporte
+ contrato/precio
+ responsabilidad certificado
```

Un 404 aislado nunca equivale a `NOT_FOUND_CONCLUSIVE`; un estado “no enviado” tampoco equivale a `PROVEN_NOT_SENT` por nombre.

## Siguiente avance oficial

**No es construir más runtime ni contactar proveedores como sustituto de la planificación del producto.**

El siguiente entregable es:

```text
SYSTEM-ARCHITECTURE-V1.md
```

Debe derivarse de `docs/PRODUCT-DEFINITION-V1-FINAL.md`, revisar críticamente la arquitectura ya implementada y decidir qué se conserva, ajusta o descarta.

Después deberán producirse, en este orden:

1. `BUILD-PLAN-V1.md`;
2. backlog completo por fases/épicas/historias/tareas;
3. mapa de dependencias;
4. Definition of Done por unidad;
5. plan diario de construcción;
6. reanudación controlada del código.
