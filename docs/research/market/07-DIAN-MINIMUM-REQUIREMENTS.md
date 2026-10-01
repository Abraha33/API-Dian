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

### Documento soporte en adquisiciones

La Resolucion 000167 de 2021, compilada posteriormente, regula el documento soporte para adquisiciones a sujetos no obligados a expedir factura y su nota de ajuste. La API necesita numeracion cuando aplique, identificacion de comprador y vendedor, impuestos/totales, XML, firma, transmision y CUDS. No sustituye el proceso contable de cuentas por pagar.

### Nomina electronica

El documento soporte de pago de nomina electronica y sus notas de ajuste tienen estructura, periodicidad e identificador CUNE propios. El producto debe recibir devengados, deducciones y liquidacion previamente calculados; validar, firmar, transmitir, consultar y conservar la respuesta. Calculo laboral, seguridad social, PILA y pago al empleado quedan fuera salvo producto futuro separado.

### Recepcion y RADIAN

Los eventos 030-034 cubren acuse de recibo, recibo del bien o servicio, aceptacion expresa, reclamo y aceptacion tacita, segun rol y secuencia aplicable. La recepcion operativa y el registro de eventos deben existir antes de ofrecer negociacion de factura como titulo valor. RADIAN agrega actores, eventos, mandatos, endosos, limitaciones y pagos: requiere validar la Resolucion 000085 de 2022, anexos vigentes y cobertura real del PT antes de cada release.

### Catalogo DEE

DEE POS es solo una clase. El catalogo incluye documentos equivalentes de sectores y operaciones diferentes; cada tipo tiene campos y reglas particulares. Se habilita por esquema/version y cliente ancla, no mediante un payload POS renombrado.

### Salud y RIPS

La FEV de salud conserva su ciclo DIAN y agrega datos sectoriales y RIPS ante el mecanismo del Ministerio de Salud. La Resolucion 948 de 2026 es la referencia vigente encontrada y reemplaza reglas anteriores citadas por material historico. CUFE, CUV/CUCON y estados de DIAN/MUV deben almacenarse por separado. Requiere revision juridica y especialista sectorial antes de produccion.

### Transporte y RNDC

La factura pertenece al sistema DIAN; remesas, manifiestos y otros registros RNDC pertenecen al Ministerio de Transporte. La integracion debe correlacionar ambos dominios sin afirmar que RNDC es un documento DIAN. Operacion de flota, rutas, tarifas y despacho siguen siendo responsabilidad del TMS.

## Contingencia

No todo timeout es contingencia fiscal. Separar inconveniente DIAN, PT, facturador y comunicacion. Solo activar procedimientos, numeraciones y plazos que el marco vigente permita. `UNKNOWN` tecnico nunca autoriza por si mismo contingencia o reemision.

## Reparto contractual

Asignar por escrito cliente/nuestra API/PT para habilitacion, software, certificado, firma, numeracion, XML, transmision, consulta, entrega, almacenamiento, contingencia y soporte. La responsabilidad del obligado no desaparece por usar PT.

## Requisito fiscal vs producto

Fiscal: contenido, numeracion, XML, firma, validacion, identificadores, entrega y contingencia. Comercial: REST/JSON, API keys, webhooks, SDK, dashboard, bolsa multiempresa y errores explicados.

## Gate de frescura

Revisar normativa, anexos y habilitacion PT: antes de implementar adapter, antes de piloto y antes de produccion. Registrar URL, hash/version del anexo y fecha.

Para salud y transporte, el gate incluye ademas normativa y ambientes de la autoridad sectorial. Este documento no reemplaza concepto tributario, laboral, sanitario o de transporte.
