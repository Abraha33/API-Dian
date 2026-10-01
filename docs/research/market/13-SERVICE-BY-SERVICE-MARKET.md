# Investigación de mercado por servicio

**Fecha de corte:** 2026-10-01

## 1. FEV, NC y ND

**Mercado:** universal en la muestra; es la puerta de entrada de todas las suites.  
**Comprador:** POS, ERP, SaaS, e-commerce y software administrativo.  
**Oferta estándar:** emisión/validación, notas, consulta, XML/PDF, correo, rangos y sandbox.  
**Precio:** bolsas anuales desde decenas de COP por documento a volumen; transmisión es commodity.  
**Decisión:** obligatorio en release 1, pero no diferencia por sí solo. Diferenciar por operación multiempresa, errores y conciliación.

## 2. DEE POS

**Mercado:** publicado por Matias, HKA, Bilidox, Aliaddo, Dataico, Saphety, ESTELA y EDICOM; Factus no lo muestra en docs v2 al corte.  
**Comprador:** POS, retail, restaurantes y plataformas de comercio.  
**Problema:** alto volumen, identificación del adquirente, rangos, CUDE, ajuste y continuidad.  
**Precio:** suele consumir la misma bolsa que FEV; cada venta puede ser una unidad.  
**Decisión:** release 1 si el beachhead es POS. Evitar tarifa ilimitada.

## 3. Otros documentos equivalentes

**Mercado:** DIAN define 12; Aliaddo, Bilidox y ESTELA desglosan varios. La cobertura por subtipo de la mayoría es opaca.  
**Compradores:** cine, transporte, aerolíneas, peajes, servicios públicos, bolsas, juegos y espectáculos; cada uno es un vertical.  
**Precio:** normalmente comparte bolsa, pero implementación/soporte puede ser sectorial.  
**Decisión:** no construir catálogo completo sin cliente ancla. Habilitar arquitectura modular.

## 4. Documento soporte y nota de ajuste

**Mercado:** confirmado en Matias, Factus, HKA, Bilidox, Aliaddo, Dataico, Saphety y ESTELA. Es un estándar de suite amplia, no rareza.  
**Comprador:** ERP, software contable y cuentas por pagar.  
**Oferta estándar:** rango, emisión, ajuste, consulta y PDF/XML.  
**Precio:** incluido en bolsas de Matias/Bilidox/Aliaddo; no hay señal de que deba ser plan independiente en API generalista.  
**Decisión:** primera expansión después del core, especialmente para ERP.

## 5. Nómina electrónica

**Mercado:** Matias, Factus, HKA, Bilidox, Dataico, Saphety, ESTELA y EDICOM la publican. Existen dos productos distintos:

1. transmisión fiscal de liquidación ya calculada;
2. software completo que calcula prestaciones, PILA, pagos y portal de empleado.

**Comprador API:** software de nómina/HR o ERP que ya calcula.  
**Precio:** Matias/Bilidox la mezclan en bolsa documental; Aliaddo vende software final por empleado/plan; Factus ha manejado bolsas específicas según material transcrito.  
**Riesgo:** prometer “nómina” puede crear expectativa de liquidación laboral.  
**Decisión:** módulo separado, limitado contractualmente a documento fiscal y ajuste.

## 6. Recepción y eventos 030–034

**Mercado:** Factus, HKA, Bilidox, Dataico, Saphety, ESTELA y Alanube publican recepción/eventos.  
**Comprador:** cuentas por pagar, ERP, contabilidad y tesorería.  
**Oferta básica:** cargar/recibir factura, validar, acuse, recibo, aceptación/reclamo/tácita, bandeja y estado.  
**Diferenciador enterprise:** reglas comerciales, sincronización ERP y automatización AP, visible en ESTELA.  
**Decisión:** desarrollar antes de RADIAN avanzado; puede venderse como módulo operativo propio.

## 7. RADIAN avanzado

**Mercado:** Bilidox publica inscripción, aval, endoso, protesto y mandato; ESTELA y EDICOM describen título valor/factoring; Matias y Factus publican “RADIAN” principalmente alrededor de eventos/recepción.  
**Comprador:** factoring, tesorería, financieros, grandes proveedores y ERP especializados.  
**Precio:** evidencia pública insuficiente; Bilidox lo incluye en bolsa y material Factus previo lo trata separado.  
**Riesgo:** complejidad jurídica, secuencias y soporte especializado.  
**Decisión:** no llamarlo completo hasta probar cada evento. Lanzar solo con design partner.

## 8. Salud y RIPS

**Mercado:** HKA publica HKA Fácil RIPS y API REST; Factus documenta variantes FEV salud; Matias publica modalidad salud. La muestra comparable es menor que en core.  
**Comprador:** IPS, clínicas y software de salud.  
**Problema:** coordinar factura/notas DIAN con RIPS y validación MUV, manteniendo identificadores/estados separados.  
**Precio:** **NO PUBLICADO** en forma API comparable.  
**Riesgo:** normativa 2026, datos sensibles y doble soporte regulatorio.  
**Decisión:** vertical posterior, con especialista y cliente ancla; no incluir gratuitamente.

## 9. Transporte y RNDC

**Mercado:** Factus documenta FEV tipo transporte; Aliaddo/Bilidox cubren DEE de transporte. La oferta conjunta DIAN+RNDC no está suficientemente publicada en la muestra.  
**Comprador:** TMS, transportadores y software logístico.  
**Problema:** correlacionar factura con operación RNDC sin convertirse en TMS.  
**Precio:** **NO PUBLICADO/NO CALCULABLE**.  
**Decisión:** mantenerlo como integración vertical, no como parte obligatoria de la suite fiscal inicial.

## 10. Capacidades de plataforma

**Mercado:** dashboard, almacenamiento, correo, firma, retención, soporte y multiempresa se usan para empaquetar el cumplimiento. Aliaddo restringe multiempresa/webhooks por nivel; Matias cobra firma/almacenamiento extra; Saphety ofrece operador virtual.  
**Comprador:** dueño/product manager del software, no el contador final.  
**Decisión:** son parte del producto comercial, no “infraestructura interna”. Cobrar NIT/plataforma protege margen.

## Priorización resultante

| Prioridad | Servicios | Por qué |
|---|---|---|
| 1 | FEV, NC, ND, DEE POS/ajuste | demanda transversal y beachhead POS/ERP |
| 2 | documento soporte | alta recurrencia en suites y mismo comprador ERP |
| 3 | nómina fiscal o recepción | elegir según pilotos; compradores diferentes |
| 4 | recepción y luego RADIAN avanzado | dependencia funcional y complejidad |
| 5 | otros DEE | vertical por subtipo |
| 6 | salud/RIPS y transporte/RNDC | especialización sectorial |

