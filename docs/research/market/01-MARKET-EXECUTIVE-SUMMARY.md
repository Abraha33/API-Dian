# Resumen ejecutivo — mercado colombiano de API fiscal

**Fecha de corte:** 2026-10-01  
**Naturaleza:** investigación preliminar para decidir producto, cliente y secuencia; no reemplaza cotizaciones, pilotos ni concepto jurídico.

## Respuesta corta

Sí existe un mercado observable para una API fiscal multiempresa dirigida a casas de software, ERP, POS y SaaS. La evidencia pública demuestra oferta de facturación, documentos equivalentes, documento soporte, nómina y eventos de recepción/RADIAN. Salud y RADIAN avanzado también se venden, pero exigen especialización. No hay evidencia suficiente para justificar construir todos los servicios simultáneamente ni para asumir que se conseguirán 100 clientes.

La oportunidad no es “tener todos los documentos”: competidores como Matias, Factus, HKA, Bilidox, Saphety y ESTELA ya publican suites amplias. La hipótesis defendible es ofrecer una integración más operable para software tercero: multiempresa, sandbox, idempotencia, errores claros, estados confiables, webhooks y conciliación.

## Qué comprende el mercado investigado

1. FEV, notas crédito/débito, contingencia, exportación, mandatos, AIU, divisas y variantes sectoriales.
2. Los 12 tipos de documento equivalente electrónico, empezando por POS, y sus notas de ajuste.
3. Documento soporte en adquisiciones a no obligados y nota de ajuste.
4. Documento soporte de pago de nómina y nota de ajuste.
5. Recepción fiscal y eventos 030–034.
6. RADIAN avanzado: inscripción y eventos del título valor.
7. FEV de salud y RIPS/MUV como vertical sectorial.
8. FEV de transporte; RNDC se trata como integración adyacente, no como documento DIAN.

## Qué venden los competidores

- **API autoservicio o híbrida para desarrolladores:** Matias, Factus, Aliaddo, Bilidox, Alanube y parcialmente Dataico.
- **Proveedor/operador para integradores:** HKA, Saphety, Dataico y ESTELA.
- **Cumplimiento enterprise y regional:** EDICOM, ESTELA y Alanube.
- **Código fuente/conexión directa:** FacturaLatam; compite con una decisión de construir, no con el mismo servicio administrado.

La cobertura más amplia publicada aparece en Matias, Bilidox, ESTELA, Factus y HKA. Ninguno queda confirmado públicamente en absolutamente todos los dominios, precios y condiciones productivas.

## Cliente objetivo

**Beachhead recomendado:** casas de software, ERP, POS y SaaS colombianos con aproximadamente 5–30 NIT activos, que ya tengan usuarios y no quieran mantener normativa, firma, habilitación, XML y comunicación con DIAN.

No conviene comenzar vendiendo uno a uno a microcomercios: es un segmento competido por software final desde COP 0–36.000 mensuales y genera más onboarding y soporte. Los compradores cambian por módulo:

| Servicio | Comprador principal |
|---|---|
| FEV/DEE POS | POS, ERP, e-commerce y SaaS comercial |
| Documento soporte | ERP, contabilidad y cuentas por pagar |
| Nómina fiscal | software de nómina/HR y ERP; recibe liquidación ya calculada |
| Recepción/RADIAN | ERP contable, cuentas por pagar, factoring y tesorería |
| Salud/RIPS | IPS y software de salud |
| Transporte | TMS y software para transportadores |

## Funcionalidades realmente estándar

En el núcleo: REST/JSON, autenticación, sandbox, alta de empresa, rangos, emisión, consulta, PDF/XML, respuesta DIAN y notas. Multiempresa, dashboard, correo y soporte son recurrentes en ofertas para integradores.

En una API comercial propia también son obligatorios operativamente, aunque pocos los expliquen: idempotencia, estados separados, reconciliación tras timeout, auditoría y webhooks reintentables. No son extras estéticos: evitan duplicados y pérdida de trazabilidad.

Nómina requiere ciclos por empleado/periodo y notas; documento soporte requiere rango y CUDS; recepción requiere cargar/consultar facturas y secuenciar eventos; RADIAN avanzado no debe confundirse con los cinco eventos básicos; RIPS requiere estados DIAN y MUV separados.

## Cómo cobran y cuánto

Hay cuatro modelos comprobados:

