# Docker production packaging

Este documento describe el paquete Docker productivo de API-DIAN. No contiene
credenciales ni reemplaza la aprobación del despliegue real.

## Artefactos

- `Dockerfile.production`: imagen multi-stage de API-DIAN. Compila en la etapa
  de build, elimina dependencias de desarrollo y los gestores npm/Corepack del
  runtime, ejecuta como `node` y expone `/health` mediante un healthcheck.
- `docker-compose.production.yml`: topología sin puertos públicos para
  PostgreSQL. La API sólo se expone a un reverse proxy conectado a la red
  `edge`; PostgreSQL queda únicamente en la red privada.
- `infra/postgres/Dockerfile`: variante opcional de PostgreSQL que actualiza
  paquetes Debian y elimina `gosu`, que no se necesita cuando el contenedor
  arranca directamente como `postgres`. No está aprobada para producción hasta
  publicar una imagen inmutable y completar el escaneo indicado abajo.

Las imágenes de producción deben referenciar un digest (`@sha256:...`), nunca
`latest` ni un tag mutable. El compose exige `API_IMAGE` y `POSTGRES_IMAGE`
para evitar despliegues accidentales con referencias ambiguas.

## Build y escaneo en CI

`.github/workflows/docker-security.yml` construye ambas imágenes en un runner
limpio para cada pull request hacia `dev` o `main` y también puede ejecutarse
manualmente. Las imágenes no se publican desde ese workflow: sólo se cargan en
el runner y se escanean con Trivy. El gate falla si encuentra
vulnerabilidades **críticas o altas con corrección disponible**. El job de PR
desactiva attestations porque el exporter local de Docker no puede cargar una
manifest list; el workflow de publicación debe activar SBOM y provenance al
subir una imagen inmutable al registry.

El pipeline de release que publique imágenes debe ejecutar los comandos
equivalentes en un runner limpio y conservar sus logs:

```sh
docker build --pull --file Dockerfile.production \
  --tag ghcr.io/abraha33/api-dian:<git-sha> .

docker build --pull --file infra/postgres/Dockerfile \
  --tag ghcr.io/abraha33/api-dian-postgres:<git-sha> .

docker scout cves ghcr.io/abraha33/api-dian:<git-sha> \
  --only-severity critical,high --only-fixed
docker scout cves ghcr.io/abraha33/api-dian-postgres:<git-sha> \
  --only-severity critical,high --only-fixed
```

El release queda bloqueado si el escaneo reporta vulnerabilidades críticas o
altas corregibles. El resultado histórico de la imagen oficial PostgreSQL
15.19 usada como base fue **4 críticas, 33 altas, 30 moderadas y 55 bajas**;
por eso este repositorio no afirma que la imagen PostgreSQL esté limpia. La
imagen derivada debe medirse de nuevo después de construirla y antes de
publicar su digest.

## Variables y secretos

El deploy debe proporcionar, desde un gestor de secretos o un entorno seguro:

```text
API_IMAGE=ghcr.io/abraha33/api-dian@sha256:<digest>
POSTGRES_IMAGE=ghcr.io/abraha33/api-dian-postgres@sha256:<digest>
DATABASE_URL=postgresql://<runtime-user>:<password>@postgres:5432/<db>
AUTH_PEPPER=<valor de al menos 32 caracteres>
POSTGRES_USER=<usuario de bootstrap>
POSTGRES_DB=<base de datos>
POSTGRES_PASSWORD_FILE=/ruta/absoluta/fuera-del-repositorio/postgres-password
```

`DATABASE_URL` y `AUTH_PEPPER` se inyectan como variables del proceso porque
la aplicación actual las valida desde el entorno. El archivo indicado por
`POSTGRES_PASSWORD_FILE` debe tener permisos restrictivos y no debe entrar en
Git, imágenes, logs ni tickets.

## Validación sin arrancar servicios

Antes de desplegar, renderizar la configuración con valores temporales que no
sean secretos reales:

```powershell
$env:API_IMAGE = 'ghcr.io/abraha33/api-dian@sha256:replace-with-release-digest'
$env:POSTGRES_IMAGE = 'ghcr.io/abraha33/api-dian-postgres@sha256:replace-with-release-digest'
$env:DATABASE_URL = 'postgresql://runtime:placeholder@postgres:5432/api_dian'
$env:AUTH_PEPPER = 'placeholder-only-not-a-secret-32-chars'
$env:POSTGRES_USER = 'bootstrap'
$env:POSTGRES_DB = 'api_dian'
$env:POSTGRES_PASSWORD_FILE = 'C:\deploy-secrets\api-dian\postgres-password'
docker compose -f docker-compose.production.yml config --quiet
```

Este comando sólo valida la configuración; no inicia, detiene ni borra
contenedores o volúmenes.

## Backup, restore y rollback

El volumen no es un backup. Antes de una migración o cambio de imagen:

1. Confirmar que el backup cifrado reciente existe en almacenamiento externo.
2. Ejecutar `pg_dump` en formato custom desde el contenedor PostgreSQL y
   transferir el archivo fuera del host.
3. Probar la restauración en una base aislada; una copia no probada no cuenta
   como evidencia de recuperación.
4. Registrar el digest de API, PostgreSQL, el commit y la versión de esquema.

Ejemplo de backup (adaptar el nombre real del proyecto y no imprimir la
contraseña):

```sh
docker compose -f docker-compose.production.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc > api-dian-<utc-timestamp>.dump
```

El rollback consiste en restaurar el último par de digests conocido, verificar
`/health` y `/ready`, y sólo después dirigir tráfico al API. No se deben usar
`docker compose down -v`, `docker volume rm` ni `docker system prune` como
procedimiento normal: pueden destruir la única copia local de datos.

## Gate actual de worker

El código actual rechaza iniciar `dist/worker` con `NODE_ENV=production` porque
el worker todavía usa el proveedor fiscal falso y espera el adaptador F6C. Por
seguridad, el compose productivo no publica un servicio worker habilitado. La
imagen contiene `dist/worker` para permitir una futura configuración explícita,
pero el worker no se considera productivo hasta completar el proveedor real,
sus pruebas de aceptación y su kill-switch.

## Estado de verificación de esta entrega

- **VERIFIED:** Dockerfiles y Compose fueron escritos sólo dentro del alcance
  Docker; las referencias base tienen digest; el runtime API es no-root; hay
  healthchecks; PostgreSQL no publica el puerto al host.
- **PARTIAL:** El compose debe ser renderizado en el entorno de despliegue con
  imágenes reales y secretos efímeros.
- **UNVERIFIED:** No se ejecutó build, no se construyó ni escaneó la imagen
  derivada PostgreSQL, no se inició ningún servicio y no se probó backup/restore.
- **BLOCKED:** La producción real requiere un registry, un reverse proxy, un
  VPS, credenciales seguras y la aprobación del adaptador fiscal F6C.
