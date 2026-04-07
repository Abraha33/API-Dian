## Epic padre

Parte del epic **F1-ARCH-00**.

## Objetivo

Inicializar proyecto **NestJS** con **FastifyAdapter** y **Prisma** según ADR-001 (versiones y layout).

## Alcance

- Scaffold (`nest new` o equivalente acordado), dependencias, `main.ts` con Fastify.
- Estructura de carpetas alineada con ADR-002 (módulos).
- Scripts npm/yarn/pnpm documentados en README mínimo del paquete app.

## Fuera de alcance

- Lógica de negocio fiscal, RLS, colas productivas.

## Prueba de cierre

| Qué verificar | Resultado esperado | Tiempo |
|---------------|-------------------|--------|
| `npm run start:dev` (o script acordado) | Servidor levanta sin errores en local | M (< 15 min) |

## Rama sugerida

`feature/backend/<n>-f1-arch-03-nest-bootstrap`