1. Bolsa anual compartida por documentos: Matias.
2. Bolsa anual por empresa/plan: Bilidox.
3. Bolsa API con funciones que aparecen por nivel: Aliaddo.
4. Cotización enterprise o API asistida: HKA, Dataico, Saphety, ESTELA, EDICOM y Alanube.

Precios públicos actuales destacados:

- **Matias casas de software:** 5.000 documentos/año por COP 220.000; 50.000 por COP 850.000; 500.000 por COP 6.000.000. Incluye facturación, nómina, POS, soporte y eventos RADIAN; firma desde COP 104.000/NIT-año.
- **Aliaddo API:** 5.000 por COP 399.900; 15.000 por COP 674.900; 40.000 por COP 1.599.900; 120.000 por COP 3.590.000. Multiempresa desde 15.000; webhooks desde 40.000. Incluye FEV/notas, soporte y DEE, no confirma nómina API en esa bolsa.
- **Bilidox:** 15 por COP 24.000 hasta 50.000 por COP 6.250.000 al año. Publica una bolsa común para facturación, nómina, RADIAN, soporte, equivalentes y ajustes; cantidad de NIT incluida no está publicada.
- **Dataico API, HKA, Saphety, ESTELA, Alanube y EDICOM:** precio comparable **NO PUBLICADO**.

Los precios son muy bajos a gran volumen —Matias publica COP 12–44/documento—, por lo que revender transmisión pura tendrá poco margen. El negocio debe cobrar por plataforma, NIT, operación y soporte, no competir solo por centavos por documento.

## Cómo venden

- Matias, Aliaddo y Bilidox muestran precios y permiten una compra o inicio directo.
- Factus combina documentación/sandbox con contacto por WhatsApp.
- Dataico ofrece planes directos, pero la API requiere agenda comercial.
- Alanube ofrece solicitud de sandbox y pago por emisión.
- Saphety vende programas de operador virtual/distribuidor con integración asistida.
- HKA, ESTELA y EDICOM siguen un recorrido consultivo/enterprise.

Documentación, sandbox y ejemplos funcionan como adquisición para desarrolladores. WhatsApp, formularios, onboarding, partners y contenido educativo son los canales visibles. La importancia de anuncios pagados es **NO VERIFICADA**.

## Producto mínimo competitivo y secuencia

**Release comercial 1:** FEV + NC + ND + DEE POS/ajuste, multiempresa, sandbox, rangos, idempotencia, estados, consulta, XML/PDF/respuesta, webhooks y reconciliación.

**Expansión validada por clientes:** documento soporte; nómina fiscal; recepción 030–034; RADIAN avanzado; restantes DEE; salud/RIPS; transporte/RNDC.

El producto objetivo es completo, pero cada módulo necesita evidencia de demanda, contrato/proveedor, precio, sandbox, pruebas negativas y margen antes de construirse.

## Qué no necesita el primer release

Liquidación laboral/PILA, ERP, contabilidad, POS propio, TMS, historia clínica, factoring financiero, segundo PT, SDK para muchos lenguajes, white-label visual completo ni los 12 DEE sin cliente ancla.

## Economía de 100 clientes

La meta de COP 5 millones mensuales exige aproximadamente COP 120.000–150.000 de ARPA con costos y soporte controlados. Un plan barato de transmisión no alcanza. La mezcla debe incluir cargo de plataforma/NIT y consumo; verticales y módulos deben cobrarse aparte.

## Decisión preliminar

**GO condicionado** para continuar discovery y construir el núcleo común. **NO-GO** para implementar toda la suite a la vez o comprometer precio antes de obtener al menos dos cotizaciones partner actuales y tres pilotos con consumo real.

Próximas pruebas decisivas: 10–15 entrevistas con integradores segmentadas por POS/ERP/nómina; dos cotizaciones contractuales; prueba de timeout/reconciliación; y un piloto dispuesto a pagar. La investigación demuestra oferta y comparables, no demanda propia garantizada.

## Incertidumbre pendiente

- Costos partner productivos, SLA y derecho de reventa de la mayoría de PT.
- Precio de excedentes y número de NIT de Bilidox.
- Cobertura productiva de todos los servicios mostrados en sandbox.
- Demanda pagada por salud, RADIAN avanzado y DEE no POS.
- Costo real de soporte, certificados, alta y cambios normativos.

