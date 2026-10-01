# Economia unitaria

**Fecha de corte:** 2026-10-01  
**Meta:** alrededor de 100 clientes activos y COP 5.000.000/mes de beneficio estabilizado.

## Formula

`beneficio = N*ARPA - N*(D*c_doc + c_nit + ARPA*c_pay + s*c_hour) - F`

Donde N clientes, D documentos/cliente, c_doc costo efectivo, c_nit cargo/certificado, c_pay cobro, s horas de soporte, c_hour costo/hora y F fijos.

`ARPA requerido = (meta + F + N*(D*c_doc + c_nit + s*c_hour)) / (N*(1-c_pay))`

## Escenarios

Valores de planeacion, no cotizaciones.

| Variable mensual | Conservador | Base | Favorable |
|---|---:|---:|---:|
| Clientes | 100 | 100 | 100 |
| ARPA | $79.000 | $120.000 | $149.000 |
| Docs/cliente | 1.000 | 500 | 300 |
| Costo efectivo/doc | $56 | $44 | $24 |
| Costo NIT/certificado | $10.833 | $10.833 | $0* |
| Soporte h/cliente | 0,6 | 0,3 | 0,2 |
| Costo hora | $30.000 | $30.000 | $30.000 |
| Pasarela | 3% | 3% | 3% |
| Fijos | $3.000.000 | $2.500.000 | $3.000.000 |
| Beneficio estimado | **-$3.820.300** | **$4.956.700** | **$10.133.000** |

\\* Supone certificado incluido dentro del costo documental/paquete.

El escenario base queda practicamente en la meta: ARPA requerido aproximado **$120.450**. Esto valida un ticket cercano a $119k-$129k, no un plan unico barato para todos.

## Sensibilidades

- Cada COP 10 adicionales por documento a 50.000 documentos/mes reduce beneficio en COP 500.000.
- Cada 0,1 h extra de soporte por 100 clientes cuesta COP 300.000.
- Diez clientes de 5.000 docs pueden consumir mas capacidad/costo que noventa de 100; contar clientes no basta.
- Certificado Factus multi de COP 130.000/año equivale a COP 10.833/NIT-mes antes de emitir.

## Mezcla objetivo ilustrativa

| Plan | Clientes | Precio | Ingreso |
|---|---:|---:|---:|
| Starter | 35 | $69.000 | $2.415.000 |
| Growth | 50 | $119.000 | $5.950.000 |
| Scale | 15 | $249.000 | $3.735.000 |
| **Total/ARPA** | **100** | **$121.000 promedio** | **$12.100.000** |

Con esta mezcla solo se llega a la meta si costo variable medio y soporte se mantienen cerca del escenario base. El Starter no puede subsidiar usuarios de alto volumen.

## Condiciones de viabilidad

1. Cobro por excedente automatico.
2. Medicion por NIT/tipo.
3. Margen de contribucion positivo en percentil alto.
4. Alta estandarizada y soporte <=0,3 h/NIT-mes.
5. Compra de bolsa despues de demanda, no antes.
6. Reserva para incidentes y cambios normativos.

No hay evidencia para asumir 100 clientes. La meta requiere canal de partners y retencion; con venta uno a uno la carga comercial/soporte contradice la operacion unipersonal.

## Economia de suite completa

No mezclar unidades: ventas/DEE/soporte se cobran por documento; nomina por empleado-periodo/ajuste; recepcion/RADIAN por documento o evento; salud por factura mas validacion RIPS; transporte por factura/integracion RNDC.

Modelo recomendado: suscripcion de plataforma + modulos activados + consumo por modulo. Un “todo incluido” unico trasladaria consumos impredecibles al operador. La meta de 100 clientes debe recalcularse segun cuantos usan core, nomina, RADIAN y verticales.
