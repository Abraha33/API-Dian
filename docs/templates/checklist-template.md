# Checklist template

## 1. Apertura del issue
- [ ] Título con formato `[F?-XXX-??] Descripción concisa`.
- [ ] Labels obligatorios: `role-*`, `type-*`, `size-*`, `priority-*`.
- [ ] Labels opcionales: `module-*`, `track-*`, `blocked`/`needs-discussion` si aplica.
- [ ] Body completo: Contexto, Objetivo, Alcance (checklist), Fuera de alcance, Talla, Riesgo, Rama de trabajo, Prueba de cierre.
- [ ] Issue asociado al milestone correcto (F0–F8).

## 2. Antes de empezar a trabajar
- [ ] Talla estimada (XS–XL) revisada con `docs/estimation-and-definition-of-done.md`.
- [ ] Riesgo (Bajo / Medio / Alto) definido.
- [ ] Rama creada desde `dev` (`feature/<rol>/<issue-n>-slug`).
- [ ] Tarjeta movida a **In Progress** en el Project board.

## 3. Durante el trabajo
- [ ] Sesión inicial con IA usando `docs/templates/session-template.md`.
- [ ] Contexto mínimo cargado según `docs/context-policy.md`.
- [ ] Cambios limitados al alcance del issue (no meter cosas extra).
- [ ] Commits pequeños y descriptivos.

## 4. Evidencia
- [ ] Comentario en el issue con:
      - Comandos ejecutados.
      - Resultados (OK / errores y cómo se resolvieron).
      - Snippets de código / SQL / respuestas relevantes.
- [ ] Si hubo migraciones, evidencias según `docs/supabase-workflow.md`.

## 5. PR y revisión
- [ ] PR abierto hacia `dev` desde la rama del issue.
- [ ] PR con `Closes #N` en el body.
- [ ] Checklist de Prueba de cierre marcada con resultado real.
- [ ] CI verde y revisión realizada.

## 6. Cierre
- [ ] PR mergeado a `dev`.
- [ ] Issue cerrado.
- [ ] Tarjeta movida a **Done** en el Project board.
- [ ] Tiempo real registrado en la tabla de calibración de `docs/estimation-and-definition-of-done.md`.
- [ ] Docs/ADR actualizados si hubo decisiones relevantes.