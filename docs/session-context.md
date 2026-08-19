# Contexto de sesión — API-DIAN

## Fuentes maestras

1. `docs/f0-producto-v1-validado-2026-08-18.md` — producto.
2. `docs/v1-requisitos.md` — requisitos.
3. ADR-003/004 — arquitectura + protocolo de side effect.
4. ADR-005/006 — datos/tenancy + seguridad.
5. ADR-007 — contrato interno/idempotencia semántica.
6. ADR-008 — gates de selección PT.
7. `docs/f4-contrato-pos-api-v1.md`.
8. `docs/f4-matriz-seleccion-pt-v1.md`.
9. `docs/f4-prueba-ambiguedad-pt-v1.md`.
10. `ROADMAP.md`.

No reabrir F0–F4A/B salvo evidencia nueva fuerte.

## Estado

```text
F0  ✅ producto
F1  ✅ requisitos
F2  ✅ arquitectura
F3  ✅ datos/seguridad
F4A ✅ contratos internos
F4B ✅ shortlist pública PT
F4C ▶ sandbox/contrato/selección PT
```

Rama: `dev`.

## Producto

```text
POS → API-DIAN → 1 PT habilitado → DIAN
```

## Arquitectura vigente

- monolito modular NestJS/Fastify/TypeScript;
- Node 24 LTS al implementar;
- PostgreSQL autoridad;
- queue durable en PostgreSQL;
- procesos `api` y `worker` del mismo artefacto;
- solo worker muta PT;
- object storage privado para artefactos;
- sin Redis/BullMQ productivo, microservicios ni Kubernetes.

## Invariantes

```text
DESCONOCIDO != REEMITIR
```

- persistir operation + idempotencia antes del PT;
- provider_attempt antes de side effect;
- no retry HTTP transparente de mutaciones;
- crash/timeout ambiguo → UNKNOWN;
- UNKNOWN → reconcile;
- un 404 del PT no equivale por sí solo a safe-to-resend.

## Contrato POS V1

Entrada:

```text
POST /v1/fiscal-operations
Authorization
Idempotency-Key
schema_version=1.0
```

Tipos:

- FEV;
- CREDIT_NOTE;
- DEBIT_NOTE;
- ELECTRONIC_POS;
- POS_ADJUSTMENT.

Tenant no va en body. Emisor se resuelve por tenant.

Dinero/cantidad/tasas = decimal strings.

Semantic hash:

```text
validated DTO
→ semantic projection
→ canonicalization fiscal-command-c14n/1
→ SHA-256 domain-separated
```

Correlation/trace metadata no cambian hash.

## FiscalProvider V1

```text
submit       # única mutación
reconcile    # read-only sobre hecho fiscal
getStatus
fetchXml
fetchPdf
```

No existe `resend()`.

Reconciliación normalizada:

```text
FOUND_ACCEPTED
FOUND_REJECTED
NOT_FOUND_CONCLUSIVE
INDETERMINATE
```

`NOT_FOUND_CONCLUSIVE` requiere semántica demostrada del PT.

## PT shortlist actual

Fuente DIAN vigente consultada el 2026-08-18 lista como autorizados a HKA, DATAICO y Facture.

Prioridad de prueba:

1. **The Factory HKA** — documentación pública fuerte de EstadoDocumento, XML/PDF, DEE y demo; certificado gestionado. Falta demostrar semántica de no-encontrado/retry.
2. **DATAICO** — API-first, FE/NC/ND/POS/nota ajuste POS, consulta FE, sandbox/certificado publicados. Falta demostrar reconciliación completa especialmente POS/notas.
3. Facture — reserva; evidencia API pública localizada insuficiente para priorizar.

No hay PT final seleccionado.

## Bloqueante actual F4C

Ejecutar `docs/f4-prueba-ambiguedad-pt-v1.md` con sandbox real y obtener respuestas contractuales a `docs/f4-matriz-seleccion-pt-v1.md`.

Necesitamos demostrar para cada documento V1:

1. identificador consultable conocido antes del POST;
2. consulta tras timeout;
3. ventana de consistencia;
4. significado de not-found;
5. cuándo es seguro un nuevo intento;
6. comportamiento de duplicados;
7. XML/PDF/estado;
8. multiempresa;
9. certificado/firma;
10. contingencias, límites, SLA, precio y datos.

## Implementación

Todavía no crear adapter productivo.

Sí se puede preparar F5 genérico/fake provider y, cuando se abra F6, construir primero infraestructura interna que no dependa de un PT concreto.
