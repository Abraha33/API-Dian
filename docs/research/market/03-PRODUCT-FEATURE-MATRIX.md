# Matriz de funcionalidades y servicios

**Fecha de corte:** 2026-10-01  
**Método:** frecuencia sobre los 10 competidores con evidencia oficial directa cuando el dato es comparable. `NC` significa no calculable, no cero.

## Capacidades transversales

| Funcionalidad | Evidencia aproximada | Clasificación | Recomendación |
|---|---:|---|---|
| API REST/JSON | al menos 7/10 | ESTÁNDAR B2B | MUST |
| Sandbox/demo | al menos 6/10 | ESTÁNDAR B2D | MUST |
| FEV + NC/ND | 10/10 | OBLIGATORIO núcleo | MUST |
| Consulta de documento/estado | al menos 6/10 | OBLIGATORIO operativo | MUST |
| XML y PDF recuperables | al menos 6/10 | ESTÁNDAR | MUST |
| Multiempresa/partner | al menos 5/10 | ESTÁNDAR objetivo | MUST |
| Dashboard operativo | al menos 5/10 | ESTÁNDAR | SHOULD mínimo |
| Webhooks publicados | al menos 3/10 | ESTÁNDAR API moderna | MUST propio |
| Correo al adquirente | al menos 4/10 | ESTÁNDAR comercial | SHOULD |
| OpenAPI/Postman/docs públicas | al menos 4/10 | ESTÁNDAR developer-first | MUST, al menos uno |
| Idempotencia explícita | al menos 1/10 | Poco publicada, crítica | MUST propio |
| Reconciliación de timeout | al menos 1/10 | Poco publicada, crítica | MUST propio |
| SDK mantenidos | NC | DIFERENCIADOR | LATER |
| Segundo PT/multi-PT | 1/10 explícito | DIFERENCIADOR costoso | LATER |

La baja frecuencia publicada de idempotencia o reconciliación no las vuelve prescindibles. Son controles de integridad.

## Funcionalidades por servicio

| Servicio | Mínimo funcional | Estándar observado | Diferenciador | No necesario inicialmente |
|---|---|---|---|---|
| FEV/NC/ND | emitir, validar, consultar, referenciar, XML/PDF/respuesta | correo, rangos, contingencia, exportación | errores accionables, conciliación | PDF altamente diseñado |
| DEE POS | emisión, CUDE, rango, adquirente, ajuste | integración POS y alto volumen | offline/contingencia robusta | los otros 11 DEE |
| Otros DEE | esquema específico y ajuste por tipo | solo suites amplias publican varios | catálogo modular | activarlos sin cliente ancla |
| Documento soporte | emisión, rango, CUDS, proveedor y ajuste | consulta/PDF/XML | carga masiva desde AP | contabilidad completa |
| Nómina fiscal | documento por empleado/periodo, CUNE, ajuste | carga masiva, PDF/XML, rangos | batch, errores por empleado | liquidación, PILA y pagos |
| Recepción 030–034 | cargar/descubrir factura, secuencia, firma, estado | bandeja, reglas y sincronización ERP | automatización AP | factoring financiero |
| RADIAN avanzado | inscripción y eventos del título valor | pocos publican ciclo amplio | trazabilidad/automatización | construir antes de recepción |
| Salud/RIPS | FEV salud, RIPS, DIAN/MUV separados | oferta pública limitada | remediación clínica/sectorial | historia clínica |
| Transporte | FEV transporte y correlación | oferta pública limitada | integración RNDC | TMS, rutas o flota |

## Catálogo DEE oficial

DIAN publica 12 clases: POS; cine; transporte de pasajeros; extracto; transporte aéreo; juegos localizados; otros juegos de suerte y azar; peajes; bolsa de valores; bolsa agropecuaria/commodities; servicios públicos; y espectáculos públicos. La frecuencia por cada subtipo es **NO CALCULABLE**: la mayoría de proveedores dice “documento equivalente” sin desglosar.

## Contrato API mínimo

1. Crear con referencia del cliente e `Idempotency-Key`.
2. Validar sin emitir cuando el proveedor lo permita.
3. Consultar por ID propio, referencia externa, identificador fiscal y emisor/tipo/prefijo/número.
4. Separar estado interno, PT, DIAN y autoridad sectorial.
5. Descargar XML, PDF, ApplicationResponse y adjuntos originales.
6. Error estable con categoría, campo, `retryable`, correlación y mensaje externo.
7. Webhook HMAC con ID, timestamp, intento, backoff, historial y reenvío.
8. Reconciliar estados ambiguos; nunca reemitir automáticamente solo por timeout.
9. Medir consumo por NIT, servicio y operación facturable.
10. Versionar esquemas por familia y anexo.

## Interpretación

El mercado espera amplitud, pero no obliga a lanzar todo. La ventaja defendible del MVP es que cuatro documentos funcionen bien bajo fallas; la amplitud debe crecer por módulos con compradores y economía distintos.
