# API-DIAN

API fiscal intermediaria entre ERPs/integradores y la DIAN (Colombia),
con notificación automática al adquiriente.
Objetivo final: cubrir todos los servicios fiscales DIAN
(factura electrónica, notas crédito/débito, documento soporte, nómina, etc.)
sobre una plataforma multi-tenant.

## Estado actual

Fase F0 — Workflow y foundations · En construcción · No apto para producción

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
- Docker (para `supabase start`)
- GitHub CLI (`gh`) instalado y autenticado

## Setup local

```bash
git clone https://github.com/Abraha33/API-Dian.git
cd API-Dian
git checkout dev
supabase start          # levanta Postgres local con Docker
supabase db push        # aplica migraciones de supabase/migrations/
```

## Estructura del repositorio

```
API-Dian/
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
| F0 | Workflow, foundations y método de trabajo ← estamos aquí |
| F1 | Arquitectura y decisiones iniciales |
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
