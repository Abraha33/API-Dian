# Roadmap API-DIAN

**Corte:** 2026-08-18/19  
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
F6B  Auth/repos/worker + fake vertical slice   ▶ Siguiente interno
F6C  Adapter PT real                           ⏸ depende F4C
F7   Readiness + piloto                         ⏸
F8   Estabilización + V1.1                      ⏸
```

## Salidas cerradas F0–F5A

- baseline: `docs/f0-producto-v1-validado-2026-08-18.md`;
- requisitos: `docs/v1-requisitos.md`;
- arquitectura/side effects: ADR-003/004;
- datos/seguridad: ADR-005/006 + docs F3;
- contrato/idempotencia/PT gates: ADR-007/008 + docs F4;
- pruebas/fault injection/kill switch: ADR-009 + docs F5.

## F6A — Core independiente del PT

**Estado: ✅ Cerrado**

Salida: `docs/f6-checkpoint-01-core-persistence.md`.

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

No hay adapter PT real.

## F6B — Vertical slice interno con fake provider

**Estado: ▶ Siguiente interno**

Orden:

1. decidir cliente PostgreSQL/repository layer mínimo; SQL/RLS sigue siendo autoridad;
2. conexión y transacciones tenant-aware (`SET LOCAL`/equivalente seguro);
3. auth de credential POS;
4. recepción atómica `operation + idempotency + audit + work`;
5. GET operation tenant-safe;
6. worker/lease + persistencia de `provider_attempt`;
7. `FakeFiscalProvider.submit`;
8. `UNKNOWN → reconcile`;
9. runtime kill switches;
10. pruebas concurrentes/adversariales DB end-to-end.

F6B no usa un PT real y debe poder demostrar el protocolo completo mediante fault injection.

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
- Ninguna dependencia o infraestructura entra por inercia: debe justificar riesgo/coste V1.
