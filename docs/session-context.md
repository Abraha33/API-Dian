# Contexto de sesión — API-DIAN

**Corte:** 2026-08-19

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

Rama principal consolidada: `dev` = `eeb3db83a27174ccbcb875f763b00897b952f2bb`.

## Producto e invariantes

```text
POS → API-DIAN → 1 PT habilitado → DIAN
```

No reabrir alcance cerrado salvo evidencia nueva fuerte.

Reglas permanentes:

- PostgreSQL es autoridad;
- API HTTP persiste, no emite;
- solo worker muta PT;
- `provider_attempt` existe antes del side effect remoto;
- ambigüedad → `UNKNOWN`;
- `UNKNOWN` reconcilia antes de cualquier nuevo submit;
- no retry HTTP transparente de mutaciones;
- retry de submit solo con evidencia concluyente de no envío;
- tenant por credential + RLS;
- evidencia append-only;
- API, worker y ops usan credenciales DB separadas;
- kill switch de submit no pausa reconcile/read;
- superusuario/app_migrator nunca es runtime normal;
- `PROVEN_NOT_SENT` y `NOT_FOUND_CONCLUSIVE` requieren prueba referenciada;
- evidencia pública decide orden de prueba, no sustituye PASS contractual.

## Fuentes maestras actuales

- `docs/f0-producto-v1-validado-2026-08-18.md`;
- `docs/v1-requisitos.md`;
- ADR-003..009;
- `docs/f4-matriz-seleccion-pt-v1.md`;
- `docs/f4-prueba-ambiguedad-pt-v1.md`;
- `docs/f4c-public-precheck-2026-08-19.md`;
- `docs/f4c-evidencia-publica-2026-08-19.md`;
- `docs/f4c-cuestionario-solicitud-sandbox-pt.md`;
- `docs/f4c-canales-contacto-y-ejecucion-2026-08-19.md`;
- `docs/f6-checkpoint-01-core-persistence.md`;
- `docs/f6-checkpoint-02-fake-vertical-slice.md`;
- `docs/runbook-fiscal-worker-v1.md`;
- `docs/f6-provider-contract-harness.md`;
- `ROADMAP.md`.

## Core interno ya cerrado

### F6A/F6B

Flujo probado:

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

Decisiones:

- `pg` / node-postgres, SQL explícito;
- Prisma retirado;
- API `app_api`, worker `app_worker`;
- fake worker prohibido en producción;
- crash en `SUBMITTING` → `UNKNOWN`, nunca segundo submit ciego;
- `SUBMITTING → READY` exige último attempt `PROVEN_NOT_SENT`;
- kill switch bloquea nuevas mutaciones pero permite reconciliación.

### F6H

Consolidado:

- telemetría estructurada worker sin payloads/credenciales;
- `app_ops` cross-tenant read-only limitado;
- `app_ops_control` solo kill switches;
- `runtime_control_events` append-only;
- reporte operacional + runbook;
- concurrencia: 32 same-key → 1 operación; carrera semántica → 202+409; 40 distintos → 40; 42 claims → sin duplicado;
- compose local solo PostgreSQL 15;
- bootstrap PowerShell y logins API/worker/ops separados;
- harness abstracto PT fail-closed basado en evidencia sanitizada.

Snapshots relevantes:

- F6B2: `7a940ac46e8f977bf33374fb5d1c75ad56d192c1`;
- ops hardening: `fb84c99be55694b3cd830a84d153ca3cf9b9bf12`;
- concurrencia: `77d2ac797747a0ac7075d2ae4ed9bd8f2fd75cda`;
- infra local: `99bd26383a299c24604c3a345ad0f7d573be682e`;
- harness PT: `6fe0e01bbaba80dcd9c7f6dfee232e27b1ac049d`;
- F4C evidencia pública consolidada: `eeb3db83a27174ccbcb875f763b00897b952f2bb`.

## F4C activo — orden provisional

La evidencia oficial actual mantiene el orden de prueba:

```text
1. The Factory HKA Colombia
2. DATAICO
3. Facture / ESTELA
```

No es selección definitiva.

### HKA

Primero porque la documentación pública encontrada describe intermitencia/timeouts, estados no concluyentes, reconsulta/reconstrucción y un proceso de integración con DEMO/credenciales/especialista.

Pendiente de demostrar en sandbox/contrato:

- mapping real de códigos;
- correlación exacta;
- FEV + DEE POS completos;
- criterio seguro de inexistencia;
- XML/PDF;
- SLA/precio/certificado.

### DATAICO

Segundo y en paralelo administrativo.

La documentación pública reconoce estados pendientes aun cuando DIAN ya aceptó, resincronización posterior y APIs para factura/POS.

Reglas:

- `DIAN_NO_ENVIADO != PROVEN_NOT_SENT` hasta evidencia;
- ausencia/404 `!= NOT_FOUND_CONCLUSIVE` hasta evidencia.

### Facture / ESTELA

Reserva. Continúa habilitado y publica FEV/documento equivalente, pero falta paquete técnico público comparable para auth/sandbox/correlación/ambigüedad.

## Contacto F4C listo

Documento operativo:

`docs/f4c-canales-contacto-y-ejecucion-2026-08-19.md`

Incluye:

- HKA: canal oficial de integración, correo `integracion_fel_co@thefactoryhka.com`, WhatsApp y central;
- DATAICO: landing API/casa de software + agenda oficial de consulta personalizada;
- Facture/ESTELA: formulario oficial Colombia;
- mensajes listos para cada proveedor;
- secuencia de escalamiento;
- formato de evidencia a conservar.

**Estado de contacto:** no se ha enviado correo, formulario ni agenda desde ChatGPT. No realizar comunicación externa sin instrucción explícita del usuario.

## Ejecución inmediata cuando exista autorización/contacto

1. HKA: pedir DEMO, credenciales, docs FEV + POS, especialista, contrato/SLA/precio;
2. DATAICO: agendar consulta API en paralelo;
3. ESTELA: solicitar paquete técnico/API/sandbox;
4. ejecutar `docs/f4-prueba-ambiguedad-pt-v1.md` primero con el primer sandbox útil;
5. guardar evidencia cruda sensible fuera de Git y solo metadatos sanitizados en repo;
6. llenar `docs/f4-matriz-seleccion-pt-v1.md` solo con evidencia real;
7. convertir casos PASS a fixtures del harness;
8. FAIL/INCONCLUSIVE crítico bloquea F6C para ese candidato.

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

## Siguiente avance real

El desarrollo interno funcional independiente del PT está sustancialmente agotado. No seguir construyendo capas especulativas ni packaging productivo alrededor de `FakeFiscalProvider`.

El siguiente avance significativo requiere obtener acceso real F4C.
