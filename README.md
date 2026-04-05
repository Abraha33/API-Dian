# API-DIAN

API fiscal intermediaria entre ERPs/integradores y la DIAN (Colombia), con notificación automática al adquiriente.

## Estado actual

Fase inicial de arquitectura · En exploración · No apto para producción

Sin código de negocio definitivo todavía. Fases, tickets y stack (hipótesis hasta **T0.0.1**): [ROADMAP.md](./ROADMAP.md) · [ADR/ADR-001-stack-tecnologico.md](./ADR/ADR-001-stack-tecnologico.md)

## Flujo de alto nivel

```
Integrador ──JSON──▶ [API-DIAN] ──XML UBL──▶ DIAN
                         │◀────────────────── Respuesta DIAN
                         │──JSON──▶ Integrador
                         └──XML/PDF por email──▶ Adquiriente
```

## Requisitos y setup local

- **Git** para clonar y trabajar con ramas.
- **Opcional:** [Supabase CLI](https://supabase.com/docs/guides/cli) si usas la carpeta `supabase/` (p. ej. `config.toml`).

```bash
git clone https://github.com/Abraha33/API-Dian.git
cd API-Dian
git checkout dev
git pull origin dev
```

Cuando exista la aplicación (`package.json`, runtime, etc.), el setup concreto se documentará aquí o en `docs/` según el ADR.

## Resumen del workflow

- Ramas largas: **`main`** (estable) y **`dev`** (integración).
- Trabajo: **`feature/...`** desde **`dev`** → PR a **`dev`**; **`main`** en releases u hitos acordados.
- Issues y tablero: [docs/GITHUB_PROJECTS.md](./docs/GITHUB_PROJECTS.md) · [docs/ticket-taxonomy.md](./docs/ticket-taxonomy.md).
- **Milestones en GitHub:** no por ahora; la priorización está en el roadmap y el Project.

Más detalle Git: [docs/git-branches.md](./docs/git-branches.md).

## Cómo contribuir

1. Abre o elige un issue alineado al roadmap; conviene una tarea en curso a la vez.
2. Crea `feature/<tema>` desde `dev`, commits claros y un PR pequeño hacia `dev`.
3. No subas secretos (`.env`, claves). Revisa CI: [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).
4. Cambios de base de datos: migraciones en `supabase/migrations/` cuando existan; no duplicar esquema a mano sin acuerdo.

## Más en el repo

- [docs/examples/](./docs/examples/) — plantillas (issue, migración, cierre).
- Labels opcionales: `python scripts/ensure_role_labels.py` o `scripts/create-labels.ps1` (con [GitHub CLI](https://cli.github.com/) autenticado).
