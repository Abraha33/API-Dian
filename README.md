# API-Dian - Factura SaaS API

API SaaS multi-tenant para facturacion electronica DIAN Colombia.
Stack: Next.js 15 + Supabase + Zod + Vercel + Factus.

---

## Workflow en este repo (roles / ramas)

- **Tickets por rol:** [docs/ticket-taxonomy.md](./docs/ticket-taxonomy.md) — labels `role-*`, tableros por rol.
- **Ramas Git:** `dev` + `area/<rol>` — [docs/git-branches.md](./docs/git-branches.md).
- **Plantillas de issue por rol:** `.github/ISSUE_TEMPLATE/` (ademas de la plantilla generica del repo).
- **Labels en GitHub:** `scripts/create-labels.ps1` (requiere [GitHub CLI](https://cli.github.com/)).

---

# INDICE
1. [Que es este proyecto](#1-que-es-este-proyecto)
2. [Como leer el tablero Projects](#2-como-leer-el-tablero-projects)
3. [Como operar el tablero dia a dia](#3-como-operar-el-tablero-dia-a-dia)
4. [Sistema de Labels](#4-sistema-de-labels)
5. [Sistema de Milestones](#5-sistema-de-milestones)
6. [Como leer un Issue](#6-como-leer-un-issue)
7. [Flujo de trabajo semanal](#7-flujo-de-trabajo-semanal)
8. [Reglas del proyecto](#8-reglas-del-proyecto)
9. [Arquitectura del sistema](#9-arquitectura-del-sistema)
10. [Tech Stack confirmado](#10-tech-stack-confirmado)
11. [Decisiones tecnicas pendientes](#11-decisiones-tecnicas-pendientes)
12. [Estados de una factura](#12-estados-de-una-factura)
13. [Estructura de carpetas](#13-estructura-de-carpetas)
14. [Timeline del proyecto](#14-timeline-del-proyecto)
15. [Glosario](#15-glosario)

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

El tablero esta en: github.com/Abraha33/projects

### Las 4 columnas del Kanban

Define en Projects las columnas que uses (por ejemplo: **Por hacer**, **En progreso**, **En revision**, **Hecho**). Los issues se filtran por labels segun [docs/ticket-taxonomy.md](./docs/ticket-taxonomy.md).

---

## Documentacion adicional del repositorio

- [ROADMAP.md](./ROADMAP.md) — tickets de desarrollo
- [docs/ticket-taxonomy.md](./docs/ticket-taxonomy.md) — roles, labels y tableros
- [docs/git-branches.md](./docs/git-branches.md) — `main`, `dev`, `area/*`
