# Contexto de sesión — API-DIAN

## Estado

```text
F0–F3 ✅
F4A contratos ✅
F4B shortlist PT ✅
F4C sandbox/contrato PT ▶ ACTIVO / bloqueo externo
F5A diseño pruebas/runbooks ✅
F5B pruebas reales PT ⏸ depende F4C
F6A core independiente PT ✅
F6B auth/repos/worker fake ✅
F6H hardening interno PT-independent ✅
F6C adapter real ⏸ depende F4C
F7 readiness/piloto ⏸ depende F6C
```

Rama principal consolidada: `dev` = `6fe0e01bbaba80dcd9c7f6dfee232e27b1ac049d` al iniciar este corte F4C.  
Rama de investigación actual: `research/f4c-public-evidence-2026-08-19`.

## Producto

```text
POS → API-DIAN → 1 PT habilitado → DIAN
```

No reabrir producto/alcance cerrado salvo evidencia nueva fuerte.

## Fuentes maestras

- baseline F0;
- `docs/v1-requisitos.md`;
- ADR-003/004 arquitectura + side effects;
- ADR-005/006 datos + seguridad;
- ADR-007/008 contratos + PT gates;
- ADR-009 pruebas/fault injection/kill switch;
- `docs/f4-matriz-seleccion-pt-v1.md`;
- `docs/f4-prueba-ambiguedad-pt-v1.md`;
- `docs/f4c-evidencia-publica-2026-08-19.md`;
- `docs/f4c-cuestionario-solicitud-sandbox-pt.md`;
- `docs/f6-checkpoint-01-core-persistence.md`;
- `docs/f6-checkpoint-02-fake-vertical-slice.md`;
- `docs/runbook-fiscal-worker-v1.md`;
- `docs/f6-provider-contract-harness.md`;
- `ROADMAP.md`.

## Invariantes

- PostgreSQL autoridad;
- API HTTP persiste, no emite;
- solo worker muta PT;
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
- superusuario/app_migrator nunca es runtime normal, tampoco en desarrollo;
- `PROVEN_NOT_SENT` y `NOT_FOUND_CONCLUSIVE` requieren prueba referenciada, no inferencia informal;
- evidencia pública decide orden de prueba, **no** sustituye PASS contractual.

## Contrato interno actual

```text
POST /v1/fiscal-operations
Authorization: Bearer <credential>
Idempotency-Key: <key>
schema_version = 1.0
```

Tipos: FEV, CREDIT_NOTE, DEBIT_NOTE, ELECTRONIC_POS, POS_ADJUSTMENT.

Hash:

```text
validated DTO
→ semantic projection
→ fiscal-command-c14n/1
→ SHA-256
```

`FiscalProvider`: `submit`, `reconcile`, `getStatus`, `fetchXml`, `fetchPdf`; no `resend`.

## F6A + F6B cerrados

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

Decisiones cerradas:

- cliente DB: `pg` / node-postgres;
- SQL explícito en repositories;
- Prisma retirado del scaffold activo;
- API con login `app_api`;
- worker con login `app_worker` distinto;
- fake worker prohibido en producción;
- crash en `SUBMITTING` → `UNKNOWN`, nunca segundo submit ciego;
- `SUBMITTING → READY` exige último attempt `PROVEN_NOT_SENT`;
- kill switch bloquea nuevos side effects pero permite reconciliación.

## F6H cerrado

### Operación/observabilidad

- telemetría estructurada worker sin payloads/credenciales;
- `app_ops` cross-tenant read-only limitado;
- `app_ops_control` solo kill switches;
- `runtime_control_events` append-only;
- reporte SQL operacional + runbook.

Snapshot: `fb84c99be55694b3cd830a84d153ca3cf9b9bf12`.

### Concurrencia

Consolidado: `77d2ac797747a0ac7075d2ae4ed9bd8f2fd75cda`, CI #66.

- 32 requests same key → 1 operación/work/audit;
- carrera semántica same key → un 202 + un 409;
- 40 distintos simultáneos → 40 operaciones;
- 42 claims paralelos → cada work una vez.

### Infra local

