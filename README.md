# API-Dian — Middleware SaaS multi-tenant (DIAN Colombia)

**API SaaS multi-tenant** que conecta **ERPs** con la **DIAN** (Colombia) como **middleware B2B**: el cliente **no** integra ERP ↔ DIAN de forma directa en este modelo; el flujo es **ERP → nuestra API → canal de salida DIAN válido → DIAN → respuesta/estado → retorno al ERP** (consulta y/o notificación).

Se usan términos neutros: **canal de salida DIAN**, **integrador API**, **motor de emisión**, **proveedor tecnológico autorizado por la DIAN** (cuando aplique en sentido jurídico y normativo). **Factus** es un **ejemplo** de **integrador API** / canal de salida en la cadena técnica; **no** debe confundirse con **proveedor tecnológico autorizado** en sentido jurídico salvo evidencia contractual y normativa explícita.

**Stack:** **hipótesis** hasta cerrar **[ADR-001](./ADR/ADR-001-stack-tecnologico.md)** (issue de tablero habitualmente etiquetado como **T0.0.1**). Mientras tanto, cualquier lista de tecnologías en este README es **orientativa**, no compromiso.

**Quién construye:** 1 desarrollador + uso intensivo de IA; flujo operativo en [§12](#12-workflow-de-construccion-ia-y-herramientas) y en [docs/workflow.md](./docs/workflow.md).

---

## INDICE

1. [Que es este proyecto](#1-que-es-este-proyecto)
2. [Como leer el tablero Projects](#2-como-leer-el-tablero-projects)
3. [Como operar el tablero dia a dia](#3-como-operar-el-tablero-dia-a-dia)
   - [3.2 Fork vs ramas Git y flujo main / dev](#32-fork-vs-ramas-git-y-flujo-main--dev)
   - [3.3 Roles de desarrollo](#33-roles-de-desarrollo)
4. [Sistema de Labels](#4-sistema-de-labels)
5. [Sistema de Milestones](#5-sistema-de-milestones)
6. [Como leer un Issue](#6-como-leer-un-issue)
7. [Flujo de trabajo semanal](#7-flujo-de-trabajo-semanal)
8. [Reglas del proyecto](#8-reglas-del-proyecto)
9. [Arquitectura del sistema](#9-arquitectura-del-sistema)
10. [Tech Stack (objetivo / ADR)](#10-tech-stack-objetivo--adr)
11. [Decisiones tecnicas pendientes y preguntas abiertas](#11-decisiones-tecnicas-pendientes-y-preguntas-abiertas)
12. [Workflow de construccion (IA y herramientas)](#12-workflow-de-construccion-ia-y-herramientas)
13. [Estimacion, pruebas de cierre y definicion de done](#13-estimacion-pruebas-de-cierre-y-definicion-de-done)
14. [Riesgos estructurales del producto](#14-riesgos-estructurales-del-producto)
15. [Estructura de carpetas](#15-estructura-de-carpetas)
16. [Timeline del proyecto](#16-timeline-del-proyecto)
17. [Glosario](#17-glosario)
18. [Setup inicial y scripts](#18-setup-inicial-y-scripts)

---

## 1. Que es este proyecto

Es una **API de middleware** que conecta ERPs y sistemas de facturación con la **DIAN** (Colombia) a través de un **canal de salida** válido (integrador API / motor de emisión acordado en operación). **No** hay conexión directa ERP–DIAN en el modelo de producto: el middleware concentra validación, orquestación, persistencia de estados y artefactos, e integración hacia el canal.

### Para que sirve

- Las empresas envían documentos fiscales hacia nuestra API (REST u contrato acordado).
- Validamos, encolamos y enviamos al **canal de salida** hacia la DIAN según el **primer canal** elegido en ADR-001 y posteriores decisiones.
- La DIAN acepta o rechaza; persistimos estados, identificadores y, cuando aplique, XML/PDF/respuestas según ADR.
- Notificación y/o consulta hacia el ERP (webhooks salientes, API de estado) según fases del [ROADMAP.md](./ROADMAP.md).
- **Multi-tenant:** aislamiento por cliente (en la hipótesis actual, **RLS** en Supabase — confirmar en ADR-001).

### Modelo de negocio (objetivo)

- SaaS por planes (básico / pro / enterprise).
- Cobro por volumen y límites (fases posteriores: pasarela tipo Stripe, cuotas — ver [ROADMAP.md](./ROADMAP.md) F8).

### Quien lo construye

- 1 desarrollador / founder.
- ~30 h/semana (ajusta a tu realidad).
- Uso intensivo de IA (Perplexity, Cursor, etc. — ver §12).

---

## 2. Como leer el tablero Projects

**Donde:** [github.com/Abraha33/projects](https://github.com/Abraha33/projects) — abre el Project que uses para **API-Dian** (en documentación cruzada con ERP suele citarse el [Project 5](https://github.com/users/Abraha33/projects/5); **verifica el número** en tu cuenta).

**Asignaciones:** en la práctica todo va con **Assignees = [@Abraha33](https://github.com/Abraha33)**. Una vista *Mis items* con `assignee:@me` filtra tu cola.

**Status update:** si el Project tiene campo de texto **Status update** por tarjeta, úsalo para bloqueos y avance. Actívalo en **View** → campos visibles.

**Modo solo dev (ultra-lean):** detalle y vistas en [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md).

### Workflows del Project (recomendado)

No se activan por API; se configuran en **Project → Workflows**. Tabla guía en [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md#workflows-del-project-recomendado).

### Columnas del Kanban (Status)

Orden sugerido: **Icebox** → **Backlog** → **Ready** → **In progress** → **In review** → **Done**. Tabla de significados en [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md#columnas-del-kanban-status).

### Vistas sugeridas

Tabla resumida en [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md#vistas-sugeridas). Incluye **filtros por rol** (`label:role-backend`, etc.) alineados con [docs/ticket-taxonomy.md](./docs/ticket-taxonomy.md).

### Campos personalizados (recomendado en el Project)

| Campo | Uso |
|-------|-----|
| **Status** | Icebox … Done |
| **Priority** | P0–P3 (opcional pero útil) |
| **Fase** | F1–F8 alineadas al [ROADMAP.md](./ROADMAP.md) |
| **Talla** | XS / S / M / L / XL (ver §13) |
| **Riesgo** | Bajo / Medio / Alto |
| **Prueba de cierre** | Texto ejecutable (obligatorio antes de **Ready**) |
| **Size** | Estimación numérica (opcional) |
| **Status update** | Texto corto por tarjeta |
| **Roadmap · inicio / fin** | Si usas vista Roadmap |

Tabla ampliada y alternativas con labels: [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md#campos-personalizados-alineados-al-roadmap).

---

## 3. Como operar el tablero dia a dia

1. **Sprint:** De **Backlog** a **Ready** solo 5-7 tickets para ~2 semanas (no mezclar con Icebox salvo que promuevas la idea).
2. **Trabajar:** **Una** tarjeta en **In progress** (WIP = 1).
3. **Probar:** Cuando el código esté listo, mueve a **In review** y haz self-QA según la **prueba de cierre** del issue (API, CLI, Supabase, E2E cuando existan).
4. **Cerrar:** Si pasa → **Done**; si no → vuelve a **In progress**.
5. **Ideas** sin fecha → **Icebox**; trabajo en roadmap sin sprint → **Backlog**.

### 3.1 Automatizacion CI (repo)

El workflow [.github/workflows/ci.yml](./.github/workflows/ci.yml) corre en **push/PR a `main`**. Sustituye los `echo` por lint y tests reales cuando toque; **opcional:** ampliar disparadores a la rama **`dev`** para alinear con el flujo diario.

*(Opcional futuro: workflow tipo `daily-progress` que sincronice Projects con push/PR — aún no está en este repo.)*

### 3.2 Fork vs ramas Git y flujo main / dev

En GitHub, **fork** es una **copia del repo** bajo otra cuenta u organización; **no** es una rama. Este proyecto vive en el canónico **[Abraha33/API-Dian](https://github.com/Abraha33/API-Dian)**; como solo dev **no necesitas fork** salvo experimentar aislado.

**Ramas oficiales (solo estas dos de larga vida en el remoto):**

| Rama / tipo | Quien la usa | Proposito |
|-------------|--------------|-----------|
| **`main`** | Release | Código **estable** (producción / demo seria). Merge desde `dev` o hotfix excepcional. |
| **`dev`** | Dia a dia | **Integración**: PRs del sprint. Base al empezar una tarea. Debe pasar CI razonablemente. |

**Equivalencia:** en otros equipos la integración se llama `develop`; **aquí es `dev`**.

**Ramas de trabajo:** creadas **desde `dev`**, por tu cuenta. Nombres recomendados: `feature/<rol>-<tema>` o `feature/issue-NNN-desc` (ej. `feature/database-issue-202-rls`). **Vida corta**; un PR → **`dev`**.

**Flujo resumido:** `feature/...` → PR → **`dev`** → (hito) PR **`dev`** → **`main`**.

**Rutina diaria (git):**

```bash
git checkout dev && git pull origin dev
git checkout -b feature/<rol>-<tema>
# commits...
git push -u origin feature/<rol>-<tema>
# PR hacia dev
```

Tras merge, borra la rama de trabajo; al cerrar sprint/hito, integra **`dev`** → **`main`**.

Más detalle: [docs/git-branches.md](./docs/git-branches.md).

### 3.3 Roles de desarrollo

Eres **un solo dev**; los labels **`role-*`** son *sombreros* para enfocar el día en el tablero. **No** confundir con roles de producto en la aplicación (admin de tenant, usuario API, etc.): eso es **RBAC en la app** y se documenta en specs / futuro `CURSOR_CONTEXT` si lo añades.

**Rutina diaria (tablero):**

1. Filtra por **un** `role-*` o abre una vista guardada ([docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md#filtros-por-rol-vistas-por-rol)).
2. Entre tickets **Ready** de ese rol, elige uno (prioriza P0 y dependencias).
3. **Una** tarjeta en **In progress**.
4. Rama desde **`dev`** (§3.2).

**Crear labels en el repo:** `python scripts/ensure_role_labels.py` (o `scripts/create-labels.ps1` en Windows). Requiere [GitHub CLI](https://cli.github.com/) y `gh auth login`.

**Plantillas:** `.github/ISSUE_TEMPLATE/` (una por rol + `ticket.md` genérica).

---

## 4. Sistema de Labels

En **este repo** los labels usan **guión** (`role-backend`, `type-feature`). Coinciden con plantillas y scripts.

**Referencia completa:** [docs/ticket-taxonomy.md](./docs/ticket-taxonomy.md).

| Label (ejemplos) | Uso |
|-------------------|-----|
| **`role-backend`** | API, reglas de negocio, colas, adaptadores hacia **canal de salida DIAN**. |
| **`role-frontend`** | UI (stack según ADR-001), dashboard, documentación visible al cliente. |
| **`role-database`** | Esquema, migraciones, RLS, Supabase (si ADR lo confirma). |
| **`role-devops`** | CI/CD, hosting, secretos, observabilidad. |
| **`role-qa`** | Pruebas, checklists, E2E. |
| **`role-design`** | UX/UI si aplica. |
| **`role-product`** | discovery, priorización, specs. |
| **`role-platform`** | cambios transversales / full-stack con un solo owner. |
| **`type-bug`**, **`type-feature`**, **`type-spike`**, **`type-tech-debt`**, **`type-chore`** | Tipo de trabajo. |

**Regla:** **un** `role-*` principal por issue. Si toca dos capas, elige donde cae **la mayor parte del esfuerzo** y nombra la otra en el cuerpo o con sub-issues.

**Opcional:** labels extra (`MVP`, `Sprint-N`, `phase-f4` …) según [ROADMAP.md](./ROADMAP.md); no están automatizados en scripts aún.

---

## 5. Sistema de Milestones

Alineados con las **fases globales** del [ROADMAP.md](./ROADMAP.md) (F1–F8). Los nombres en GitHub pueden ser, por ejemplo, `F1 — Arquitectura`, `F2 — Plataforma`, etc.

| Milestone sugerido | Contenido (resumen) |
|--------------------|---------------------|
| **F1** | ADR-001 + marco DIAN inicial; límites del monolito modular. |
| **F2** | Plataforma ejecutable: DB, health, async mínimo, CI. |
| **F3** | Multi-tenant, auth consola, empresas, terceros. |
| **F4** | Documento fiscal, motor de emisión, primer **canal de salida**, persistencia de resultados. |
| **F5** | Retorno al ERP: consulta, webhook saliente, API keys según prioridad. |
| **F6** | Operación: logs, DLQ, replay, panel, rate limits, gobierno DIAN operativo. |
| **F7** | Cobertura fiscal ampliada, nómina (según alcance), multi-canal. |
| **F8** | SaaS comercial + escala opcional (Redis/BullMQ, observabilidad avanzada). |

Mapa detallado **orden de producto ↔ F1–F8:** [docs/modules.md](./docs/modules.md).

---

## 6. Como leer un Issue

- **Primer trabajo fundacional del stack:** issue vinculado al cierre de [ADR-001](./ADR/ADR-001-stack-tecnologico.md) (en tablero a menudo **T0.0.1**); ver [ROADMAP.md](./ROADMAP.md).
- **Título:** prefijo claro (`[API]`, `[DB]`, `[CANAL]`, …) o ID interno si unificas con el tablero.
- **Cuerpo:** contexto, **prueba de cierre** explícita, criterios de aceptación, enlaces a PR / epic.
- **Labels:** un **`role-*`** para triage; **`type-*`** según corresponda; opcional **fase F1–F8**.
- **Milestone:** fase ROADMAP o sprint.
- **Project:** tarjeta vinculada con **Status** coherente (ver §2).

---

## 7. Flujo de trabajo semanal

1. **Inicio de sprint:** 5-7 items de Backlog → **Ready** (cada uno con `role-*` y **prueba de cierre**).
2. **Cada día:** elige **rol** → filtra Project → **1** item en **In progress**; rama desde **`dev`**; hasta **In review** antes de coger otro.
3. **Fin de semana:** revisar **Done** y actualizar contexto (README, ROADMAP, `docs/open-questions.md` si aplica).

---

## 8. Reglas del proyecto

- **WIP = 1** en **In progress**.
- **Ramas:** trabajo en **`feature/*`** desde **`dev`**; merge a **`dev`**; **`main`** solo por release o hotfix acordado.
- PRs pequeños; un issue = un PR cuando sea posible.
- No commitear **secrets**; usar `.env` y variables en el hosting (según ADR-001).
- **Decisiones de arquitectura duraderas:** registrar en `ADR/` (ADR-001 stack; **ADR-002** workflow de construcción).
- **Sin prueba de cierre acordada** → el ticket no entra a **Ready** (ver §13).
- Al cerrar un módulo que cambie comportamiento para integradores u operadores, **actualizar documentación** en el repo.

---

## 9. Arquitectura del sistema

> **Hipótesis hasta ADR-001:** la siguiente lista es la **línea base** actual del README; el ADR aprobado puede sustituirla.

- **Cliente:** aplicaciones de empresas consumen la API (API keys / JWT según fase del ROADMAP).
- **Aplicación:** en la hipótesis actual, Next.js 15 (App Router) en Vercel; validación con Zod; resolución de tenant en middleware.
- **Datos:** Supabase PostgreSQL con **RLS** por tenant (si el ADR lo confirma).
- **Asíncrono:** cola y workers según ADR-001; integración mediante **adaptador** al **canal de salida DIAN** (sin acoplar el dominio a un proveedor concreto en el diseño).
- Detalle por fases y módulos: [ROADMAP.md](./ROADMAP.md).

---

## 10. Tech Stack (objetivo / ADR)

**Fuente de verdad:** al cerrar **ADR-001** debe quedar rellenado [ADR-001 — Stack tecnológico](./ADR/ADR-001-stack-tecnologico.md). Hasta entonces, la tabla siguiente es **línea base** para planificar, no compromiso cerrado.

| Capa | Hipótesis actual |
|------|------------------|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Validación | Zod |
| Base de datos | Supabase (PostgreSQL, RLS) |
| Hosting API | Vercel |
| Canal de salida / integrador | Ejemplo comercial: **Factus** como **integrador API**; elección y condición jurídica frente a **proveedor tecnológico autorizado** → cerrar en ADR-001 y diligencia propia |
| CI | GitHub Actions (`.github/workflows/ci.yml`) |

---

## 11. Decisiones tecnicas pendientes y preguntas abiertas

- **Prioridad 0:** cerrar stack en [ADR-001](./ADR/ADR-001-stack-tecnologico.md) (issue **T0.0.1** o equivalente en el Project).
- **Preguntas no cerradas** (stack, canal, contrato ERP): [docs/open-questions.md](./docs/open-questions.md).
- **Cómo trabajamos** (IA, pruebas de cierre): [ADR-002](./ADR/ADR-002-workflow-construccion.md).
- Resto de capacidades por fase: [ROADMAP.md](./ROADMAP.md). Añade más ADRs cuando cierres decisiones grandes distintas al stack.

---

## 12. Workflow de construccion (IA y herramientas)

Resumen del pipeline acordado; el detalle vive en [docs/workflow.md](./docs/workflow.md) y en [ADR-002](./ADR/ADR-002-workflow-construccion.md).

| Herramienta | Rol |
|-------------|-----|
| **Perplexity** | Definición, análisis, arquitectura, investigación, revisión de decisiones. |
| **Cursor** | Implementación sobre archivos reales del repositorio. |
| **CLI** | Ejecución, validación, tests, migraciones, logs (según stack ADR-001). |
| **Supabase** | Backend operativo cuando forme parte del stack: DB, auth, RLS, storage, validación en entorno real. |
| **Docs del repo** | Memoria estable: README, ROADMAP, ADRs, `docs/*`. |

**Flujo por módulo:** definir → aclarar dependencias → documentar decisiones → estimar → **definir prueba de cierre** → implementar → validar (CLI + Supabase) → documentar cambios.

---

## 13. Estimacion, pruebas de cierre y definicion de done

- **Tallas:** XS / S / M / L / XL; **tiempo** en rangos tentativos; **riesgo** Bajo / Medio / Alto.
- **Sin prueba de cierre ejecutable** → el trabajo **no** está listo para construir (no va a **Ready**).
- **Módulo L o XL** → partir en subtareas antes de implementar.
- Criterios completos y **definición de done:** [docs/estimation-and-definition-of-done.md](./docs/estimation-and-definition-of-done.md).
- Por fase agregada (F1–F8): tabla en [ROADMAP.md](./ROADMAP.md) («Resumen por fase»).

---

## 14. Riesgos estructurales del producto

- **Cambios normativos y operativos de la DIAN** y del ecosistema fiscal (validaciones, tipos, plazos, documentación técnica variable).
- **Dependencia de un canal de salida externo** (disponibilidad, coste, cambios de API, condiciones comerciales).
- **Sobrediseño temprano** frente a un solo mantenedor y un MVP fiscal acotado.
- **Deuda operativa** si se posponen panel interno, DLQ, replay y observabilidad.
- **Documentación desactualizada** si los cierres de módulo no se reflejan en el repo.

La línea transversal **Cumplimiento y adaptación DIAN** en el ROADMAP existe para mitigar parte de esto; no elimina el riesgo regulatorio.

---

## 15. Estructura de carpetas

Estado actual del repo (crecerá con el código de la app):

```
API-Dian/
├── ADR/
│   ├── ADR-001-stack-tecnologico.md   # Stack: cerrar con issue fundacional (p. ej. T0.0.1)
│   └── ADR-002-workflow-construccion.md
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── workflows/                    # ci.yml
├── docs/
│   ├── estimation-and-definition-of-done.md
│   ├── GITHUB_PROJECTS.md
│   ├── git-branches.md
│   ├── modules.md
│   ├── open-questions.md
│   ├── ticket-taxonomy.md
│   └── workflow.md
├── scripts/
│   ├── ensure_role_labels.py
│   └── create-labels.ps1
├── README.md
├── ROADMAP.md
└── .gitignore
```

*(Cuando exista la aplicación según ADR-001, añade `src/` o `app/`, `package.json`, etc., y actualiza este árbol.)*

---

## 16. Timeline del proyecto

Referencia alineada al [ROADMAP.md](./ROADMAP.md) (ajusta fechas reales). Las fases **F1–F4** concentran el MVP fiscal; **F5–F6** integración y operación; **F7–F8** diferenciación y monetización.

- **~Mes 1–2** — **F1–F3** hacia **F4** en curso: fundación, plataforma, tenant, primer flujo hacia canal en sandbox.
- **~Mes 2–4** — **F4–F5**: emisión estable y retorno al ERP.
- **~Mes 4–6** — **F6**: operación, DLQ, panel, regresión normativa inicial.
- **~Mes 6+** — **F7**: más tipos documentales, multi-canal.
- **~Mes 9–12** (orientativo) — **F8**: SaaS cobrable y escala opcional.

---

## 17. Glosario

| Término | Significado |
|---------|-------------|
| **DIAN** | Dirección de Impuestos y Aduanas Nacionales (Colombia). |
| **Canal de salida DIAN** | Vía técnica y comercial válida para alcanzar la red fiscal (integrador API, motor de emisión, etc.). |
| **Integrador API** | Proveedor de servicios que expone API hacia la cual nuestra plataforma se adapta; **no** implica por sí solo categoría jurídica de **proveedor tecnológico autorizado**. |
| **Proveedor tecnológico autorizado (DIAN)** | Figura normativa cuando aplique; exige evidencia jurídica y contractual explícita, no se infiere del nombre comercial del integrador. |
| **Factus** | Ejemplo de **integrador API** / referencia de mercado; **no** sinónimo de proveedor tecnológico autorizado salvo acreditación explícita. |
| **Tenant** | Empresa cliente aislada lógicamente (multi-tenant SaaS). |
| **RLS** | Row Level Security en PostgreSQL / Supabase. |
| **PGMQ** | Ejemplo de cola en Postgres/Supabase (hipótesis de stack; confirmar en ADR-001). |
| **MVP** | Producto mínimo que demuestra el flujo acordado en ADR y ROADMAP (p. ej. primer documento válido vía canal en sandbox). |

---

## 18. Setup inicial y scripts

### Clonar y ramas

```bash
git clone https://github.com/Abraha33/API-Dian.git
cd API-Dian
git checkout dev
git pull origin dev
```

### Labels en GitHub

```bash
python scripts/ensure_role_labels.py
```

Windows (PowerShell): `.\scripts\create-labels.ps1`

### Scripts / CI (tabla)

| Artefacto | Uso |
|-----------|-----|
| [scripts/ensure_role_labels.py](./scripts/ensure_role_labels.py) | Crea labels `role-*` y `type-*` (idempotente con `gh`). |
| [scripts/create-labels.ps1](./scripts/create-labels.ps1) | Lo mismo en PowerShell. |
| [.github/workflows/ci.yml](./.github/workflows/ci.yml) | CI en push/PR a `main` (placeholder hasta añadir lint/test). |

### Documentacion

- [ADR/ADR-001-stack-tecnologico.md](./ADR/ADR-001-stack-tecnologico.md) — Stack (**cerrar** con trabajo fundacional del tablero).
- [ADR/ADR-002-workflow-construccion.md](./ADR/ADR-002-workflow-construccion.md) — Workflow con IA.
- [ROADMAP.md](./ROADMAP.md) — Fases F1–F8, módulos, estimación por fase.
- [docs/modules.md](./docs/modules.md) — Orden de construcción ↔ fases.
- [docs/workflow.md](./docs/workflow.md) — Flujo detallado Perplexity → Cursor → CLI → Supabase.
- [docs/estimation-and-definition-of-done.md](./docs/estimation-and-definition-of-done.md) — Tallas, riesgo, prueba de cierre, DoD.
- [docs/open-questions.md](./docs/open-questions.md) — Hipótesis y pendientes.
- [docs/ticket-taxonomy.md](./docs/ticket-taxonomy.md) — Labels y tableros por rol.
- [docs/git-branches.md](./docs/git-branches.md) — `main`, `dev`, `feature/*`.
- [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md) — Tablero solo dev, vistas, workflows, campos ROADMAP.
