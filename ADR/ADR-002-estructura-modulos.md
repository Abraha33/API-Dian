# ADR-002: Estructura de módulos NestJS — API-DIAN

- **Estado:** Supersedido para V1 por ADR-003
- **Fecha original:** 2026-04-07
- **Reconciliado:** 2026-08-18
- **Autoridad de producto:** `docs/f0-producto-v1-validado-2026-08-18.md`

## Estado histórico

La estructura original incluía responsabilidades ligadas a una API SaaS pública (`webhooks`, integradores) y describía `emission` como generación/envío DIAN directo. Ese modelo contradice V1.

ADR-003 define ahora los límites conceptuales vigentes:

```text
platform
fiscal
provider
reconciliation
evidence
operations
```

ADR-004 gobierna específicamente idempotencia, intentos, mutaciones al PT y reconciliación.

## Disposición de módulos históricos

| Módulo histórico | V1 |
|---|---|
| `health` | mantener capacidad |
| `tenants` | obligatorio |
| `auth` | obligatorio, mecanismo en F3 |
| `users` | no crear sin actor humano real |
| `documents` | reencuadrar como operaciones/documentos fiscales |
| `emission` | no DIAN directa; orquestación vía `FiscalProvider` |
| `jobs` | reemplazar dependencia BullMQ por trabajo durable PostgreSQL |
| `webhooks` | fuera de V1 |
| `storage` | capacidad de artefactos; proveedor pendiente |
| `observability` | parte del núcleo desde el inicio |

## Regla para el refactor físico

Los nombres exactos de carpetas NestJS pueden adaptarse incrementalmente. No se exige una migración cosmética masiva antes de F6.

Sí son obligatorias las siguientes dependencias:

- dominio fiscal no importa el SDK/cliente concreto del PT;
- solo el worker puede invocar mutaciones de `FiscalProvider`;
- reconciliación usa capacidades de consulta separadas de mutación;
- evidencia/auditoría no depende de que el flujo termine con éxito;
- plataforma/tenant se aplica antes de acceder al dominio;
- código fuera del módulo de provider no interpreta estados propietarios del PT.

Este ADR queda solo como registro histórico; no debe usarse para crear módulos `webhooks`, `users` o `jobs/BullMQ` por inercia.
