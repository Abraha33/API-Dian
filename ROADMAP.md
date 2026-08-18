# Roadmap API-DIAN

**Corte:** 2026-08-18  
**Autoridad de producto:** `docs/f0-producto-v1-validado-2026-08-18.md`

Modelo V1:

```text
POS propio → API fiscal propia → 1 Proveedor Tecnológico habilitado → DIAN
```

Restricciones: una sola persona opera inicialmente; un PT; sin DIAN directa; sin API pública; sin multi-PT; sin custodia propia de certificados si puede delegarse de forma segura; integridad fiscal por encima de velocidad.

## Estado actual

```text
F0  Baseline de producto y validación        ✅ Cerrado
F1  Requisitos V1                            ✅ Cerrado para arquitectura
F2  Arquitectura formal y ADR                ✅ Cerrado para F3
F3  Modelo de datos + seguridad/amenazas     ✅ Cerrado para F4
F4  Contratos internos + selección del PT    ▶ Siguiente
F5  Pruebas, contingencia y operación        ⏸ Pendiente
F6  Implementación incremental               ⏸ Pendiente
F7  Readiness + piloto controlado con POS     ⏸ Pendiente
F8  Estabilización + decisión V1.1            ⏸ Pendiente
```

## F0 — Producto

Salida: `docs/f0-producto-v1-validado-2026-08-18.md`.

## F1 — Requisitos

Salida: `docs/v1-requisitos.md`.

## F2 — Arquitectura

Salidas:

- `ADR/ADR-003-arquitectura-v1-monolito-postgres.md`;
- `ADR/ADR-004-protocolo-side-effect-idempotencia-reconciliacion.md`.

Decisiones: monolito modular; PostgreSQL autoridad; trabajo durable en DB; roles `api/worker`; sin Redis/BullMQ productivo; solo worker muta PT; `UNKNOWN` reconcilia antes de repetir.

## F3 — Datos + seguridad/amenazas

**Estado: ✅ Cerrado para F4**

Salidas:

- `ADR/ADR-005-modelo-datos-tenancy-v1.md`;
- `ADR/ADR-006-seguridad-auth-threat-model-v1.md`;
- `docs/f3-modelo-datos-v1.md`;
- `docs/f3-threat-model-v1.md`.

Decisiones:

- schema `app` no expuesto directamente al POS;
- UUID aleatorio interno;
- `tenant_id NOT NULL` y FK compuestas tenant-safe;
- RLS + runtime no-owner/no-BYPASSRLS;
- roles DB separados `api`, `worker`, `migrator`;
- tenant derivado de credencial POS, no del body;
- credential opaca por instalación, scoped a un tenant;
- unique `(tenant_id, idempotency_key)` + semantic hash;
- snapshot de comando inmutable;
- attempts/jobs/evidence/artifacts/audit separados;
- evidencia/audit append-only;
- PT secret solo worker;
- object storage privado;
- restore implica reconciliar la ventana posterior al restore.

El DDL productivo/migraciones se implementa en F6 después de contratos F4; F3 define el modelo e invariantes que ese DDL debe materializar.

## F4 — Contratos internos + evaluación y selección del PT

**Estado: ▶ Siguiente**

Objetivo:

1. definir contrato versionado POS→API para FEV/NC/ND/DEE;
2. definir canonicalización/fingerprint semántico;
3. definir estados/errores públicos internos;
4. definir puerto mínimo `FiscalProvider`;
5. evaluar PTs habilitados actuales con evidencia oficial/contractual;
6. confirmar firma/certificados, multiempresa, correlación/reconciliación y contingencias;
7. seleccionar un PT o declarar que ninguno satisface gates;
8. completar campos fiscales del modelo F3 que dependan del contrato/PT.

**No seleccionar un PT por precio antes de demostrar que puede resolver resultados ambiguos.**

## F5 — Pruebas, contingencia y operación

Pruebas adversariales, contingencias reales, reconciliación, runbooks, observabilidad, restauración y kill switch.

## F6 — Implementación incremental

Orden:

1. migraciones/roles/RLS;
2. auth tenant;
3. operación/idempotencia;
4. work queue/worker;
5. `FiscalProvider` fake + fault injection;
6. FEV sandbox;
7. notas;
8. DEE;
9. artefactos/estado;
10. contingencia/reconciliación;
11. hardening.

## F7 — Readiness/piloto

Ejecutar todos los gates, limitar empresas/volumen y demostrar operación unipersonal sostenible.

## F8 — Estabilización/V1.1

Expandir solo por evidencia real.

## Regla de control de alcance

Una tarea entra V1 solo si soporta documento V1, evita pérdida/duplicación/ambigüedad, protege seguridad/auditoría/recuperación o es requisito indispensable del PT.
