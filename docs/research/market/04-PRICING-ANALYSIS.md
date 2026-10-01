# Análisis de precios ampliado

**Fecha de corte:** 2026-10-01  
**Regla:** solo se normalizan precios públicos con cupo y vigencia visibles. IVA se considera **NO PUBLICADO** salvo indicación explícita.

## Precios API/partner confirmados públicamente

| Proveedor | Vigencia | Planes observados | Servicios incluidos | Condiciones relevantes |
|---|---|---|---|---|
| Matias casa de software | anual | 5k/$220k; 10k/$400k; 30k/$630k; 50k/$850k; 150k/$2,25m; 300k/$3,9m; 500k/$6m | FEV/notas, nómina, POS, soporte, eventos RADIAN | bolsa multi-NIT; firma $104k/NIT-año; mínimo 3 clientes en 6 meses; soporte dev-to-dev |
| Aliaddo API | anual | 5k/$399,9k; 15k/$674,9k; 40k/$1,5999m; 120k/$3,59m | FEV/NC/ND, soporte/ajuste, DEE/ajuste | firma y retención 5 años; multiempresa desde 15k; webhooks desde 40k; 20/60/120/300 rpm |
| Bilidox | anual | 15/$24k; 50/$40k; 100/$60k; 200/$80k; 500/$150k; 1.200/$240k; 2.400/$420k; 5k/$750k; 10k/$1,25m; 20k/$2,5m; 30k/$3,75m; 50k/$6,25m | facturación, nómina, eventos RADIAN, soporte, equivalentes/ajustes | NIT, excedente, firma, IVA y rate limit no publicados |

`k` = mil documentos; `$` = COP en esta tabla.

## Otros precios observados

- **Dataico software final:** COP 0, 36.000 y 72.000 mensuales; incluye muchos módulos, pero cantidad de documentos no quedó visible y el precio API es por contacto. No usar como costo partner.
- **Aliaddo nómina Lite:** COP 99.900/año, dos empleados y documentos de nómina ilimitados; es software/transmisión para empresa final, no bolsa API multiempresa.
- **FacturaLatam APIDIAN 2026:** USD 200 por código/API autohospedada. No incluye operación administrada comparable.
- **Factus:** listas comerciales transcritas previamente existen, pero no se encontraron en la landing pública actual; se clasifican **PARCIALMENTE CONFIRMADAS** y no gobiernan la recomendación.
- HKA, Saphety, ESTELA, Alanube, EDICOM y Dataico API: **NO PUBLICADO**.

## Precio mensual equivalente

Se multiplica el consumo mensual por 12 y se elige el paquete individual publicado más pequeño que lo cubra. No se asume que se puedan sumar bolsas ni tarifa custom.

| Proveedor | 100 docs/mes | 500 | 1.000 | 5.000 | 10.000 | 50.000 | 100.000 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Matias | $18.333 | $33.333 | $52.500 | $187.500 | $187.500 | No calculable | No calculable |
| Aliaddo | $33.325 | $56.242 | $56.242 | $299.167 | $299.167 | No calculable | No calculable |
| Bilidox | $20.000 | $104.167 | $208.333 | No calculable | No calculable | No calculable | No calculable |

Estas cifras son costo mensual equivalente del paquete, no tarifa mensual contractual.

## Costo efectivo al consumo objetivo

| Proveedor | 100/mes | 500/mes | 1.000/mes | 5.000/mes | 10.000/mes |
|---|---:|---:|---:|---:|---:|
| Matias | $183/doc | $67 | $53 | $38 | $19 |
| Aliaddo | $333/doc | $112 | $56 | $60 | $30 |
| Bilidox | $200/doc | $208 | $208 | NC | NC |

La diferencia se debe al desperdicio del paquete elegido. A consumo completo, Matias publica COP 12–44 por documento, Aliaddo aproximadamente COP 30–80 y Bilidox COP 125–1.600 según tramo.

## Modelos encontrados

### Bolsa anual compartida

Ventaja proveedor: caja anticipada y consumo predecible. Ventaja integrador: distribuye volumen entre NIT. Riesgos: saldo vencido y costo de certificados/soporte. Es el mejor punto de partida para una operación pequeña si el contrato permite reventa.

### Plan por NIT/empresa

Simple de vender y facturar; protege contra alta por cliente. Puede penalizar integradores con muchos NIT de bajo consumo. Debe combinar cargo base con consumo.

### Módulo o unidad específica

Nómina puede cobrarse por empleado/año; recepción/RADIAN por evento; RIPS por factura/validación. Refleja el costo real, pero complica billing. Recomendado solo cuando esos módulos se lancen.

### Pago por emisión/pospago

Alanube comunica pago por lo emitido. Reduce compromiso inicial del comprador, pero traslada variación y riesgo de cartera al proveedor.

### Contrato enterprise

HKA, Saphety, ESTELA y EDICOM priorizan cotización, SLA e implementación. Mayor ticket y venta más lenta; difícil para una persona sin referencias.

## Opciones de precio para validar

No son conclusiones de mercado; son experimentos que requieren cotización de costo y pilotos.

| Opción | Precio propuesto | Incluye | Excedente | Cliente |
|---|---:|---|---:|---|
| Starter | $89.000/mes | 1 NIT, 200 core | $180/doc | SaaS/POS pequeño |
| Growth | $149.000/mes | 1 NIT, 1.000 core | $110/doc | ERP/POS establecido |
| Partner | $249.000/mes + $20.000/NIT activo | 2.000 compartidos, multiempresa | $75–110/doc | casa de software |
| Modular | cargo Partner + add-on | nómina, recepción/RADIAN o vertical | por empleado/evento | integrador especializado |

No ofrecer ilimitado. No regalar nómina, RADIAN y RIPS hasta medir soporte y costo. El precio debe separar plataforma/NIT de consumo para sostener un ARPA superior a COP 120.000.

## Información faltante antes de publicar tarifas

1. Dos cotizaciones partner con IVA, certificado, alta, soporte, excedentes y derecho de reventa.
2. Consumo por tipo de 3–5 pilotos.
3. Si cada evento, ajuste, correo, PDF o reintento consume unidad.
4. Costo de almacenamiento/retención y soporte por NIT.
5. Precio y unidad específicos de nómina, RADIAN, RIPS y RNDC.

