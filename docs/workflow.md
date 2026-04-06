# Workflow del proyecto (v0.1)

Flujo estándar para cualquier issue del proyecto API-DIAN,
desde la idea hasta el cierre.

## Paso 1 · Idea → Issue

Toda idea entra como issue en GitHub con:

- Título: `[F<n>-<CÓDIGO>] Descripción concisa`
- Labels obligatorios:
  - `role-*` (quién lo hace: backend, database, frontend, devops, docs, qa)
  - `type-*` (qué es: feature, bug, chore, docs, migration, refactor, test)
  - `size-*` (talla: XS, S, M, L, XL)
  - `priority-*` (prioridad: high, medium, low)
- Labels opcionales:
  - `module-*` (módulo del dominio que toca)
  - `track-*` (paquete de trabajo dentro de F0)
  - `blocked` / `needs-discussion`
- Body obligatorio:
  - Contexto, Objetivo, Alcance (checklist)
  - Fuera de alcance
  - Talla, Riesgo, Rama de trabajo
  - Prueba de cierre (checklist al final)
- Milestone: F0–F8 según la fase correspondiente.

Plantilla de issue disponible en `docs/templates/` (ver F0-WKF-02).

## Paso 2 · Estimación

Antes de empezar:
- Elegir talla XS–XL usando la tabla de
  `docs/estimation-and-definition-of-done.md`.
- Evaluar riesgo (Bajo / Medio / Alto).
- Registrar ambos en el body del issue antes de crear la rama.
- Si la tarea parece XL, trocear en issues más pequeños.

## Paso 3 · Diseño (Perplexity)

Usar Perplexity para diseño técnico y funcional:
- Cargar contexto mínimo según `docs/context-policy.md`.
- Usar el prompt de `docs/agents/perplexity-prompt.md`.
- Aplicar para:
  - Diseñar modelos de datos.
  - Especificar contratos de API.
  - Afinar queries SQL y migraciones.
  - Analizar impacto en módulos existentes.

Si la decisión es relevante a largo plazo → crear ADR en `ADR/`.

## Paso 4 · Implementación (Cursor)

Crear rama desde `dev`:

```bash
git checkout dev
git pull
git checkout -b feature/<rol>/<issue-n>-slug
```

Ejemplos de nombre de rama:

- `feature/docs/1-workflow-foundations`
- `feature/database/4-flujo-validacion-supabase`
- `feature/backend/15-health-endpoint`

Luego:

- Usar Cursor con las reglas de `.cursor/rules/project.mdc`.
- Usar la plantilla de sesión de `docs/templates/session-template.md`.
- Tocar solo los archivos que el issue describe.
- Commits pequeños y descriptivos:

```bash
git commit -m "tipo(scope): descripción corta"
```

## Paso 5 · Migraciones (Supabase CLI)

Solo si el issue toca la base de datos:

```bash
# Crear migración
supabase migration new <nombre-descriptivo>

# Editar el SQL generado en supabase/migrations/

# Aplicar en local
supabase db push

# Verificar
supabase db diff
```

Reglas:
- Nunca modificar el esquema directamente en el dashboard de Supabase.
- Todo cambio de esquema pasa por una migración versionada.
- Actualizar `scripts/introspection/current-public-schema.sql`
  si hay cambios de esquema.

Flujo detallado en `docs/supabase-workflow.md` (ver F0-WKF-04).

## Paso 6 · Evidencia

Antes de abrir el PR, añadir un comentario en el issue con:
- Comandos ejecutados (copiados literalmente).
- Resultado obtenido (OK o error + cómo se resolvió).
- Snippet SQL o descripción de introspección (si hubo cambios de BD).
- Output relevante (logs, respuestas HTTP, etc.).

Usar la plantilla de `docs/templates/checklist-template.md`.

## Paso 7 · PR + Revisión

```bash
git push origin feature/<rol>/<issue-n>-slug
# Abrir PR en GitHub hacia dev
```

PR debe tener:
- Título: `[#N] Descripción`
- Body:
  - `Closes #N`
  - Checklist de prueba de cierre marcada con resultado real.
- CI verde antes de merge.

Si el cambio toca BD, flujo de emisión o notificación al adquiriente:
añadir nota de impacto y plan de rollback.

## Paso 8 · Cierre

- Al mergear a `dev`, cerrar el issue asociado.
- Registrar tiempo real en la tabla de calibración de
  `docs/estimation-and-definition-of-done.md`.
- `dev` → `main` solo cuando haya un recorte estable
  (cierre de milestone), no se automatiza por ahora.

## Resumen rápido

1. Issue en GitHub: título, labels obligatorios (role, type, size, priority), body completo, milestone F0–F8; opcionales module, track, blocked/needs-discussion.
2. Estimar talla y riesgo con `docs/estimation-and-definition-of-done.md`; trocear si XL.
3. Diseño con Perplexity (`docs/context-policy.md`, `docs/agents/perplexity-prompt.md`); ADR si aplica.
4. Rama `feature/<rol>/<issue-n>-slug` desde `dev`, Cursor, `docs/templates/session-template.md`, commits pequeños.
5. Si hay BD: Supabase CLI, migraciones versionadas, introspección; detalle en `docs/supabase-workflow.md`.
6. Evidencia en el issue; `docs/templates/checklist-template.md`.
7. PR a `dev`, `Closes #N`, CI verde; nota de impacto/rollback si es sensible.
8. Cerrar issue, registrar tiempo real en calibración; `dev` → `main` solo en hitos estables.
