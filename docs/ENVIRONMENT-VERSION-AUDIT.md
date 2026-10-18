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
Working tree local                [██████████████████████████████] 100% VERIFIED (limpio)
Typecheck TypeScript               [██████████████████████████████] 100% VERIFIED
Lint                                [██████████████████████████████] 100% VERIFIED
Unitarias Jest                      [██████████████████████████████] 100% VERIFIED (3/3, 9/9)
Auditoría npm producción            [██████████████████████████████] 100% VERIFIED (0)
Compose sintaxis                    [██████████████████████████████] 100% VERIFIED
Build                               [██████████████████████████████] 100% VERIFIED (CI #39118975602)
E2E/concurrencia/provider           [██████████████████████████████] 100% VERIFIED (CI #39118975602)
Auditoría npm desarrollo            [██████████████████████░░░░░░░░] 0% VERIFIED (20 moderadas)
Gobernanza GitHub                   [██████████████████████████████] 100% VERIFIED (ruleset + controles)
CVEs imagen PostgreSQL fijada       [██████████████░░░░░░░░░░░░░░░░] BLOCKED (4 críticas, 33 altas)
CI + CodeQL remoto                  [██████████████████████████████] 100% VERIFIED (CI + 3 análisis)
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
producción**. La auditoría completa aún reporta **20 avisos moderados de
desarrollo**, concentrados en la cadena de Jest/ts-jest (`sprintf-js` y
dependencias de cobertura). `npm audit fix --force` propone un downgrade
incompatible de `ts-jest`; por eso no se aplicó. Producción está limpia, pero la
salud total de la cadena de desarrollo queda pendiente de una migración de
runner o de una corrección upstream compatible.

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

En GitHub, la rama de mantenimiento está publicada y el PR #75 tiene CI y
CodeQL en verde: build, lint, unitarias, provider-contract, migraciones, E2E y
concurrencia pasan en `39118975602`; los tres análisis CodeQL también pasan.
`dev`/`main` tienen el
ruleset activo `protect-dev-main`: PR obligatorio, una aprobación, check `ci`,
sin borrado ni force-push. Dependabot alerts/security updates, secret scanning,
push protection y CodeQL default setup también están habilitados. Aún no hay
La integración en `dev` sigue pendiente de aprobación humana; el PR no se
auto-mergeó.

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
npm test -- --runInBand
```

Con PostgreSQL inicializado y las identidades de prueba:

```bash
npm run test:e2e -- --runInBand
npm run test:concurrency -- --runInBand
```

La rama es una base saludable para desarrollo cuando estos comandos pasan y el
working tree no tiene cambios no intencionados. En este corte, typecheck, lint,
Jest unitario, auditoría de producción, configuración de Compose, E2E,
concurrencia, contrato provider, build y CI remoto pasan. La gobernanza GitHub
también está verificada. El gate
de CVEs de Docker está verificado como fallido, no como ausente. La aprobación para
producción continúa bloqueada hasta cerrar esos gates y resolver o aceptar
formalmente las vulnerabilidades de desarrollo.
