# Análisis go-to-market y cliente objetivo

**Fecha de corte:** 2026-10-01

## Segmentación observada

| Segmento | Competidores visibles | Promesa | Proceso de venta |
|---|---|---|---|
| Desarrolladores/casas de software | Matias, Factus, Aliaddo, Bilidox, Dataico | integrar API, delegar DIAN, multiempresa | self-service/híbrido |
| ERP/POS | HKA, Saphety, ESTELA, Dataico | cumplimiento, integración y soporte | sales-assisted |
| Pyme final | Dataico, Aliaddo, Siigo/Alegra | facilidad y módulos administrativos | self-service |
| Enterprise/regional | EDICOM, ESTELA, Alanube | escala, países, cumplimiento y continuidad | consultivo |
| Vertical salud | HKA, Factus, Matias | coordinar FEV y RIPS | consultivo técnico |

## Cliente objetivo recomendado

Una casa de software, ERP, POS o SaaS con:

- 5–30 NIT clientes activos;
- un equipo técnico pequeño;
- volumen agregado de 5.000–100.000 documentos/año;
- necesidad inmediata de FEV/DEE POS;
- frustración demostrable con soporte, cambios normativos o múltiples integraciones;
- disposición a pagar por operación y no solo por XML.

Se excluye como primer objetivo al comerciante individual: exige adquisición y soporte masivos y compara contra planes de software final muy baratos o gratuitos.

## Buyer por servicio

| Servicio | Usuario técnico | Comprador económico | Señal de compra |
|---|---|---|---|
| Core/DEE POS | desarrollador POS/ERP | dueño de software/product manager | migración normativa o PT inestable |
| Soporte | equipo ERP/AP | líder contable/financiero | alto trabajo manual a no obligados |
| Nómina fiscal | software HR/payroll | product owner/operaciones | ya calcula nómina y necesita transmitir |
| Recepción | ERP/AP | controller/CFO | volumen de proveedores y conciliación |
| RADIAN | factoring/tesorería | financiero/legal | negociación real de FEV título valor |
| Salud/RIPS | software IPS | dirección de tecnología/compliance | cliente IPS ancla |
| Transporte/RNDC | TMS | product owner/logística | transportador ancla |

## Mensajes observados

- Matias: un POST, conexión DIAN, precio por volumen y soporte dev-to-dev.
- Factus: rapidez, confiabilidad, soporte y compatibilidad con cualquier stack.
- Aliaddo: API masiva, firma incluida, retención y planes visibles.
- Dataico: ecosistema administrativo completo y API para ERP/POS/nómina.
- Saphety: continuidad, experto local y modelo operador virtual/distribuidor.
- ESTELA/EDICOM: alto volumen, integración ERP y cumplimiento regional.
- Alanube: pago por emisión, sandbox, webhooks y varios países.

La promesa propia no debe ser “más documentos”. Debe ser: **una integración fiscal operable para múltiples empresas, con estados, errores y conciliación que reducen soporte del integrador**. Requiere demostración, no solo copy.

## Recorridos de compra

### Developer-first

```text
Contenido/búsqueda → documentación → sandbox → primer aceptado
→ prueba de error/timeout → precio → alta NIT → producción
```

Matias, Factus y parcialmente Aliaddo muestran este patrón.

### Sales-assisted

```text
Landing/caso → formulario o WhatsApp → discovery → cotización
→ contrato → credenciales → integración → habilitación → producción
```

HKA, Saphety, Dataico API, ESTELA y EDICOM siguen este patrón.

### Partner/white-label

```text
Programa aliado → validación comercial → contrato/reventa
→ integración común → alta repetible de NIT → soporte de nivel 1 por partner
```

Saphety diferencia operador virtual y distribuidor; Matias asigna soporte dev-to-dev y deja usuario final al integrador.

## Canales con evidencia

- Documentación y sandbox: Matias, Factus, HKA, Alanube.
- Precios/checkout: Matias, Aliaddo, Bilidox.
- WhatsApp/formulario: Matias, Factus, Dataico, Alanube.
- Programa de aliados: Saphety, Factus, Matias, Aliaddo.
- Contenido educativo/blog/webinars: HKA, Dataico, ESTELA, Bilidox.
- Venta enterprise y casos: EDICOM, ESTELA, Saphety.

Ads, afiliados y referidos como fuente dominante: **NO VERIFICADO**.

## Estrategia inicial

1. Elegir un beachhead entre POS y ERP con clientes existentes.
2. Entrevistar 10–15 integradores; no mezclar respuestas de contadores finales.
3. Publicar documentación y sandbox del núcleo antes de la llamada.
4. Hacer producción asistida y cobrar el piloto.
5. Medir días a primer aceptado, tickets/NIT, horas de alta, errores y margen.
6. Agregar documento soporte al mismo canal; nómina solo si el cliente ya calcula.
7. Abrir RADIAN/salud/transporte únicamente con design partner.

## Métricas de validación

- ≥3 de 10 entrevistados aceptan piloto concreto.
- ≥2 pilotos completan integración sin desarrollo hecho por nosotros.
- tiempo a primer FEV aceptado <1 día de trabajo del integrador después del alta;
- onboarding propio <2 horas/NIT tras estabilización;
- soporte <0,3 h/NIT-mes;
- margen de contribución >60%;
- conversión sandbox→piloto y piloto→pago registrada.

## Promesas que no deben usarse

“API oficial DIAN”, cero errores, disponibilidad no contratada, integración en cinco minutos, documentos ilimitados, todos los sectores desde el día uno o soporte 24/7 sin capacidad. Los claims de competidores no son métricas nuestras.

