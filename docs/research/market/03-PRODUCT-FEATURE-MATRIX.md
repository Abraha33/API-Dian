# Matriz de funcionalidades

**Fecha de corte:** 2026-10-01  
**Denominador:** 11 competidores; porcentajes aproximados incluyen evidencia parcial.

| Funcionalidad | Evidencia | Categoria | MVP |
|---|---:|---|---:|
| FEV por API | 10/11 (91%) | OBLIGATORIO | Si |
| NC por API | 9/11 (82%) | OBLIGATORIO por alcance | Si |
| ND por API | 8/11 (73%) | OBLIGATORIO por alcance | Si |
| DEE POS | 10/11 (91%), varias parciales | OBLIGATORIO por alcance | Si |
| Multiempresa/casa software | 8/11 (73%) | ESTANDAR del segmento | Si |
| Sandbox/demo | 6/11 (55%) | ESTANDAR B2D | Si |
| Consulta separada | 5/11 (45%) | OBLIGATORIO operacional | Si |
| XML/PDF recuperable | 7/11 (64%) | ESTANDAR | Si |
| OpenAPI/Postman | 5/11 (45%) | ESTANDAR B2D | Si, uno |
| Webhooks explicitos | 3/11 (27%) | ESTANDAR deseable | Si |
| Reconciliacion documentada | 2/11 (18%) | OBLIGATORIO operacional | Si |
| Idempotency key PT | 0/11 confirmado | DIFERENCIADOR tecnico | Propia |
| Error DIAN accionable | No calculable | ESTANDAR esperado | Si |
| SDK mantenidos | No calculable | DIFERENCIADOR | Later |
| Segundo PT/failover | No calculable | DIFERENCIADOR costoso | Later |
| Dashboard contable | Comun en facturadores | PRESCINDIBLE API MVP | No |

Frecuencia no equivale a necesidad. Idempotencia y reconciliacion son obligatorias por integridad aunque casi nadie las explique comercialmente.

## Contrato minimo

1. Crear con Idempotency-Key y referencia propia.
2. Validar sin side effect fiscal cuando sea posible.
3. Consultar por ID propio, emisor/tipo/prefijo/numero y referencia PT.
4. Separar estado interno, PT, DIAN y webhook.
5. Descargar XML, PDF y respuesta original.
6. Exponer codigo estable, campo, reintentabilidad y mensaje original.
7. Firmar webhooks, reintentar y permitir reenvio manual.
8. Reconciliar UNKNOWN; nunca reemitir por timeout sin evidencia.

Estados internos: received, validated, queued, sending, reconciling, completed, failed_internal. Fiscales: pending, accepted, rejected, unknown, requires_attention.
