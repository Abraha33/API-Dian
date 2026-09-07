# MP07 — Outbox, cola y workers

## Pregunta
¿Cómo hacemos trabajo fiscal durable, recuperable y seguro ante crashes?

## Fase 1 — Conceptualización
Definir:
- transactional outbox;
- `work_items` durables en PostgreSQL;
- claim/lease;
- `FOR UPDATE SKIP LOCKED` cuando aplique;
- expiración/recuperación de leases;
- API y worker como procesos separados;
- `provider_attempt` persistido antes de side effect remoto;
- backoff/circuit breaker;
- separación entre estado fiscal y estado del scheduler;
- kill switch.

Invariantes:
- no llamada remota dentro de transacción SQL;
- dos workers no ejecutan dos mutaciones activas para la misma operación;
- crash no implica reemisión automática;
- trabajo durable sobrevive reinicios.

Dependencias simulables: `FakeWorkItem`, `FakeFiscalProvider`.

## Fase 2 — Testeo aislado
Probar:
- dos/múltiples workers compitiendo;
- lease expirado;
- worker muerto antes/durante/después del intento;
- backlog;
- provider lento/caído;
- recuperación sin pérdida;
- orden/reintentos según política.

**Gate:** ningún trabajo se pierde y ninguna mutación fiscal se duplica por fallo del scheduler.

## Integración posterior
MP06 gobierna estados/idempotencia y MP08 realiza el side effect mediante adapter.
