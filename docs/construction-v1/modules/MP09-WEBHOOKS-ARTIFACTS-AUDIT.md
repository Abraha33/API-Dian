# MP09 — Webhooks, artefactos y auditoría

## Pregunta
¿Cómo entregamos resultados y evidencias al cliente de forma durable, verificable y auditable?

## Fase 1 — Conceptualización
Definir:
- webhook endpoints por tenant/app/environment;
- webhook delivery y reintentos;
- firma/autenticidad de webhook;
- timeouts, backoff y DLQ por endpoint;
- XML/PDF/evidencia como artefactos;
- metadata en PostgreSQL + archivos en object storage;
- audit log append-only para eventos críticos.

Invariantes:
- un webhook fallido no cambia el estado fiscal del documento;
- reintentos de webhook son independientes por destino;
- evidencia validada no se regenera de manera que cambie su significado histórico;
- auditoría crítica no se edita rutinariamente.

Dependencias simulables: receptor webhook local, object storage falso/local, documentos sintéticos.

## Fase 2 — Testeo aislado
Probar:
- webhook 2xx;
- timeout/500/429;
- firma válida/inválida;
- retry/backoff;
- endpoint permanentemente caído → DLQ/terminal controlado;
- artefacto existente/no existente;
- metadata consistente;
- audit trail completo y ordenado.

**Gate:** entrega externa puede fallar sin perder evidencia ni alterar incorrectamente estado fiscal.

## Integración posterior
MP01 expone artefactos/eventos; MP06 produce cambios de estado; MP07 puede ejecutar deliveries durables.
