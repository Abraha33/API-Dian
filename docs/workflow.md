# Workflow del proyecto (v0.1)

Flujo estándar para cualquier issue del proyecto API-DIAN, desde la idea hasta el cierre en `dev`, con evidencia y trazabilidad.

## Introducción

**Propósito:** Ordenar el trabajo en issues, ramas, migraciones, PRs y cierre sin perder contexto ni duplicar decisiones.

**Dirigido a:** Quien crea issues, implementa en `feature/...`, revisa PRs o usa IA (Perplexity, Cursor).

**Herramienta principal** en cada paso indica la herramienta **típica** de esa fase; no impide usar GitHub u otras en cualquier momento.

**Documentos de apoyo:** [`session-context.md`](./session-context.md) (pegado rápido al abrir chat), [`daily-checklist.md`](./daily-checklist.md) (checklist F1 día a día), [`ticket-taxonomy.md`](./ticket-taxonomy.md) (labels).

---

## Paso 1 · Idea → Issue

**Herramienta principal:** **GitHub** (issues, labels, milestones, Project).

- **Título:** `[F<n>-<CÓDIGO>] Descripción concisa` (ej. `[F0-WKF-01] Definir workflow`).
- **Labels obligatorios:** `role-*`, `type-*`, `size-*`, `priority-*`.
- **Labels opcionales:** `module-*`, `track-*` (sobre todo en F0), `blocked`, `needs-discussion`.
- **Body mínimo:** Contexto, Objetivo, Alcance (checklist), Fuera de alcance, Talla, Riesgo, Rama de trabajo, **Prueba de cierre** (checklist al final).
- **Milestone:** F0–F8 según la fase.

**Plantillas:**

- Apertura del issue: sección **«1. Apertura del issue»** de [`templates/checklist-template.md`](./templates/checklist-template.md).
- [`templates/module-template.md`](./templates/module-template.md) — documentar un módulo nuevo.
- [`templates/session-template.md`](./templates/session-template.md) — sesiones con IA (ver también Pasos 3 y 4).

---

## Paso 2 · Estimación

**Herramienta principal:** **GitHub** (body del issue) + [`estimation-and-definition-of-done.md`](./estimation-and-definition-of-done.md).

- Talla **XS–XL** con la tabla de tallas de ese doc (orientativa, no contrato de horas).
- Riesgo **Bajo / Medio / Alto** según los criterios del mismo doc.
- Dejar talla y riesgo **en el issue antes** de crear la rama.
- Si es **XL**, trocear en issues más pequeños **antes** de implementar.

---

## Paso 3 · Diseño (Perplexity)

**Herramienta principal:** **Perplexity**.

- Estructurar la sesión con [`templates/session-template.md`](./templates/session-template.md) (meta, contexto mínimo, objetivo, criterios de salida).
- Contexto mínimo según [`context-policy.md`](./context-policy.md).
- Prompt base: [`agents/perplexity-prompt.md`](./agents/perplexity-prompt.md).
- **Casos típicos:** modelos de datos, contratos de API, SQL y borradores de migración, impacto en módulos (integrador, emisión DIAN, notificación, etc.).
- Decisión **duradera** → nuevo archivo en [`ADR/`](../ADR/).

---

## Paso 4 · Implementación (Cursor)

**Herramienta principal:** **Cursor**.

```bash
git checkout dev
git pull
git checkout -b feature/<rol>/<issue-n>-slug
```

Ejemplos: `feature/docs/1-workflow-foundations`, `feature/database/4-flujo-validacion-supabase`, `feature/backend/15-health-endpoint`.

- Reglas: [`.cursor/rules/project.mdc`](../.cursor/rules/project.mdc).
- Sesión: [`templates/session-template.md`](./templates/session-template.md).
- **Alcance:** solo lo del issue; sin refactors colaterales.
- **Commits:** pequeños y claros, p. ej. `docs(workflow): unificar pasos`.

---

## Paso 5 · Migraciones (Supabase CLI)

**Herramienta principal:** **Supabase CLI** (solo si el issue toca base de datos).

**Guía completa:** [`supabase-workflow.md`](./supabase-workflow.md) — comandos, nombres de archivos, introspección, fallos y depuración (F0-WKF-04).

```bash
supabase migration new <nombre-descriptivo>
# Editar SQL en supabase/migrations/

supabase db push

supabase db diff   # opcional
```

