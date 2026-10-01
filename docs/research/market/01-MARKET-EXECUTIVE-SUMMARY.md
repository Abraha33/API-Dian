# Resumen ejecutivo - mercado de API fiscal DIAN

**Fecha de corte:** 2026-10-01  
**Alcance:** FEV, nota credito (NC), nota debito (ND) y documento equivalente electronico POS (DEE POS).  
**Evidencia:** fuentes oficiales verificadas entre 2026-08-19 y 2026-09-26, mas evidencia tecnica publica consultada en GitHub el 2026-10-01. La reconsulta directa de sitios el dia de corte fallo por indisponibilidad del proxy; se indica donde afecta la frescura.

## Veredicto

**Hay evidencia suficiente para continuar, pero no para construir los cuatro documentos sin cerrar primero el contrato con un proveedor tecnologico (PT).** Existe oferta para casas de software, APIs REST, sandbox y bolsas multiempresa. El vacio no es tecnico: faltan cotizaciones contractuales comparables y una prueba de reconciliacion ante timeout.

La mejor hipotesis es una API multiempresa, con un PT, que cubra FEV/NC/ND/DEE POS, estados y artefactos. No conviene competir como facturador final ni por “tener mas documentos”. El valor defendible es reducir trabajo de integracion y operacion para POS/ERP/SaaS.

## Hallazgos

### Que venden

1. PT empresariales con venta asistida: HKA, Dataico, Saphety, Aliaddo y Facture/ESTELA.
2. API para casas de software: Matias API, Factus, FacturaLatam, Plemsi y Dataico.
3. Infraestructura regional: Alanube y Gosocket.
4. Software final con API complementaria: Alegra, Siigo y similares; sirven como referencia, pero no son comparables uno a uno con una API fiscal neutral.

### Que es estandar

Sobre 11 competidores con evidencia util, API aparece en aproximadamente 10/11; DEE POS se atribuye a 10/11, aunque varias confirmaciones son secundarias; multiempresa/casa de software aparece en al menos 8/11. Sandbox, webhooks y reconciliacion estan peor documentados.

El minimo vendible incluye FEV/NC/ND/DEE POS; alta y aislamiento de NIT; resoluciones; validacion e idempotencia; consulta; XML/PDF/respuesta fiscal; errores estructurados; sandbox; webhooks y reconciliacion.

### Como cobran

- **Factus individual:** COP 169.000/150 documentos-año hasta COP 2.160.000/120.000; certificado incluido. Material oficial transcrito el 2026-09-11.
- **Factus multifacturador:** COP 630.000/10.000 hasta COP 21.000.000/1.000.000; certificado COP 130.000/NIT-año. Lista recibida el 2026-09-26 sin fecha impresa: **PARCIALMENTE CONFIRMADO**.
- **Matias API:** COP 220.000/5.000; COP 400.000/10.000; COP 630.000/30.000; COP 850.000/50.000. Otra fuente reporta COP 6.000.000/500.000. **PARCIALMENTE CONFIRMADO**.
- **FacturaLatam:** COP 99.900/mes, 10 empresas/5.000 documentos; COP 349.900, 50/30.000; COP 999.900, 200/150.000. **PARCIALMENTE CONFIRMADO**.
- **Plemsi:** referencias desde COP 19.000/mes por 100 y COP 1.242.000/año por 24.000; bolsa multiempresa sin precio publico. **PARCIALMENTE CONFIRMADO**.
- HKA, Dataico, Aliaddo, Alanube, Gosocket y Facture/ESTELA: precio API comparable **NO PUBLICADO o NO VERIFICADO**.

### Como venden

El patron API-first usa documentacion, sandbox, Postman e integracion rapida. El patron PT empresarial usa demo, contacto, especialista, contrato y puesta en produccion. Conviene un recorrido hibrido: documentacion y sandbox autoservicio; activacion productiva asistida.

### A quien venden

Casas de software, POS, ERP, SaaS verticales e integradores con varios NIT. No es el mismo comprador que una pyme que busca un programa de facturacion completo.

## MVP

**MUST:** cuatro documentos; un PT; API JSON versionada; API keys por entorno; multiempresa; idempotencia; validacion; estados; reconciliacion; XML/PDF/respuesta; webhooks; sandbox; OpenAPI/Postman; auditoria; limites; metricas; alta productiva.

**SHOULD:** sucursales/multiprefijo, alertas de resolucion y consumo, reenvio de webhook, panel operativo minimo, ejemplos y exportacion.

**LATER:** segundo PT, failover, SDK multiples, white-label visual, PDF altamente personalizable, BI, portal contable y documentos fiscales excluidos.

## Precio a estudiar

No vender “ilimitado”. Probar:

1. Por NIT: COP 69.000/100, COP 119.000/500 y COP 249.000/2.500 al mes.
2. Integrador: COP 199.000/mes + COP 25.000/NIT activo + COP 75-120/documento.
3. Prepago anual con descuento despues de medir consumo.

Son **precios de experimento**, no conclusion de mercado.

## Meta de 100 clientes

Con 100 clientes, costos fijos de COP 2,5 millones, 500 documentos/cliente, costo efectivo de COP 44/documento, 0,3 horas de soporte y pasarela de 3%, se necesita aproximadamente **COP 120.000 de ARPA** para acercarse a COP 5 millones de beneficio. A COP 69.000 y alto consumo, la meta no cierra.

## Riesgos

1. Factus tiene evidencia contradictoria sobre DEE POS; la fuente comercial reciente dice que no lo ofrece.
2. El “not found” concluyente tras timeout no esta demostrado para ningun PT.
3. Bolsa compartida no siempre es mas barata; en Factus puede costar mas que paquetes individuales.
4. Certificado, alta, resolucion y soporte por NIT pueden consumir el margen.
5. DEE POS convierte cada venta en consumo; un precio fijo ilimitado es peligroso.
6. La API externa contradice el baseline de agosto que la reservaba para despues. Esta mision reabre deliberadamente esa decision.

## Decision

**GO condicionado para discovery y prototipo; NO-GO aun para lanzamiento.** Gates: dos cotizaciones API/partner, confirmacion escrita de los cuatro documentos, contrato multiempresa/reventa, sandbox con timeout/reconciliacion y cinco entrevistas B2B con volumen y disposicion de pago.

Pendiente: precio contractual de HKA/Dataico/Aliaddo; DEE POS de Factus; costo real de soporte/alta; y evidencia de demanda pagada de una API neutral.
