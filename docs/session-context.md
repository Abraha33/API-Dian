# Contexto de sesión — API-DIAN

## Fuentes maestras

1. `docs/f0-producto-v1-validado-2026-08-18.md` — producto.
2. `docs/v1-requisitos.md` — requisitos.
3. ADR-003 — arquitectura/topología.
4. ADR-004 — side effects/idempotencia/reconciliación.
5. ADR-005 — datos/tenancy.
6. ADR-006 — seguridad/auth.
7. `docs/f3-modelo-datos-v1.md` y `docs/f3-threat-model-v1.md` — detalle F3.
8. `ROADMAP.md` — secuencia.

No reabrir F0–F3 salvo evidencia nueva fuerte.

## Estado

- rama `dev`;
- F0 ✅;
- F1 ✅;
- F2 ✅;
- F3 ✅ cerrado para F4;
- **siguiente: F4 — contratos internos + selección PT**.

## Producto

```text
POS propio → API fiscal propia → 1 PT habilitado → DIAN
```

## Arquitectura

- monolito modular NestJS/Fastify/TypeScript;
- Node 24 LTS al implementar;
- PostgreSQL administrado autoridad;
- async durable PostgreSQL;
- `api` + `worker` mismo artefacto;
- solo worker muta PT;
- object storage privado solo artefactos;
- sin Redis/BullMQ productivo, microservicios ni Kubernetes.

## Protocolo fiscal

```text
persist operation + idempotency + work
→ claim
→ persist provider_attempt
→ PT mutation
→ definitive result OR UNKNOWN
→ reconcile before any new mutation
```

No retry HTTP transparente de mutaciones.

## Modelo F3

Tablas conceptuales:

- tenants;
- api_credentials;
- fiscal_operations;
- provider_attempts;
- work_items;
- evidence_records;
- artifacts;
- audit_events.

Invariantes:

- tenant_id obligatorio;
- FK tenant-safe;
- RLS + runtime no BYPASSRLS;
- tenant proviene de credential;
- unique tenant+idempotency key;
- payload/hash inmutables;
- state_version/concurrency;
- evidencia/audit append-only;
- work status != fiscal status.

## Seguridad F3

- credential opaca 32-byte secret por instalación POS, scoped a un tenant;
- secreto almacenado solo como digest; rotatable/revocable;
- Authorization redacted;
- API no tiene PT secret;
- worker sí, con privilegio mínimo;
- migrator separado;
- no service_role/superuser como runtime normal;
- PT host fijo;
- buckets privados;
- logs sin payload fiscal completo/secrets;
- restore de DB obliga reconciliar ventana posterior al restore.

## F4 siguiente

No empezar implementación fiscal real todavía.

Cerrar en orden:

1. contrato POS→API;
2. canonicalización + semantic hash;
3. errores/estados internos expuestos;
4. `FiscalProvider` mínimo;
5. investigación vigente de PTs habilitados;
6. shortlist y pruebas sandbox;
7. seleccionar PT con prioridad a reconciliación/correlación, firma/certificados, contingencias y operación multiempresa;
8. completar modelo de campos dependientes PT/DIAN.

Un PT barato que no permita saber qué ocurrió tras timeout es **incompatible**.
