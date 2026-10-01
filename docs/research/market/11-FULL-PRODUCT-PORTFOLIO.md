# Portafolio fiscal completo

**Fecha de corte:** 2026-10-01  
**Objetivo:** definir todo el producto posible sin fingir que todo debe entrar en la primera version.

## Limite

La plataforma cubre documentos electronicos fiscales y sus integraciones regulatorias inmediatas. No se convierte automaticamente en ERP, software de nomina, TMS, historia clinica, contabilidad, declaraciones tributarias o PILA.

## Mapa completo

### 1. Ventas electronicas

- Factura Electronica de Venta, Nota Credito y Nota Debito.
- Contingencia y transmision posterior cuando aplique.
- Consulta, XML, PDF, ApplicationResponse, CUFE y entrega.
- Consumidor final, adquirente identificado, moneda e impuestos.

### 2. Documentos equivalentes electronicos

- DEE POS y notas de ajuste.
- Restantes tipos del catalogo DEE vigente.
- CUDE, numeraciones, representaciones y reglas por tipo.

El motor comparte infraestructura, pero cada tipo necesita esquema versionado y pruebas propias.

### 3. Compras a no obligados

- Documento soporte en adquisiciones.
- Nota de ajuste.
- CUDS, numeracion y vendedor residente/no residente cuando aplique.
- Importacion desde cuentas por pagar sin convertirse en contabilidad.

### 4. Nomina electronica

- Nomina individual.
- Reemplazo y eliminacion/ajuste.
- CUNE, periodos, devengados y deducciones.
- Emision masiva, estado por empleado, archivos y correccion.

No calcula la liquidacion laboral: recibe una liquidacion aprobada y la convierte en documento fiscal.

### 5. Recepcion electronica

- Importar por CUFE/archivo/correo.
- Bandeja de documentos recibidos.
- Validar emisor, totales y estado DIAN.
- Eventos de recepcion 030-034.
- Evidencia, firma, timestamps y consulta.
- Integracion con cuentas por pagar por webhook/API.

### 6. RADIAN

- Registro/consulta de FEV como titulo valor.
- Trazabilidad de eventos.
- Endoso, mandato, pago, limitaciones y otros eventos solo despues de verificar cobertura PT/anexo.
- Separacion entre recepcion fiscal basica y negociacion financiera.

### 7. Sector salud

- FEV y notas con campos de salud.
- RIPS JSON asociado.
- Envio/validacion ante MUV/SISPRO.
- CUFE fiscal separado de CUV/CUCON sectorial.
- Estados DIAN y MinSalud separados.

La Resolucion 948 de 2026 es la referencia encontrada; desplaza material que aun cita 2275/2023.

### 8. Transporte

- FEV transporte con referencias requeridas.
- Integracion RNDC para remesas/manifiestos cuando aplique.
- Consulta de errores y correlacion.
- TMS, rutas y flota quedan fuera.

### 9. Plataforma transversal

- Organizaciones, NIT, sucursales, usuarios y roles.
- Credenciales, certificados, software y resoluciones.
- Sandbox/produccion; API keys/OAuth.
- Idempotencia, colas, estados y reconciliacion.
- Webhooks HMAC, historial y reenvio.
- XML/PDF/respuestas/adjuntos.
- Consumo, limites, planes y facturacion.
- Auditoria, retencion, exportacion y portal desarrollador.

## Identificadores

| Familia | Identificador principal | Relacion |
|---|---|---|
| FEV | CUFE | Factura base |
| NC/ND | CUDE/CUFE segun tipo | Referencia FEV |
| DEE | CUDE | Documento equivalente |
| Documento soporte | CUDS | Compra a no obligado |
| Nomina | CUNE | Empleado/periodo |
| RADIAN | CUFE + evento | Titulo valor |
| Salud | CUFE + CUV/CUCON | DIAN + MUV |
| Transporte | CUFE + IDs RNDC | DIAN + MinTransporte |

La nomenclatura exacta se valida por anexo; esta tabla es mapa de dominio.

## Referencia competitiva de amplitud

La documentacion publica de Matias confirma endpoints para FEV, NC, ND, POS, ajustes POS, documento soporte, ajuste, nomina/reemplazo/eliminacion, eventos RADIAN 030-034, salud, archivos, resoluciones y webhooks. Es evidencia de que una suite unificada es tecnicamente comercializable; no prueba precio, SLA ni calidad productiva.

Factus reporta FEV/notas, soporte, nomina y RADIAN, pero DEE POS permanece contradictorio. HKA y Dataico tienen evidencia fuerte en facturacion/DEE, con los modulos ampliados pendientes de cotizacion y sandbox.

## Planes comerciales

1. **Core Sales:** FEV/NC/ND.
2. **Commerce:** Core + DEE POS.
3. **Purchasing:** documento soporte.
4. **Payroll Fiscal:** nomina electronica.
5. **Reception:** bandeja + eventos.
6. **RADIAN Pro:** titulo valor.
7. **Health:** FEV salud + RIPS.
8. **Transport:** FEV + RNDC.
9. **Enterprise Suite:** combinacion contractual, nunca consumo ilimitado.

## Criterio de completitud

Un modulo existe solo con normativa versionada, contrato PT, sandbox, casos aceptados/rechazados/ambiguos, artefactos, reconciliacion, documentacion, pricing, soporte y piloto. Un endpoint aislado no lo convierte en producto.
