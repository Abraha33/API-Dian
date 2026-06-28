# Evidencia — F0 entorno mínimo listo

## Fecha

2026-06-28

## Rama

feature/devops/f0-entorno-listo

## Objetivo

Dejar listo el entorno mínimo de trabajo para API-Dian sin implementar lógica DIAN.

## Archivos creados

- `apps/api/.env.example`
- `.github/ISSUE_TEMPLATE/tarea-tecnica.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `docs/f0-entorno-listo-evidencia.md`

## Archivos modificados

- `.gitignore`
- `README.md`

## Comandos ejecutados

```bash
# Intento inicial en Google Drive / repo local
cd apps/api
Copy-Item .env.example .env
npm ci
npm.cmd ci

# Validación final en copia temporal fuera de Google Drive
cd C:\Users\acace\AppData\Local\Temp\api-dian-validate-f0-entorno-files\apps\api
Copy-Item .env.example .env
npm.cmd ci
npm.cmd run build
npm.cmd run lint
npm.cmd run test:e2e
```

## Resultado de comandos

| Comando | Resultado | Nota |
|---|---|---|
| `npm ci` | Falló | En PowerShell, `npm.ps1` fue bloqueado por ExecutionPolicy. Se usó `npm.cmd`. |
| `npm.cmd ci` en Google Drive | Bloqueado / detenido | Generó muchos `TAR_ENTRY_ERROR UNKNOWN`, `EBADF` y `EPERM` al escribir `node_modules` dentro de carpeta sincronizada con Google Drive. Se detuvo el proceso para no dejar el entorno colgado. |
| `npm.cmd ci` en copia temporal fuera de Drive | OK | Instaló 797 paquetes. `npm audit` reportó 31 vulnerabilidades: 1 low, 20 moderate, 10 high. No se cambiaron dependencias por estar fuera de alcance. |
| `npm.cmd run build` | OK | Ejecutó `prisma generate && nest build`. Prisma Client generado correctamente. |
| `npm.cmd run lint` | OK | Ejecutó ESLint con `--fix` sin errores. |
| `npm.cmd run test:e2e` | OK | 1 suite passed, 2 tests passed. Verificó `/health` y `/ready` con status 200. |

## Problemas encontrados

- Faltaba `apps/api/.env.example`, aunque el README indicaba copiarlo.
- `.gitignore` ignoraba `.env.*`, lo que también ignoraba `apps/api/.env.example`.
- El repo tenía la plantilla PR rastreada como `.github/pull_request_template.md`; se renombró a `.github/PULL_REQUEST_TEMPLATE.md` para coincidir con la ruta solicitada.
- Ejecutar `npm ci` dentro de Google Drive produjo errores de escritura en `node_modules` (`TAR_ENTRY_ERROR`, `EBADF`, `EPERM`).
- `npm audit` reportó vulnerabilidades en dependencias existentes, pero no se cambiaron dependencias porque esta tarea no autoriza upgrades.

## Correcciones aplicadas

- Se creó `apps/api/.env.example` con valores seguros de desarrollo compatibles con `src/config/env.validation.ts`.
- Se ajustó `.gitignore` para permitir versionar `.env.example` sin permitir secretos reales.
- Se actualizó `README.md` con setup local, build, modo desarrollo, e2e y verificación de `/health` y `/ready`.
- Se creó `.github/ISSUE_TEMPLATE/tarea-tecnica.md`.
- Se actualizó/renombró `.github/PULL_REQUEST_TEMPLATE.md` con `Relates to #` y checklist de revisión humana.
- Se creó esta evidencia de auditoría.

## Estado final

- [x] `apps/api/.env.example` existe.
- [x] `README.md` coincide con el flujo real.
- [x] `.github/ISSUE_TEMPLATE/tarea-tecnica.md` existe.
- [x] `.github/PULL_REQUEST_TEMPLATE.md` existe.
- [x] `npm.cmd ci` fue ejecutado correctamente en copia temporal fuera de Drive.
- [x] `npm.cmd run build` pasa.
- [x] `npm.cmd run lint` pasa.
- [x] `npm.cmd run test:e2e` pasa.
- [x] No se implementó XML.
- [x] No se implementó firma.
- [x] No se implementó envío DIAN.
- [x] No se agregaron secretos reales.

## Recomendación operativa

No instalar `node_modules` dentro de carpetas sincronizadas con Google Drive. Para desarrollo diario, usar una copia local fuera de Drive o excluir `node_modules` del mecanismo de sincronización.
