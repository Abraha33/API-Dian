# Contexto de sesión — API-DIAN

Usar este archivo para reanudar trabajo sin reconstruir decisiones cerradas.

## Fuentes maestras

1. `docs/f0-producto-v1-validado-2026-08-18.md` — producto.
2. `docs/v1-requisitos.md` — requisitos/invariantes.
3. `ADR/ADR-003-arquitectura-v1-monolito-postgres.md` — arquitectura/topología V1.
4. `ADR/ADR-004-protocolo-side-effect-idempotencia-reconciliacion.md` — protocolo de mutación fiscal.
5. `ROADMAP.md` — secuencia vigente.

No reabrir producto ni F2 salvo evidencia nueva fuerte.

## Estado

- **Rama:** `dev`.
- **F0 producto:** cerrado.
- **F1 requisitos:** cerrado para arquitectura.
- **F2 arquitectura:** cerrado para F3.
- **Siguiente:** F3 — modelo de datos + seguridad/threat model.
- **Operación inicial:** una sola persona.

## Producto V1

```text
POS propio → API fiscal propia → 1 PT habilitado → DIAN
```

API interna del POS en V1; no API pública comercial.

## Arquitectura congelada en F2

```text
POS
 ↓
API (monolito, rol api)
 ↓
PostgreSQL administrado ← autoridad transaccional
 ↑
Worker (mismo código, rol worker)
 ↓
FiscalProvider → 1 PT

Object storage: solo artefactos
```

Decisiones:

- monolito modular;
- TypeScript + NestJS + Fastify;
- Node 24 LTS al implementar;
- PostgreSQL como fuente de verdad;
- trabajo durable/retries en PostgreSQL;
- sin Redis/BullMQ en producción V1;
- sin microservicios/Kubernetes/broker;
- el HTTP nunca ejecuta mutaciones fiscales del PT;
- solo worker muta PT;
- estado final se consulta por operación;
- object storage no controla workflow;
- observabilidad administrada/minimalista.

## Protocolo fiscal no negociable

```text
persistir operación/idempotencia/job
→ worker reclama
→ persistir provider_attempt
→ llamada PT
→ resultado definitivo O UNKNOWN
→ reconciliar antes de repetir
```

- `DESCONOCIDO != REEMITIR`;
- sin retry HTTP genérico de mutaciones;
- un crash de `SUBMITTING` se recupera como ambigüedad, no como “no enviado”;
- un nuevo intento mutante solo se permite si se demuestra que el anterior no produjo side effect y la semántica del PT lo permite;
- recuperar XML/PDF nunca habilita reemisión.

Estados semánticos mínimos: `PERSISTED`, `READY`, `SUBMITTING`, `ACCEPTED`, `REJECTED_LOCAL`, `REJECTED_REMOTE`, `UNKNOWN`, `RECONCILING`, `NEEDS_ATTENTION`.

## ADR históricos

- ADR-001: supersedido para V1 por ADR-003/004.
- ADR-002: supersedido para V1 por ADR-003.

No borrar infraestructura histórica por reflejo; limpiarla de forma trazada cuando se implemente.

## Próximo trabajo — F3

1. diseñar entidades/tablas y ownership;
2. fijar claves/UUID, tenant_id y constraints;
3. idempotency unique + fingerprint;
4. provider_attempts y trabajo durable con leases;
5. máquina de estados/concurrencia;
6. RLS/defensa multi-tenant;
7. auditoría/evidencia;
8. threat model;
9. auth POS→API;
10. secretos PT;
11. backup/PITR + restore test;
12. documentar ADR/DDL antes de lógica fiscal real.

F4 después: contratos internos y selección PT. Un PT sin reconciliación suficiente no es compatible con V1.
