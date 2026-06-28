# Entorno diario de trabajo

Issue principal: #44 ? [F0-OPS-00] Definir entorno diario: Obsidian, GitHub Project, Issues y Codex

## Objetivo

Documentar el entorno operativo diario del proyecto API-Dian durante la fase de consolidaci?n del modelo experimental.

Esta fase **no** busca construir c?digo funcional de facturaci?n DIAN. La fase actual es consolidar la idea/modelo de API-Dian mediante ciclos de consulta, correcci?n de errores, documentaci?n, tickets y revisi?n.

## Regla central

```text
Obsidian guarda el pensamiento.
GitHub Issue define la acci?n.
GitHub Project muestra la prioridad.
Codex/Cursor ejecuta el cambio.
ChatGPT revisa el criterio.
```

Esta regla evita mezclar conocimiento estrat?gico con tareas accionables. Y eso importa: si todo vive como conversaci?n suelta, no hay trazabilidad; si todo vive como issue, el proyecto se vuelve burocr?tico antes de entenderse.

## Herramientas del entorno diario

| Herramienta | Papel en esta fase | Qu? NO debe reemplazar |
|---|---|---|
| Obsidian | Memoria estrat?gica: ideas, decisiones, hip?tesis, riesgos, aprendizajes y modelo conceptual. | No reemplaza issues accionables. |
| GitHub Issues | Tareas accionables, trazables y cerrables. | No reemplaza la reflexi?n ni la documentaci?n estrat?gica. |
| GitHub Project | Tablero diario para priorizar y visualizar estado. | No reemplaza el contenido detallado del issue. |
| Codex/Cursor | Ejecutor controlado por tickets. Implementa cambios concretos o documentaci?n pedida. | No decide el modelo sin criterio humano. |
| ChatGPT | Arquitecto/revisor senior del modelo experimental. Ayuda a ordenar, criticar y revisar decisiones. | No reemplaza validaci?n real de mercado ni evidencia t?cnica. |

## Papel de Obsidian

Obsidian guarda el pensamiento del proyecto.

Debe usarse para:

- Consolidar conversaciones importantes.
- Guardar decisiones del modelo.
- Separar hechos, hip?tesis, riesgos y pendientes.
- Documentar aprendizajes despu?s de cada ciclo.
- Mantener la memoria estrat?gica conectada al Drive.

Obsidian responde:

```text
?Qu? estamos pensando?
?Qu? aprendimos?
?Qu? hip?tesis tenemos?
?Qu? decisiones ya tomamos?
?Qu? riesgos vimos?
```

## Papel de GitHub Issues

GitHub Issues guarda tareas accionables.

Una idea se convierte en issue cuando:

- Tiene una acci?n clara.
- Tiene criterios de aceptaci?n.
- Puede cerrarse con evidencia.
- Tiene prioridad suficiente para entrar al flujo diario.
- Ya no es solo pensamiento exploratorio.

Un issue responde:

```text
?Qu? hay que hacer?
?Por qu? importa?
?C?mo sabemos que qued? hecho?
?Qu? evidencia queda?
```

## Papel de GitHub Project

GitHub Project muestra la prioridad y el estado diario.

Debe usarse para:

- Ordenar el trabajo actual.
- Ver qu? est? pendiente, en progreso, bloqueado o hecho.
- Evitar trabajar por impulso.
- Mantener foco en F0.

GitHub Project responde:

```text
?Qu? va primero?
?Qu? est? bloqueado?
?Qu? se est? ejecutando hoy?
?Qu? ya termin??
```

## Papel de Codex/Cursor

Codex/Cursor ejecuta cambios concretos basados en tickets.

Debe usarse para:

- Crear o modificar documentos.
- Aplicar cambios pedidos por issues.
- Mantener evidencia en commits y PRs.
- Trabajar sobre ramas dedicadas desde `dev`.

Codex/Cursor no debe inventar fase, alcance o prioridades. Ejecuta sobre tickets, no sobre impulsos.

## Papel de ChatGPT

ChatGPT act?a como arquitecto/revisor senior del modelo experimental.

Debe usarse para:

