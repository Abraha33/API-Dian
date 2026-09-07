# API-DIAN

API fiscal pública multitenant para software de terceros en Colombia.

```text
POS / ERP / SaaS / integrador / nuestro POS
                    ↓
           Public Fiscal API V1
                    ↓
        Núcleo fiscal + adapter PT
                    ↓
                   DIAN
```

## Estado

- Branch de definición: `draft/architecture-product-v1`.
- `PRODUCT DEFINITION: PASS`.
- `SERVICE CATALOG: PASS`.
- `ARCHITECTURE FINAL: PASS`.
- `PRODUCTION READY: BLOCKED` hasta PT real, verificación normativa del release, implementación, pentest, carga y restore.

La arquitectura autoritativa está en [`docs/architecture/final/`](./docs/architecture/final/README.md); el catálogo y roadmap fiscal en [`docs/service-catalog/`](./docs/service-catalog/MASTER-FISCAL-SERVICE-CATALOG.md); la continuidad en [`docs/HANDOFF-NEXT-CHAT.md`](./docs/HANDOFF-NEXT-CHAT.md).

## V1

V1 incluye FEV, nota crédito, nota débito, contingencia mínima aplicable, estado, XML/PDF/evidencia, idempotencia, reconciliación, sandbox, webhooks, cuotas, uso y auditoría. Nuestro POS es un cliente más y no define la frontera.

## Stack

NestJS/Fastify/TypeScript sobre Node 24; PostgreSQL autoritativo; API y worker separados; outbox/queue durable; object storage privado; un PT detrás de adapter. Referencia de despliegue: servicios administrados de Google Cloud mediante Terraform.

Regla de integridad:

```text
UNKNOWN != REEMITIR
```

El código existente de core, RLS, idempotencia, worker y fake provider se audita y adapta a la nueva jerarquía tenant–organization–application; no se desecha automáticamente.
