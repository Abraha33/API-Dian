# MP02 — Modelo de datos PostgreSQL

## Pregunta
¿Cómo representamos datos fiscales durables, consultables y seguros?

## Fase 1 — Conceptualización
Definir:
- tenants, organizations, applications, environments;
- documents/versions/events;
- submissions/attempts;
- outbox/work items;
- webhooks/deliveries;
- usage/quotas;
- audit log;
- claves, constraints, índices y timestamps;
- separación metadata DB vs XML/PDF/evidencia en object storage.

Invariantes:
- PostgreSQL es autoridad;
- relaciones cross-tenant inválidas deben fallar por diseño;
- dinero/cantidades usan representación decimal exacta;
- datos históricos fiscales no se reinterpretan por cambios posteriores.

Dependencias simulables: servicios/API/workers falsos.

## Fase 2 — Testeo aislado
Probar localmente:
- migración desde cero;
- constraints y foreign keys;
- unicidad/idempotencia aplicable;
- transacciones y rollback;
- índices/queries críticas;
- crecimiento con datasets sintéticos;
- migración forward/rollback cuando sea seguro.

**Gate:** `ISOLATED TEST READY` cuando schema y migraciones reproducen invariantes sin necesitar API completa.

## Integración posterior
MP03/MP04 aplican identidad/aislamiento; MP06/MP07 usan estado, outbox y work queue.
