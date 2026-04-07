# Plantilla — copia al crear el issue en GitHub

**Título en GitHub:** `[F0-WKF-06] Epic: Validar workflow IA-asistido (checklist v2) — 9 misiones` — issue **#16**.

**Sub-issues enlazadas en GitHub:** **#17–#25** (una por sección de la checklist v2). Cuerpos fuente: [`wkf06-subissues/`](./wkf06-subissues/).

**Labels sugeridos (epic):** `role-qa`, `type-test`, `track-workflow-ia`, `size-L`, `priority-medium`

**Milestone:** F0 — Workflow, foundations y método de trabajo

---

## Nota (roadmap)

Se agregó el milestone **F5.5 — Integraciones comerciales y e-commerce** en GitHub y en `ROADMAP.md` (entre F5 y F6). Epic: **#26** con sub-issues **#27, #28, #29, #30, #31, #32, #33**.

## Contexto

Antes de dar por cerrado F0 y avanzar con confianza a F1, hay que **ejecutar de punta a punta** el método de trabajo (GitHub, Supabase CLI, Cursor, Perplexity) usando la checklist de validación **v2**.

## Objetivo

Completar el trabajo en los **sub-issues #17–#25**, dejando **evidencia** en cada uno. El epic **#16** se revisa al final con la prueba de cierre de este documento.

## Alcance

- Cerrar las 9 sub-issues con sus checklists y pruebas de cierre.
- Documentar bloqueos con dependencia o decisión pendiente (label `blocked` si aplica).

## Fuera de alcance

- Cambiar el stack de producto o implementar features de dominio fiscal.
- Automatizar la checklist en CI (solo ejecución manual en este ticket).

## Talla y riesgo

- **Talla:** L (aprox. un día; puede fraccionarse en sub-issues si se prefiere).
- **Riesgo:** Medio (depende de entorno local, GitHub Projects y CLI).

## Rama de trabajo

`feature/qa/<n>-validacion-workflow-ia-v2` (sustituir `<n>` por el número del issue en GitHub).

## Prueba de cierre

| Qué ejecutar | Resultado esperado | Talla prueba |
|--------------|-------------------|--------------|
| Revisar comentario final o checklist en el issue: todas las secciones 1–9 marcadas o ítems omitidos **justificados** | Checklist v2 cerrada con trazabilidad | **M** (< 15 min) |

Tras cerrar: anotar **tiempo real** de esa verificación frente al estimado en `docs/estimation-and-definition-of-done.md` (tabla de calibración).

---

## Checklist de validación del workflow IA-asistido (v2)

### 1. Work Environment

- [ ] Repo clonado y rama `dev` actualizada.
- [ ] Supabase CLI instalado y `supabase start` sin errores.
- [ ] Cursor instalado con `project.mdc` cargado y reconocido.
- [ ] Los 4 commands visibles en Cursor (`/start-ticket`, `/resume-ticket`, `/debug-sql`, `/close-ticket`).
- [ ] Archivo `Rama` eliminado de raíz.

### 2. Proyecto y estructura

- [ ] Árbol del repo coincide con el acordado (`.cursor/`, `.github/`, `ADR/`, `docs/`, `scripts/`, `supabase/`).
- [ ] `docs/` tiene todos los archivos core: `workflow.md`, `estimation-and-definition-of-done.md`, `context-policy.md`, `session-context.md`, `supabase-workflow.md`, `daily-checklist.md`.
- [ ] `scripts/introspection/` tiene los 4 archivos SQL.
- [ ] `supabase/migrations/` tiene al menos la migración de prueba de F0-WKF-04.
- [ ] `ADR/` tiene `ADR-001` y `ADR-002`.

### 3. GitHub Projects y tickets

- [ ] El Project board existe con columnas correctas (Backlog, In Progress, In Review, Done).
- [ ] Se puede crear issue usando template de `.github/ISSUE_TEMPLATE/`.
- [ ] El issue queda con labels correctos (`role-*`, `type-*`, `size-*`, `priority-*`, `module-*`).
- [ ] El issue se puede mover entre columnas del board.
- [ ] Se puede actualizar un issue (añadir comentario de evidencia).
- [ ] Un issue puede dividirse en sub-issues con sus propias ramas `feature/<rol>/<id>-slug`.
- [ ] **Cada issue tiene una "Prueba de cierre" concreta:**
  - qué ejecutar (comando, consulta SQL, acción manual),
  - qué resultado esperar,
  - tiempo estimado de la prueba (S = < 5 min, M = < 15 min).
