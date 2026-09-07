# Arquitectura final — Public Fiscal API V1

> Gate: **ARCHITECTURE FINAL: PASS**  
> Fecha de revisión: 2026-09-07  
> Alcance: arquitectura lista para planificación de implementación; producción conserva gates de PT, regulación, seguridad, carga y restauración.

## Decisión central

La V1 es una **API fiscal pública multitenant para software de terceros**. Nuestro POS es un consumidor más. Se adopta un **monolito modular NestJS/Fastify** con procesos API y worker independientes, PostgreSQL autoritativo, outbox transaccional y almacenamiento privado de objetos. No se introducen microservicios, Kubernetes, Kafka ni un segundo PT.

## Índice de autoridad

| Tema solicitado | Documento autoritativo |
|---|---|
| Product definition, V1, roadmap | [`PROJECT-CONSOLIDATED-PLAN.md`](../../PROJECT-CONSOLIDATED-PLAN.md), [`RELEASE-ROADMAP.md`](../../service-catalog/RELEASE-ROADMAP.md) |
| Service catalog | [`MASTER-FISCAL-SERVICE-CATALOG.md`](../../service-catalog/MASTER-FISCAL-SERVICE-CATALOG.md) |
| System context, containers, components | [`SYSTEM-CONTEXT-AND-COMPONENTS.md`](SYSTEM-CONTEXT-AND-COMPONENTS.md) |
| Data and multi-tenancy | [`DATA-AND-MULTITENANCY.md`](DATA-AND-MULTITENANCY.md) |
| Public API and contract | [`PUBLIC-API-CONTRACT.md`](PUBLIC-API-CONTRACT.md) |
| Pipeline, DIAN/PT, queues, webhooks | [`PROCESSING-QUEUES-WEBHOOKS.md`](PROCESSING-QUEUES-WEBHOOKS.md) |
| Authentication, authorization, security | [`SECURITY-ARCHITECTURE.md`](SECURITY-ARCHITECTURE.md) |
| Infrastructure, deployment, observability, DR | [`INFRASTRUCTURE-OPERATIONS.md`](INFRASTRUCTURE-OPERATIONS.md) |
| Scaling | [`SCALING-MODEL.md`](SCALING-MODEL.md) |
| Costs | [`COST-MODEL.md`](COST-MODEL.md) |
| Failure modes | [`FAILURE-MODES.md`](FAILURE-MODES.md) |
| ADRs | [`ADR/`](../../../ADR/) |
| Risks, validation, status | [`TECHNICAL-VALIDATION.md`](TECHNICAL-VALIDATION.md), [`ARCHITECTURE-STATUS.md`](ARCHITECTURE-STATUS.md) |
| Handoff | [`HANDOFF-NEXT-CHAT.md`](../../HANDOFF-NEXT-CHAT.md) |

## Límites

`PASS` significa que no queda una decisión arquitectónica crítica sin respuesta. No significa “producción autorizada”. La elección contractual del PT, pruebas con su sandbox, revisión normativa previa al release y benchmarks son evidencias de implementación y siguen como gates de producción.

