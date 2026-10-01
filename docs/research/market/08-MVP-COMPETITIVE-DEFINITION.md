# Definicion del MVP competitivo

**Fecha de corte:** 2026-10-01  
**Producto:** plataforma fiscal comercial B2B2B modular para software colombiano.

Esta mision reemplaza para efectos comerciales el baseline de agosto que reservaba la API publica para despues. No cambia la recomendacion de un solo PT.

## MUST HAVE antes de vender

1. FEV, NC, ND y DEE POS completos con un PT.
2. Nota de ajuste DEE POS como capacidad auxiliar necesaria, no SKU adicional.
3. Multiempresa, aislamiento probado y limites por NIT.
4. Alta de emisor, certificado/firma y numeracion segun contrato.
5. API JSON versionada, autenticacion, rate limit e idempotencia.
6. Validacion previa y errores accionables.
7. Procesamiento asincrono, consulta y estados separados.
8. XML, PDF y respuesta fiscal descargables.
9. Webhooks firmados, retry, historial y reenvio.
10. Reconciliacion: UNKNOWN nunca reemite a ciegas.
11. Sandbox determinista y OpenAPI/Postman.
12. Auditoria, metricas, alertas, backup/restauracion y runbooks.
13. Terminos, tratamiento de datos, contrato PT/reventa y soporte.
14. Medicion de consumo por NIT/documento para cobro.

## SHOULD HAVE

- Sucursales y multiples prefijos.
- Panel operativo ligero para integrador.
- Alertas de resolucion, certificado y cupo.
- Exportacion de historico.
- Ejemplos en JavaScript y C# o lenguaje elegido por pilotos.
- Herramientas internas de alta/reconciliacion.

## LATER

- Segundo PT/failover.
- SDK mantenidos.
- White-label avanzado.
- Personalizacion extensa de PDF.
- BI, aplicacion POS propia o portal contable.
- Modulos de soporte, nomina, RADIAN, restantes DEE y verticales, segun roadmap.

## Producto objetivo completo

| Capa | Productos |
|---|---|
| Core ventas | FEV, NC, ND, contingencia |
| Comercio | DEE POS y ajustes |
| Compras | Documento soporte y ajuste |
| Laboral fiscal | Nomina y ajustes |
| Recepcion | Bandeja y eventos 030-034 |
| RADIAN | Titulo valor |
| DEE extendido | Tipos restantes vigentes |
| Salud | FEV/NC salud + RIPS/MUV |
| Transporte | FEV + RNDC |
| Plataforma | Empresas, sandbox, webhooks, archivos, consumo |

El producto completo no equivale a un unico MVP. Cada capa tiene gate normativo, proveedor, pruebas y economia propios.

## Criterio de salida

Demostrar aceptado, rechazado, timeout antes/despues de recepcion, duplicado, webhook caido, reinicio, aislamiento y reconciliacion para cada familia documental. Tambien: dos integradores externos completan sandbox, un piloto paga y margen base es positivo.

## Gates que pueden matar el producto

- Contrato PT prohibe intermediacion.
- PT no soporta realmente DEE POS por API.
- No existe clave de consulta tras perder response.
- Costo por NIT/soporte elimina margen.
- Integradores prefieren PT directo y no pagan por la capa.

## Decision

Construir primero un prototipo comercial de FEV + estado/reconciliacion contra fake provider; no ampliar a implementacion PT de los cuatro iniciales hasta cerrar los gates contractuales. El alcance objetivo es la suite modular descrita en `11-FULL-PRODUCT-PORTFOLIO.md`; el primer release permanece deliberadamente limitado.
