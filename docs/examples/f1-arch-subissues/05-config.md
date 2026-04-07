## Epic padre

Parte del epic **F1-ARCH-00**.

## Objetivo

**ConfigModule** con variables de entorno validadas (p. ej. class-validator / Joi / zod según ADR-001) y perfiles **dev / staging / prod**.

## Alcance

- `.env.example` completo (sin secretos reales).
- Validación al arranque: falla rápido si faltan vars obligatorias.
- Documentar en README del app qué vars son requeridas.

## Prueba de cierre

| Qué verificar | Resultado esperado | Tiempo |
|---------------|-------------------|--------|
| Arranque sin `.env` o con vars faltantes | Error claro; con `.env.example` copiado, arranque OK | S (< 5 min) |

## Rama sugerida

`feature/backend/<n>-f1-arch-05-config`
