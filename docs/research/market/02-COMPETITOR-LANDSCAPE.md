# Panorama competitivo ampliado

**Fecha de corte:** 2026-10-01  
**Muestra principal:** 12 ofertas; 10 con evidencia oficial directa y 2 parciales.  
**Leyenda:** C = confirmado oficialmente; P = parcial/secundario; ? = no publicado o no verificado. La ausencia pública nunca se convierte en “No”.

## Matriz por servicio

| Competidor | Rol | FEV/notas | DEE POS | Otros DEE | Soporte | Nómina | Recepción | RADIAN avanzado | Salud/RIPS | Transporte | API/sandbox |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Matias API | software propio/API | C | C | ? | C | C | C | P | C/FEV salud | ? | C/C |
| Factus | API/aliados | C | ? | ? | C | C | C | P | C/P | C FEV | C/C |
| The Factory HKA | PT | C | C | C | C | C | C | P | C/C | ? | C/C |
| Bilidox/Grafosoft | PT/API | C | C | C parcial | C | C | C | C publicado | ? | DEE transporte | C/C |
| Aliaddo | PT/API/software | C | C | C parcial | C | P separado | ? | ? | ? | DEE transporte | C/? |
| Dataico | PT/API/software | C | C | ? | C | C | C | ? | ? | ? | C/P |
| Saphety | PT/operador virtual | C | C | C genérico | C | C | C | P/factoring | ? | ? | P/? |
| ESTELA/Facture | PT enterprise | C | C | C | C | C | C | C | ? | ? | P/? |
| Alanube/Alegra | API regional | C | ? | ? | ? | ? | C | P eventos | ? | ? | C/C solicitado |
| EDICOM | PT enterprise/global | C | C | ? | ? | C | P | C | ? | ? | integración/? |
| Plemsi/ECA | API/PT | P | P | ? | ? | ? | ? | ? | ? | ? | P/P |
| FacturaLatam | código fuente | P | P | ? | ? | ? | ? | ? | ? | ? | API autohospedada |

## Fichas competitivas

### Matias API / Lopezsoft

**Oferta:** API bajo modalidad software propio, casas de software y paquetes por NIT. Publica FEV/notas, POS, soporte, nómina, eventos RADIAN, salud, contingencia, exportación, ApplicationResponse y AttachedDocument.  
**DX:** documentación pública, endpoints, sandbox inmediato, valores mágicos para errores, dashboard multiempresa y webhooks.  
**Precio:** bolsa anual pública; 5.000–500.000 documentos. Firma separada para casas de software.  
**Venta:** self-service/híbrida, precios visibles, WhatsApp y soporte dev-to-dev.  
**Crítica:** es la referencia más fuerte para API amplia y barata. Los claims de uptime, tiempos y volumen son del proveedor y no fueron auditados. “Eventos RADIAN” no prueba todo el ciclo avanzado de título valor.

### Factus

**Oferta:** API v2 para FEV/notas, documento soporte/ajuste, nómina/ajuste, recepción/RADIAN y variantes FEV de salud y transporte.  
**DX:** documentación pública muy detallada, sandbox/producción, OAuth bearer, consulta/listado, PDF/XML y `reference_code` para evitar duplicados.  
**Precio:** planes comunicados por asesores/material comercial; tarifa pública API comparable no aparece en la landing actual.  
**Venta:** documentación y sandbox compartido para iniciar; sandbox privado/producción tras comprar; contacto por WhatsApp.  
**Crítica:** la documentación actual no muestra DEE POS, por lo que queda `?`; no debe atribuirse por analogía con “software POS”.

### The Factory HKA

**Oferta:** PT autorizado con manuales para facturación, DEE, documento soporte, nómina, eventos y HKA Fácil RIPS.  
**DX:** wiki pública, ambientes demo/productivo, guías de intermitencia y API REST específica para RIPS.  
**Precio:** **NO PUBLICADO**.  
**Venta:** alta e integración asistida con acuerdo, credenciales y especialista.  
**Crítica:** mejor referencia pública de operación/reconciliación y salud. Multiempresa, SLA y RADIAN avanzado requieren cotización.

### Bilidox / Grafosoft

