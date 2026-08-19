# F4C — Canales de contacto y ejecución

**Corte:** 2026-08-19  
**Estado:** listo para contacto humano; no se ha enviado ninguna solicitud desde este repositorio.

## Objetivo

Convertir F4C de investigación pública a evidencia privada verificable:

```text
contacto oficial
→ acceso DEMO/sandbox
→ credenciales
→ documentación vigente
→ respuestas escritas al cuestionario
→ prueba de ambigüedad
→ fixtures con evidencia
→ matriz final PT
```

No construir F6C mientras este flujo no produzca un candidato con gates críticos PASS.

---

## 1. Prioridad 1 — The Factory HKA Colombia

### Canal técnico oficial verificado

La wiki pública de The Factory HKA identifica un canal específico para:

- manuales de integración;
- consumo de Web Services;
- uso de conectores;
- soporte a desarrolladores y casas de software.

Canales públicos localizados:

- correo de integración: `integracion_fel_co@thefactoryhka.com`;
- WhatsApp de integración: `+57 316 319 2251`;
- central telefónica Colombia: `+57 601 746 1515`, opción 5 → opción 1 para integración;
- documentación: `https://felcowiki.thefactoryhka.com.co/`;
- portal desarrolladores: `https://developers.thefactoryhka.com.co/`.

Fuente pública oficial de comunicación/integración:

- `https://felcowiki.thefactoryhka.com.co/index.php/Medios_de_Comunicaci%C3%B3n_con_The_Factory_HKA_Colombia`

### Acción recomendada

1. enviar correo al canal de integración;
2. si no hay acuse útil, usar WhatsApp/canal telefónico para confirmar recepción y pedir especialista;
3. solicitar ambiente DEMO, credenciales, folios/datos de prueba y documentación vigente FEV + DEE POS;
4. enviar el cuestionario `docs/f4c-cuestionario-solicitud-sandbox-pt.md`;
5. no iniciar adapter real todavía.

### Correo listo

**Asunto:** `Integración casa de software — sandbox FEV + POS electrónico`

```text
Hola equipo de Integración de The Factory HKA Colombia,

Estamos construyendo un POS propio y una capa fiscal interna para comercios en Colombia. En V1 integraremos un único Proveedor Tecnológico habilitado y estamos evaluando The Factory HKA como primera opción técnica.

Necesitamos validar la integración para Factura Electrónica de Venta y Documento Equivalente Electrónico POS, incluyendo sus notas/ajustes aplicables. Nuestro gate principal es evitar duplicidad fiscal ante timeouts, respuestas perdidas o estados no concluyentes.

Solicitamos por favor:

1. proceso para obtener ambiente DEMO/sandbox;
2. credenciales y datos/folios de prueba;
3. documentación técnica vigente para FEV y DEE POS;
4. métodos de consulta/reconciliación posteriores al submit;
5. contacto de un especialista de integración;
6. información comercial/contractual, SLA y modelo para casa de software con múltiples clientes/NIT.

Tenemos preparado un cuestionario técnico específico para probar correlación, timeouts, reconciliación, duplicidad, XML/PDF y criterio de reenvío seguro. Podemos enviarlo de inmediato al responsable técnico.

Agradecemos nos indiquen el siguiente paso para iniciar la evaluación.

Saludos,
Caceres Automation Lab
```

### Evidencia mínima que debe volver

- identificación del contacto técnico;
- instrucciones DEMO;
- credenciales o proceso de alta;
- docs/versiones exactas;
- respuesta al cuestionario crítico;
- propuesta/precio/contrato o proceso para obtenerlos.

---

## 2. Prioridad 2 — DATAICO

### Canal oficial verificado

La landing pública de API de DATAICO orientada a casas de software ofrece una **consulta personalizada** mediante agenda/formulario. La documentación técnica pública está disponible en su Portal del Cliente.

Canales verificados:

- API / casas de software: `https://facturaelectronica.dataico.com/api`;
- agenda de consulta personalizada enlazada desde la página API: `https://meetings.hubspot.com/laura89/consulta-personalizada-de-dataico`;
- documentación técnica: `https://portaldelcliente.dataico.com/es/knowledge/documentaci%C3%B3n-t%C3%A9cnica-de-la-api-de-dataico`.

No se verificó en este corte un correo técnico público equivalente al canal explícito de integración de HKA. No inventarlo; usar el canal oficial de consulta/API y pedir contacto técnico por esa vía.

### Acción recomendada

1. agendar consulta API/casa de software;
2. en la solicitud indicar que el gate no es una demo comercial sino sandbox + ambigüedad/reconciliación;
3. pedir credenciales de prueba y responsable técnico;
4. enviar el mismo cuestionario F4C usado con HKA;
5. mantener la evaluación administrativa en paralelo mientras se ejecuta HKA.

### Texto listo para formulario/reunión

