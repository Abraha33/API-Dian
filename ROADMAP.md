# Roadmap API-DIAN

**Corte:** 2026-08-18  
**Autoridad de producto:** `docs/f0-producto-v1-validado-2026-08-18.md`

```text
POS propio → API fiscal propia → 1 Proveedor Tecnológico habilitado → DIAN
```

Restricciones: una sola persona opera inicialmente; un PT; sin DIAN directa; sin API pública; sin multi-PT; sin custodia propia de certificados si puede delegarse; integridad fiscal por encima de velocidad.

## Estado actual

```text
F0  Baseline de producto y validación         ✅ Cerrado
F1  Requisitos V1                             ✅ Cerrado
F2  Arquitectura formal                       ✅ Cerrado
F3  Modelo de datos + seguridad/amenazas      ✅ Cerrado
F4A Contratos internos                        ✅ Cerrado
F4B Shortlist/evidencia pública PT            ✅ Cerrado
F4C Sandbox + contrato + selección final PT   ▶ Bloqueante actual
F5  Pruebas, contingencia y operación         ⏸ Preparación permitida
F6  Implementación incremental                ⏸ Pendiente
F7  Readiness + piloto                         ⏸ Pendiente
F8  Estabilización + V1.1                      ⏸ Pendiente
```

## F0–F3

Fuentes:

- `docs/f0-producto-v1-validado-2026-08-18.md`;
- `docs/v1-requisitos.md`;
- ADR-003/004 — arquitectura y side effects;
- ADR-005/006 — datos/tenancy y seguridad;
- `docs/f3-modelo-datos-v1.md`;
- `docs/f3-threat-model-v1.md`.

No reabrir salvo evidencia nueva fuerte.

## F4A — Contratos internos

**Estado: ✅ Cerrado**

Salidas:

- `ADR/ADR-007-contratos-internos-idempotencia-v1.md`;
- `docs/f4-contrato-pos-api-v1.md`.

Decisiones:

- `POST /v1/fiscal-operations` como entrada mutante única del POS;
- tenant derivado de credential;
- `Idempotency-Key` obligatoria;
- contrato `schema_version=1.0` independiente del PT;
- dinero/cantidad/tasas como decimal string;
- semantic hash sobre DTO normalizado, no raw JSON;
- canonicalización versionada;
- estados normalizados incluyen `UNKNOWN`;
- no endpoint `resend/retry` fiscal;
- `FiscalProvider.submit/reconcile/getStatus/fetchXml/fetchPdf` mínimo;
- `NOT_FOUND_CONCLUSIVE` exige garantía, un 404 no basta.

## F4B — Shortlist PT

**Estado: ✅ Cerrado a nivel público**

Salidas:

- `ADR/ADR-008-seleccion-pt-gates-v1.md`;
- `docs/f4-matriz-seleccion-pt-v1.md`;
- `docs/f4-prueba-ambiguedad-pt-v1.md`.

Candidatos iniciales:

1. The Factory HKA — candidato A para prueba de reconciliación.
2. DATAICO — candidato B, fuerte API-first; validar especialmente POS/notas y semántica de timeout.
3. Facture — reserva por menor evidencia técnica pública localizada.

No hay selección final todavía.

## F4C — Sandbox + contrato + selección

**Estado: ▶ Bloqueante actual**

Para cerrar:

1. obtener credenciales sandbox y docs completas del candidato A;
2. ejecutar protocolo de ambigüedad para FEV/NC/ND/POS/nota POS;
3. confirmar multiempresa/casa de software;
4. confirmar certificado/firma sin custodia nuestra;
5. confirmar contingencias V1;
6. obtener rate limits/timeouts/versionado;
7. revisar soporte/SLA/tratamiento datos;
8. obtener cotización API real;
9. repetir con candidato B si A falla o el coste/operación no es aceptable;
10. seleccionar un PT y congelar adapter mapping inicial.

Regla:

```text
INCONCLUSIVE en reconciliación = no seleccionar todavía
```

## F5 — Pruebas, contingencia y operación

Puede prepararse en paralelo solo en lo que no dependa del PT:

- fake provider + fault injection;
- casos ADR-004;
- test de canonicalización/idempotencia;
- threat/security tests;
- runbooks base;
- diseño kill switch.

Los casos de contingencia fiscal exactos se cierran con evidencia DIAN/PT.

## F6 — Implementación incremental

No implementar adapter productivo antes de cerrar F4C.

Orden previsto:

1. migraciones/roles/RLS;
2. auth tenant;
3. operación/idempotencia/canonicalización;
4. work queue/worker;
5. `FiscalProvider` fake + fault injection;
6. adapter PT seleccionado + FEV sandbox;
7. notas;
8. DEE POS/ajustes;
9. estado/artefactos;
10. contingencia/reconciliación;
11. hardening.

## F7 — Readiness/piloto

Ejecutar gates, limitar empresas/volumen y demostrar operación unipersonal sostenible.

## F8 — Estabilización/V1.1

Expandir solo por evidencia real.

## Regla de control de alcance

Una tarea entra V1 solo si soporta documento V1, evita pérdida/duplicación/ambigüedad, protege seguridad/auditoría/recuperación o es requisito indispensable del PT.
