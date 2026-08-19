# Roadmap API-DIAN

**Corte:** 2026-08-19  
**Autoridad de producto:** `docs/f0-producto-v1-validado-2026-08-18.md`

```text
POS propio → API fiscal propia → 1 Proveedor Tecnológico habilitado → DIAN
```

Restricciones: una sola persona opera inicialmente; un PT; sin DIAN directa; sin API pública; sin multi-PT; sin custodia propia de certificados si puede delegarse; integridad fiscal por encima de velocidad.

## Estado actual

```text
F0   Baseline producto                         ✅
F1   Requisitos V1                             ✅
F2   Arquitectura                              ✅
F3   Datos + seguridad                         ✅
F4A  Contratos internos                        ✅
F4B  Shortlist/evidencia pública PT            ✅
F4C  Sandbox + contrato + selección PT         ▶ Bloqueante externo
F5A  Pruebas adversariales genéricas/runbooks  ✅
F5B  Contingencias + contract tests PT         ⏸ depende F4C
F6A  Core SQL + c14n + fake provider           ✅
F6B  Auth/repos/worker + fake vertical slice   ✅
F6C  Adapter PT real                           ⏸ depende F4C
F7   Readiness + piloto                         ⏸
F8   Estabilización + V1.1                      ⏸
```

## Salidas cerradas F0–F6B

- baseline: `docs/f0-producto-v1-validado-2026-08-18.md`;
- requisitos: `docs/v1-requisitos.md`;
- arquitectura/side effects: ADR-003/004;
- datos/seguridad: ADR-005/006 + docs F3;
- contrato/idempotencia/PT gates: ADR-007/008 + docs F4;
- pruebas/fault injection/kill switch: ADR-009 + docs F5;
- core independiente PT: `docs/f6-checkpoint-01-core-persistence.md`;
- vertical slice interno: `docs/f6-checkpoint-02-fake-vertical-slice.md`.

## F6A — Core independiente del PT

**Estado: ✅ Cerrado**

Implementado y verificado:

- schema `app`, tablas núcleo, roles/RLS/FK tenant-safe;
- guards DB para inmutabilidad/transiciones;
- queue durable PostgreSQL/`SKIP LOCKED`;
- kill switches fail-closed;
- canonicalización/hash semántico;
- `FiscalProvider` mínimo + `FakeFiscalProvider`;
- Node 24;
- supply-chain gate de dependencias productivas;
- CI con migraciones y pruebas PostgreSQL de comportamiento.

## F6B — Vertical slice interno con fake provider

**Estado: ✅ Cerrado**

Implementado y probado:

1. `pg`/node-postgres como capa SQL explícita; Prisma retirado;
2. conexión/transacciones tenant-aware con RLS;
3. auth de credential POS con HMAC + pepper;
4. recepción atómica `operation + audit + work`;
5. GET operation tenant-safe;
6. worker separado con login `app_worker`;
7. claim/lease durable + `provider_attempt` persistido antes de submit;
8. `FakeFiscalProvider.submit` + reconciliación;
9. `UNKNOWN → RECONCILING` antes de cualquier decisión de reenvío;
10. `PROVEN_NOT_SENT` como única vía segura de `SUBMITTING → READY`;
11. kill switch que bloquea submit pero no reconcile/read;
12. pruebas e2e con logins PostgreSQL `ci_api` y `ci_worker` no privilegiados.

Evidencia final: PR efímero #56, run #54, todo PASS. Snapshot limpio promovido a `dev` como `7a940ac46e8f977bf33374fb5d1c75ad56d192c1`.

## F4C / F5B / F6C — Gate externo PT

Shortlist actual:

1. The Factory HKA;
2. DATAICO;
3. Facture como reserva.

No hay selección definitiva hasta ejecutar `docs/f4-prueba-ambiguedad-pt-v1.md` y confirmar contrato/sandbox real. Un 404 aislado nunca equivale automáticamente a `NOT_FOUND_CONCLUSIVE`.

Solo después:

- contract tests reales;
- contingencias según causa;
- límites/backoff reales;
- XML/PDF reales;
- adapter seleccionado.

**No implementar adapter productivo inventando semántica del PT.** Mientras F4C permanezca bloqueado, el trabajo interno permitido es endurecimiento, observabilidad, operación y pruebas independientes del proveedor.

## F7 — Readiness/piloto

Ejecutar todos los gates, limitar empresas/volumen y demostrar operación unipersonal sostenible.

## F8 — Estabilización/V1.1

Expandir solo por evidencia real.

## Reglas permanentes

- PostgreSQL es autoridad.
- API HTTP persiste; no emite.
- Solo worker muta PT.
- `provider_attempt` existe antes del HTTP mutante.
- `UNKNOWN` nunca reemite directamente.
- No retry HTTP transparente de mutaciones.
- Tenant deriva de credential + RLS.
- Evidencia es append-only.
- API runtime no posee secreto PT.
- Kill switch de mutaciones no apaga reconciliación/read.
- API y worker usan identidades DB separadas y de mínimo privilegio.
- Ninguna dependencia o infraestructura entra por inercia: debe justificar riesgo/coste V1.
