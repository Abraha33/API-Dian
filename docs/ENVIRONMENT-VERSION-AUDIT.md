# Auditoría y versión del entorno

**Fecha de corte:** 2026-10-18
**Rama auditada:** `dev`
**Commit auditado:** `11a95b5`

## Objetivo

Dejar reproducible el entorno local y de CI sin eliminar código funcional ni
ocultar problemas de seguridad.

## Versiones fijadas

| Componente | Versión objetivo | Control |
|---|---|---|
| Node.js | 24.19.0 | `.nvmrc`, `package.json`, Dockerfile y CI |
| npm | 11.9.0 | `package.json` (`packageManager`) y `.npmrc` |
| PostgreSQL | 15, digest verificado en el entorno | `docker-compose.dev.yml` y CI |
| NestJS | lockfile vigente | `apps/api/package-lock.json` |
| TypeScript | lockfile vigente | `apps/api/package-lock.json` |

## Estado de salud

```text
Git limpio                         [██████████████████████████████] 100%
Build                              [██████████████████████████████] 100%
Unitarias                          [██████████████████████████████] 100%
E2E                                [██████████████████████████████] 100%
Concurrencia                       [██████████████████████████████] 100%
Contrato provider fake             [██████████████████████████████] 100%
Versionado reproducible            [██████████████████████████████] 100%
Vulnerabilidades npm               [████████░░░░░░░░░░░░░░░░░░░░]  0% resueltas
```

## Seguridad de dependencias

`npm audit --omit=dev --audit-level=high` reportó 10 vulnerabilidades (8 altas y
2 moderadas), varias transitivas en Fastify/`fast-uri`, sin corrección automática
disponible en el momento de la auditoría. Esto queda visible como bloqueo; no se
usa `npm audit fix` ciegamente y no se rebaja el umbral de CI.

## Verificación reproducible

Desde la raíz:

```bash
node --version
npm --version
docker compose -f docker-compose.dev.yml config --quiet
```

Desde `apps/api`:

```bash
npm ci
npm run build
npm test -- --runInBand
npm run test:provider-contract-harness -- --runInBand
```

Con PostgreSQL inicializado y las identidades de prueba:

```bash
npm run test:e2e -- --runInBand
npm run test:concurrency -- --runInBand
```

La rama se considera saludable para desarrollo cuando estos comandos pasan y el
working tree no tiene cambios no intencionados. La aprobación para producción
continúa bloqueada hasta resolver o aceptar formalmente el riesgo de dependencias,
integrar el proveedor real y cerrar el despliegue productivo.
