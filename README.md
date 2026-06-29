# API-DIAN

## Estado del proyecto

API-Dian está en fase de **modelo experimental**.

El objetivo inmediato no es construir todavía toda la plataforma fiscal completa, sino validar el modelo de trabajo, la arquitectura inicial, los agentes, el manejo de errores, los paquetes, la operación mínima y la forma en que el mercado recibe la propuesta.

## Enfoque actual corregido

API-Dian está en **F0: consolidación del modelo experimental**.

El objetivo inmediato **no** es construir la API DIAN completa.

El objetivo inmediato es:

1. Consolidar la documentación del modelo.
2. Definir hipótesis de mercado.
3. Diseñar una prueba de fogueo usando canales como Meta Ads, Facebook Ads, landing page, WhatsApp y entrevistas.
4. Construir solo lo mínimo necesario para probar recepción real.
5. Diagnosticar si el modelo puede ser rentable y mantenible por una sola persona.
6. Decidir qué servicios DIAN conviene construir primero.

La construcción inicial no es el producto final.
La construcción inicial es una herramienta para aprender del mercado.

### Pregunta central del proyecto

```text
¿Puede una sola persona construir, vender, operar y mantener una API DIAN rentable,
con servicios limitados, en el mercado actual?
```

Pregunta secundaria:

```text
¿Qué habría que cambiar en el modelo para que eso sí sea posible?
```

Documentos clave de esta fase:

- [`docs/modelo-experimental.md`](./docs/modelo-experimental.md) — define qué significa “modelo” en este proyecto y cómo se trabaja.
- [`docs/prueba-fogueo-mercado.md`](./docs/prueba-fogueo-mercado.md) — define cómo probar la recepción del mercado antes de escalar construcción.
- [`docs/f0-correccion-enfoque-mercado.md`](./docs/f0-correccion-enfoque-mercado.md) — registra la corrección estratégica: primero mercado y viabilidad, luego MVP real.

---

API fiscal intermediaria entre ERPs/integradores y la DIAN (Colombia),
con notificación automática al adquiriente.

Visión larga: cubrir servicios fiscales DIAN
(factura electrónica, notas crédito/débito, documento soporte, nómina, etc.)
sobre una plataforma multi-tenant.

## Estado actual

- **F0** — Consolidación documental del modelo experimental.
- **F0.5** — Diseño de prueba de fogueo de mercado.
- **F1** — Prototipo mínimo solo para probar recepción real, no producto final.
- **F2** — Ejecución de prueba con Meta Ads / Facebook Ads / landing / WhatsApp.
- **F3** — Diagnóstico de viabilidad para una sola persona.
- **F4** — Decisión del MVP real.
- **F5** — Construcción técnica del MVP validado.

## Flujo de alto nivel

> El flujo técnico siguiente representa la visión larga. No es el siguiente paso de F0. Antes se debe validar mercado y viabilidad unipersonal.

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

> Fase actual: **F0 / modelo experimental**. Este setup permite levantar y validar la app base. No significa que el sistema ya facture, genere XML UBL, firme documentos o env?e informaci?n a la DIAN.

### API NestJS (`apps/api`)

```bash
git clone https://github.com/Abraha33/API-Dian.git
cd API-Dian
git checkout dev
cd apps/api
cp .env.example .env
npm ci
```

El archivo `apps/api/.env.example` contiene valores seguros de desarrollo. No reemplaza secretos reales ni configuraci?n productiva.

### Build

Desde `apps/api`:

```bash
npm run build
```

### App en modo desarrollo

Desde `apps/api`:

```bash
npm run start:dev
```

Con la app levantada, verifica:

```bash
curl http://localhost:3000/health
curl http://localhost:3000/ready
```

Tambi?n se puede abrir en navegador:

- `GET http://localhost:3000/health`
- `GET http://localhost:3000/ready`

### Pruebas e2e

Desde `apps/api`:

```bash
npm run test:e2e
```

### Docker Compose (Postgres + Redis + MinIO + app)

En la ra?z del repo:

```bash
docker compose -f docker-compose.dev.yml up -d
```

La app en contenedor usa variables inyectadas en el compose (ver `docker-compose.dev.yml`). Para desarrollo en m?quina host suele ser m?s c?modo levantar solo **supabase-db**, **redis** y **minio** y ejecutar `npm run start:dev` en `apps/api` con un `.env` alineado a `apps/api/.env.example`.

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
| F0 | Workflow, foundations y consolidación del modelo experimental |
| F0.5 | Prueba de fogueo del mercado y recepción de la propuesta |
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
| ChatGPT | Arquitecto/revisor senior del modelo experimental |
| Obsidian | Cerebro del modelo: ideas, decisiones, hipótesis, riesgos y aprendizaje |
| GitHub Project | Tablero diario de trabajo |
| GitHub Issues | Tareas accionables y trazables |
| Codex / Cursor | Ejecución controlada por tickets |
| Perplexity | Diseño, estimación, modelado SQL, debug |
| Supabase CLI | Migraciones en `supabase/migrations/` |
