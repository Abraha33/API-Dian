# API-Dian - Factura SaaS API

API SaaS multi-tenant para facturacion electronica DIAN Colombia.
Stack: Next.js 15 + Supabase + Zod + Vercel + Factus.

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


#!/bin/bash
export PATH="$PATH:/c/Program Files/GitHub CLI"

USERNAME="Abraha33"
REPO_NAME="API-Dian"

if [ -d "$REPO_NAME" ]; then rm -rf "$REPO_NAME"; fi
git clone "https://github.com/$USERNAME/$REPO_NAME.git"
cd "$REPO_NAME"

# DESCRIPCION DEL REPO
gh repo edit "$USERNAME/$REPO_NAME" \
  --description "API SaaS multi-tenant para facturacion electronica DIAN Colombia. Next.js 15 + Supabase + Zod + Vercel + Factus. MVP en 8 semanas." \
  --homepage "https://api-dian.vercel.app" \
  --add-topic "nextjs" \
  --add-topic "supabase" \
  --add-topic "facturacion-electronica" \
  --add-topic "dian" \
  --add-topic "colombia" \
  --add-topic "saas" \
  --add-topic "api" \
  --add-topic "typescript"

# README
cat > README.md << 'README'
# API-Dian

API SaaS multi-tenant para facturacion electronica DIAN en Colombia.
Conecta sistemas de facturacion de empresas con la DIAN a traves de Factus.

## Que hace
- Recibe facturas via REST API
- Las valida, procesa y envia a la DIAN
- Notifica el resultado (aceptada / rechazada)
- Multi-empresa con aislamiento total de datos

## Stack
Next.js 15 · Supabase PostgreSQL · Zod · Vercel · Factus API

## Documentacion
- [ROADMAP.md](./ROADMAP.md) — 50+ tickets de desarrollo
- [DECISIONS.md](./DECISIONS.md) — Decisiones tecnicas pendientes

## Timeline
- **Mes 2** — MVP vendible (primera factura DIAN real)
- **Mes 9** — SaaS cobrable (Stripe + dashboard)
- **Mes 14** — Enterprise (BullMQ + observabilidad)
