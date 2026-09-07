# ADR-010: V1 es una API fiscal pública multitenant

- **Estado:** Aprobado
- **Fecha:** 2026-09-07
- **Supersede:** toda frontera POS-first/internal-only en ADR-003, ADR-005, ADR-006 y ADR-007.

## Decisión

Terceros son clientes de primera clase desde V1. Tenant, organización fiscal y aplicación son identidades distintas. Nuestro POS no pertenece al núcleo y usa el mismo contrato público.

## Consecuencias

Se requieren credenciales de aplicación, scopes, grants por organización, cuotas, medición, sandbox, webhooks, versionado y documentación pública. Módulos de inventario, caja, compras, ventas y offline POS quedan fuera del producto fiscal.

