# Economía unitaria y meta de 100 clientes

**Fecha de corte:** 2026-10-01  
**Meta de referencia:** COP 5.000.000/mes de beneficio estabilizado con aproximadamente 100 clientes activos.

## Fórmula

`beneficio = N × ARPA − costo_documental − certificados − soporte − pagos − fijos`

`ARPA requerido = (meta + fijos + costos variables totales) / (N × (1 − comisión de pago))`

No se asume que cada cliente consume igual ni que “cliente” equivale a un NIT.

## Escenarios de plataforma core

Valores de planeación; no son cotización de PT.

| Variable mensual | Conservador | Base | Favorable |
|---|---:|---:|---:|
| Clientes | 100 | 100 | 100 |
| ARPA | $89.000 | $149.000 | $189.000 |
| Docs/cliente | 1.000 | 600 | 400 |
| Costo efectivo/doc | $80 | $45 | $25 |
| Costo NIT/certificado | $12.000 | $8.667 | $0* |
| Soporte h/cliente | 0,6 | 0,3 | 0,2 |
| Costo hora | $30.000 | $30.000 | $30.000 |
| Pasarela | 3% | 3% | 3% |
| Fijos | $3.000.000 | $3.000.000 | $3.500.000 |
| Beneficio estimado | **−$5.367.000** | **$6.986.300** | **$13.233.000** |

\* Supone firma incluida o trasladada explícitamente al cliente.

En el escenario base, ARPA requerido para exactamente COP 5 millones es cercano a COP 128.500. Conviene apuntar a COP 149.000 para absorber variación e incidentes.

## Sensibilidades

- Cada COP 10 por documento sobre 60.000 docs/mes cambia el beneficio en COP 600.000.
- Cada 0,1 h adicional de soporte por cliente cuesta COP 300.000/mes.
- Un certificado Matias de COP 104.000/año equivale a COP 8.667/NIT-mes.
- Diez clientes de alto volumen pueden costar más que noventa pequeños; número de clientes es una métrica insuficiente.
- Un módulo vendido pero poco automatizado puede destruir más margen por soporte que por costo PT.

## Mezcla ilustrativa de 100 clientes

| Plan | Clientes | Precio mensual | Ingreso |
|---|---:|---:|---:|
| Starter | 25 | $89.000 | $2.225.000 |
| Growth | 55 | $149.000 | $8.195.000 |
| Partner | 20 | $249.000 | $4.980.000 |
| **Total/ARPA** | **100** | **$154.000 promedio** | **$15.400.000** |

Esta mezcla solo funciona si Starter limita consumo, Partner cobra NIT adicionales y soporte se mantiene cerca de 0,3 h/cliente-mes.

## Economía por módulo

| Módulo | Unidad recomendada | Riesgo de costo |
|---|---|---|
| FEV/DEE/soporte | documento validado | alto volumen POS |
| Nómina | empleado-periodo/documento | picos mensuales y correcciones |
| Recepción | factura recibida + evento | varios eventos por factura |
| RADIAN | factura/evento avanzado | soporte legal/operativo |
| Salud/RIPS | factura + validación RIPS | dobles rechazos DIAN/MUV |
| Transporte/RNDC | factura + operación RNDC | dos autoridades y soporte vertical |

No usar una única bolsa ilimitada propia aunque el proveedor mayorista agrupe servicios. Cobrar según la unidad que genera trabajo y costo.

## Margen potencial con bolsas públicas

Matias publica COP 12–44 por unidad a consumo completo; Aliaddo COP 30–80; Bilidox alrededor de COP 125 en tramos altos. Estos son solo costos de paquete visibles: faltan IVA, desperdicio, NIT, certificado, plataforma, soporte e incidentes. Un excedente vendido a COP 75 puede ser inviable con Aliaddo/Bilidox en ciertos tramos y viable con Matias solo si la bolsa se utiliza bien.

## Condiciones para acercarse a la meta

1. ARPA promedio ≥COP 129.000, preferiblemente ~149.000.
2. Margen de contribución ≥60% por cohorte.
3. Cargo automático por excedente y NIT activo.
4. Onboarding repetible y soporte ≤0,3 h/NIT-mes.
5. Comprar capacidad según demanda; controlar saldo anual desperdiciado.
6. Trasladar o cobrar certificado/alta.
7. No abrir vertical sin cliente ancla y precio específico.
8. Conseguir clientes mediante integradores con base instalada, no 100 ventas individuales.

## Conclusión económica

La meta es posible matemáticamente, no validada comercialmente. Cien clientes a COP 69.000 no bastan bajo consumo y soporte realistas. El negocio necesita ticket medio superior, automatización fuerte y mezcla de integradores; la suite completa no debe subsidiarse desde un plan core barato.
