# ADR-011: Jerarquía tenant–organization–application

- **Estado:** Aprobado
- **Fecha:** 2026-09-07

## Decisión

`Tenant` es la frontera contractual/seguridad; `Organization` es el emisor fiscal; `Application` es el software cliente. Un integrador puede administrar varias organizaciones y cada aplicación recibe grants explícitos. Documentos pertenecen a tenant+organización+ambiente.

## Alternativas descartadas

- tenant=emisor siempre: impide integradores multiempresa;
- application=tenant: mezcla identidad técnica y contractual;
- confiar solo en filtros ORM: una omisión produciría BOLA.

## Controles

Contexto autenticado, grants, FK tenant-safe, RLS deny-by-default, roles DB separados y pruebas cross-tenant.