- [ ] Al cerrar el ticket, el tiempo real de la prueba se compara con el estimado y se anota en la tabla de calibración.

### 4. Branches y PR

- [ ] Se puede crear rama `feature/<rol>/<id>-slug` desde `dev`.
- [ ] Rama sigue la convención de `docs/git-branches.md`.
- [ ] Se puede hacer PR de la rama a `dev` con `Closes #N`.
- [ ] CI pasa (`.github/workflows/ci.yml` verde).
- [ ] PR se puede mergear a `dev` sin conflictos.
- [ ] Issue se cierra automáticamente al mergear.

### 5. Contexto y prompts con IA

**Perplexity:**

- [ ] Output configurado por defecto en texto plano o bullets cortos (sin headers ni secciones largas salvo buena razón).
- [ ] Instrucción de formato fija en `docs/session-context.md` para no repetirla cada sesión.
- [ ] Se puede arrancar sesión pegando solo: issue + estado actual + objetivo.
- [ ] La sesión produce decisiones claras (diseño, enfoque, edge cases).
- [ ] Las decisiones se anotan en el issue o en un ADR (no se pierden).

**Cursor:**

- [ ] `/start-ticket` produce: resumen del issue, archivos a tocar, primeros pasos.
- [ ] `/resume-ticket` reconstruye el contexto de sesiones anteriores correctamente.
- [ ] `/debug-sql` identifica el error, propone fix y sugiere prueba de verificación.
- [ ] `/close-ticket` genera: borrador de evidencia, checklist DoD, body de PR.
- [ ] `project.mdc` frena a Cursor si intenta tocar archivos fuera del alcance del issue.

### 6. SQL, migraciones y Supabase

- [ ] `supabase migration new <nombre>` crea el archivo en `supabase/migrations/`.
- [ ] SQL editado y aplicado con `supabase db push` sin errores.
- [ ] Tabla visible en Supabase Studio tras el push.
- [ ] `scripts/introspection/current-public-schema.sql` actualizado tras la migración.
- [ ] `/debug-sql` funciona con un error real de migración (caso de uso comprobado).

### 7. Milestones y línea de tiempo

- [ ] Existe el milestone F0 en GitHub y está cerrado.
- [ ] Existe el milestone F1 con al menos 3 tickets asignados.
- [ ] Cada ticket tiene talla (`size-S`, `size-M`) y tiempo estimado en horas.
- [ ] La tabla de calibración en `estimation-and-definition-of-done.md` tiene al menos 4 filas reales de F0.
- [ ] Se puede comparar tiempo estimado vs real en al menos 2 tickets cerrados.

### 8. Casos de uso aplicados como commands

- [ ] **Ticket nuevo:** crear issue → rama → `/start-ticket` → implementar → evidencia → PR → cierre.
- [ ] **Retomar ticket:** `git checkout <rama>` → `/resume-ticket` → continuar → push.
- [ ] **Debug SQL:** error real → `/debug-sql` → fix → `supabase db push` → verificar.
- [ ] **Cierre de ticket:** `/close-ticket` → comentario en issue → PR → calibración.
- [ ] **Sub-ticket:** issue padre → sub-issue → rama propia → PR independiente → cierre.

### 9. Done — el workflow funciona si:

- [ ] Puedes correr 1 ticket S de F1 de inicio a fin sin consultar docs adicionales.
- [ ] Puedes retomar ese ticket 2 días después en menos de 5 minutos.
- [ ] Puedes depurar un error de migración SQL usando solo `/debug-sql`.
- [ ] Puedes cerrar un ticket generando la evidencia en menos de 10 minutos.
- [ ] La prueba de cierre de ese ticket tomó el tiempo estimado (±20%).
- [ ] El board refleja el estado real del trabajo en todo momento.
