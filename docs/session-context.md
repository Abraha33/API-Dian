# Contexto de sesión — API-DIAN

## Fuentes maestras

1. baseline F0;
2. `docs/v1-requisitos.md`;
3. ADR-003/004 — arquitectura/side effects;
4. ADR-005/006 — datos/seguridad;
5. ADR-007 — contrato/idempotencia;
6. ADR-008 — PT gates;
7. ADR-009 — pruebas/fault injection/kill switch;
8. docs F3/F4/F5;
9. `ROADMAP.md`.

No reabrir decisiones cerradas salvo evidencia nueva fuerte.

## Estado

```text
F0   ✅
F1   ✅
F2   ✅
F3   ✅
F4A  ✅ contratos
F4B  ✅ shortlist pública
F4C  ▶ requiere sandbox/contrato PT
F5A  ✅ diseño pruebas/runbooks
F5B  ⏸ depende PT
F6   ⏸ implementación
```

## Producto

```text
POS → API-DIAN → 1 PT habilitado → DIAN
```

## Invariantes operativos

- PostgreSQL autoridad;
- solo worker muta PT;
- provider_attempt antes de HTTP;
- timeout/crash ambiguo → UNKNOWN;
- UNKNOWN nunca reemite directamente;
- un 404 PT no significa safe-to-resend por sí solo;
- no retry HTTP transparente de mutaciones;
- tenant por credential + RLS;
- evidencia append-only;
- API no posee secreto PT.

## Contrato interno

```text
POST /v1/fiscal-operations
Authorization
Idempotency-Key
schema_version=1.0
```

Tipos: FEV, CREDIT_NOTE, DEBIT_NOTE, ELECTRONIC_POS, POS_ADJUSTMENT.

Dinero/cantidad/tasas usan decimal string.

Hash:

```text
validated DTO → semantic projection → c14n/1 → SHA-256
```

`FiscalProvider`:

```text
submit
reconcile
getStatus
fetchXml
fetchPdf
```

No `resend`.

## PT

Candidato A: The Factory HKA.  
Candidato B: DATAICO.  
Facture: reserva.

Selección final bloqueada por `docs/f4-prueba-ambiguedad-pt-v1.md` y contrato real.

## F5 genérico

FakeFiscalProvider debe simular:

```text
ACCEPT
REJECT
PROVEN_NOT_SENT
AMBIGUOUS_TIMEOUT
DELAYED_RESPONSE/VISIBILITY
MALFORMED_RESPONSE
RATE_LIMIT
UNAVAILABLE
ARTIFACT_FAILURE
```

Dos controles operativos:

```text
accept_new_operations
provider_mutations_enabled
```

Pausar submit no pausa reconcile/read.

Una llamada ya en vuelo puede haber ocurrido; tras kill switch se clasifica/reconcilia, no se asume cancelada.

Runbooks base: UNKNOWN spike, PT outage, credencial PT/POS comprometida, cruce tenant, deploy adapter, restore/PITR, storage, cambio regulatorio, reanudación.

## Bloqueante real actual

No tenemos credenciales sandbox ni contrato de un candidato PT. No fingir selección.

Mientras se obtiene F4C, el siguiente trabajo interno válido es preparar F6 **solo para piezas independientes del PT**: migraciones/roles/RLS, auth tenant, operation/idempotencia, worker DB, fake provider y kill switch. No crear adapter productivo todavía.
