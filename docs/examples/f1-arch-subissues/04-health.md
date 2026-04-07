## Epic padre

Parte del epic **F1-ARCH-00**.

## Objetivo

Exponer **GET /health** y **GET /ready** con HTTP **200** y cuerpo JSON mínimo, p. ej. `{ "status": "ok" }` (o campos adicionales no rompen la prueba si se documentan).

## Alcance

- Implementación NestJS + Fastify.
- `/ready` puede comprobar dependencias básicas si ya existen (DB/Redis); si no, documentar como stub y ampliar en F2.

## Prueba de cierre

| Qué verificar | Resultado esperado | Tiempo |
|---------------|-------------------|--------|
| `curl` o cliente HTTP a ambas rutas | 200 + JSON con status ok | S (< 5 min) |

## Rama sugerida

`feature/backend/<n>-f1-arch-04-health`