**Oferta:** API REST/JWT, sandbox, FEV/notas, soporte, nómina, recepción, varios DEE y eventos RADIAN avanzados publicados.  
**Precio:** bolsa anual desde 15 documentos/COP 24.000 hasta 50.000/COP 6.250.000; todos los tipos listados comparten plan.  
**Venta:** precios y compra directa; documentación API se solicita.  
**Crítica:** es el comparable público más claro de suite completa, pero no publica NIT incluidos, excedentes, rate limits, SLA ni detalle técnico abierto.

### Aliaddo

**Oferta API:** FEV, NC/ND, documento soporte/ajuste y DEE/ajuste; enumera POS, cine, transporte terrestre/aéreo, peajes, juegos y espectáculos. Firma y retención por cinco años incluidas.  
**Precio API:** 5.000/COP 399.900; 15.000/674.900; 40.000/1.599.900; 120.000/3.590.000 anuales. Multiempresa desde 15.000; webhooks desde 40.000; rate limits 20/60/120/300 por minuto.  
**Nómina:** producto separado; el plan Lite publicado es transmisión DIAN para dos empleados, no evidencia de nómina incluida en la API de integradores.  
**Venta:** self-service con checkout, onboarding escrito y soporte por tickets/correo.  
**Crítica:** evidencia primaria muy útil de cómo las capacidades operativas cambian por plan.

### Dataico

**Oferta:** software final y API REST JSON para ERP de facturación, nómina o POS. Sus planes directos publican FEV, POS, nómina, soporte y eventos de recepción.  
**Precio:** software final desde COP 0/36.000/72.000 mes; precio API **NO PUBLICADO**, requiere agenda comercial.  
**Venta:** híbrida; autoservicio para software final, ventas para API.  
**Crítica:** confirma la amplitud del mercado, pero los precios de pyme no sirven para calcular costo partner.

### Saphety

**Oferta:** emisión/recepción de FEV, POS/DEE, soporte, nómina, factoring/confirming y programas para partners.  
**Venta:** operador virtual con marca propia o distribuidor por comisión; integración asistida que el sitio estima en menos de 40 días.  
**Precio:** partner **NO PUBLICADO**.  
**Crítica:** benchmark directo para canal white-label, no para autoservicio inmediato.

### ESTELA / Facture

**Oferta:** FEV/notas, nómina, soporte, DEE (POS, servicios públicos, peajes, extractos, boletas y otros), RADIAN, recepción e integración ERP. Publica una opción multi-PT.  
**Venta:** enterprise, formulario y acompañamiento.  
**Precio/API pública:** **NO PUBLICADO**.  
**Crítica:** suite amplia para altos volúmenes; documentación de desarrollador no es públicamente comparable con Factus o Matias.

### Alanube

**Oferta:** API regional para emisión/consulta, webhooks, sandbox solicitado y eventos de recepción (acuse, recibo, aceptación expresa/tácita).  
**Modelo:** comunica pago por emisión y alianza con Alegra como PT.  
**Venta:** formulario de sandbox y asesoría.  
**Crítica:** fuerte mensaje API/multip país; soporte, nómina, DEE y salud quedan **NO VERIFICADOS**.

### EDICOM

**Oferta:** cumplimiento global/enterprise; página Colombia confirma FEV, RADIAN, nómina y facturación electrónica POS, integración con sistemas y archivo.  
**Venta:** consultiva internacional.  
**Precio/API pública:** **NO PUBLICADO**.  
**Crítica:** benchmark de cumplimiento regional, no alternativa inicial económica demostrada.

### Plemsi / ECA

Fuentes técnicas previas muestran API/sandbox, FEV, NC y POS. El sitio devolvió un desafío anti-bot durante la consulta de corte. Nómina, soporte, RADIAN y precios partner quedan **NO VERIFICADOS**.

### FacturaLatam

Vende código fuente/APIDIAN con conexión directa, no una bolsa administrada comparable. La web publica USD 200 para APIDIAN 2026 y afirma documentos ilimitados, pero “todos los documentos” no se desglosó. Se mantiene como sustituto de construir internamente, no como PT/API SaaS equivalente.

## Watchlist

- Carvajal T&S y Cadena siguen siendo actores autorizados/históricos, pero no se obtuvo oferta API actual suficientemente detallada.
- Siigo, Alegra y LOGGRO sirven para precio y UX de software final; no se atribuye una API fiscal neutral por pertenecer al listado DIAN.
- La lista DIAN contiene 97 razones sociales visibles al corte. Ser autorizado no demuestra programa partner, API pública ni soporte de todos los módulos.

