# ADR-001: Stack tecnológico — API-DIAN

- **Estado:** Requiere revalidación en F2
- **Fecha original:** 2026-04-07
- **Reconciliado:** 2026-08-18
- **Autoridad superior de producto:** `docs/f0-producto-v1-validado-2026-08-18.md`

## Motivo de la revalidación

Este ADR fue aprobado bajo un contexto anterior: API SaaS para integradores, con construcción de capacidades públicas y una secuencia de fases distinta. El baseline validado del 18 de agosto cambió el producto V1 a:

```text
POS propio → API fiscal propia → 1 PT habilitado → DIAN
```

Por tanto, las decisiones de este ADR no se eliminan, pero tampoco pueden usarse por sí solas para justificar complejidad operativa o capacidades que ya quedaron fuera de V1.

## Disposición de las decisiones históricas

| Capa | Decisión histórica | Disposición V1 |
|---|---|---|
| Framework HTTP | NestJS + Fastify | **Candidato vigente.** Ya existe base implementada; revalidar coste/beneficio en F2 antes de expandir. |
| Runtime | Node.js 20 + TypeScript estricto | **TypeScript estricto vigente como candidato.** La versión exacta de Node debe fijarse en una versión LTS soportada al iniciar F2; no congelar una versión antigua por este ADR. |
| Base de datos | PostgreSQL/Supabase + RLS + Prisma | **Candidato fuerte.** PostgreSQL administrado y aislamiento multiempresa son coherentes con el baseline; ORM y uso exacto de Supabase/RLS se revalidan en F2/F3. |
| Async | Redis + BullMQ | **No aprobado automáticamente para V1.** Solo se conserva si un requisito demuestra que una cola transaccional/worker más simple no basta. La reducción de componentes operados pesa más que flexibilidad futura. |
| Auth integradores | API Key + Secret | **Supersedido para V1 como requisito de integradores externos.** V1 necesita autenticación POS→API y aislamiento por empresa; el mecanismo exacto se decide con el threat model. |
| Auth panel | JWT RS256 | **Sin requisito V1 que obligue a un panel.** Diferido hasta que exista actor/UI que lo necesite. |
| Validación DTO | class-validator + class-transformer | **Candidato vigente** si se mantiene NestJS. No es una decisión de producto. |
| Storage | Cloudflare R2 / MinIO | **Candidato.** V1 sí requiere conservar/recuperar artefactos y evidencia; la tecnología final se decide por durabilidad, coste y operación. |
| Logging | Pino | **Candidato vigente.** Logs estructurados sí son requisito V1. |
| OpenAPI / Scalar | OpenAPI 3.1 + Scalar | **OpenAPI interno útil; Scalar opcional.** No existe requisito de portal público de desarrolladores. |
| Infra local | Docker Compose | **Vigente como herramienta de desarrollo**, sin implicar la topología de producción. |
| CI/CD | GitHub Actions | **Vigente como candidato** por repositorio y flujo actuales. |
| Integración fiscal | canal/integrador según roadmap | **Reemplazado conceptualmente:** un único `FiscalProvider` y un solo adaptador a un PT habilitado. Sin integración directa con DIAN en V1. |

## Restricciones que gobiernan F2

La arquitectura formal deberá demostrar que:

- una sola persona puede operar el sistema;
- el número de servicios administrados y piezas móviles es mínimo;
- no se introduce Redis, broker, panel, gateway o servicio separado sin un requisito verificable;
- la persistencia del intento fiscal y la idempotencia ocurren antes de side effects remotos;
- un timeout ambiguo nunca conduce a reemisión ciega;
- el PT concreto queda aislado detrás de una interfaz mínima, no de un framework multi-PT;
- observabilidad, backup y recuperación son parte del núcleo, no una fase tardía.

## Consecuencia sobre el código existente

La revalidación **no ordena borrar** NestJS, Prisma, Redis/BullMQ u otras piezas ya presentes. Evitar churn es también una restricción. F2 debe comparar el coste de mantener cada pieza contra el coste y riesgo de retirarla.

## Decisión vigente hasta F2

Este ADR se conserva como registro histórico y lista de candidatos. La arquitectura V1 final deberá producir uno o más ADR nuevos que:

1. confirmen explícitamente las decisiones que sobreviven;
2. reemplacen las decisiones incompatibles;
3. documenten por qué cada componente merece su coste operacional.