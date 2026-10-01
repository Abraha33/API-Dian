# Analisis de precios

**Fecha de corte:** 2026-10-01  
**Regla:** valores sin fuente primaria accesible se marcan PARCIALMENTE CONFIRMADO. IVA no confirmado.

## Precios observados

| Oferta | Modalidad | Precio y cupo | NIT/certificado | Estado |
|---|---|---|---|---|
| Factus individual | Anual | 150/$169k; 400/$190k; 1.600/$220k; 2.500/$260k; 5k/$290k; 10k/$390k; 15k/$440k; 20k/$490k; 35k/$820k; 50k/$1,1m; 80k/$1,7m; 120k/$2,16m | 1 NIT; certificado incluido | P; material oficial 2026-09-11 |
| Factus multi | Bolsa anual | 10k/$630k; 20k/$1,12m; 50k/$2,25m; 80k/$3,2m; 120k/$3,84m; 200k/$5,6m; 500k/$12m; 750k/$16,5m; 1m/$21m | $130k/NIT-año | P; imagen sin fecha 2026-09-26 |
| Matias API | Bolsa anual | 5k/$220k; 10k/$400k; 30k/$630k; 50k/$850k; otra fuente 500k/$6m | Compartida; certificado no incluido | P |
| FacturaLatam | Mensual | $99,9k 10 NIT/5k; $349,9k 50/30k; $999,9k 200/150k | Marca blanca | P |
| Plemsi | Mensual/anual | $19k/100 mes; $1,242m/24k año | Multi por cotizacion | P |
| Saphety directo | Anual | $150k/100; $720k/1k; $1,2m/2k | No es tarifa partner | P |
| HKA/Dataico/Aliaddo/Alanube/Gosocket/ESTELA | Cotizacion | No calculable | Por confirmar | NO PUBLICADO/NO VERIFICADO |

## Normalizacion mensual

Se anualiza Q*12 y se toma el menor paquete conocido. No incluye IVA, soporte ni alta.

| Oferta | 100 | 500 | 1.000 | 5.000 | 10.000 | 50.000 | 100.000 docs/mes |
|---|---:|---:|---:|---:|---:|---:|---:|
| Factus individual | $18.333 | $32.500 | $36.667 | $141.667 | $180.000 | ~$900.000* | ~$1.800.000* |
| Factus multi + 1 certificado | $63.333 | $63.333 | $104.167 | $277.500 | $330.833 | $1.385.833 | No calculable** |
| Matias conocido | $18.333*** | $33.333 | $52.500 | No calculable | No calculable | $500.000**** | No calculable |
| FacturaLatam | $99.900 | $99.900 | $99.900 | $99.900 | $349.900 | $999.900 | $999.900 |
| Plemsi | $19.000 | No calculable | No calculable | No calculable | No calculable | No calculable | No calculable |

\\* Repeticion aproximada de paquetes de 120.000.  
\\** Sumar bolsas de lista nueva no esta confirmado.  
\\*** Se paga minimo de 5.000/año.  
\\**** Referencia 500.000/año por COP 6m.

## Lecturas

- Bolsa compartida no garantiza menor precio.
- Bajo volumen: domina el minimo anual.
- DEE POS puede equivaler a cada venta; planes pequenos se agotan rapido.
- “POS ilimitado” suele describir cajas, no documentos fiscales.
- No ofrecer ilimitado mientras el PT cobre por documento.

## Experimentos

| Plan propuesto | Precio | Incluye | Excedente | Objetivo |
|---|---:|---|---:|---|
| Starter API | $69.000/mes | 1 NIT, 100 docs | $180/doc | SaaS pequeno |
| Growth API | $119.000/mes | 1 NIT, 500 docs | $120/doc | POS/ERP pequeno |
| Scale API | $249.000/mes | 1 NIT, 2.500 docs | $85/doc | Volumen |
| Partner | $199.000 + $25.000/NIT | 500 compartidos | $75-$120/doc | Casa de software |

No publicar antes de dos cotizaciones y simulacion con consumo real.

## Modulos adicionales

| Modulo Factus | Tramos anuales observados | Nota |
|---|---|---|
| Nomina | 24/$60k; 60/$75k; 120/$90k; 300/$180k; 480/$250k; 780/$350k; 1.200/$480k | Interfaz aliados; P |
| RADIAN | 24/$60k; 60/$75k; 120/$90k; 300/$150k; 500/$195k; 800/$240k; 1.600/$320k; 2.500/$475k; 5.000/$900k | Plan separado; P |

La bolsa multifacturador Factus reporta nomina incluida, no RADIAN. Matias confirma los modulos, pero no se verifico si todos consumen la misma bolsa/unidad. Salud/RIPS y RNDC deben cotizarse como add-ons sectoriales.
