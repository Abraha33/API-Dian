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

**Herramienta principal:** **Supabase CLI** (solo si el issue toca base de datos).

```bash
supabase migration new <nombre-descriptivo>
# Editar SQL en supabase/migrations/
supabase db push
supabase db diff   # opcional: comprobar diferencias respecto al estado esperado
```

- **No** aplicar cambios de esquema solo desde el dashboard de Supabase; todo va en migraciones versionadas.
- Tras cambios de esquema, actualizar al menos [`scripts/introspection/current-public-schema.sql`](../scripts/introspection/current-public-schema.sql) cuando el equipo lo exija en el issue.
- Detalle operativo: [`docs/supabase-workflow.md`](./supabase-workflow.md) (F0-WKF-04).

---

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

<<<<<<< HEAD
Para la **apertura** del issue (título, labels, body, milestone), usa como guía la sección **«1. Apertura del issue»** de [`docs/templates/checklist-template.md`](./templates/checklist-template.md).

Otras plantillas en `docs/templates/`: [`module-template.md`](./templates/module-template.md) (documentar un módulo nuevo), [`session-template.md`](./templates/session-template.md) (sesiones con IA; ver también Paso 3 y 4).
=======
Plantillas en `docs/templates/` cuando existan (F0-WKF-02).

---
>>>>>>> feature/docs/1-workflow-foundations

## Paso 2 · Estimación

**Herramienta principal:** **GitHub** (body del issue) + documento [`estimation-and-definition-of-done.md`](./estimation-and-definition-of-done.md).

- Asignar **talla XS–XL** con la tabla de tallas de ese doc (no son horas fijas; son relativas al proyecto).
- Asignar **riesgo** Bajo / Medio / Alto según los criterios del mismo doc.
- Dejar talla y riesgo **registrados en el issue antes** de abrir la rama.
- Si huele a **XL**, trocear en varios issues (idealmente S o M) **antes** de implementar.

---

## Paso 3 · Diseño (Perplexity)

<<<<<<< HEAD
Usar Perplexity para diseño técnico y funcional. Estructura la sesión con [`docs/templates/session-template.md`](./templates/session-template.md) (meta, contexto mínimo, objetivo de la sesión, criterios de salida).

- Cargar contexto mínimo según `docs/context-policy.md`.
- Usar el prompt de `docs/agents/perplexity-prompt.md`.
- Aplicar para:
  - Diseñar modelos de datos.
  - Especificar contratos de API.
  - Afinar queries SQL y migraciones.
  - Analizar impacto en módulos existentes.
=======
**Herramienta principal:** **Perplexity** (análisis y diseño con fuentes).
>>>>>>> feature/docs/1-workflow-foundations

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

**Herramienta principal:** **Supabase CLI** (solo si el issue toca base de datos).

```bash
supabase migration new <nombre-descriptivo>
# Editar SQL en supabase/migrations/
supabase db push
supabase db diff   # opcional: comprobar diferencias respecto al estado esperado
```

- **No** aplicar cambios de esquema solo desde el dashboard de Supabase; todo va en migraciones versionadas.
- Tras cambios de esquema, actualizar al menos [`scripts/introspection/current-public-schema.sql`](../scripts/introspection/current-public-schema.sql) cuando el equipo lo exija en el issue.
- Detalle operativo: [`docs/supabase-workflow.md`](./supabase-workflow.md) (F0-WKF-04).

---

## Paso 6 · Evidencia

**Herramienta principal:** **GitHub** (comentario en el issue).

<<<<<<< HEAD
Sigue [`docs/templates/checklist-template.md`](./templates/checklist-template.md): sección **«4. Evidencia»** para el comentario; **«5. PR y revisión»** y **«6. Cierre»** para alinear evidencia, PR y cierre del issue con el tablero y la calibración.
=======
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
>>>>>>> feature/docs/1-workflow-foundations

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
1. Issue en GitHub: título, labels obligatorios (role, type, size, priority), body completo, milestone F0–F8; opcionales module, track, blocked/needs-discussion. Guía de apertura: `docs/templates/checklist-template.md` §1.
2. Estimar talla y riesgo con `docs/estimation-and-definition-of-done.md`; trocear si XL.
3. Diseño con Perplexity; estructurar sesión con `docs/templates/session-template.md`; `docs/context-policy.md`, `docs/agents/perplexity-prompt.md`; ADR si aplica.
4. Rama `feature/<rol>/<issue-n>-slug` desde `dev`, Cursor, `docs/templates/session-template.md`, commits pequeños.
5. Si hay BD: Supabase CLI, migraciones versionadas, introspección; detalle en `docs/supabase-workflow.md`.
6. Evidencia en el issue; `docs/templates/checklist-template.md` §4–6 (evidencia, PR, cierre).
7. PR a `dev`, `Closes #N`, CI verde; nota de impacto/rollback si es sensible.
8. Cerrar issue, registrar tiempo real en calibración; `dev` → `main` solo en hitos estables.
=======
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
>>>>>>> feature/docs/1-workflow-foundations
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

