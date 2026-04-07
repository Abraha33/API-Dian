# Workflow del proyecto (v0.1)

## Introducción

**Propósito:** Definir el recorrido estándar de cualquier trabajo en API-DIAN, desde la idea hasta el cierre en `dev`, con evidencia y trazabilidad.

**Dirigido a:** Quien abre issues, implementa en ramas `feature/...`, revisa PRs o integra cambios; sirve también como contexto para sesiones con IA.

Las herramientas que aparecen en cada paso son las **principales** para ese momento; no excluyen otras (por ejemplo, leer el repo en GitHub en cualquier fase).

---

## Paso 1 · Idea → Issue

**Herramienta principal:** **GitHub** (issues, labels, milestones, Project).

- **Título:** `[F<n>-<CÓDIGO>] Descripción concisa` (ej. `[F0-WKF-01] Definir workflow`).
- **Labels obligatorios:**
  - `role-*` (quién: backend, database, frontend, devops, docs, qa)
  - `type-*` (qué: feature, bug, chore, docs, migration, refactor, test)
  - `size-*` (XS–XL)
  - `priority-*` (high, medium, low)
- **Labels opcionales:** `module-*`, `track-*` (sobre todo en F0), `blocked`, `needs-discussion`.
- **Body mínimo:** Contexto, Objetivo, Alcance (checklist), Fuera de alcance, Talla, Riesgo, Rama de trabajo, **Prueba de cierre** (checklist al final).
- **Milestone:** uno de F0–F8 según la fase del trabajo.

Plantillas en `docs/templates/` cuando existan (F0-WKF-02).

---

## Paso 2 · Estimación

**Herramienta principal:** **GitHub** (body del issue) + documento [`estimation-and-definition-of-done.md`](./estimation-and-definition-of-done.md).

- Asignar **talla XS–XL** con la tabla de tallas de ese doc (no son horas fijas; son relativas al proyecto).
- Asignar **riesgo** Bajo / Medio / Alto según los criterios del mismo doc.
- Dejar talla y riesgo **registrados en el issue antes** de abrir la rama.
- Si huele a **XL**, trocear en varios issues (idealmente S o M) **antes** de implementar.

---

## Paso 3 · Diseño (Perplexity)

**Herramienta principal:** **Perplexity** (análisis y diseño con fuentes).

- Cargar **contexto mínimo** según [`docs/context-policy.md`](./context-policy.md) (cuando exista).
- Usar la base del prompt en [`docs/agents/perplexity-prompt.md`](./agents/perplexity-prompt.md).
- **Casos típicos:** modelos de datos, contratos de API, queries SQL y borradores de migración, impacto en módulos (integrador, emisión, notificación, etc.).
- Si la decisión es **relevante a largo plazo** → nuevo archivo en [`ADR/`](../ADR/).

---

## Paso 4 · Implementación (Cursor)

**Herramienta principal:** **Cursor** (código y docs en el repo).

Rama desde `dev`, patrón `feature/<rol>/<issue-n>-slug`:

```bash
git checkout dev
git pull
git checkout -b feature/<rol>/<issue-n>-slug
```

Ejemplos: `feature/docs/1-workflow-foundations`, `feature/database/4-flujo-validacion-supabase`, `feature/backend/15-health-endpoint`.

- Reglas del proyecto: [`.cursor/rules/project.mdc`](../.cursor/rules/project.mdc).
- Inicio de sesión alineado a [`docs/templates/session-template.md`](./templates/session-template.md) (cuando exista).
- **Alcance:** solo archivos y cambios descritos en el issue; evitar refactors colaterales.
- **Commits:** pequeños y descriptivos, p. ej. `docs(workflow): aclarar paso 2`.

---

## Paso 5 · Migraciones (Supabase CLI)

<<<<<<< HEAD
**Herramienta principal:** **Supabase CLI** (solo si el issue toca base de datos).
=======
Solo si el issue toca la base de datos.

**Guía operativa completa:** [`docs/supabase-workflow.md`](./supabase-workflow.md) (comandos, convenciones de nombres, introspección, qué hacer si falla una migración; alineado con F0-WKF-04).
>>>>>>> feature/docs/5-criterios-cierre-modulo

```bash
supabase migration new <nombre-descriptivo>
# Editar SQL en supabase/migrations/
supabase db push
supabase db diff   # opcional: comprobar diferencias respecto al estado esperado
```

<<<<<<< HEAD
- **No** aplicar cambios de esquema solo desde el dashboard de Supabase; todo va en migraciones versionadas.
- Tras cambios de esquema, actualizar al menos [`scripts/introspection/current-public-schema.sql`](../scripts/introspection/current-public-schema.sql) cuando el equipo lo exija en el issue.
- Detalle operativo: [`docs/supabase-workflow.md`](./supabase-workflow.md) (F0-WKF-04).

