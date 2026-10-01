# Requisitos minimos DIAN

**Fecha de corte:** 2026-10-01  
**Naturaleza:** resumen de producto, no concepto juridico.

## Marco verificado

- Resolucion DIAN 000165 de 2023: sistema de facturacion y documentos equivalentes.
- Resoluciones 000008, 000119 y 000189 de 2024: modificaciones/calendarios.
- Resolucion 000202 de 2025: modificacion parcial.
- Resolucion Unica 000227 de 2025: referencia compilada reportada.
- Anexo Tecnico FEV version 1.9 y Anexo DEE version 1.0.
- Estatuto Tributario, articulos 616-1 y 617.

Las URLs oficiales estan en `10-SOURCES.md`. Deben revalidarse antes del adapter, piloto y produccion.

## Minimo por dominio

### Comun

- Identificar obligado, adquirente cuando aplique, software/proveedor y ambiente.
- Numeracion autorizada, prefijo, rango y vigencia.
- Fecha/hora, moneda, lineas, cantidades, precios, descuentos/cargos, impuestos y totales consistentes.
- XML conforme al anexo aplicable, firma y validacion previa.
- Identificador unico aplicable, respuesta de validacion y QR/representacion cuando corresponda.
- Entrega al adquirente y conservacion de evidencia segun responsabilidad contractual.

### FEV

Denominacion, vendedor/adquirente, consecutivo autorizado, impuestos/totales, CUFE, firma, validacion previa y entrega. La API debe soportar consumidor final y adquirente identificado conforme a reglas vigentes.

### NC y ND

No son simples facturas negativas/positivas. Deben referenciar el documento afectado, concepto/codigo y valores de ajuste; mantener trazabilidad con FEV y reglas del anexo.

### DEE POS

Usa anexo e identificador propios (CUDE reportado en las fuentes), numeracion y representacion aplicables. Debe revisarse la nota de ajuste asociada aunque el producto comercial enumere solo DEE POS: sin mecanismo de ajuste el ciclo operativo queda incompleto. Esa nota es capacidad auxiliar, no quinto SKU.

## Contingencia

No todo timeout es contingencia fiscal. Separar inconveniente DIAN, PT, facturador y comunicacion. Solo activar procedimientos, numeraciones y plazos que el marco vigente permita. `UNKNOWN` tecnico nunca autoriza por si mismo contingencia o reemision.

## Reparto contractual

Asignar por escrito cliente/nuestra API/PT para habilitacion, software, certificado, firma, numeracion, XML, transmision, consulta, entrega, almacenamiento, contingencia y soporte. La responsabilidad del obligado no desaparece por usar PT.

## Requisito fiscal vs producto

Fiscal: contenido, numeracion, XML, firma, validacion, identificadores, entrega y contingencia. Comercial: REST/JSON, API keys, webhooks, SDK, dashboard, bolsa multiempresa y errores explicados.

## Gate de frescura

Revisar normativa, anexos y habilitacion PT: antes de implementar adapter, antes de piloto y antes de produccion. Registrar URL, hash/version del anexo y fecha.
