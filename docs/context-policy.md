# Política de contexto para sesiones con IA

## 1. Objetivo
Definir qué información aportamos a Perplexity y Cursor en cada sesión,
qué vive en `docs/` y `ADR/`, y qué va solo en comentarios de issues.

## 2. Contexto fijo (no se pega cada vez)
Vive en `docs/` y `ADR/` y se actualiza cuando cambia el proyecto:

- Estructura del repo y ramas: `docs/git-branches.md`, `docs/workflow.md`.
- Módulos y responsabilidades: `docs/modules.md`.
- Estimación y Definition of Done: `docs/estimation-and-definition-of-done.md`.
- Forma general de trabajar con IA: este doc y `docs/agents/*`.
- Decisiones de arquitectura: `ADR/`.

En las sesiones con IA solo se hace referencia (“según docs/workflow.md…”),
no se pega todo el contenido.

## 3. Contexto variable por ticket

Cada sesión con IA debe incluir como mínimo:

- Issue activo (texto completo): contexto, objetivo, alcance, prueba de cierre.
- Módulo y archivos relevantes (rutas + fragmentos necesarios, no todo el repo).
- Rama activa (`feature/...`) y estado actual del trabajo:
  qué se hizo y qué falta.
- Último comentario de evidencia si se retoma trabajo anterior.

Regla: una sesión = un issue. No mezclar varios tickets en el mismo contexto.

## 4. Uso de Perplexity

Perplexity se usa principalmente para:

- Aclarar conceptos que el desarrollador no domina.
- Diseñar flujo, contratos y decisiones antes de implementarlas.
- Revisar si el enfoque propuesto tiene riesgos.

En el prompt se pega:

- Issue activo.
- Resumen del estado actual.
- Fragmentos de código o docs estrictamente necesarios.

Cuando la respuesta esté clara, las conclusiones se vuelcan a:
- Código (vía Cursor).
- `docs/` o `ADR/` si es decisión persistente.
- Comentario en el issue si es evidencia puntual.

## 5. Uso de Cursor

Cursor se usa principalmente para:

- Implementar código y cambios en docs.
- Navegar y editar archivos relevantes al issue.

En el chat de Cursor se aporta:

- Issue activo (o enlace).
- Esquema/decisiones ya acordadas en Perplexity.
- Rutas de archivos donde se va a trabajar.

No se pega teoría larga ni partes del repo que no se van a tocar.

## 6. Qué va en docs, ADR y comentarios de issues

- `docs/`: reglas de trabajo, flujos, plantillas, guías que se reutilizan
  en muchos tickets.
- `ADR/`: decisiones de arquitectura de largo plazo, con contexto y alternativas.
- Comentarios de issues: evidencia puntual de ejecución
  (comandos, outputs, capturas, notas de la sesión).

## 7. Responsabilidad de actualización

Actualmente hay un solo desarrollador responsable.
Por tanto:

- Al cerrar un issue que cambie el flujo o decisiones,
  el mismo desarrollador debe actualizar el doc afectado
  (`docs/`, `ADR/`) como parte del DoD.
- Si un doc está desactualizado, se abre un issue de tipo `docs`
  para corregirlo.