---
=======
Reglas:
- Nunca modificar el esquema directamente en el dashboard de Supabase.
- Todo cambio de esquema pasa por una migración versionada.
- Actualizar `scripts/introspection/current-public-schema.sql`
  si hay cambios de esquema (detalle en `supabase-workflow.md`).
>>>>>>> feature/docs/5-criterios-cierre-modulo

## Paso 6 · Evidencia

**Herramienta principal:** **GitHub** (comentario en el issue).

Antes del PR, un **comentario** en el issue con:

- Comandos ejecutados (texto literal).
- Resultado (OK / error y cómo se resolvió).
- Si hubo BD: snippet SQL o nota de introspección.
- Si aplica: logs, respuestas HTTP, capturas breves.

Estructurar con [`docs/templates/checklist-template.md`](./templates/checklist-template.md) cuando exista.

**Ejemplo breve de comentario:**

```text
## Evidencia (#N)
- Comando: supabase db push
- Resultado: OK, migración aplicada sin errores.
- SQL: SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'test_migration_log';
→ 1 fila devuelta.
```

---

## Paso 7 · PR + Revisión

**Herramienta principal:** **GitHub** (pull requests y CI).

```bash
git push origin feature/<rol>/<issue-n>-slug
# Abrir PR hacia dev en la UI de GitHub
```

- **Título:** `[#N] Descripción breve`.
- **Body:** `Closes #N` (o referencia clara al issue), checklist de prueba de cierre con **resultado real** (no solo casillas vacías).
- **CI** en verde antes de merge (salvo acuerdo explícito documentado en el PR).

**Criterios mínimos para aprobar / mergear:**

- Alcance acorde al issue; sin secretos en el diff.
- Prueba de cierre cubierta o justificada en el PR / comentarios del issue.
- Cambios sensibles (BD, emisión DIAN, notificación al adquiriente): **nota de impacto** y **plan de rollback** en el PR.

---

## Paso 8 · Cierre

**Herramienta principal:** **GitHub** (cerrar issue) + [`estimation-and-definition-of-done.md`](./estimation-and-definition-of-done.md) (calibración).

- Tras merge a `dev`, **cerrar** el issue vinculado.
- Registrar **horas reales** y notas en la **tabla de calibración** del doc de estimación.
- **`dev` → `main`:** solo en recortes estables (p. ej. cierre de fase o hito acordado); **no** automatizado en este workflow v0.1.

---

## Resumen rápido

<<<<<<< HEAD
| # | Paso | Herramienta principal |
|---|------|------------------------|
| 1 | Issue con título, labels, body, milestone F0–F8 | GitHub |
| 2 | Talla y riesgo desde `estimation-and-definition-of-done.md`; trocear si XL | GitHub + doc |
| 3 | Diseño; context-policy + perplexity-prompt; ADR si aplica | Perplexity |
| 4 | Rama `feature/...`, reglas Cursor, session-template, commits acotados | Cursor |
| 5 | Migraciones, `db push`, introspección; `supabase-workflow.md` | Supabase CLI |
| 6 | Comentario de evidencia en el issue; checklist-template | GitHub |
| 7 | PR a `dev`, `Closes #N`, CI verde, impacto/rollback si aplica | GitHub |
| 8 | Cerrar issue; tabla de calibración; `dev`→`main` manual en hitos | GitHub + doc |

Pasos en una línea: **GitHub** (issue) → **estimación** (doc) → **Perplexity** (diseño) → **Cursor** (código) → **Supabase CLI** (si BD) → **GitHub** (evidencia + PR) → **cierre** (GitHub + calibración).
=======
1. Issue en GitHub: título, labels obligatorios (role, type, size, priority), body completo, milestone F0–F8; opcionales module, track, blocked/needs-discussion.
2. Estimar talla y riesgo con `docs/estimation-and-definition-of-done.md`; trocear si XL.
3. Diseño con Perplexity (`docs/context-policy.md`, `docs/agents/perplexity-prompt.md`); ADR si aplica.
4. Rama `feature/<rol>/<issue-n>-slug` desde `dev`, Cursor, `docs/templates/session-template.md`, commits pequeños.
5. Si hay BD: Supabase CLI, migraciones versionadas, introspección; detalle en `docs/supabase-workflow.md`.
6. Evidencia en el issue; `docs/templates/checklist-template.md`.
7. PR a `dev`, `Closes #N`, CI verde; nota de impacto/rollback si es sensible.
8. Antes de cerrar el issue, revisar la sección “DoD por tipo de módulo” en docs/estimation-and-definition-of-done.md y confirmar que el módulo principal cumple todos los criterios.
9. Cerrar issue, registrar tiempo real en calibración; `dev` → `main` solo en hitos estables.
>>>>>>> feature/docs/5-criterios-cierre-modulo
