# Auditoría y versión del entorno

**Fecha de corte:** 2026-10-18
**Rama auditada:** `maintenance/nest12-security-2026-10-18`
**Base:** `maintenance/healthy-baseline-2026-10-18` (`a859057`)

## Objetivo

Dejar reproducible el entorno local y de CI sin eliminar código funcional ni
ocultar problemas de seguridad.

## Versiones fijadas

| Componente | Versión objetivo | Control |
|---|---|---|
| Node.js | `>=24.19.0 <25` (runtime fijado en 24.19.0) | `apps/api/package.json` (`engines`), `.nvmrc`, Dockerfile y CI |
| npm | `>=11.9.0 <12` (runtime fijado en 11.9.0) | `apps/api/package.json` (`engines`/`packageManager`) y `.npmrc` |
| PostgreSQL | 15, digest verificado en el entorno | `docker-compose.dev.yml` y CI |
| NestJS | `12.1.3` (core/common/platform/testing), `@nestjs/config` `12.0.1` | `apps/api/package.json`/lockfile |
| Fastify | `5.12.7` | `apps/api/package.json`/lockfile |
| TypeScript | `6.0.3` | `apps/api/package.json`/lockfile |

## Estado de salud

```text
Working tree local                [██████████████████████████████] 100% VERIFIED (commits bf0f281 + 9c95a2d; limpio)
Typecheck TypeScript               [██████████████████████████████] 100% VERIFIED
Lint                                [██████████████████████████████] 100% VERIFIED
Unitarias Vitest                    [██████████████████████████████] 100% VERIFIED (3/3, 9/9)
Auditoría npm producción            [██████████████████████████████] 100% VERIFIED (0)
Compose sintaxis                    [██████████████████████████████] 100% VERIFIED
Build                               [████████████████████░░░░░░░░░░] PENDING (debe correr en CI para este commit)
E2E/concurrencia/provider           [██████████████████░░░░░░░░░░░] PARTIAL (provider 6/6; DB local no disponible)
Auditoría npm desarrollo            [██████████████████████████████] 100% VERIFIED (0)
Gobernanza GitHub                   [██████████████████████████████] 100% VERIFIED (ruleset + controles)
CVEs imagen PostgreSQL fijada       [██████████████░░░░░░░░░░░░░░░░] BLOCKED (4 críticas, 33 altas)
CI + CodeQL remoto                  [██████████████████░░░░░░░░░░░░] PENDING (debe repetir para esta migración)
```

## Seguridad de dependencias

La revisión actualizó la API a NestJS 12.1.3, `@nestjs/config` 12.0.1,
Fastify 5.12.7 y TypeScript 6.0.3, y aplicó las correcciones transitivas
seguras disponibles mediante el lockfile. También eliminó `ts-node-dev`, que
no era usado por los scripts y arrastraba una cadena vulnerable.
El engine de Node declarado por la API es `>=24.19.0 <25` y el de npm es
`>=11.9.0 <12`; el entorno fijado usa Node `24.19.0` y npm `11.9.0`.

El manifest declara `fastify@5.12.7` como dependencia de primer nivel. Con
NestJS 12 ya no queda la copia anidada de Fastify 5.11.3 que disparaba el aviso
de producción anterior.

El resultado actual de `npm audit --omit=dev --audit-level=high` es **0 avisos de
producción** y la auditoría completa `npm audit --audit-level=moderate` también
es **0 avisos** después de migrar de Jest/ts-jest a Vitest 5.0.5. La salida de
`npm ls jest ts-jest vitest @vitest/coverage-v8 --depth=0` confirma que Jest y
ts-jest ya no son dependencias directas y que Vitest quedó fijado en el lockfile.

## Docker y PostgreSQL local

El digest fijado por Compose es el oficial vigente de PostgreSQL 15.19 y fue
descargado localmente sin iniciar servicios. Docker Scout reporta para esa
imagen **4 críticas, 33 altas, 30 moderadas y 55 bajas**; la política queda en
salud `D` porque la imagen oficial ejecuta su entrypoint como root, contiene
paquetes con copyleft y todavía no tiene attestations de supply chain
requeridas. La variante oficial Alpine reduce el inventario de paquetes, pero
mantiene 4 críticas y 32 altas en este corte, por lo que cambiar de variante no
resolvería el gate por sí solo. El contenedor histórico `api-dian-postgres`
continúa detenido y no se eliminó su volumen: arrancarlo o migrar sus datos
requiere una validación operacional separada.

La rama de mantenimiento está publicada y el PR #75 sigue abierto. La corrida
anterior de CI/CodeQL pasó sobre el commit previo, pero la migración Vitest y el
paquete Docker requieren una nueva ejecución remota antes de afirmar que el
estado verde se conserva. `dev`/`main` tienen el ruleset activo
`protect-dev-main`: PR obligatorio, una aprobación, checks `ci` y `CodeQL`, sin
borrado ni force-push. Dependabot alerts/security updates, secret scanning,
push protection y CodeQL default setup también están habilitados. La integración
en `dev` sigue pendiente de aprobación humana; el PR no se auto-mergeó.

## Verificación reproducible

Desde la raíz (no inicia servicios):

```bash
node --version
npm --version
docker compose -f docker-compose.dev.yml config --quiet
```

Desde `apps/api` (no ejecutar `npm run build` en esta auditoría):

```bash
npm ci
npx tsc --noEmit --pretty false
npx eslint "{src,apps,libs,test}/**/*.ts"
npm test
```

Con PostgreSQL inicializado y las identidades de prueba:

```bash
npm run test:e2e
npm run test:concurrency
```

La rama será una base saludable para desarrollo cuando estos comandos pasen y el
working tree no tenga cambios no intencionados. En este corte, typecheck, lint,
unitarias Vitest, contrato provider, auditorías npm y configuración de Compose
están verificados. E2E y concurrencia sólo llegaron al arranque de la aplicación
en local; fallan porque no hay PostgreSQL escuchando en `127.0.0.1:5432`. Deben
repetirse en CI para este commit. El gate de CVEs de Docker está verificado como
fallido, no como ausente. La aprobación para producción continúa bloqueada hasta
cerrar esos gates y verificar build, escaneo de imágenes, VPS, backup/restore y
proveedor fiscal real.
