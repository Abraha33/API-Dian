# ADR-001: Stack tecnológico — API-Dian

- **Estado:** Aprobado
- **Fecha:** 2026-04-07
- **Contexto:** API SaaS multi-tenant para facturación electrónica DIAN (Colombia), con integradores JSON/XML y canales de salida. Este ADR fija el stack de implementación acordado para F1 en adelante.

## Contexto

Se necesita un stack homogéneo (runtime, datos, colas, observabilidad, despliegue) alineado a Node/TypeScript, PostgreSQL con RLS en Supabase, y operación con contenedores en local y CI en GitHub Actions.

## Decisión

| Capa | Decisión | Alternativa descartada | Razón breve |
|------|----------|------------------------|-------------|
| Framework HTTP | NestJS + adaptador **Fastify** | Express (default Nest), Koa, Hono | Rendimiento y modelo plugin de Fastify; Nest da estructura modular y DI madura. |
| Runtime / lenguaje | **Node.js 20 LTS** + **TypeScript estricto** | Node 18, Deno, Bun | LTS estable, ecosistema maduro para librerías fiscales y tooling. |
| Base de datos | **PostgreSQL** vía **Supabase** + **RLS**; ORM **Prisma** | TypeORM, Drizzle, SQL crudo | Prisma + migraciones versionadas encajan con el flujo del repo; RLS en Supabase para multi-tenant. |
| Colas / async | **Redis** + **BullMQ** | PGMQ solo, RabbitMQ, SQS temprano | BullMQ es idiomático en Node; Redis ya cubre rate limiting/caché ligera más adelante. |
| Auth integradores | **API Key** + **Secret** (hash almacenado) | Solo JWT de larga duración | Patrón simple para integraciones servidor-servidor; rotación por clave. |
| Auth panel interno | **JWT RS256** | JWT HS256 global | Mejor separación de firmas y rotación de claves en despliegues multi-instancia. |
| Validación DTO | **class-validator** + **class-transformer** | Zod-only | Alineado con ecosistema Nest (pipes) y validación de `ConfigModule`. |
| Storage documentos | **Cloudflare R2** (S3-compatible); local **MinIO** | S3 directo, GCS | Coste y simplicidad para adjuntos/XML/PDF; MinIO paridad local. |
| Logging | **Pino** (JSON prod, **pino-pretty** en dev) | Winston, consola | Bajo overhead y formato JSON estándar para agregadores. |
| Documentación API | **OpenAPI 3.1** + **Scalar** | Swagger UI solo | Scalar mejora DX sobre OpenAPI generado desde Nest. |
| Infra local | **Docker Compose** (Postgres + Redis + MinIO; alineado a Supabase/CLI según fase) | Solo `supabase start` | Compose explícito para servicios que la app Nest consume directamente en F1/F2. |
| CI/CD | **GitHub Actions** | GitLab CI, Circle | Repositorio ya en GitHub; integración nativa. |
| Integración fiscal | Integrador API / canal DIAN según **ROADMAP** (sandbox → prod) | Acoplamiento duro a un solo proveedor sin contrato | El conector concreto se fija por contrato y entorno; el core permanece agnóstico donde sea posible. |

## Alternativas consideradas (resumen)

- **Express vs Fastify:** Express es más familiar pero Fastify ofrece mejor rendimiento y tipado con plugins; Nest soporta ambos de primera clase.
- **Prisma vs Drizzle:** Drizzle es ligero; Prisma prioriza DX y cliente tipado ya adoptado en el plan de trabajo.
- **Colas solo en Postgres (PGMQ):** reduce operaciones pero limita patrones de workers y reintentos ya previstos para F2.

## Consecuencias

- **Positivas:** Stack coherente con Nest; logs y validación homogéneos; despliegue y local reproducible con Compose.
- **Negativas / deuda:** Mantener Prisma + Supabase RLS requiere disciplina en migraciones y políticas; OpenAPI/Scalar hay que versionar con el API.

## Criterios de aceptación (F1)

- [x] Tabla anterior completa (sin celdas vacías en capas críticas).
- [x] Al menos una alternativa descartada por capa crítica (DB, runtime/framework).
- [x] README enlaza a este ADR como fuente de verdad del stack.
