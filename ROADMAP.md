# Roadmap API-DIAN

**Estado:** `ACTIVE` — roadmap vigente de ejecución
**Corte:** 2026-10-18
**Rama de trabajo:** `chore/agent-governance-2026-10-18`
**Autoridad de producto:** `docs/PRODUCT-DEFINITION-V1-FINAL.md` (`FROZEN`)
**Estado local:** build, TypeScript, lint sin correcciones, unit, provider-contract y governance `PASS`; E2E y concurrencia `BLOCKED` por PostgreSQL local no disponible.
**CI remoto, auditoría de dependencias, Docker security y PT:** `UNVERIFIED`/`BLOCKED` en este corte.

```text
ERP/POS/SaaS/integrador → API fiscal comercial multitenant
                                  → 1 Proveedor Tecnológico habilitado → DIAN
```

El POS propio es el primer cliente y caso de validación, no una exclusión del
producto comercial. Restricciones: una sola persona opera inicialmente; un PT;
sin DIAN directa; sin selección automática multi-PT; sin API self-service ni
SDK público en el MVP; los webhooks de estado/resultado son para consumidores
autorizados; sin custodia propia de certificados si puede delegarse; integridad
fiscal por encima de velocidad.

El MVP comercial cubre FEV, Nota Crédito, Nota Débito, DEE POS y ajustes del DEE
POS, además de estado, webhooks, contingencias, idempotencia, auditoría,
recuperación/reconciliación, soportes y aislamiento multiempresa.

## Estado actual

La definición de producto está aprobada y congelada (`FROZEN`). Los documentos
anteriores que describían una API exclusivamente interna para el POS se
conservan como contexto histórico (`HISTORICAL`/`SUPERSEDED`); no deben
contradecir la definición vigente. La implementación y los resultados remotos
no se vuelven a declarar verificados por este cambio documental.

```text
F0   Baseline producto                         ✅
F1   Requisitos V1                             ✅
F2   Arquitectura                              ✅
F3   Datos + seguridad                         ✅
F4A  Contratos internos                        ✅
F4B  Shortlist/evidencia pública PT            ✅
F4C  Sandbox + contrato + selección PT         ▶ Activo / bloqueo externo
F5A  Pruebas adversariales genéricas/runbooks  ✅
F5B  Contingencias + contract tests PT         ⏸ depende F4C
F6A  Core SQL + c14n + fake provider           ✅
F6B  Auth/repos/worker + fake vertical slice   ✅
F6H  Hardening interno independiente del PT    ✅
F6C  Adapter PT real                           ⏸ depende F4C
F7   Readiness + piloto                         ⏸ depende F6C
F8   Estabilización + V1.1                      ⏸
```

Las marcas de fase preservan el estado documentado del roadmap y no sustituyen
una verificación fechada del HEAD actual. En este corte la implementación, CI
remoto y PT permanecen `UNVERIFIED`.

`F6H` es una etiqueta de seguimiento del hardening posterior a F6B; no cambia el alcance funcional V1.

## Fuentes de continuidad

- autoridad de producto vigente (`FROZEN`): `docs/PRODUCT-DEFINITION-V1-FINAL.md`;
- baseline histórico (`HISTORICAL`/`SUPERSEDED` como autoridad de producto): `docs/f0-producto-v1-validado-2026-08-18.md`;
- requisitos: `docs/v1-requisitos.md`;
- arquitectura/side effects: ADR-003/004;
- datos/seguridad: ADR-005/006 + docs F3;
- contrato/idempotencia/PT gates: ADR-007/008 + docs F4;
- pruebas/fault injection/kill switch: ADR-009 + docs F5;
- core persistencia: `docs/f6-checkpoint-01-core-persistence.md`;
- vertical slice fake: `docs/f6-checkpoint-02-fake-vertical-slice.md`;
- operación: `docs/runbook-fiscal-worker-v1.md`;
- packaging Docker y límites de despliegue: `docs/DOCKER-PRODUCTION.md`;
- harness abstracto del futuro adapter: `docs/f6-provider-contract-harness.md`;
- evidencia pública F4C actual: `docs/f4c-evidencia-publica-2026-08-19.md`;
- cuestionario/sandbox: `docs/f4c-cuestionario-solicitud-sandbox-pt.md`.

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
- roles `app_ops` y `app_ops_control` separados;
- historial append-only de cambios de `runtime_controls`;
- reporte SQL operativo + runbook de incidentes;
- gates de concurrencia permanentes;
- infraestructura local reducida a PostgreSQL 15;
- retirados Redis/MinIO y runtime local con superusuario;
- packaging productivo Docker con API no-root, Compose con red privada para PostgreSQL,
  referencias inmutables, secretos por archivo, healthchecks y capacidades reducidas;
