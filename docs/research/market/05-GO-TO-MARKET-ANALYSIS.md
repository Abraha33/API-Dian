# Analisis go-to-market

**Fecha de corte:** 2026-10-01

## Segmentos y mensajes observados

| Segmento | Ejemplos | Mensaje dominante | Venta |
|---|---|---|---|
| Desarrolladores/casas de software | Dataico, Factus, Matias, Plemsi | API, sandbox, integracion, varios clientes | Hibrida |
| ERP/POS corporativo | HKA, Saphety, Gosocket | Cumplimiento, acompanamiento, estabilidad | Sales-assisted |
| Pyme final | Alegra, Siigo, LOGGRO | Facilidad, facturar y administrar | Self-service/hibrida |
| Multi-pais | Alanube, Gosocket | Una integracion regional | Enterprise |

HKA publica etapas de implementacion con acuerdo, credenciales, especialista y produccion. Dataico usa documentacion/Postman y pagina para ERP/POS. Factus combina sandbox con programa de aliados. La evidencia respalda dos recorridos, no uno.

## Recorrido recomendado

```text
Busqueda/referencia
→ landing para integradores
→ precios orientativos
→ documentacion y sandbox
→ primer documento de prueba
→ verificacion comercial/NIT
→ contrato y alta PT
→ checklist de produccion
→ consumo y cobro
```

El sandbox debe ser autoservicio; produccion, asistida. Ocultar toda la documentacion detras de ventas aumenta friccion; permitir produccion anonima aumenta riesgo.

## Canales con evidencia o señal

- Documentacion publica y Postman: adquisicion tecnica comprobable en Dataico/Factus/HKA.
- SEO/contenido educativo: portales de conocimiento de Dataico/HKA.
- Demo/contacto comercial: comun en PT enterprise.
- Partners/casas de software: Factus, Matias, Saphety y Dataico.
- White-label: reportado para FacturaLatam y Saphety.
- Webinars/redes/ads: existencia posible, importancia **NO VERIFICADA**; no se infiere canal ganador por tener cuenta.

## Estrategia inicial

1. Vender a software con base instalada, no adquirir cien comercios uno a uno.
2. Elegir un vertical con dolor y volumen conocidos: POS/restaurantes es atractivo, pero DEE POS eleva consumo.
3. Ofrecer sandbox y documentacion antes de la llamada.
4. Ejecutar dos pilotos pagos o con compromiso contractual.
5. Medir dias hasta primer aceptado, horas de alta, tickets/NIT, documentos y margen.
6. Publicar caso solo despues de resultados.

## Hipotesis que deben probarse

- El integrador paga por simplificacion aunque pueda contratar PT directo.
- Un contrato/credencial multiempresa reduce trabajo real.
- Errores explicados y reconciliacion importan en la compra.
- El comprador acepta cargo por NIT y consumo.
- Soporte mensual puede mantenerse por debajo de 0,3 h/NIT.

## Clasificacion de ventas

- **Self-service:** FacturaLatam/planes pequenos reportados.
- **Hibrido:** Factus, Dataico, Plemsi.
- **Sales-assisted:** HKA, Aliaddo, Saphety, Alanube.
- **Enterprise:** Gosocket, ESTELA.

## Lo que no debe prometerse

“API oficial DIAN”, cero errores, disponibilidad no contratada, integracion en minutos, documentos ilimitados o soporte 24/7. La promesa defendible es contrato estable, trazabilidad, sandbox y menor carga de integracion.

## Go-to-market por modulo

La suite completa no tiene un solo comprador ni debe venderse con una landing generica.

| Modulo | Comprador inicial | Problema que compra | Movimiento comercial |
|---|---|---|---|
| Ventas + DEE POS | POS, ERP, SaaS comercio | Emitir y operar alto volumen | Sandbox autoservicio + alta asistida |
| Documento soporte | ERP y cuentas por pagar | Compras a no obligados | Venta cruzada al cliente core |
| Nomina fiscal | Software de nomina/HR y ERP | Transmitir liquidaciones ya calculadas | Piloto por ciclos de nomina |
| Recepcion/RADIAN | ERP contable, AP, factoring | Evidencia, eventos y titulo valor | Venta consultiva con casos de uso |
| Salud/RIPS | IPS y software salud | Coordinar DIAN y MUV | Vertical con especialista y cliente ancla |
| Transporte/RNDC | TMS y transportadores | Coordinar factura y RNDC | Alianza con TMS; no vender como API fiscal generica |

La expansion eficiente es `land and expand`: entrar por una familia con volumen probado y agregar modulos al mismo NIT o integrador. Marketing, documentacion, precio y onboarding deben existir por modulo, aunque compartan marca y plataforma.
