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

## Estado canónico

- `PRODUCT DEFINITION: PASS`
- `SERVICE CATALOG: PASS`
- `ARCHITECTURE FINAL: PASS`
- `BUILD PLAN V1: OFFICIAL`
- `CAPACITY READY: BLOCKED` hasta benchmark reproducible
- `PRODUCTION READY: BLOCKED` hasta implementación, PT real, validación regulatoria, seguridad, carga, restore y piloto

## Documentación que se debe leer primero

### Construcción

1. [`GOAL.md`](./GOAL.md) — misión de ejecución para Codex.
2. [`AGENTS.md`](./AGENTS.md) — reglas del repositorio para agentes.
3. [`docs/build/README.md`](./docs/build/README.md) — índice canónico de construcción.
4. [`docs/build/OFFICIAL-CONSTRUCTION-PLAN-V1.md`](./docs/build/OFFICIAL-CONSTRUCTION-PLAN-V1.md) — 8 fases oficiales.
5. [`docs/build/INDEPENDENT-MODULES-V1.md`](./docs/build/INDEPENDENT-MODULES-V1.md) — 12 módulos independientes.
6. [`docs/build/LOCAL-FIRST-EXECUTION-MODEL.md`](./docs/build/LOCAL-FIRST-EXECUTION-MODEL.md) — entorno local, runner y frontera de Actions.
7. [`docs/build/PRODUCTION-READINESS-GATES-V1.md`](./docs/build/PRODUCTION-READINESS-GATES-V1.md) — gates de salida.

### Producto y arquitectura

- [`docs/architecture/final/`](./docs/architecture/final/README.md) — arquitectura autoritativa.
- [`docs/service-catalog/`](./docs/service-catalog/MASTER-FISCAL-SERVICE-CATALOG.md) — catálogo fiscal y roadmap.
- [`docs/HANDOFF-NEXT-CHAT.md`](./docs/HANDOFF-NEXT-CHAT.md) — continuidad exacta.

## V1

V1 incluye FEV, nota crédito, nota débito, contingencia mínima aplicable, estados, XML/PDF/evidencia, idempotencia, reconciliación, sandbox, webhooks, cuotas, uso, auditoría y contrato público estable. Nuestro POS es un cliente más y no define la frontera.

## Stack canónico

NestJS/Fastify/TypeScript sobre Node.js; PostgreSQL autoritativo; API y worker separados; outbox/work queue durable; object storage privado; PT detrás de adapter provider-neutral; OpenAPI 3.1. Referencia productiva: servicios administrados de Google Cloud mediante Terraform.

## Estrategia de construcción

```text
conceptualización
      ↓
implementación + testeo local
      ↓
integración local
      ↓
automatización / runner / Actions
      ↓
PT + DIAN sandbox
      ↓
seguridad + capacidad + restore
      ↓
piloto
      ↓
producción
```

El owner dispone de runner local. Los módulos deben poder probarse desde terminal antes de depender de GitHub Actions.

## Capacidad

Objetivo inicial **a demostrar**, no promesa:

- hasta ~3 M documentos/mes;
- ~50 docs/s de burst comercial objetivo;
- primera etapa operable por una sola persona.

Regla de integridad:

```text
UNKNOWN != REEMITIR
```

## Ruta educativa

Los mismos componentes pueden estudiarse como mini-proyectos independientes. Prompt canónico: [`docs/learning/MINI-PROJECTS-CHAT-PROMPT.md`](./docs/learning/MINI-PROJECTS-CHAT-PROMPT.md).

## Documentación histórica

Planes de construcción anteriores a este plan oficial pueden conservar valor histórico, pero no tienen autoridad cuando contradicen `docs/build/`, `GOAL.md` o la arquitectura final.