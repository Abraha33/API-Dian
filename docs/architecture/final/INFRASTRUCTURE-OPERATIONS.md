# Infraestructura, despliegue, observabilidad y recuperación

## Plataforma seleccionada

Referencia de implementación: Google Cloud, región `southamerica-east1` cuando todos los servicios y el PT lo permitan. La elección reduce latencia regional y usa servicios administrados. Terraform debe permitir cambiar región; el dominio no importa SDK cloud.

| Necesidad | Servicio inicial |
|---|---|
| API | Cloud Run, request-based, min 1 producción |
| Worker | Cloud Run con instance-based/min 1 mientras use cola PostgreSQL |
| Base | Cloud SQL PostgreSQL, PITR; HA desde lanzamiento comercial con SLA |
| Objetos | Cloud Storage regional privado, versioning/retention/lifecycle |
| Borde | External HTTPS Load Balancer + Cloud Armor + managed TLS |
| Secretos | Secret Manager + Cloud KMS cuando aplique |
| Observabilidad | Cloud Logging/Monitoring/Trace + OpenTelemetry |
| Imágenes | Artifact Registry |
| CI/CD | GitHub Actions con Workload Identity Federation |
| IaC | Terraform con state remoto y revisión de plan |

Sandbox vive en proyecto/cuentas/secretos/DB/buckets separados; no es una columna en producción. Dentro de cada proyecto, `environment` sigue presente como defensa y semántica.

## Topologías

- **Dev/sandbox:** scale-to-zero API, worker bajo demanda o único, DB pequeña sin SLA; datos sintéticos.
- **Piloto controlado:** 1 API + 1 worker mínimos, DB zonal con PITR si el riesgo es aceptado; sin SLA público.
- **Comercial:** 2+ instancias lógicas escalables, Cloud SQL regional HA, borde/WAF, alertas 24/7 y restore probado.
- **Escala:** read replica para lecturas/reportes, pool/connector, particiones, Pub/Sub si queue benchmark falla; sharding solo en 10k-cliente/medición.

## CI/CD y rollback

`lint → unit → contract → integration/Postgres → tenant/security → build/SBOM/sign → deploy staging → smoke → aprobación producción → canary → promote`.

Rollback revierte imagen/config compatible; las migraciones no se revierten destructivamente. Expand/contract mantiene dos versiones durante despliegue. Feature flags y kill switches aíslan familia, PT, tenant o release.

## Observabilidad

Todos los logs son JSON con `timestamp`, `severity`, `service`, `version`, `request_id`, `correlation_id`, `tenant_id_hash`, `application_id`, `organization_id_hash`, `document_type`, `state`, `provider`, `error_code`, `duration_ms`; nunca payload fiscal.

Métricas mínimas:

- requests, latencia p50/p95/p99 y 4xx/5xx por endpoint/app;
- auth failures, 429, cuota y abuso;
- documentos por tipo/estado/tenant, aceptación/rechazo/unknown;
- tiempo request→aceptado y latencia PT/DIAN;
- queue depth, oldest age, leases expirados, retries y dead letters;
- webhook success/age/retries/dead letters;
- conexiones/CPU/IO/locks/storage DB y object errors;
- coste y uso por tenant/endpoint/documento.

Tracing cruza API→DB/outbox→worker→PT→webhook sin atributos PII. Health: `/live` solo proceso; `/ready` dependencias esenciales con timeout y sin filtrar secretos.

Alertas P0: aislamiento/credencial comprometida, pérdida/corrupción, emisión duplicada masiva. P1: unknown elevado, cola envejecida, PT/DIAN caído, DB saturada, certificado próximo, restore/backup fallido. Cada alerta enlaza runbook y tiene deduplicación.

## Backup y disaster recovery

- Cloud SQL: backups automáticos, PITR y copia/retención independiente según política;
- objetos: versioning/soft delete o retention lock según clase de evidencia; inventario y checksum;
- Terraform, migraciones y configuración no secreta en Git; secretos respaldados mediante procedimiento seguro, no exportación rutinaria;
- prueba de restore trimestral a proyecto aislado con nuevas credenciales;
- RPO objetivo comercial ≤5 min para DB (según PITR contratado), RTO objetivo ≤4 h; piloto puede aceptar RTO 24 h sin SLA;
- runbook declara incidente, congela side effects si integridad es incierta, restaura, reconcilia con PT/DIAN y rota secretos.

## Operación por una persona

Panel único: salud, cola, unknown, rechazos, PT, webhooks, certificados, cuota, DB, backups y coste. Acciones disponibles son allowlist y auditadas. Tareas recurrentes se automatizan; no hay acceso SSH rutinario, servidores autogestionados ni coordinación de microservicios.

