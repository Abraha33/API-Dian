# Modelo experimental API-Dian

## Estado de decisión

**Estado:** definición consolidada para avanzar a diseño de prueba de mercado.

**Issue relacionado:** #42.

**Fecha:** 2026-06-29.

API-Dian se encuentra en **F0 — Consolidación documental del modelo experimental**.

La decisión central de esta fase es:

```text
No construir el MVP real todavía.
Primero consolidar el modelo, diseñar la prueba de mercado y diagnosticar viabilidad.
```

La construcción inicial no es el producto final. La construcción inicial solo debe existir si ayuda a probar recepción real del mercado.

---

## Pregunta central del modelo

```text
¿Puede una sola persona construir, vender, operar y mantener una API DIAN rentable,
con servicios limitados, en el mercado actual?
```

Pregunta secundaria:

```text
¿Qué habría que cambiar en el modelo para que esa meta sea posible?
```

El modelo debe responder con evidencia:

- Si es viable construir y mantener esto con una sola persona.
- Qué servicios DIAN sí son manejables por una sola persona.
- Qué servicios deben descartarse al inicio.
- Qué partes requieren automatización.
- Qué partes exigirían contratar personal.
- Qué precio o paquete parece viable.
- Qué objeciones reales tiene el mercado.
- Qué nivel de soporte exige el cliente.

---

## Definición consolidada

API-Dian, en esta fase, es un **modelo experimental de producto y operación** para evaluar si vale la pena construir una API fiscal limitada alrededor de servicios DIAN.

No se define todavía como:

- Producto SaaS completo.
- API pública madura.
- Proveedor tecnológico completo.
- Plataforma fiscal de cobertura total.
- Sistema listo para clientes reales.

Sí se define como:

- Laboratorio de modelo de negocio.
- Sistema de documentación y aprendizaje.
- Prueba ordenada de hipótesis.
- Base para medir recepción de mercado.
- Marco para decidir qué construir y qué descartar.
- Proyecto diseñado para evaluar operación de una sola persona.

---

## Visión larga

La visión larga podría ser una plataforma intermediaria entre ERPs, POS, integradores, contadores o negocios y servicios fiscales DIAN.

En visión larga podría incluir:

- Factura electrónica.
- Notas crédito y débito.
- Documento soporte.
- Eventos y respuestas.
- Retorno al ERP.
- Webhooks.
- Notificación al adquiriente.
- Panel operativo.
- Multiempresa.
- Automatización de soporte.

Pero esta visión larga **no es el alcance actual**.

---

## Alcance inmediato

El alcance inmediato de F0 y F0.5 es:

```text
consolidar modelo
↓
definir hipótesis
↓
diseñar prueba de mercado
↓
medir recepción
↓
diagnosticar viabilidad unipersonal
```

En esta etapa se permite trabajar en:

- Documentación del modelo.
- Hipótesis de cliente.
- Hipótesis de precio.
- Hipótesis de paquetes.
- Riesgos de mantenimiento.
- Plan de prueba con Meta Ads / Facebook Ads / landing / WhatsApp.
- Criterios para decidir si se construye o no.

No se permite pasar directamente a construcción fiscal DIAN real.

---

## Qué significa “modelo” en este proyecto

En este contexto, **modelo** significa:

```text
propuesta de producto
+
cliente objetivo
+
paquetes hipotéticos
+
servicios DIAN limitados
+
forma de operación para una sola persona
+
canales de prueba de mercado
+
sistema de trabajo con Obsidian, GitHub y Codex
+
criterios de decisión
```

El modelo no es solo código.

El modelo incluye:

- Qué se ofrece.
- A quién se ofrece.
- Por qué pagaría.
- Qué soporte exige.
- Qué se puede mantener solo.
- Qué debe automatizarse.
- Qué debe descartarse.
- Cuándo contratar.
- Cuándo parar.

---

## Hipótesis principales

Estas hipótesis deben validarse antes de construir el MVP real:

1. Hay clientes que entienden el dolor de integración DIAN.
2. Hay clientes dispuestos a pagar por una API o solución intermedia limitada.
3. El cliente objetivo puede adquirir sin exigir soporte 24/7.
4. Un paquete limitado puede ser operado por una sola persona.
5. La carga de soporte no destruye la rentabilidad.
6. El canal Meta Ads / Facebook Ads puede generar leads útiles o al menos señales de interés.
7. WhatsApp puede servir como canal inicial de diagnóstico y preventa.
8. El cliente no exige desde el inicio cobertura total DIAN.
9. Los servicios iniciales pueden mantenerse con bajo riesgo normativo y operativo.
10. La propuesta se puede explicar sin sonar como promesa de proveedor tecnológico completo.

---

## Cliente objetivo inicial

