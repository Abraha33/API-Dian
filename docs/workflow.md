# Workflow del proyecto (v0.1)

Este documento describe el flujo de trabajo estándar para cualquier issue del proyecto API-DIAN.

## Paso 1 · Idea → Issue

Toda idea entra como issue en GitHub.

Cada issue debe incluir:
- Título: `[FASE] Descripción concisa`
- Labels:
  - `role-*` (ej. `role-backend`, `role-database`, `role-frontend`)
  - `type-*` (ej. `type-feature`, `type-bug`, `type-docs`, `type-chore`)
- Campos en el body:
  - Talla (XS–XL)
  - Riesgo (Bajo/Medio/Alto)
  - Prueba de cierre (checklist al final)

El campo milestone (F1–F8) es opcional por ahora y se terminará de definir cuando el roadmap esté más estable.

## Paso 2 · Estimación

Antes de empezar a trabajar:
- Elegir talla XS–XL usando la tabla de `docs/estimation-and-definition-of-done.md`.
- Evaluar riesgo (Bajo/Medio/Alto).
- Registrar ambos en el body del issue.

Si la tarea parece XL, se debe trocear en varios issues más pequeños.

## Paso 3 · Diseño (Perplexity)

Para diseño funcional y técnico:
- Usar Perplexity con el prompt de `docs/agents/perplexity-prompt.md`.
- Cargar el contexto mínimo recomendado en `docs/session-context.md` (estructura del repo, decisiones previas, etc.).
- Usar Perplexity para:
  - Diseñar modelos de datos.
  - Especificar contratos de API.
  - Afinar queries SQL y migraciones.
  - Analizar impacto de cambios en módulos (integrador, emisión DIAN, notificación, etc.).

Cualquier decisión de arquitectura relevante se documenta en `ADR/` como un nuevo ADR.

## Paso 4 · Implementación (Cursor)

Para implementación:
- Crear rama desde `dev`: `feature/<rol>/<issue-n>-slug`.
  - Ejemplo: `feature/database/12-test-migration`
  - Ejemplo: `feature/backend/15-health-endpoint`
- Usar Cursor con las reglas de `.cursor/rules/project.mdc`.
- Tocar solo los archivos que el issue describe.
- Mantener commits pequeños, con mensajes claros.

## Paso 5 · Migraciones (Supabase CLI)

Si el issue implica cambios en la base de datos:

```bash
supabase migration new <nombre-descriptivo>   # crea archivo SQL en supabase/migrations/
# editar el SQL generado con el cambio necesario
supabase db push                               # aplica migraciones en local
```

Reglas:
- No modificar el esquema directamente en el dashboard de Supabase.
- Todo cambio de esquema debe pasar por una migración versionada.
- Los scripts de introspección en `scripts/introspection/` se pueden actualizar para reflejar el estado actual.

## Paso 6 · Evidencia

Antes de abrir un PR:
- Añadir un comentario en el issue con:
  - Comandos ejecutados (copiados literalmente).
  - Resultado obtenido (OK o error, y cómo se resolvió).
  - Snippet SQL o descripción de la inspección de la base de datos, si hubo cambios de esquema.
  - Captura o breve descripción de cualquier output relevante (logs, respuestas HTTP, etc.).

La prueba de cierre del issue debe poder marcarse usando esta evidencia.

## Paso 7 · PR + Revisión

Flujo de PR:
- Abrir PR de `feature/...` hacia `dev`.
- Título del PR: `[#issue-n] Descripción`.
- Body del PR:
  - Referencia al issue (`Closes #n` cuando aplique).
  - Checklist de la prueba de cierre, marcando lo que se ha validado.
- CI debe pasar antes de hacer merge.

Si el cambio es sensible (base de datos, flujo de emisión, notificación al adquiriente), añadir una nota breve de impacto y rollback.

## Paso 8 · Cierre y promoción

- Al mergear a `dev`, el issue correspondiente debe quedar cerrado.
- La rama `dev` acumula trabajo listo pero no necesariamente para producción.
- Los merges de `dev` → `main` se harán cuando exista un recorte estable (por ejemplo, cierre de un milestone F4), y se documentarán aparte (no automatizar por ahora).

## Resumen rápido

1. Idea → Issue con labels, talla, riesgo y prueba de cierre.
2. Estimación usando `docs/estimation-and-definition-of-done.md`.
3. Diseño con Perplexity + ADR si aplica.
4. Implementación en rama `feature/...` con Cursor.
5. Migraciones de base de datos con Supabase CLI (si aplica).
6. Evidencia documentada en el issue.
7. PR a `dev` con CI verde.
8. Cierre del issue y, más adelante, promoción controlada de `dev` a `main`.
