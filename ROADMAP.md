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
F6H  Hardening interno independiente del PT    ✅
F6C  Adapter PT real                           ⏸ depende F4C
F7   Readiness + piloto                         ⏸ depende F6C
F8   Estabilización + V1.1                      ⏸
```

`F6H` es una etiqueta de seguimiento del hardening posterior a F6B; no cambia el alcance funcional V1.

## Salidas cerradas F0–F6B

- baseline: `docs/f0-producto-v1-validado-2026-08-18.md`;
- requisitos: `docs/v1-requisitos.md`;
- arquitectura/side effects: ADR-003/004;
- datos/seguridad: ADR-005/006 + docs F3;
- contrato/idempotencia/PT gates: ADR-007/008 + docs F4;
- pruebas/fault injection/kill switch: ADR-009 + docs F5;
- core persistencia: `docs/f6-checkpoint-01-core-persistence.md`;
- vertical slice fake: `docs/f6-checkpoint-02-fake-vertical-slice.md`;
- operación: `docs/runbook-fiscal-worker-v1.md`;
- harness abstracto del futuro adapter: `docs/f6-provider-contract-harness.md`.

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

1. `pg` como cliente PostgreSQL explícito; sin ORM en el camino fiscal crítico;
2. transacciones tenant-aware y RLS con login API no privilegiado;
3. auth por credencial opaca + HMAC/pepper;
4. recepción atómica `operation + audit + work`;
5. idempotencia persistida y conflicto semántico;
6. GET tenant-safe;
7. proceso worker separado con login `app_worker`;
8. claim durable, leases y `provider_attempt` persistido antes del side effect;
9. `FakeFiscalProvider.submit` y fault injection;
10. `UNKNOWN → RECONCILING` sin reemisión ciega;
11. retry solo cuando existe evidencia `PROVEN_NOT_SENT`;
12. kill switch que bloquea nuevos submits pero no reconciliación;
13. recuperación de crash en `SUBMITTING` hacia `UNKNOWN`;
14. CI end-to-end con logins separados `ci_api` / `ci_worker`.

Prisma fue retirado del runtime/scaffold de F6B: PostgreSQL + SQL versionado + repositories explícitos son la autoridad del camino fiscal.

No existe adapter PT real.

## F6H — Hardening interno independiente del PT

**Estado: ✅ Cerrado**

Completado después de F6B:

- telemetría estructurada del worker sin payloads/credenciales;
- `app_ops` cross-tenant read-only con columnas operativas limitadas;
- `app_ops_control` separado para kill switches;
- historial append-only de cambios de `runtime_controls`;
- reporte SQL operativo + runbook de incidentes;
- gates de concurrencia permanentes:
  - 32 requests simultáneas con misma idempotency key → una sola operación lógica;
  - carrera semántica misma key → un 202 y un 409;
  - 40 operaciones distintas simultáneas sin pérdida/duplicado;
  - 42 claims paralelos `SKIP LOCKED` sin doble claim;
- infraestructura local reducida a PostgreSQL 15;
- retirados Redis/MinIO y el antiguo runtime local con superusuario;
- bootstrap Windows aplica migraciones y crea logins separados API/worker/ops;
- CI valida compose, sintaxis PowerShell, provisioning y aislamiento de membresías;
- harness de contract tests del futuro adapter basado únicamente en evidencia sanitizada;
- el harness rechaza fixtures sin evidencia y exige prueba explícita para clasificar `TRANSPORT_PROVEN_NOT_SENT` o `NOT_FOUND_CONCLUSIVE`;
- el harness no contiene URLs, auth, códigos, tiempos, wire formats ni semántica específica de ningún PT.

Evidencia reciente:

- limpieza local: PR #60, árbol final validado en CI run #71;
- harness abstracto PT: PR #61, self-tests + pipeline completo PASS en CI run #75 antes del cierre documental final.

## Siguiente trabajo interno sin PT

El trabajo funcional y de hardening **independiente del proveedor** está sustancialmente agotado. No conviene seguir agregando capas especulativas para aparentar avance.

Solo queda como trabajo opcional:

- packaging/deployment mínimo del API/worker si puede hacerse sin elegir infraestructura productiva nueva ni asumir comportamiento del PT;
- mantenimiento de CI/documentación.

El siguiente avance funcional significativo requiere F4C.

No construir respuestas, códigos, reintentos, XML/PDF ni rate limits específicos de un PT sin sandbox/contrato real.

## F4C / F5B / F6C — Gate externo PT

Shortlist actual:

1. The Factory HKA;
2. DATAICO;
3. Facture como reserva.

No hay selección definitiva hasta ejecutar `docs/f4-prueba-ambiguedad-pt-v1.md` y confirmar contrato/sandbox real. Un 404 aislado nunca equivale automáticamente a `NOT_FOUND_CONCLUSIVE`.

F4C debe producir evidencia suficiente para llenar los fixtures definidos en `docs/f6-provider-contract-harness.md` sin placeholders ni suposiciones.

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
- API, worker y operaciones usan roles/credenciales DB separados.
- Kill switch de mutaciones no apaga reconciliación/read.
- Superusuario/migrator nunca es runtime normal, ni siquiera en desarrollo.
- Una clasificación peligrosa del adapter debe estar respaldada por evidencia verificable, no por intuición del desarrollador.
- Ninguna dependencia o infraestructura entra por inercia: debe justificar riesgo/coste V1.