El modelo debe comparar al menos estos perfiles:

### 1. Integradores / desarrolladores / software pequeño

Posible dolor:

- Quieren integrar DIAN sin construir todo desde cero.
- Buscan documentación simple.
- Quieren endpoints claros.
- Pueden tolerar una solución técnica.

Riesgo:

- Exigen confiabilidad técnica.
- Pueden pedir más cobertura de la que una persona puede mantener.

### 2. Contadores

Posible dolor:

- Manejan clientes que necesitan emitir o corregir documentos.
- Pueden recomendar soluciones.
- Entienden parte del problema fiscal.

Riesgo:

- Pueden requerir soporte humano alto.
- Pueden preferir soluciones ya conocidas.

### 3. Negocios pequeños con POS o ERP básico

Posible dolor:

- Necesitan facturación y soporte práctico.
- Quieren algo fácil, no técnico.

Riesgo:

- Pueden saturar soporte.
- Pueden no entender una “API”.
- Pueden pedir interfaz, capacitación y atención constante.

### 4. Proveedores de software local

Posible dolor:

- Quieren agregar facturación electrónica sin volverse expertos DIAN.

Riesgo:

- Requieren estabilidad, documentación y soporte técnico.
- Pueden convertirse en clientes valiosos, pero exigentes.

---

## Servicios DIAN: clasificación inicial

Esta clasificación es preliminar. Debe validarse con investigación técnica, normativa y mercado antes de construir.

### Posiblemente manejables por una persona al inicio

- Validación y normalización de datos de factura.
- Simulación de flujo de emisión sin envío real.
- Diagnóstico de errores comunes de entrada.
- Generación interna de estructura de documento.
- Consulta/documentación de estados en modo experimental.
- Pruebas sandbox limitadas cuando el modelo lo justifique.

### Candidatos para MVP validado, no para F0

- Factura electrónica básica.
- Notas crédito/débito básicas.
- Documento soporte básico.
- Webhook de respuesta.
- Notificación simple al adquiriente.

### Deben descartarse al inicio

- RADIAN.
- Nómina electrónica completa.
- Factoring.
- Multiempresa compleja.
- SLA 24/7.
- Contabilidad completa.
- Panel administrativo avanzado.
- Soporte masivo a usuarios finales.
- Automatizaciones críticas sin revisión humana.

---

## Paquetes hipotéticos

Estos paquetes no son oferta final. Son hipótesis para probar lenguaje, precio, interés y soporte requerido.

### Paquete A — Diagnóstico / Sandbox

Para validar si el cliente entiende la propuesta.

Incluye hipotéticamente:

- Revisión de flujo actual.
- Prueba de estructura de datos.
- Diagnóstico de errores comunes.
- Recomendación de integración.

No incluye emisión real.

### Paquete B — API limitada para integrador

Para desarrolladores o software pequeño.

Incluye hipotéticamente:

- Endpoint de validación.
- Estructura normalizada.
- Errores claros.
- Documentación simple.
- Ambiente de prueba.

No incluye soporte fiscal completo.

### Paquete C — MVP fiscal básico validado

Solo se consideraría después de prueba de mercado.

Incluye hipotéticamente:

- Servicio DIAN limitado.
- Flujo controlado.
- Logs.
- Evidencia.
- Manejo de errores.
- Soporte acotado.

No incluye cobertura DIAN total.

---

## Riesgos principales para una sola persona

### Riesgo técnico

- Cambios DIAN.
- XML / firma / certificados.
- Ambientes de prueba inestables.
- Errores difíciles de reproducir.
- Dependencia de servicios externos.

### Riesgo operativo

- Soporte por WhatsApp desbordado.
- Clientes sin datos claros.
- Casos urgentes en horarios no sostenibles.
- Expectativa de soporte 24/7.
- Falta de documentación interna.

### Riesgo comercial

- Mercado no entiende “API DIAN”.
- Cliente quiere software completo, no API.
- Precio aceptado menor al costo real de soporte.
- Competidores con más confianza o trayectoria.
- Ciclo de venta más largo de lo esperado.

### Riesgo personal

- Una sola persona puede convertirse en cuello de botella.
- El soporte puede impedir construir.
- El mantenimiento puede impedir vender.
- La operación puede impedir estudiar y mejorar.

---

## Condiciones para que sea viable con una sola persona

El modelo solo será viable si se cumplen varias condiciones:

- Alcance muy limitado.
- Servicios DIAN priorizados por bajo mantenimiento.
- Soporte acotado por horario y canal.
- Documentación fuerte.
- Errores trazables.
- Pruebas automáticas mínimas.
- Onboarding simple.
- Precios que cubran soporte y mantenimiento.
- Automatización progresiva.
- Cliente objetivo suficientemente técnico o bien filtrado.

