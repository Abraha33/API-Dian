# Fase 2 — Plan de testeo y aceptación

**Estado:** PASS para el alcance actualmente implementado; Fases 5–6 aún requieren gates adicionales.

## Suites ejecutadas

- Unitarias Jest: 3 suites, 9 tests PASS.
- Provider contract harness: 1 suite, 6 tests PASS.
- E2E local con PostgreSQL y `FakeFiscalProvider`: 1 suite, 11 tests PASS.
- Concurrencia HTTP/DB: 1 suite, 4 tests PASS.
- Verificación SQL de comportamiento F6: PASS.

## Escenarios críticos cubiertos

- replay con misma semántica y conflicto con semántica diferente;
- aislamiento cross-tenant;
- aceptación y rechazo concluyentes;
- transporte probado como no enviado;
- timeout ambiguo sin segundo submit;
- visibilidad tardía y reconcile read-only;
- crash después de posible aceptación remota;
- kill switch de mutaciones;
- 32 requests idénticos, carrera semántica y 40 comandos distintos;
- claim durable de trabajos sin duplicación.

## Pendiente para cerrar Fase 6

Restore ejecutado, outage/recovery de DB, fallos de webhook, benchmark reproducible, saturación medida y evidencia de rollback aún no están demostrados.