- No cambiar esquema solo desde el **dashboard**; todo en migraciones versionadas.
- Actualizar [`scripts/introspection/current-public-schema.sql`](../scripts/introspection/current-public-schema.sql) si el issue lo exige (detalle en `supabase-workflow.md`).

---

## Paso 6 · Evidencia

**Herramienta principal:** **GitHub** (comentario en el issue).

Antes del PR, **comentario** con:

- Comandos (texto literal).
- Resultado (OK / error y resolución).
- Si hubo BD: SQL o nota de introspección.
- Si aplica: logs, HTTP, capturas breves.

Usar [`templates/checklist-template.md`](./templates/checklist-template.md): **§4 Evidencia** para el comentario; **§5 PR** y **§6 Cierre** para alinear con tablero y merge.

**Ejemplo breve:**

```text
## Evidencia (#N)
- Comando: supabase db push
- Resultado: OK.
- SQL: SELECT 1 FROM public.test_migration_log LIMIT 1;
```

---

## Paso 7 · PR + Revisión

**Herramienta principal:** **GitHub** (PR y CI).

```bash
git push origin feature/<rol>/<issue-n>-slug
# Abrir PR hacia dev
```

- **Título:** `[#N] Descripción breve`.
- **Body:** `Closes #N`, prueba de cierre con **resultado real** (no solo casillas vacías).
- **CI** verde antes del merge (salvo acuerdo explícito en el PR).

**Mínimo para mergear:**

- Alcance acorde al issue; sin secretos en el diff.
- Prueba de cierre cubierta o justificada en el issue/PR.
- Cambios sensibles (BD, emisión DIAN, notificación al adquiriente): **impacto** y **rollback** en el PR.

---

## Paso 8 · Cierre

**Herramienta principal:** **GitHub** + [`estimation-and-definition-of-done.md`](./estimation-and-definition-of-done.md).

- Tras merge a `dev`, **cerrar** el issue.
- Comprobar **DoD por tipo de módulo** en `estimation-and-definition-of-done.md` si el issue tenía un perfil claro (docs, database, backend, devops, qa).
- **Horas reales** y notas en la **tabla de calibración** del mismo doc.
- **`dev` → `main`:** solo en recortes estables (hito acordado); no automatizado en v0.1.

---

## Resumen rápido

| # | Paso | Herramienta |
|---|------|-------------|
| 1 | Issue: título, labels, body, milestone | GitHub |
| 2 | Talla y riesgo (doc estimación); trocear si XL | GitHub + doc |
| 3 | Diseño; session-template, context-policy, perplexity-prompt; ADR si aplica | Perplexity |
| 4 | Rama `feature/...`, Cursor, reglas, commits acotados | Cursor |
| 5 | Migraciones, `db push`, introspección; `supabase-workflow.md` | Supabase CLI |
| 6 | Evidencia en issue; checklist-template §4–6 | GitHub |
| 7 | PR a `dev`, CI, impacto/rollback si aplica | GitHub |
| 8 | Cerrar issue, DoD módulo si aplica, calibración; `dev`→`main` manual | GitHub + doc |

**Pipeline:** GitHub (issue) → estimación (doc) → Perplexity → Cursor → Supabase (si BD) → GitHub (evidencia + PR) → cierre (GitHub + calibración).

**Lista numerada:**

1. Issue + [`checklist-template.md`](./templates/checklist-template.md) §1; milestone F0–F8.
2. Talla/riesgo en [`estimation-and-definition-of-done.md`](./estimation-and-definition-of-done.md); trocear si XL.
3. Perplexity + [`session-template.md`](./templates/session-template.md) + [`context-policy.md`](./context-policy.md) + [`perplexity-prompt.md`](./agents/perplexity-prompt.md); ADR si aplica.
4. `feature/<rol>/<issue-n>-slug`, Cursor, [`session-template.md`](./templates/session-template.md).
5. Si BD: CLI + [`supabase-workflow.md`](./supabase-workflow.md).
6. Comentario de evidencia; [`checklist-template.md`](./templates/checklist-template.md) §4–6.
7. PR `dev`, `Closes #N`, CI verde.
8. Cerrar; DoD por módulo si aplica; tabla de calibración; `dev`→`main` en hitos.
