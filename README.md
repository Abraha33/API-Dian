# API-Dian — Factura SaaS API

API SaaS **multi-tenant** para facturacion electronica **DIAN Colombia**. Middleware entre sistemas de facturacion de empresas y la DIAN via proveedor **Factus**.

**Stack (hipotesis hasta cerrar ticket T0.0.1):** Next.js 15 · Supabase (PostgreSQL) · Zod · Vercel · Factus API. La **primera tarea** del roadmap es **definir y congelar** el stack en [ADR-001](./ADR/ADR-001-stack-tecnologico.md) — ver [ROADMAP.md](./ROADMAP.md) **T0.0.1**.

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
11. [Decisiones tecnicas pendientes](#11-decisiones-tecnicas-pendientes)
12. [Estrategia de construccion](#12-estrategia-de-construccion)
13. [Estructura de carpetas](#13-estructura-de-carpetas)
14. [Timeline del proyecto](#14-timeline-del-proyecto)
15. [Glosario](#15-glosario)
16. [Setup inicial y scripts](#16-setup-inicial-y-scripts)

---

## 1. Que es este proyecto

Es una **API de middleware** que conecta ERPs y sistemas de facturacion con la **DIAN** (Colombia) a traves de **Factus**.

### Para que sirve

- Las empresas envian facturas a nuestra API (REST).
- Validamos, encolamos y enviamos a la DIAN via Factus.
- La DIAN acepta o rechaza; persistimos estados y notificamos (webhooks / futuras notificaciones).
- **Multi-tenant:** cada empresa aislada (RLS en Supabase).

### Modelo de negocio (objetivo)

- SaaS por planes (basico / pro / enterprise).
- Cobro por volumen de facturas (fases posteriores: Stripe, cuotas — ver [ROADMAP.md](./ROADMAP.md)).

### Quien lo construye

- 1 desarrollador / founder.
- ~30 h/semana (ajusta a tu realidad).
- Uso intensivo de IA (Cursor, ChatGPT, etc.).

---

## 2. Como leer el tablero Projects

**Donde:** [github.com/Abraha33/projects](https://github.com/Abraha33/projects) — abre el Project que uses para **Factura SaaS / API-Dian** (en documentacion cruzada con ERP suele citarse el [Project 5](https://github.com/users/Abraha33/projects/5); **verifica el numero** en tu cuenta).

**Asignaciones:** en la practica todo va con **Assignees = [@Abraha33](https://github.com/Abraha33)**. Una vista *Mis items* con `assignee:@me` filtra tu cola.

**Status update:** si el Project tiene campo de texto **Status update** por tarjeta, usalo para bloqueos y avance. Activalo en **View** → campos visibles.

**Modo solo dev (ultra-lean):** detalle y vistas en [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md).

### Workflows del Project (recomendado)

No se activan por API; se configuran en **Project → Workflows**. Tabla guia en [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md#workflows-del-project-recomendado).

### Columnas del Kanban (Status)

Orden sugerido: **Icebox** → **Backlog** → **Ready** → **In progress** → **In review** → **Done**. Tabla de significados en [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md#columnas-del-kanban-status).

### Vistas sugeridas

Tabla resumida en [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md#vistas-sugeridas). Incluye **filtros por rol** (`label:role-backend`, etc.) alineados con [docs/ticket-taxonomy.md](./docs/ticket-taxonomy.md).

### Campos personalizados (recomendado en el Project)

| Campo | Uso |
|-------|-----|
| **Status** | Icebox … Done |
| **Priority** | P0–P3 (opcional pero util) |
| **Size** | Estimacion numerica (opcional) |
| **Status update** | Texto corto por tarjeta |
| **Roadmap · inicio / fin** | Si usas vista Roadmap |

---

## 3. Como operar el tablero dia a dia

1. **Sprint:** De **Backlog** a **Ready** solo 5-7 tickets para ~2 semanas (no mezclar con Icebox salvo que promuevas la idea).
2. **Trabajar:** **Una** tarjeta en **In progress** (WIP = 1).
3. **Probar:** Cuando el codigo este listo, mueve a **In review** y haz self-QA (API, Postman, E2E cuando existan).
4. **Cerrar:** Si pasa → **Done**; si no → vuelve a **In progress**.
5. **Ideas** sin fecha → **Icebox**; trabajo en roadmap sin sprint → **Backlog**.

### 3.1 Automatizacion CI (repo)

El workflow [.github/workflows/ci.yml](./.github/workflows/ci.yml) corre en **push/PR a `main`**. Cuando el proyecto crezca, sustituye los `echo` por lint y tests reales; opcional: ampliar ramas a `dev`.

*(Opcional futuro: un workflow tipo `daily-progress` que sincronice Projects con push/PR — como en ERP Satelite; aun no esta en este repo.)*

### 3.2 Fork vs ramas Git y flujo main / dev

En GitHub, **fork** es una **copia del repo** bajo otra cuenta u organizacion; **no** es una rama. Este proyecto vive en el canonico **[Abraha33/API-Dian](https://github.com/Abraha33/API-Dian)**; como solo dev **no necesitas fork** salvo experimentar aislado.

**Ramas oficiales (solo estas dos de larga vida en el remoto):**

| Rama / tipo | Quien la usa | Proposito |
|-------------|--------------|-----------|
| **`main`** | Release | Codigo **estable** (produccion / demo seria). Merge desde `dev` o hotfix excepcional. |
| **`dev`** | Dia a dia | **Integracion**: PRs del sprint. Base al empezar una tarea. Debe pasar CI razonablemente. |

**Equivalencia:** en otros equipos la integracion se llama `develop`; **aqui es `dev`**.

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

Mas detalle: [docs/git-branches.md](./docs/git-branches.md).

### 3.3 Roles de desarrollo

Eres **un solo dev**; los labels **`role-*`** son *sombreros* para enfocar el dia en el tablero. **No** confundir con roles de producto en la aplicacion (admin de tenant, usuario API, etc.): eso es **RBAC en la app** y se documenta en specs / futuro `CURSOR_CONTEXT` si lo anades.

**Rutina diaria (tablero):**

1. Filtra por **un** `role-*` o abre una vista guardada ([docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md#filtros-por-rol-vistas-por-rol)).
2. Entre tickets **Ready** de ese rol, elige uno (prioriza P0 y dependencias).
3. **Una** tarjeta en **In progress**.
4. Rama desde **`dev`** (§3.2).

**Crear labels en el repo:** `python scripts/ensure_role_labels.py` (o `scripts/create-labels.ps1` en Windows). Requiere [GitHub CLI](https://cli.github.com/) y `gh auth login`.

**Plantillas:** `.github/ISSUE_TEMPLATE/` (una por rol + `ticket.md` generica).

---

## 4. Sistema de Labels

En **este repo** los labels usan **guion** (`role-backend`, `type-feature`). Es el mismo concepto que `role/frontend` o `tipo/feature` en el ERP; aqui se eligio guion para coincidir con las plantillas y scripts.

**Referencia completa:** [docs/ticket-taxonomy.md](./docs/ticket-taxonomy.md).

| Label (ejemplos) | Uso |
|-------------------|-----|
| **`role-backend`** | API, reglas de negocio, colas, integracion Factus. |
| **`role-frontend`** | UI Next.js, dashboard, documentacion visible al cliente. |
| **`role-database`** | Schema, migrations, RLS, SQL, Supabase. |
| **`role-devops`** | CI/CD, Vercel, secrets, observabilidad. |
| **`role-qa`** | Pruebas, checklists, E2E. |
| **`role-design`** | UX/UI si aplica. |
| **`role-product`** | discovery, priorizacion, specs. |
| **`role-platform`** | cambios transversales / full-stack con un solo owner. |
| **`type-bug`**, **`type-feature`**, **`type-spike`**, **`type-tech-debt`**, **`type-chore`** | Tipo de trabajo (complementa al rol). |

**Regla:** **un** `role-*` principal por issue. Si toca dos capas, elige donde cae **la mayor parte del esfuerzo** y nombra la otra en el cuerpo o con sub-issues.

**Opcional:** puedes anadir labels extra (`MVP`, `Sprint-N`, `fase-0` …) en GitHub segun [ROADMAP.md](./ROADMAP.md); no estan automatizados en scripts aun.

---

## 5. Sistema de Milestones

Alineados con fases del [ROADMAP.md](./ROADMAP.md):

| Milestone sugerido | Contenido |
|--------------------|-----------|
| **Fase 0** | **Definicion stack (T0.0.1 + ADR-001)**, repo, Next, Supabase, CI, health. |
| **Fase 1** | MVP funcional (auth, tenant, facturas, cola, Factus sandbox, E2E basico). |
| **Fase 2** | Estabilidad (logs, api keys, rate limit, reintentos). |
| **Fase 3** | Diferenciacion (multi-proveedor, circuit breaker). |
| **Fase 4** | SaaS monetizable (Stripe, cuotas, notificaciones, OpenAPI). |
| **Fase 5** | Escalamiento opcional (BullMQ, observabilidad avanzada). |

---

## 6. Como leer un Issue

- **Primer ticket del producto:** **T0.0.1** — definicion del tech stack y cierre de [ADR-001](./ADR/ADR-001-stack-tecnologico.md) (ver [ROADMAP](./ROADMAP.md)).
- **Titulo:** prefijo claro (`[API]`, `[DB]`, `[Factus]`, …) o ID de ticket si unificas con ROADMAP (`T0.0.1`, `T1.2.1`, etc.).
- **Cuerpo:** contexto, criterios de aceptacion, enlaces a PR / epic.
- **Labels:** un **`role-*`** para triage; **`type-*`** segun corresponda.
- **Milestone:** fase o sprint.
- **Project:** tarjeta vinculada con **Status** coherente (ver §2).

*(Si mas adelante adoptas convencion estricta tipo `[T##]` / `[E##-S##-##]` como en ERP, anade un doc en `docs/` y enlazalo aqui.)*

---

## 7. Flujo de trabajo semanal

1. **Inicio de sprint:** 5-7 items de Backlog → **Ready** (cada uno con `role-*`).
2. **Cada dia:** elige **rol** → filtra Project → **1** item en **In progress**; rama desde **`dev`**; hasta **In review** antes de coger otro.
3. **Fin de semana:** revisar **Done** y actualizar notas de contexto (README, ROADMAP, o doc de contexto IA si lo creas).

---

## 8. Reglas del proyecto

- **WIP = 1** en **In progress**.
- **Ramas:** trabajo en **`feature/*`** desde **`dev`**; merge a **`dev`**; **`main`** solo por release o hotfix acordado.
- PRs pequenos; un issue = un PR cuando sea posible.
- No commitear **secrets**; usar `.env` y variables en Vercel/Supabase.
- Decisiones de arquitectura grandes: considera ADR en carpeta `ADR/` (opcional; aun no obligatorio en este repo).

---

## 9. Arquitectura del sistema

- **Cliente:** apps de empresas consumen REST API (API keys / JWT segun fase).
- **App:** Next.js 15 (App Router) en Vercel; validacion Zod; middleware tenant.
- **Datos:** Supabase PostgreSQL con **RLS** por tenant.
- **Asincrono:** cola (PGMQ / Edge Functions en roadmap); integracion **Factus** para DIAN.
- Detalle de tickets y tecnologias: [ROADMAP.md](./ROADMAP.md).

---

## 10. Tech Stack (objetivo / ADR)

**Fuente de verdad:** al cerrar el ticket **T0.0.1** en [ROADMAP.md](./ROADMAP.md) debe quedar rellenado [ADR-001 — Stack tecnologico](./ADR/ADR-001-stack-tecnologico.md). Hasta entonces, la tabla siguiente es **linea base** para planificar, no un compromiso cerrado.

| Capa | Hipotesis actual |
|------|------------------|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Validacion | Zod |
| Base de datos | Supabase (PostgreSQL 16, RLS) |
| Hosting API | Vercel |
| Proveedor fiscal | Factus (DIAN) |
| CI | GitHub Actions (`.github/workflows/ci.yml`) |

---

## 11. Decisiones tecnicas pendientes

- **Prioridad 0:** cerrar stack en [ADR-001](./ADR/ADR-001-stack-tecnologico.md) (**T0.0.1**).
- Resto: [ROADMAP.md](./ROADMAP.md) (multi-proveedor, Stripe, BullMQ, etc.). Puedes anadir mas ADRs en `ADR/` cuando cierres decisiones grandes.

---

## 12. Estrategia de construccion

| Fase | Nombre | Enfoque |
|------|--------|---------|
| 0 | Fundacion | **T0.0.1 stack (ADR)**, repo, CI, health |
| 1 | MVP | Primera factura DIAN real via Factus |
| 2 | Estabilidad | Logs, auth dual, rate limits |
| 3 | Diferenciacion | Segundo proveedor, resiliencia |
| 4 | SaaS | Billing, cuotas, notificaciones |
| 5 | Escala | Colas premium, observabilidad enterprise (opcional) |

---

## 13. Estructura de carpetas

Estado actual del repo (crecera con el codigo de la app):

```
API-Dian/
├── ADR/
│   └── ADR-001-stack-tecnologico.md   # Stack: completar con T0.0.1
├── .github/
│   ├── ISSUE_TEMPLATE/     # Plantillas por rol + ticket generico
│   └── workflows/        # ci.yml
├── docs/
│   ├── GITHUB_PROJECTS.md
│   ├── git-branches.md
│   └── ticket-taxonomy.md
├── scripts/
│   ├── ensure_role_labels.py
│   └── create-labels.ps1
├── README.md
├── ROADMAP.md
└── .gitignore
```

*(Cuando exista la app Next.js, anade `src/` o `app/`, `package.json`, etc., y actualiza este arbol.)*

---

## 14. Timeline del proyecto

Referencia alineada al ROADMAP (ajusta fechas reales):

- **~Mes 2** — MVP vendible (primera factura DIAN real).
- **~Mes 4-5** — Estabilidad operativa.
- **~Mes 6-8** — Diferenciacion proveedores.
- **~Mes 9-12** — SaaS cobrable.
- **~Mes 13-15** — Escalamiento opcional.

---

## 15. Glosario

| Termino | Significado |
|---------|-------------|
| **DIAN** | Direccion de Impuestos y Aduanas Nacionales (Colombia). |
| **Factus** | Proveedor tecnologico para envio de documentos electronicos a la DIAN. |
| **Tenant** | Empresa cliente aislada logicamente (multi-tenant SaaS). |
| **RLS** | Row Level Security en PostgreSQL / Supabase. |
| **PGMQ** | Cola basada en Postgres en Supabase (roadmap). |
| **MVP** | Producto minimo vendible (primera factura valida end-to-end). |

---

## 16. Setup inicial y scripts

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
| [.github/workflows/ci.yml](./.github/workflows/ci.yml) | CI en push/PR a `main` (placeholder hasta anadir lint/test). |

### Documentacion

- [ADR/ADR-001-stack-tecnologico.md](./ADR/ADR-001-stack-tecnologico.md) — Stack (primer entregable **T0.0.1**)
- [ROADMAP.md](./ROADMAP.md) — Tickets y fases
- [docs/ticket-taxonomy.md](./docs/ticket-taxonomy.md) — Labels y tableros por rol
- [docs/git-branches.md](./docs/git-branches.md) — `main`, `dev`, `feature/*`
- [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md) — Tablero solo dev, vistas, workflows sugeridos
