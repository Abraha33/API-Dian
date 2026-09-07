# Contexto de sesión — API-DIAN

**Corte:** 2026-09-07
**Branch:** `draft/architecture-product-v1`

## Autoridades vigentes

1. `docs/PROJECT-CONSOLIDATED-PLAN.md` — producto.
2. `docs/service-catalog/` — catálogo y roadmap.
3. `docs/architecture/final/` — arquitectura.
4. ADR-010..014 — decisiones.
5. `docs/HANDOFF-NEXT-CHAT.md` — continuidad.

Documentos marcados `SUPERSEDIDO` son historia, no autoridad.

## Producto

```text
POS / ERP / SaaS / integrador / nuestro POS
                    ↓
         API fiscal pública multitenant
                    ↓
      núcleo fiscal → 1 adapter PT → DIAN
```

V1: FEV, NC, ND, contingencia mínima aplicable, lifecycle, XML/PDF/evidencia, idempotencia, reconciliación, autenticación de aplicaciones, scopes/grants, sandbox, webhooks, cuotas, uso y auditoría.

## Arquitectura

Monolito modular NestJS/Fastify/Node 24; PostgreSQL autoritativo con RLS/FK tenant-safe; API y worker separados; outbox/queue durable; object storage privado; servicios administrados y Terraform. Jerarquía: tenant → organizations y applications; grants explícitos unen app con organización.

Invariante superior: `UNKNOWN != REEMITIR`.

## Código existente

Se conservan/adaptan core SQL, RLS, canonicalización, idempotencia, leases, worker, fake provider, fault injection, kill switches y pruebas. Se amplían para organizations, applications, scopes, webhooks, usage, cuotas y contrato público. No se reinicia el núcleo sin evidencia.

## Gates

- arquitectura: PASS;
- implementación: pendiente;
- PT/adapter: bloqueado hasta contrato+sandbox;
- producción: bloqueada hasta regulatory diff, pentest, carga, restore y piloto.
