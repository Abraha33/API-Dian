# Requisitos mínimos regulatorios por servicio

**Fecha de corte:** 2026-10-01  
**Naturaleza:** mapa de producto preliminar; no es concepto jurídico, tributario, laboral, sanitario ni de transporte.

## Marco general

- Resolución DIAN 000165 de 2023 y modificaciones: sistema de facturación y DEE.
- Resolución Única 000227 de 2025: referencia compilada a revalidar por tema.
- Anexo Técnico FEV 1.9 y Anexo DEE 1.0.
- Resolución 000013 de 2021 y caja de herramientas de nómina.
- Resolución 000167 de 2021 y anexo de documento soporte.
- Resolución 000085 de 2022 y anexo RADIAN.

La versión vigente del anexo debe comprobarse antes de implementar, pilotear y producir.

## Común a los documentos DIAN

- Identificar emisor/obligado, adquirente o contraparte cuando aplique, software y ambiente.
- Resolver numeración, prefijo, rango, vigencia y clave técnica donde aplique.
- Generar XML del esquema correcto, identificador único, firma y validación previa.
- Mantener fecha/hora, moneda, líneas, cantidades, descuentos/cargos, impuestos y totales consistentes.
- Conservar respuesta de validación, XML, representación y evidencia de entrega.
- Diferenciar rechazo fiscal, error técnico, estado pendiente y desconocido.
- Ejecutar contingencia solo bajo causal, numeración y plazo permitidos; un timeout no es contingencia automáticamente.

## FEV, NC y ND

FEV requiere contenido fiscal, numeración autorizada, CUFE, firma, validación y entrega. NC/ND no son facturas negativas/positivas: referencian el documento afectado, concepto y valores, y preservan relación y trazabilidad. Las variantes —estándar, exportación, mandatos, AIU, divisas, salud o transporte— agregan campos/reglas; no son solo etiquetas comerciales.

## Documento equivalente electrónico

DIAN publica 12 tipos:

1. tiquete POS;
2. boleta de cine;
3. tiquete de transporte de pasajeros;
4. extracto;
5. tiquete/billete aéreo;
6. juegos localizados;
7. otros juegos de suerte y azar;
8. peajes;
9. bolsa de valores;
10. bolsa agropecuaria y commodities;
11. servicios públicos domiciliarios;
12. espectáculos públicos.

Comparten marco y CUDE, pero cada tipo tiene campos propios. El producto necesita notas de ajuste y esquemas versionados. POS debe identificar adquirente conforme a regla vigente y operar con volumen elevado. No se debe generalizar POS a los otros once.

## Documento soporte en adquisiciones

Lo genera el comprador para soportar adquisiciones a no obligados a facturar. Requiere numeración autorizada, partes, bienes/servicios, impuestos/totales, CUDS, XML, firma, transmisión y nota de ajuste. La API no reemplaza cuentas por pagar ni decisión sobre deducibilidad.

## Nómina electrónica

El documento soporte de pago de nómina se genera por beneficiario y contiene periodo, devengados, deducciones y diferencia. Requiere CUNE, transmisión/validación y nota de ajuste. El producto fiscal debe recibir una liquidación aprobada; cálculo laboral, PILA, seguridad social, archivo bancario y pago son otro mercado. Si se incluyen, dejan de ser “solo API fiscal”.

## Recepción y eventos 030–034

El ciclo incluye acuse de recibo, recibo del bien/servicio, aceptación expresa, reclamo y aceptación tácita conforme a rol, secuencia y plazo. La API debe firmar, transmitir, consultar y conservar cada evento. Recepción operativa puede incluir correo/carga de XML y reglas de negocio, pero estas son funcionalidades comerciales adicionales.

## RADIAN avanzado

RADIAN administra registro, consulta y trazabilidad de FEV como título valor. La inscripción y eventos como endoso, aval, mandato, protesto, limitaciones, transferencias o pago no deben confundirse con 030–034. Se necesita validar actor, evento, secuencia, firma, CUDE RADIAN, AttachedDocument y estado de la factura. Ofrecer factoring financiero también añade regulación y operación fuera de una API técnica.

## Salud y RIPS

La FEV/NC de salud conserva ciclo DIAN y agrega datos sectoriales. RIPS se envía/valida ante el mecanismo del Ministerio de Salud; CUFE y CUV/CUCON, así como estados DIAN y MUV, se almacenan separadamente. La Resolución 948 de 2026 es la referencia reciente encontrada y reemplaza material anterior; la fuente oficial y anexos deben revalidarse antes de construir.

## Transporte y RNDC

Factus publica una variante FEV transporte; los campos fiscales pertenecen a DIAN. Remesas/manifiestos y operaciones RNDC pertenecen al Ministerio de Transporte. Una integración puede correlacionar ambos sistemas, pero RNDC no es un documento DIAN y el producto no se convierte en TMS.

## Responsabilidades contractuales

Definir cliente/nuestra plataforma/PT para habilitación, software, certificado, numeración, firma, XML, transmisión, consulta, entrega, conservación, contingencia, soporte y cambios normativos. Usar un PT no elimina responsabilidad del obligado.

## Gates de frescura

1. Registrar URL, número, fecha, versión y hash del anexo.
2. Revisar antes de diseñar adapter.
3. Revisar antes de piloto.
4. Revisar antes de producción y en cada anuncio normativo.
5. Para salud y transporte, añadir autoridad sectorial y ambiente correspondiente.

