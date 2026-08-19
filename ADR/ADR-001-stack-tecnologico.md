# ADR-001: Stack tecnológico — API-DIAN

- **Estado:** Supersedido para V1 por ADR-003 y ADR-004
- **Fecha original:** 2026-04-07
- **Reconciliado:** 2026-08-19
- **Autoridad de producto:** `docs/f0-producto-v1-validado-2026-08-18.md`

## Estado histórico

Este ADR fue aprobado cuando el proyecto se concebía como API SaaS para integradores. Se conserva como evidencia de decisiones anteriores, pero ya **no es fuente de verdad de arquitectura V1**.

La decisión vigente está en:

- `ADR-003-arquitectura-v1-monolito-postgres.md`;
- `ADR-004-protocolo-side-effect-idempotencia-reconciliacion.md`.

## Disposición final de las decisiones históricas

| Capa | Decisión histórica | Disposición V1 |
|---|---|---|
| NestJS + Fastify | aprobado | **Conservado** en ADR-003 para evitar churn y por soporte vigente. |
| Node.js 20 | aprobado | **Reemplazado por Node.js 24 LTS**; Node 20 está EOL al corte. |
| TypeScript estricto | aprobado | **Conservado**. |
| PostgreSQL/Supabase | aprobado | **PostgreSQL administrado conservado**; Supabase es candidato preferente sujeto a F3. |
| Prisma | aprobado | **Retirado del runtime/scaffold activo en F6B.** El camino fiscal usa `pg`, repositories explícitos y SQL versionado porque RLS, locking, transacciones e invariantes DB son autoridad. |
| Redis + BullMQ | aprobado | **Eliminado de arquitectura productiva V1.** Trabajo durable en PostgreSQL. |
| API Key para integradores | aprobado | **Fuera de contexto V1.** Auth POS→API se diseña en F3. |
| JWT panel | aprobado | **Sin requisito V1.** |
| R2/MinIO | aprobado | **Object storage administrado sí; proveedor exacto pendiente. MinIO no producción.** |
| Pino | aprobado | **Conservado**. |
| OpenAPI/Scalar | aprobado | OpenAPI interno útil; UI documental no crítica. |
| Docker Compose | aprobado | Solo desarrollo local. |
| GitHub Actions | aprobado | Puede conservarse para CI/CD. |
| integración DIAN/canales | aprobado | **Reemplazado:** un `FiscalProvider`, un PT, sin DIAN directa. |

## Nota sobre código existente

Este ADR no ordena borrar inmediatamente Redis/MinIO/configuración histórica del repositorio. Esos cambios se realizan como limpieza de implementación trazada y probada. Lo que sí queda prohibido es justificar nuevas dependencias productivas en esos componentes usando este ADR supersedido.
