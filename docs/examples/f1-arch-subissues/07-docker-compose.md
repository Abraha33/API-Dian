## Epic padre

Parte del epic **F1-ARCH-00**.

## Objetivo

Entorno local reproducible: **Docker Compose** con **Supabase** (o Postgres acordado), **Redis** y **MinIO** (o S3 compatible), más **Dockerfile** de desarrollo si aplica.

## Alcance

- `docker-compose.dev.yml` (nombre puede ajustarse si el repo ya tiene convención).
- `Dockerfile.dev` y `.dockerignore` para imagen de la API en dev (si aplica al estado del repo).
- Documentación mínima: cómo levantar y puertos.

## Fuera de alcance

- Producción / K8s.

## Prueba de cierre

| Qué verificar | Resultado esperado | Tiempo |
|---------------|-------------------|--------|
| `docker compose -f ... up` | Servicios healthy; app puede conectarse con vars documentadas | M (< 15 min) |

## Rama sugerida

`feature/devops/<n>-f1-arch-07-compose`
