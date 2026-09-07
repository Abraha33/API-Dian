# ADR-012: Ciclo asíncrono con PostgreSQL y outbox

- **Estado:** Aprobado
- **Fecha:** 2026-09-07

## Decisión

POST fiscal crea estado+idempotencia+work item/outbox en una transacción y responde 202. Worker separado ejecuta PT. PostgreSQL mantiene queue durable con leases inicialmente. Timeout ambiguo produce `unknown`, nunca retry ciego.

## Razón

Reduce piezas para un operador y elimina el dual-write inicial. Pub/Sub/SQS se añade solo si benchmark prueba contención/latencia; no reemplaza estado ni outbox.