- Revisar criterio.
- Ordenar ideas complejas.
- Cuestionar supuestos.
- Separar modelo, operaci?n, mercado y tecnolog?a.
- Ayudar a convertir conversaciones en conocimiento ?til.

ChatGPT responde:

```text
?Esto tiene sentido?
?Qu? falta?
?Qu? riesgo estamos ignorando?
?Qu? decisi?n conviene tomar ahora?
```

## Flujo desde conversaci?n hasta Obsidian

```text
Conversaci?n
?
idea o aprendizaje relevante
?
se consolida en Obsidian
?
se separa en hechos, decisiones, hip?tesis, riesgos y pendientes
?
queda disponible como memoria estrat?gica
```

No toda conversaci?n genera issue. Primero se guarda y ordena el pensamiento.

## Cu?ndo una idea se convierte en issue

Una idea pasa de Obsidian a GitHub Issue cuando deja de ser reflexi?n y se convierte en trabajo accionable.

Criterios m?nimos:

- Acci?n concreta.
- Resultado esperado.
- Criterios de aceptaci?n.
- Evidencia de cierre.
- Relaci?n con una fase o milestone.

Ejemplo:

```text
Idea en Obsidian:
?Necesitamos aclarar c?mo se maneja una respuesta desconocida de DIAN.?

Issue en GitHub:
?Definir estados y flujo para RESPUESTA_DESCONOCIDA.?
```

## C?mo se prioriza en GitHub Project

La priorizaci?n debe considerar:

- Fase actual: F0.
- Riesgo de no hacerlo.
- Dependencias con otros issues.
- Claridad del criterio de aceptaci?n.
- Valor para consolidar el modelo experimental.

Orden recomendado:

```text
Inbox
?
Por aclarar
?
Listo para hacer
?
En progreso
?
En revisi?n / prueba
?
Hecho
```

## C?mo se ejecuta con Codex/Cursor

El flujo operativo es:

```text
Issue aprobado o priorizado
?
rama desde dev
?
Codex/Cursor ejecuta el cambio
?
commit convencional
?
PR hacia dev
?
evidencia en PR e issue
?
revisi?n
```

En esta fase, la ejecuci?n ser? principalmente documentaci?n, organizaci?n, definici?n de modelo, backlog y pruebas del flujo.

## C?mo se deja evidencia

La evidencia puede quedar en:

- El documento creado o actualizado.
- El diff del PR.
- El body del PR.
- Comentarios en el issue.
- Links entre Obsidian, issue y PR cuando aplique.

Toda tarea debe poder responder:

```text
?Qu? cambi??
?D?nde cambi??
?Por qu? cambi??
?C?mo se verifica?
```

## C?mo se actualiza aprendizaje en Obsidian

Despu?s de cerrar un ciclo importante:

1. Revisar qu? se aprendi?.
2. Registrar decisiones nuevas.
3. Marcar hip?tesis validadas o pendientes.
4. Documentar riesgos detectados.
5. Crear issues nuevos solo si hay tareas accionables.

Obsidian no es un archivo muerto. Es la memoria viva del modelo.

## Orden actual de F0

- #44 ? Entorno diario de trabajo.
- #42 ? Definici?n del modelo experimental.
- #43 ? Prueba de fogueo del mercado.
- #45 ? Primera prueba completa del modelo sin usuarios.

## Qu? NO se debe hacer en esta fase

En F0 no se debe:

- Implementar c?digo funcional de facturaci?n DIAN.
- Tocar integraci?n DIAN.
- Modificar configuraci?n de producci?n.
- Mover archivos de Obsidian/Drive.
- Construir features de producto final sin validar el modelo.
- Confundir conversaci?n estrat?gica con tarea accionable.
- Confundir issue con documentaci?n de pensamiento.
- Escalar alcance antes de consolidar el modelo experimental.

## Resumen operativo

```text
Primero pensar bien.
Luego documentar.
Luego convertir en tickets.
Luego priorizar.
Luego ejecutar.
Luego dejar evidencia.
Luego actualizar aprendizaje.
```

La calidad de esta fase no se mide por cu?ntas l?neas de c?digo se escriben. Se mide por qu? tan claro queda el modelo para decidir, ejecutar y aprender sin perder trazabilidad.
