# Roadmap API-DIAN

> Actualizado: 2026-09-07. La autoridad detallada de producto vive en `docs/service-catalog/RELEASE-ROADMAP.md`.

## Producto

```text
Software tercero / POS propio → API fiscal pública multitenant → 1 PT → DIAN
```

## Releases

- **V1:** FEV, NC, ND, contingencia mínima, lifecycle, artefactos, idempotencia, reconciliación, auth de aplicaciones, cuotas, uso, sandbox y webhooks.
- **V1.1:** DEE POS/ajuste y documento soporte a no obligados/ajuste.
- **V1.2:** recepción, validación y eventos del adquirente.
- **V2:** nómina, RADIAN y primer vertical salud bajo piloto.
- **Futuro:** transporte/RNDC y demás perfiles DEE por demanda.

## Secuencia de implementación

1. Reconciliar migraciones/código con tenant–organization–application.
2. Publicar OpenAPI 3.1 y contract tests.
3. Implementar auth/scopes/grants, management resources y rate/quota.
4. Adaptar intake/document model y estado público.
5. Completar outbox, worker, artifacts y webhook delivery.
6. Seleccionar PT con contrato+sandbox y construir un adapter.
7. Terraform/deploy sandbox, observabilidad y runbooks.
8. Pentest, carga, restore, revisión regulatoria y piloto.

## Gates actuales

| Gate | Estado |
|---|---|
| Definición de producto | PASS |
| Catálogo/roadmap | PASS |
| Arquitectura | PASS |
| Adapter PT real | BLOCKED por selección/sandbox |
| Implementación V1 | PENDING |
| Producción | BLOCKED |