<<<<<<< HEAD
Para la **apertura** del issue (título, labels, body, milestone), usa como guía la sección **«1. Apertura del issue»** de [`docs/templates/checklist-template.md`](./templates/checklist-template.md).

Otras plantillas en `docs/templates/`: [`module-template.md`](./templates/module-template.md) (documentar un módulo nuevo), [`session-template.md`](./templates/session-template.md) (sesiones con IA; ver también Paso 3 y 4).
=======
Plantillas en `docs/templates/` cuando existan (F0-WKF-02).

---
>>>>>>> feature/docs/1-workflow-foundations

## Paso 2 · Estimación

**Herramienta principal:** **GitHub** (body del issue) + documento [`estimation-and-definition-of-done.md`](./estimation-and-definition-of-done.md).

- Asignar **talla XS–XL** con la tabla de tallas de ese doc (no son horas fijas; son relativas al proyecto).
- Asignar **riesgo** Bajo / Medio / Alto según los criterios del mismo doc.
- Dejar talla y riesgo **registrados en el issue antes** de abrir la rama.
- Si huele a **XL**, trocear en varios issues (idealmente S o M) **antes** de implementar.

---

## Paso 3 · Diseño (Perplexity)

<<<<<<< HEAD
Usar Perplexity para diseño técnico y funcional. Estructura la sesión con [`docs/templates/session-template.md`](./templates/session-template.md) (meta, contexto mínimo, objetivo de la sesión, criterios de salida).

- Cargar contexto mínimo según `docs/context-policy.md`.
- Usar el prompt de `docs/agents/perplexity-prompt.md`.
- Aplicar para:
  - Diseñar modelos de datos.
  - Especificar contratos de API.
  - Afinar queries SQL y migraciones.
  - Analizar impacto en módulos existentes.
=======
**Herramienta principal:** **Perplexity** (análisis y diseño con fuentes).
>>>>>>> feature/docs/1-workflow-foundations

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

**Herramienta principal:** **Supabase CLI** (solo si el issue toca base de datos).

```bash
supabase migration new <nombre-descriptivo>
# Editar SQL en supabase/migrations/
supabase db push
supabase db diff   # opcional: comprobar diferencias respecto al estado esperado
```

- **No** aplicar cambios de esquema solo desde el dashboard de Supabase; todo va en migraciones versionadas.
- Tras cambios de esquema, actualizar al menos [`scripts/introspection/current-public-schema.sql`](../scripts/introspection/current-public-schema.sql) cuando el equipo lo exija en el issue.
- Detalle operativo: [`docs/supabase-workflow.md`](./supabase-workflow.md) (F0-WKF-04).

---

## Paso 6 · Evidencia

**Herramienta principal:** **GitHub** (comentario en el issue).

<<<<<<< HEAD
Sigue [`docs/templates/checklist-template.md`](./templates/checklist-template.md): sección **«4. Evidencia»** para el comentario; **«5. PR y revisión»** y **«6. Cierre»** para alinear evidencia, PR y cierre del issue con el tablero y la calibración.
=======
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
>>>>>>> feature/docs/1-workflow-foundations

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
1. Issue en GitHub: título, labels obligatorios (role, type, size, priority), body completo, milestone F0–F8; opcionales module, track, blocked/needs-discussion. Guía de apertura: `docs/templates/checklist-template.md` §1.
2. Estimar talla y riesgo con `docs/estimation-and-definition-of-done.md`; trocear si XL.
3. Diseño con Perplexity; estructurar sesión con `docs/templates/session-template.md`; `docs/context-policy.md`, `docs/agents/perplexity-prompt.md`; ADR si aplica.
4. Rama `feature/<rol>/<issue-n>-slug` desde `dev`, Cursor, `docs/templates/session-template.md`, commits pequeños.
5. Si hay BD: Supabase CLI, migraciones versionadas, introspección; detalle en `docs/supabase-workflow.md`.
6. Evidencia en el issue; `docs/templates/checklist-template.md` §4–6 (evidencia, PR, cierre).
7. PR a `dev`, `Closes #N`, CI verde; nota de impacto/rollback si es sensible.
8. Cerrar issue, registrar tiempo real en calibración; `dev` → `main` solo en hitos estables.
=======
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
>>>>>>> feature/docs/1-workflow-foundations
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

Solo si el issue toca la base de datos.

**Guía operativa completa:** [`docs/supabase-workflow.md`](./supabase-workflow.md) (comandos, convenciones de nombres, introspección, qué hacer si falla una migración; alineado con F0-WKF-04).

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
  si hay cambios de esquema (detalle en `supabase-workflow.md`).

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
8. Antes de cerrar el issue, revisar la sección “DoD por tipo de módulo” en docs/estimation-and-definition-of-done.md y confirmar que el módulo principal cumple todos los criterios.
9. Cerrar issue, registrar tiempo real en calibración; `dev` → `main` solo en hitos estables.