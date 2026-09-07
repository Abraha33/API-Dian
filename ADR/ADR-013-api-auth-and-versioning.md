# ADR-013: Autenticación de aplicaciones y versionado público

- **Estado:** Aprobado
- **Fecha:** 2026-09-07

## Decisión

V1 usa API keys revocables por app/ambiente, almacenadas como hash, con scopes y rotación. Contrato HTTP `/v1`, OpenAPI 3.1, errores estables e idempotency key obligatoria. OAuth client credentials se incorpora mediante IdP administrado cuando exista demanda empresarial; no se construye un IdP propio.

## Consecuencia

La simplicidad inicial no elimina controles empresariales. La telemetría permite deprecación y migración; breaking changes requieren nueva major.