Si el cliente exige soporte intensivo, personalización alta o cobertura fiscal amplia, el modelo deja de ser viable para una sola persona.

---

## Métricas de decisión

La prueba de mercado debe producir datos sobre:

- Leads generados.
- Costo por lead.
- Calidad del lead.
- Tipo de cliente interesado.
- Preguntas frecuentes.
- Objeciones.
- Precio aceptado.
- Nivel de urgencia.
- Nivel de soporte requerido.
- Confianza/desconfianza frente a solución nueva.
- Servicios que el mercado pide primero.
- Servicios que conviene descartar.

---

## Criterios para decidir

### Viable

El modelo puede considerarse viable si:

- Hay leads reales.
- El cliente entiende la propuesta.
- El soporte requerido parece controlable.
- El precio aceptado permite margen.
- El alcance inicial puede mantenerse por una sola persona.
- Los servicios solicitados no exigen cobertura total DIAN.

### Viable con cambios

El modelo puede ser viable con cambios si:

- Hay interés, pero el mensaje no se entiende.
- Hay interés, pero el cliente objetivo debe cambiar.
- Hay interés, pero el paquete debe simplificarse.
- Hay interés, pero el soporte debe automatizarse.
- Hay interés, pero el precio debe ajustarse.

### No viable para una persona

El modelo no es viable para una sola persona si:

- El soporte requerido es alto.
- El cliente exige atención inmediata constante.
- El mercado pide cobertura amplia desde el inicio.
- El precio aceptado no cubre mantenimiento.
- La confianza requerida exige equipo, certificaciones o trayectoria fuerte.

---

## Papel de las herramientas

### Obsidian

Obsidian es el **cerebro del modelo**.

Ahí viven:

- Ideas crudas.
- Ideas consolidadas.
- Decisiones.
- Hipótesis.
- Riesgos.
- Mercado.
- Paquetes.
- Errores.
- Agentes.
- Arquitectura.
- Pruebas.
- Lecciones aprendidas.

### GitHub Issues

GitHub Issues es la **cola de trabajo accionable**.

Una idea no entra como ticket hasta que tenga:

- Objetivo claro.
- Alcance.
- Fuera de alcance.
- Criterios de aceptación.
- Evidencia esperada.
- Riesgos.

### GitHub Project

GitHub Project es el **tablero operativo diario**.

Responde:

- Qué está en espera.
- Qué está listo.
- Qué está en progreso.
- Qué está en revisión.
- Qué está terminado.
- Qué está bloqueado.

### Codex

Codex es el **ejecutor controlado por tickets**.

No debe inventar el proyecto. Debe recibir:

- Issue específico.
- Contexto mínimo.
- Archivos objetivo.
- Restricciones.
- Criterios de aceptación.
- Prueba de cierre.

### ChatGPT

ChatGPT cumple el rol de **arquitecto senior y auditor del modelo**.

Debe ayudar a:

- Ordenar ideas.
- Detectar riesgos.
- Convertir conversación en sistema.
- Proponer tickets.
- Revisar prompts.
- Auditar decisiones.
- Evitar explosión de alcance.

---

## Flujo de trabajo del modelo

```text
Idea
↓
ChatGPT la ordena
↓
Obsidian la consolida
↓
se clasifica como:
  - decisión
  - hipótesis
  - riesgo
  - requisito
  - investigación
  - ticket
  - prueba
↓
GitHub Issue si requiere acción
↓
GitHub Project para priorizar
↓
Codex ejecuta
↓
PR / evidencia
↓
Obsidian actualiza aprendizaje
```

---

## Criterio de cierre de #42

#42 puede cerrarse cuando:

- Este documento quede revisado.
- Se confirme que “modelo experimental” se mantiene como nombre de fase.
- Se confirme que el objetivo central es viabilidad para una sola persona.
- Se documenten hipótesis, clientes, paquetes, riesgos y criterios de decisión.
- Se confirme que el siguiente paso es #43.
- Se deje comentario de decisión final en el issue #42.
- Obsidian quede actualizado o se prepare parche.

---

## Pendientes derivados

Después de #42, los siguientes trabajos son:

1. #43 — Diseñar prueba de fogueo de mercado.
2. Definir mensajes comerciales para Meta Ads / Facebook Ads.
3. Definir segmentos de cliente.
4. Definir landing o formulario mínimo.
5. Definir matriz de métricas.
6. Definir guion de entrevista / WhatsApp.
7. Definir criterios para pasar a prototipo mínimo.

---

## Regla principal

```text
No se construye el MVP real hasta tener evidencia mínima del mercado.
```

---

## Frase guía

```text
La teoría nos da el mapa.
La prueba de fogueo nos dice dónde el mapa está equivocado.
```
