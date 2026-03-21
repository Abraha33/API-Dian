# API-Dian - Factura SaaS API

API SaaS multi-tenant para facturacion electronica DIAN Colombia.
Stack: Next.js 15 + Supabase + Zod + Vercel + Factus.

---

# INDICE
1. [Que es este proyecto](#1-que-es-este-proyecto)
2. [Como leer el tablero Projects](#2-como-leer-el-tablero-projects)
3. [Fork, ramas Git y flujo main / dev](#3-fork-ramas-git-y-flujo-main--dev)
4. [Roles de desarrollo y rutina en el tablero](#4-roles-de-desarrollo-y-rutina-en-el-tablero)
5. [Documentacion del repo](#5-documentacion-del-repo)

---

## 1. Que es este proyecto

Es una API de middleware que conecta sistemas de facturacion de empresas
con la DIAN (entidad fiscal de Colombia) a traves del proveedor Factus.

### Para que sirve
- Empresas envian sus facturas a nuestra API
- Nosotros las procesamos, validamos y enviamos a la DIAN
- La DIAN las acepta o rechaza
- Notificamos el resultado a la empresa

### Modelo de negocio
- SaaS: cobro mensual por plan (basico / pro / enterprise)
- Cada empresa es un "tenant" aislado
- Cobramos por cantidad de facturas enviadas al mes

### Quien lo construye
- 1 desarrollador
- 30 horas semanales
- Uso intensivo de IA (Cursor, ChatGPT)

---

## 2. Como leer el tablero Projects

El tablero esta en: [github.com/Abraha33/projects](https://github.com/Abraha33/projects)

Define columnas (por ejemplo: **Por hacer**, **En progreso**, **En revision**, **Hecho**). Filtra issues por labels `role-*` y `type-*` segun [docs/ticket-taxonomy.md](./docs/ticket-taxonomy.md). Vistas guardadas: [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md).

---

## 3. Fork, ramas Git y flujo main / dev

### 3.1 Fork vs ramas

En GitHub, **fork** es una copia del repo bajo otra cuenta u organizacion (para contribuir con PRs desde afuera). **No es una rama.**

Este proyecto se desarrolla en el repo canonico **[Abraha33/API-Dian](https://github.com/Abraha33/API-Dian)**. Como solo hay un dev, **no necesitas un fork** salvo que quieras experimentar aislado en otra cuenta.

### 3.2 Ramas oficiales (solo estas dos en el remoto)

| Rama / tipo | Quien la usa | Proposito |
|-------------|----------------|-----------|
| `main` | Release | Codigo estable alineado a produccion o demo seria. Solo entra con merge desde `dev` (o hotfix excepcional). |
| `dev` | Dia a dia | Integracion: aqui van los PRs del sprint. Es la base al actualizar al empezar una tarea nueva. Debe compilar y pasar CI razonablemente. |

En otros equipos la rama de integracion se llama `develop`; **aqui esa funcion la cumple `dev`.**

### 3.3 Ramas de trabajo (tu eleccion)

No hay ramas fijas por rol en el remoto. Las creas **tu** desde `dev` cuando abres un ticket:

- Nombre recomendado: `feature/<rol>-<tema>` o `feature/issue-NNN-desc`  
  Ejemplos: `feature/database-issue-202-rls`, `feature/frontend-login`
- Vida corta: un PR → `dev`; despues borra la rama local y remota.

**Flujo resumido:** `feature/...` → PR → **`dev`** → (al cerrar hito) PR **`dev`** → **`main`**.

### 3.4 Rutina diaria (git)

```bash
git checkout dev
git pull origin dev
git checkout -b feature/<rol>-<tema>
# ... commits ...
git push -u origin feature/<rol>-<tema>
# Abre PR hacia dev en GitHub
```

Tras merge en `dev`, borra la rama de trabajo. Al cerrar sprint u hito, integra `dev` → `main` con PR.

---

## 4. Roles de desarrollo y rutina en el tablero

Eres un solo dev: los labels **`role-*`** (frontend, database, etc.) son **sombreros** para enfocar el dia en el tablero. **No** son lo mismo que roles de producto en la aplicacion (administrador, encargado, empleado): eso seria **RBAC en la app** y se documenta aparte si aplica.

**Rutina diaria (tablero):**

1. En el Project, filtra por un label `role-*` (o abre una vista guardada; ver [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md)).
2. Entre tickets *Ready* con ese rol, elige uno (prioriza P0 / dependencias).
3. Mueve **una** tarjeta a *In progress* (WIP = 1).
4. Abre la rama de trabajo desde `dev` (§3.4).
5. Cada ticket deberia tener un **`role-*` principal** y, si aplica, **`type-*`**; tabla en [docs/ticket-taxonomy.md](./docs/ticket-taxonomy.md).

**Crear labels en el repo:**

```bash
python scripts/ensure_role_labels.py
```

(Requiere [GitHub CLI](https://cli.github.com/) y `gh auth login`. Alternativa Windows: `scripts/create-labels.ps1`.)

**Plantillas de issue por rol:** `.github/ISSUE_TEMPLATE/`.

---

## 5. Documentacion del repo

- [ROADMAP.md](./ROADMAP.md) — tickets de desarrollo
- [docs/ticket-taxonomy.md](./docs/ticket-taxonomy.md) — labels `role-*`, `type-*`, tableros
- [docs/git-branches.md](./docs/git-branches.md) — solo `main` y `dev` + ramas de trabajo
- [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md) — vistas por rol en Projects
