# Roadmap API-DIAN

**Corte:** 2026-08-18  
**Autoridad de producto:** `docs/f0-producto-v1-validado-2026-08-18.md`

```text
POS propio → API fiscal propia → 1 Proveedor Tecnológico habilitado → DIAN
```

Restricciones: una sola persona opera inicialmente; un PT; sin DIAN directa; sin API pública; sin multi-PT; sin custodia propia de certificados si puede delegarse; integridad fiscal por encima de velocidad.

## Estado actual

```text
F0   Baseline producto                         ✅ Cerrado
F1   Requisitos V1                             ✅ Cerrado
F2   Arquitectura                              ✅ Cerrado
F3   Datos + seguridad                         ✅ Cerrado
F4A  Contratos internos                        ✅ Cerrado
F4B  Shortlist/evidencia pública PT            ✅ Cerrado
F4C  Sandbox + contrato + selección PT         ▶ Bloqueante externo
F5A  Pruebas adversariales genéricas/runbooks  ✅ Diseño cerrado
F5B  Contingencias + contract tests PT         ⏸ Depende de F4C
F6   Implementación incremental                ⏸ Pendiente
F7   Readiness + piloto                         ⏸ Pendiente
F8   Estabilización + V1.1                      ⏸ Pendiente
```

## F0–F3

Fuentes maestras: baseline, requisitos y ADR-003..006. No reabrir salvo evidencia fuerte.

## F4A — Contratos internos

Salidas:

- ADR-007;
- `docs/f4-contrato-pos-api-v1.md`.

Decisiones: endpoint mutante único, tenant por credential, idempotency key, semantic hash/canonicalización versionados, estados/errores propios, `FiscalProvider` mínimo y sin `resend()`.

## F4B/C — Proveedor Tecnológico

Salidas públicas:

- ADR-008;
- `docs/f4-matriz-seleccion-pt-v1.md`;
- `docs/f4-prueba-ambiguedad-pt-v1.md`.

Orden de prueba actual:

1. The Factory HKA.
2. DATAICO.
3. Facture como reserva.

F4C requiere credenciales sandbox, contrato, prueba de timeout/reconciliación, multiempresa, certificado, contingencias, SLA/límites/datos y precio API real.

`INCONCLUSIVE` en reconciliación bloquea selección.

## F5A — Pruebas adversariales genéricas

**Estado: ✅ Diseño cerrado**

Salidas:

- ADR-009;
- `docs/f5-plan-pruebas-adversariales-v1.md`;
- `docs/f5-runbooks-base-v1.md`.

Decisiones:

- fault injection obligatorio;
- FakeFiscalProvider antes del adapter real;
- contract suite común a cualquier PT;
- dos kill switches: aceptación y mutación remota;
- reconcile/read sigue funcionando al pausar submit;
- llamadas en vuelo se tratan como potencialmente ejecutadas;
- restore/PITR obliga reconciliar ventana divergente;
- kill switch no equivale a contingencia fiscal.

## F5B — Provider/regulación

Después de F4C:

1. ejecutar contract tests contra sandbox;
2. cerrar matriz regulatoria vigente FEV/DEE POS;
3. modelar contingencias por causa;
4. fijar backoff/rate limits según PT;
5. completar runbooks con endpoints/canales reales;
6. fijar SLO internos;
7. probar recuperación de XML/PDF;
8. probar kill switch con adapter real.

Fuentes regulatorias deben ser oficiales DIAN y mantenerse separadas de recomendaciones del PT.

## F6 — Implementación incremental

Puede comenzar **solo la infraestructura interna independiente del PT** cuando se decida abrir F6. El adapter productivo queda bloqueado hasta F4C.

Orden:

1. migraciones/roles/RLS;
2. auth tenant;
3. operation/idempotencia/canonicalización;
4. queue/worker;
5. FakeFiscalProvider + fault injection;
6. operational controls/kill switch;
7. adapter seleccionado + FEV sandbox;
8. notas;
9. DEE POS/ajustes;
10. estado/artefactos;
11. contingencias/reconciliación;
12. hardening.

## F7 — Readiness/piloto

Ejecutar todos los gates, limitar empresas/volumen y demostrar operación unipersonal sostenible.

## F8 — Estabilización/V1.1

Expandir solo por evidencia real.

## Regla de control de alcance

Una tarea entra V1 solo si soporta documento V1, evita pérdida/duplicación/ambigüedad, protege seguridad/auditoría/recuperación o es requisito indispensable del PT.
