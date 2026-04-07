# API-DIAN

API fiscal intermediaria entre ERPs/integradores y la DIAN (Colombia),
con notificación automática al adquiriente.
Objetivo final: cubrir todos los servicios fiscales DIAN
(factura electrónica, notas crédito/débito, documento soporte, nómina, etc.)
sobre una plataforma multi-tenant.

## Estado actual

- **F0** — Workflow y foundations (docs, plantillas, validación Supabase CLI).
- **F1** — Arquitectura inicial: app **NestJS + Fastify** en `apps/api/` según [ADR-001](./ADR/ADR-001-stack-tecnologico.md) y [ADR-002](./ADR/ADR-002-estructura-modulos.md). No apto para producción.

## Flujo de alto nivel

```
Integrador ──JSON──▶ [API-DIAN] ──XML UBL──▶ DIAN
                         │◀────────────────── Respuesta DIAN
                         │──JSON──▶ Integrador
                         └──XML/PDF por email──▶ Adquiriente
```

## Requisitos previos

- Node.js 20+
- Supabase CLI instalado globalmente
- Docker y Docker Compose (Supabase CLI y/o `docker-compose.dev.yml`)
- GitHub CLI (`gh`) instalado y autenticado

## Setup local

### API NestJS (`apps/api`)

```bash
git clone https://github.com/Abraha33/API-Dian.git
cd API-Dian
git checkout dev
cd apps/api
cp .env.example .env   # completar valores locales
npm ci
npm run build
npm run start:dev
```

Comprueba: `GET http://localhost:3000/health` y `GET http://localhost:3000/ready`.

### Docker Compose (Postgres + Redis + MinIO + app)

En la raíz del repo:

```bash
docker compose -f docker-compose.dev.yml up -d
```

La app en contenedor usa variables inyectadas en el compose (ver `docker-compose.dev.yml`). Para desarrollo en máquina host suele ser más cómodo levantar solo **supabase-db**, **redis** y **minio** y ejecutar `npm run start:dev` en `apps/api` con un `.env` alineado a `apps/api/.env.example`.

### Supabase (esquema versionado del repo)

```bash
supabase start
supabase db push        # aplica migraciones de supabase/migrations/
```

## Estructura del repositorio

```
API-Dian/
├── apps/
│   └── api/             ← Aplicación NestJS + Fastify (F1+)
├── .cursor/             ← Reglas de Cursor
├── .github/             ← Issue templates y CI
├── ADR/                 ← Decisiones de arquitectura
├── docs/                ← Workflow, agentes, plantillas y ejemplos
├── scripts/             ← Labels, introspección SQL, utilidades
└── supabase/            ← Configuración y migraciones de Supabase
```

## Roadmap

El proyecto se organiza en fases F0–F8:

| Fase | Descripción |
|------|-------------|
| F0 | Workflow, foundations y método de trabajo |
| F1 | Arquitectura y decisiones iniciales ← app base en `apps/api/` |
| F2 | Núcleo de plataforma (app base, colas, health) |
| F3 | Tenant, identidad y maestros |
| F4 | Documento fiscal, emisión DIAN y primer canal |
| F5 | Retorno al ERP (consultas y webhooks) |
| F6 | Operación, confiabilidad y gobierno DIAN |
| F7 | Cobertura fiscal ampliada y multi-canal |
| F8 | SaaS comercial y escala |

Detalle completo en [`ROADMAP.md`](./ROADMAP.md).

## Flujo de trabajo

El flujo completo está en [`docs/workflow.md`](./docs/workflow.md).
Resumen en 8 pasos:

1. Idea → Issue en GitHub con labels `role-*`, `type-*`, talla y riesgo.
2. Estimación de talla (XS–XL) y riesgo (Bajo/Medio/Alto).
3. Diseño con Perplexity usando los prompts de `docs/agents/`.
4. Implementación en rama `feature/<rol>/<issue-n>-slug` con Cursor.
5. Migraciones de base de datos con Supabase CLI (si aplica).
6. Evidencia documentada en el issue.
7. PR hacia `dev` con CI verde.
8. Merge a `dev` y cierre del issue.

## Contribuir

1. Crear un issue con:
   - Labels `role-*`, `type-*`, `size-*`, `priority-*`
   - Talla (XS–XL) y riesgo (Bajo/Medio/Alto)
   - Prueba de cierre al final del body
2. Crear rama `feature/<rol>/<issue-n>-slug` desde `dev`.
3. Implementar cambios usando Cursor.
4. Si hay cambios de base de datos, usar Supabase CLI.
5. Abrir PR hacia `dev` con prueba de cierre completada.

## Herramientas y agentes

| Herramienta | Uso principal |
|-------------|---------------|
| Perplexity | Diseño, estimación, modelado SQL, debug |
| Cursor | Implementación en ramas `feature/...` |
| Supabase CLI | Migraciones en `supabase/migrations/` |
| GitHub | Issues, Projects, PRs, Milestones |
