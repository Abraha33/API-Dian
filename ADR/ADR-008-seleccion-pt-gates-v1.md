# ADR-008: Selección del Proveedor Tecnológico V1 mediante gates de ambigüedad

- **Estado:** Aprobado — proceso/gates; selección final pendiente evidencia sandbox/contractual
- **Fecha:** 2026-08-18
- **Depende de:** ADR-004 y ADR-007
- **Detalle:** `docs/f4-matriz-seleccion-pt-v1.md` y `docs/f4-prueba-ambiguedad-pt-v1.md`

## Contexto

La V1 delega firma/generación/transmisión regulada a un único PT habilitado. Una mala selección del PT puede invalidar la principal propiedad de seguridad del sistema: poder resolver un resultado ambiguo sin reemitir a ciegas.

Precio, facilidad del SDK o reconocimiento de marca son secundarios frente a esa capacidad.

## Decisión

### 1. No se selecciona por score compensatorio

Hay requisitos que son **gates absolutos**. Un PT no puede compensar incapacidad de reconciliación con mejor precio o UX.

Gates de entrada:

1. habilitación DIAN vigente;
2. API/sandbox utilizable;
3. FEV + NC + ND + DEE POS + nota de ajuste POS necesarios para V1;
4. modelo contractual compatible con nuestro software/varios clientes;
5. firma/certificado delegable sin que API-DIAN custodie clave privada;
6. consulta de estado/documento después de una respuesta ambigua;
7. recuperación de XML y representación gráfica/PDF;
8. correlaciones/identificadores suficientes por tenant/documento;
9. contingencias V1 soportadas según regulación/contrato;
10. soporte/escalamiento y tratamiento de datos aceptables.

### 2. Gate crítico: resultado ambiguo

Antes de seleccionar, el sandbox y/o una confirmación contractual/técnica verificable debe responder:

> Si una mutación hace timeout después de que el PT puede haberla recibido, ¿cómo determinamos de forma inequívoca si el documento fue creado/validado/rechazado?

La respuesta debe identificar:

- criterio de consulta (NIT/cuenta + prefijo/número/CUFE/CUDE/track/correlation);
- consistencia/latencia esperada de esa consulta;
- significado de “no encontrado”;
- cuándo “no encontrado” autoriza de forma segura un nuevo intento;
- comportamiento ante envío duplicado del mismo número/referencia;
- existencia o no de idempotency key propia del PT.

Si la respuesta práctica es “vuelva a enviar y mire qué pasa”, el PT queda descartado.

### 3. Shortlist inicial por evidencia pública

A corte 2026-08-18 se conservan dos candidatos para prueba real:

- **The Factory HKA Colombia SAS** — prioridad A para prueba de reconciliación por documentación pública explícita de `EstadoDocumento`, XML/PDF y servicios de documento equivalente, más ambiente demo y gestión del certificado.
- **DATAICO S.A.S** — prioridad B, muy fuerte en API-first, FEV/NC/ND/POS, consulta de factura, nota de ajuste POS, sandbox publicado y certificado incluido; debe demostrarse especialmente la reconciliación de POS/notas tras timeout.

`FACTURE S.A.S` queda como reserva: DIAN lo lista como PT, pero la evidencia técnica pública localizada no es suficiente para desplazar a los dos candidatos anteriores sin contacto adicional.

La prioridad A/B **no es adjudicación comercial**.

### 4. Selección final bloqueada

No se marcará F4 completamente cerrada hasta obtener para al menos un candidato:

- credenciales sandbox;
- documentación técnica vigente completa;
- ejecución de `docs/f4-prueba-ambiguedad-pt-v1.md`;
- confirmación del modelo multiempresa/casa de software;
- confirmación de certificado/firma;
- límites/rate limits/timeouts;
- soporte/SLA/escalamiento;
- términos de tratamiento/custodia de datos;
- cotización API real.

### 5. Coste después de seguridad

Solo candidatos que pasen gates críticos se comparan por:

- coste por documento/paquete;
- mínimos mensuales;
- certificado;
- onboarding por NIT;
- soporte;
- facilidad de automatización;
- latencia/estabilidad medida;
- carga operativa para una persona.

Los precios de planes web no se usarán como proxy del precio API cuando el propio proveedor indique que son distintos.

## Consecuencia

F4 queda dividida explícitamente:

```text
F4-A contratos internos             ✅ cerrado
F4-B shortlist/evidencia pública    ✅ cerrado
F4-C prueba sandbox + contrato PT   ⏳ bloqueante para selección final
```

F5 puede preparar casos de prueba genéricos, pero no se implementa adapter productivo ni se habilita emisión real hasta cerrar F4-C.
