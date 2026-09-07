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

- Base arquitectónica: `draft/architecture-product-v1`.
- Plan oficial de construcción: `draft/official-construction-plan-v1`.
- `PRODUCT DEFINITION: PASS`.
- `SERVICE CATALOG: PASS`.
- `ARCHITECTURE FINAL: PASS`.
- `IMPLEMENTATION: PENDING / PLAN READY`.
- `CAPACITY READY: BLOCKED` hasta benchmark reproducible.
- `PRODUCTION READY: BLOCKED` hasta implementación, PT real, verificación normativa, pentest, carga, restore y piloto.

## Empezar aquí

Para construir o continuar el proyecto, leer en este orden:

1. [`GOAL.md`](./GOAL.md) — misión ejecutable para Codex.
2. [`docs/construction-v1/README.md`](./docs/construction-v1/README.md) — índice del plan oficial.
3. [`docs/construction-v1/OFFICIAL-CONSTRUCTION-PLAN.md`](./docs/construction-v1/OFFICIAL-CONSTRUCTION-PLAN.md) — fases oficiales.
4. [`docs/construction-v1/MINI-PROJECTS.md`](./docs/construction-v1/MINI-PROJECTS.md) — 12 mini-proyectos independientes.
5. [`docs/construction-v1/STAGES-AND-GATES.md`](./docs/construction-v1/STAGES-AND-GATES.md) — gates de evidencia.
6. [`docs/HANDOFF-NEXT-CHAT.md`](./docs/HANDOFF-NEXT-CHAT.md) — continuidad.

La arquitectura autoritativa está en [`docs/architecture/final/`](./docs/architecture/final/README.md); el catálogo y roadmap fiscal en [`docs/service-catalog/`](./docs/service-catalog/MASTER-FISCAL-SERVICE-CATALOG.md).

## Estrategia de construcción

El orden de aprendizaje no es el orden de integración.

Cada mini-proyecto se trabaja primero mediante:

```text
Conceptualización
      ↓
Testeo aislado
      ↓
Integración local
      ↓
Runner / Containers / CI
      ↓
Integraciones externas
      ↓
Hardening / Capacidad
      ↓
Piloto
      ↓
Producción
```

Durante conceptualización y testeo aislado se permiten mocks/fakes para que un módulo no dependa de que los demás estén terminados.

El owner dispone de self-hosted runner local. Docker, CI y GitHub Actions se consolidan en una fase posterior separada, no se mezclan con conceptualización temprana.

## V1

V1 incluye FEV, nota crédito, nota débito, contingencia mínima aplicable, estado, XML/PDF/evidencia, idempotencia, reconciliación, sandbox, webhooks, cuotas, uso y auditoría. Nuestro POS es un cliente más y no define la frontera.

## Stack

NestJS/Fastify/TypeScript sobre Node 24; PostgreSQL autoritativo; API y worker separados; outbox/queue durable; object storage privado; un PT detrás de adapter neutral. Referencia de despliegue futuro: servicios administrados de Google Cloud mediante Terraform.

Objetivo de capacidad inicial a demostrar, no certificado: ~3 M docs/mes y ~50 docs/s burst comercial, bajo la restricción de operación inicial por una sola persona.

Regla de integridad:

```text
UNKNOWN != REEMITIR
```

No modificar `dev` directamente ni ejecutar gasto cloud, credenciales reales, piloto o producción sin autorización explícita del owner.