- workflow de seguridad Docker con Trivy para imágenes API y PostgreSQL; el escaneo
  de la imagen derivada PostgreSQL y su digest de release siguen pendientes;
- bootstrap Windows con logins separados API/worker/ops;
- harness de contract tests del futuro adapter basado únicamente en evidencia sanitizada;
- fixtures sin evidencia se rechazan;
- `TRANSPORT_PROVEN_NOT_SENT` y `NOT_FOUND_CONCLUSIVE` requieren prueba explícita referenciada;
- el harness no contiene URLs, auth, códigos, tiempos, wire formats ni semántica específica de ningún PT.

Evidencia histórica preservada (no revalidada en este corte documental):

- concurrencia: CI #66;
- limpieza local: PR #60, CI #71, consolidado como `99bd26383a299c24604c3a345ad0f7d573be682e`;
- harness abstracto PT: PR #61, árbol final CI #77, consolidado como `6fe0e01bbaba80dcd9c7f6dfee232e27b1ac049d`.

## F4C — Gate externo activo

HKA es el candidato inicial para validación. La candidatura sigue sin validar:
no hay aquí evidencia actual suficiente para declarar selección, sandbox,
contrato, credenciales, reconciliación, XML/PDF, SLA o precio como disponibles.
Los resultados de proveedores y del estado remoto de CI son `UNVERIFIED` en
este corte documental.

Orden operativo provisional para probar:

1. **The Factory HKA Colombia** — candidato inicial, no validado;
2. **DATAICO** — alternativa a evaluar si HKA no supera los gates;
3. **Facture / ESTELA** — reserva, sin selección.

Razón del orden:

La información de candidatos que figura en documentos históricos es contexto de
investigación, no evidencia de selección ni de integración. Para cerrar F4C se
requiere evidencia privada y reproducible del candidato elegido.

Fuentes y pendientes: `docs/f4c-evidencia-publica-2026-08-19.md`.

Cuestionario común para obtener evidencia comparable: `docs/f4c-cuestionario-solicitud-sandbox-pt.md`.

### Orden de ejecución

1. solicitar a HKA acuerdo/acceso DEMO, credenciales, docs FEV + POS, contacto técnico, contrato/SLA/precio;
2. solicitar DATAICO en paralelo administrativo para no perder tiempo si HKA falla un gate;
3. solicitar a Facture/ESTELA paquete técnico/API/sandbox, manteniéndolo como reserva;
4. ejecutar `docs/f4-prueba-ambiguedad-pt-v1.md` primero con HKA;
5. llenar `docs/f4-matriz-seleccion-pt-v1.md` solo con evidencia real;
6. convertir casos PASS en fixtures del harness de `docs/f6-provider-contract-harness.md`;
7. si un criterio crítico queda FAIL/INCONCLUSIVE, no construir F6C con ese proveedor.

F4C no se cierra porque un PT “tenga API”. Debe demostrar:

```text
sandbox real
+ FEV
+ POS electrónico
+ auth
+ correlación durable
+ timeout controlado
+ reconcile
+ prueba de duplicidad
+ criterio seguro de inexistencia
+ XML/PDF
+ SLA/soporte
+ contrato/precio
+ responsabilidad certificado
```

Un 404 aislado nunca equivale automáticamente a `NOT_FOUND_CONCLUSIVE`; un estado llamado `NO_ENVIADO` tampoco equivale por nombre a `TRANSPORT_PROVEN_NOT_SENT`.

## Siguiente trabajo

El siguiente avance significativo requiere **obtener y validar evidencia real
F4C**, empezando por HKA como candidato, sin tratarlo como seleccionado.

El packaging productivo Docker ya existe en `Dockerfile.production`,
`docker-compose.production.yml` e `infra/postgres/Dockerfile`. Su diseño está
documentado, pero build, escaneo de la imagen derivada, publicación, despliegue,
backup/restore y operación real siguen `UNVERIFIED`; crear un worker productivo
con `FakeFiscalProvider` produciría una falsa sensación de readiness antes de F6C.

No construir respuestas, códigos, reintentos, XML/PDF ni rate limits específicos
de un PT sin sandbox/contrato real. No declarar CI remoto, producción o
readiness comercial como verificados sin evidencia del corte correspondiente.

## F5B / F6C — después de F4C

Solo después de seleccionar un PT con evidencia suficiente:

- contract tests reales;
- contingencias según causa;
- límites/backoff reales;
- XML/PDF reales;
- adapter seleccionado;
- packaging productivo de API/worker acorde al adapter real.

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
