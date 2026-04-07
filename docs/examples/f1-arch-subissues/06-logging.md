## Epic padre

Parte del epic **F1-ARCH-00**.

## Objetivo

Logging estructurado con **Pino**: child loggers, **correlation_id** en requests HTTP, formato legible en dev y JSON en prod.

## Alcance

- Integración NestJS (logger o wrapper acordado en ADR-001).
- Interceptor o middleware que propague correlation id (header configurable, p. ej. `x-correlation-id`).
- `pino-pretty` solo en desarrollo.

## Prueba de cierre

| Qué verificar | Resultado esperado | Tiempo |
|---------------|-------------------|--------|
| Hacer 1 request y revisar logs | correlation_id presente en la línea de log | S (< 5 min) |

## Rama sugerida

`feature/backend/<n>-f1-arch-06-pino`
