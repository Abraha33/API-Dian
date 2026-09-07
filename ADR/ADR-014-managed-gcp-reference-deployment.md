# ADR-014: Despliegue de referencia administrado en Google Cloud

- **Estado:** Aprobado para implementación; recalcular precio antes de contratar
- **Fecha:** 2026-09-07

## Decisión

Cloud Run para API/worker, Cloud SQL PostgreSQL, Cloud Storage, HTTPS Load Balancer/Cloud Armor, Secret Manager, KMS y observabilidad administrada. Terraform conserva portabilidad y proyectos separados para sandbox/producción.

## Alternativas

- Kubernetes: descartado por carga operativa;
- microservicios/serverless por función: descartado por coordinación y debugging;
- VM única: descartada por SPOF y administración;
- PaaS pequeño no definido: útil para sandbox, pero menor control verificable de red/HA/DR para producción fiscal.

## Condición

La región y tamaños se confirman con latencia PT, residencia contractual, calculadora y benchmark. Cambiar proveedor no altera arquitectura de dominio.