```text
Estamos construyendo un POS propio y una capa fiscal interna para comercios en Colombia. Evaluamos DATAICO como Proveedor Tecnológico único para V1.

Necesitamos acceso de prueba para FEV y Documento Equivalente Electrónico POS, además de validar por API qué ocurre cuando un submit termina en timeout o estado pendiente y cómo se reconcilia antes de cualquier reenvío.

Buscamos confirmar: correlación/idempotencia, consulta posterior por UUID/CUFE/referencia, semántica de DIAN_NO_ENVIADO, criterio seguro de inexistencia, XML/PDF, notas/ajustes POS, SLA, soporte, certificado y precio API para casa de software/múltiples NIT.

Tenemos un cuestionario técnico y una prueba de ambigüedad reproducible listos para ejecutar en sandbox.
```

### Evidencia mínima que debe volver

- sandbox/credenciales;
- contacto técnico;
- explicación escrita de `DIAN_NO_ENVIADO` y estados pendientes;
- consulta/reconcile para FEV y POS;
- precio API real, no planes de facturación web;
- SLA/soporte y certificado.

---

## 3. Prioridad 3 — Facture / ESTELA

### Canal oficial verificado

ESTELA mantiene una página oficial de contacto para Colombia y una página específica sobre la continuidad de Facture dentro de ESTELA.

Canales:

- contacto Colombia: `https://www.estela.com/es-co/contacto`;
- página Facture/ESTELA: `https://www.estela.com/es-co/facture`;
- emisión electrónica Colombia: `https://www.estela.com/es-co/e-dt-emision-factura-electronica`.

No se verificó públicamente en este corte un correo técnico de integración ni documentación API/sandbox comparable a HKA/DATAICO. Pedirlos por el formulario oficial; no asumir que no existen.

### Acción recomendada

1. enviar formulario de contacto Colombia;
2. pedir explícitamente que el caso sea escalado a integración técnica/API;
3. solicitar documentación, sandbox, credenciales y responsable técnico;
4. no invertir trabajo de adapter hasta recibir ese paquete.

### Texto listo para formulario

```text
Estamos construyendo un POS propio y una capa fiscal interna para comercios en Colombia y evaluamos Facture/ESTELA como Proveedor Tecnológico para V1.

Necesitamos paquete técnico/API, sandbox, credenciales y contacto del equipo de integración para Factura Electrónica de Venta y Documento Equivalente Electrónico POS.

Nuestro gate principal es validar el comportamiento ante timeouts o respuestas perdidas: correlación del documento, consulta/reconciliación antes de reenvío, criterio de inexistencia concluyente, protección de duplicidad y recuperación de XML/PDF.

También necesitamos información contractual/SLA, soporte, manejo de certificado digital y precio API para una casa de software con múltiples comercios/NIT.
```

---

## 4. Secuencia operativa recomendada

### Día de contacto

```text
HKA: correo integración + guardar evidencia enviada
DATAICO: agendar consulta API + guardar confirmación
ESTELA: enviar formulario + guardar confirmación
```

### Cuando responda cada PT

Crear carpeta/evidencia fuera de Git para material crudo sensible y registrar en Git solo metadatos sanitizados.

Por proveedor:

```text
F4C/<PT>/<YYYY-MM-DD>/
  contacto
  docs-versiones
  sandbox
  respuestas-cuestionario
  contrato-comercial
  pruebas-ambiguedad
  artefactos-sanitizados
```

No subir:

- API keys;
- passwords;
- certificados;
- claves privadas;
- tokens;
- XML/PDF reales con datos personales/comerciales;
- contratos confidenciales completos si su distribución está restringida.

### Primer proveedor listo

En cuanto HKA entregue acceso suficiente:

1. congelar versión de docs usada;
2. ejecutar `docs/f4-prueba-ambiguedad-pt-v1.md`;
3. completar cada caso con `PASS / FAIL / INCONCLUSIVE`;
4. llenar fixtures del harness solo para casos respaldados;
5. actualizar `docs/f4-matriz-seleccion-pt-v1.md`;
6. decidir si HKA pasa o se salta inmediatamente a DATAICO.

---

## 5. Criterios de escalamiento

### Escalar HKA → DATAICO sin esperar indefinidamente

Cambiar prioridad si HKA:

- no entrega sandbox/documentación técnica útil;
- no cubre DEE POS por integración requerida;
- no permite una consulta/reconciliación adecuada;
- no puede explicar de forma verificable el criterio de no duplicidad;
- exige una estructura contractual/costo inviable para V1.

### Escalar DATAICO → Facture/ESTELA

Cambiar prioridad si DATAICO:

- no puede demostrar cuándo un estado `DIAN_NO_ENVIADO` es realmente safe-to-resend;
- no puede reconciliar de forma suficiente FEV/POS tras timeout;
- no entrega sandbox o soporte técnico utilizable;
- contrato/costo es inviable.

### Ninguno pasa

No degradar las invariantes para “hacer que uno pase”. Reabrir shortlist con evidencia nueva antes de construir un adapter inseguro.

---

## 6. Estado de ejecución

Al crear este documento:

- paquete técnico interno: listo;
- mensajes: listos;
- cuestionario: listo;
- harness: listo;
- sandbox real: pendiente;
- credenciales PT: pendiente;
- contactos enviados: **no enviados todavía**;
- F6C: bloqueado correctamente.
