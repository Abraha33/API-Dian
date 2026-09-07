# MP10 — Metering, cuotas y primitivas comerciales

## Pregunta
¿Cómo medimos consumo real y aplicamos límites sin mezclarlo con la lógica fiscal?

## Fase 1 — Conceptualización
Definir:
- usage events;
- agregación por tenant/organization/application/environment;
- documentos contabilizables;
- cuotas por plan;
- overage/paquetes adicionales como concepto comercial futuro;
- consultas de consumo;
- idempotencia del metering;
- separación entre aceptación fiscal y facturación comercial.

Invariantes:
- el mismo documento no se contabiliza dos veces por retry;
- correcciones de metering son auditables;
- una cuota no debe provocar pérdida silenciosa de un documento ya aceptado localmente;
- pricing final no se hardcodea en el core fiscal.

Dependencias simulables: tenants/planes/documentos sintéticos.

## Fase 2 — Testeo aislado
Probar:
- consumo normal;
- repetición/idempotencia;
- rollover mensual;
- cuota alcanzada/superada;
- múltiples organizaciones por tenant;
- consultas de uso;
- reconstrucción desde eventos fuente cuando aplique.

**Gate:** consumo reproducible y sin doble conteo.

## Integración posterior
MP01 expone usage; MP06/MP09 emiten eventos fuente. Precios/planes reales requieren decisión del owner.
