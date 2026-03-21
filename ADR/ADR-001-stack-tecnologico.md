# ADR-001: Stack tecnologico — API-Dian

- **Estado:** Borrador (completar al cerrar ticket **T0.0.1** del [ROADMAP](../ROADMAP.md))
- **Fecha:** —
- **Contexto:** El primer trabajo del proyecto es **fijar el stack** con criterios y alternativas; el resto del roadmap asume decisiones aqui documentadas.

## Contexto

API SaaS multi-tenant para facturacion electronica DIAN (Colombia) via Factus. Necesidad de runtime, datos, colas, despliegue y DX alineados a un solo maintainer.

## Decision (rellenar al cerrar T0.0.1)

| Capa | Decision | Notas |
|------|----------|-------|
| Framework / runtime | | ej. Next.js App Router |
| Lenguaje | | ej. TypeScript |
| Validacion / contratos | | ej. Zod, OpenAPI |
| Base de datos / auth | | ej. Supabase, RLS |
| Hosting | | ej. Vercel |
| Cola / async | | ej. PGMQ, Edge Functions |
| Integracion fiscal | | Factus (sandbox/prod) |
| CI / calidad | | GitHub Actions, lint, tests |
| Observabilidad (MVP) | | logs minimos |

## Alternativas consideradas (breve)

- …

## Consecuencias

- Positivas: …
- Negativas / deuda: …

## Criterios de aceptacion (ticket T0.0.1)

- [ ] Tabla anterior completa (sin celdas vacias salvo explícito "N/A fase 0").
- [ ] Al menos una alternativa descartada por capa critica (DB o runtime).
- [ ] README principal actualizado para reflejar el stack **confirmado** (o enlace a este ADR como fuente de verdad).