Consolidado: `99bd26383a299c24604c3a345ad0f7d573be682e`, árbol final CI #71.

- compose solo PostgreSQL 15;
- Redis/MinIO y runtime local superuser retirados;
- bootstrap PowerShell validado;
- logins separados API/worker/ops;
- CI verifica memberships/privilegios;
- worker prefiere `WORKER_DATABASE_URL`.

### Harness abstracto PT

Consolidado: `6fe0e01bbaba80dcd9c7f6dfee232e27b1ac049d`, árbol final CI #77.

- fixtures requieren evidencia sanitizada;
- `PROVEN_NOT_SENT` requiere prueba de no side effect;
- `NOT_FOUND_CONCLUSIVE` requiere prueba concluyente de inexistencia;
- artefactos por content type/tamaño/SHA-256;
- no contiene semántica específica de ningún PT.

## F4C — evidencia pública actualizada 2026-08-19

La lista pública vigente de la DIAN mantiene a:

- The Factory HKA Colombia;
- DATAICO;
- Facture S.A.S.

La nueva evidencia oficial **no selecciona ganador**, pero sí define un orden racional de prueba:

```text
1. HKA
2. DATAICO
3. Facture / ESTELA
```

### HKA — probar primero

La documentación pública localizada describe explícitamente:

- intermitencia/timeouts DIAN;
- estados no concluyentes/intermedios;
- reconsulta/reconstrucción posterior;
- necesidad de esperar estado definitivo;
- proceso formal de integración con ambiente DEMO, credenciales, folios, documentación y especialista técnico.

Esto encaja mejor con nuestra arquitectura `UNKNOWN → reconcile`, pero **todavía no demuestra** el mapping real de códigos ni un criterio contractual de `NOT_FOUND_CONCLUSIVE`.

### DATAICO — segundo / paralelo administrativo

La documentación pública confirma:

- API orientada a software/ERP/POS;
- casos donde DIAN ya aceptó y Dataico sigue pendiente, con sincronización posterior;
- estados/UUID/CUFE y reenvío de factura existente en ciertos estados;
- POS y nota de ajuste visibles en documentación.

Bloqueos:

- `DIAN_NO_ENVIADO` no se mapeará por nombre a `PROVEN_NOT_SENT`;
- no hay evidencia pública suficiente de `NOT_FOUND_CONCLUSIVE`;
- confirmar sandbox, POS status/reconcile y contrato real.

### Facture / ESTELA — reserva

Continúa habilitado ante DIAN y ESTELA publica oferta FEV/documento equivalente, pero no encontramos documentación pública técnica comparable para auth, sandbox, correlación y ambigüedad. Solicitar paquete privado antes de invertir integración.

## Ejecución inmediata F4C

1. solicitar a HKA DEMO/sandbox, credenciales, docs FEV + POS, contacto técnico, contrato/SLA/precio;
2. solicitar DATAICO en paralelo administrativo;
3. solicitar Facture/ESTELA paquete técnico y sandbox;
4. ejecutar `docs/f4-prueba-ambiguedad-pt-v1.md` primero con HKA;
5. conservar evidencia sanitizada por caso;
6. llenar `docs/f4-matriz-seleccion-pt-v1.md` **solo** con evidencia real;
7. convertir casos PASS a fixtures de `docs/f6-provider-contract-harness.md`;
8. un FAIL/INCONCLUSIVE crítico bloquea F6C con ese candidato.

Cuestionario listo: `docs/f4c-cuestionario-solicitud-sandbox-pt.md`.

## Gate mínimo de salida F4C

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

## Runtime/CI consolidado

- Node 24;
- audit productivo;
- compose + parser PowerShell;
- build/lint/unit;
- provider contract harness self-tests;
- migraciones + verificaciones SQL;
- provisioning local least-privilege;
- ops control/report;
- e2e API/worker;
- concurrency gate.

## Siguiente avance real

El desarrollo interno funcional independiente del PT está sustancialmente agotado. **No seguir construyendo capas especulativas.**

El siguiente avance significativo requiere obtener acceso real F4C. Packaging productivo también queda pospuesto hasta F6C para no crear una falsa sensación de readiness alrededor de `FakeFiscalProvider`.
