# MP01 — Contrato de API pública

## Pregunta
¿Cómo consume un POS/ERP/SaaS nuestra API sin conocer el PT ni la implementación interna?

## Fase 1 — Conceptualización
Definir:
- recursos y rutas `/v1`;
- requests/responses JSON;
- `202 Accepted` para aceptación local asíncrona;
- errores públicos estables;
- OpenAPI 3.1;
- versionado;
- paginación/filtros;
- headers relevantes como `Idempotency-Key`;
- estados públicos y enlaces a artefactos/eventos.

Dependencias simulables: auth falsa, núcleo fiscal falso, repositorio falso.

Invariantes:
- ningún campo propietario del PT se filtra al contrato público;
- un cambio de PT no obliga a cambiar la API pública;
- contratos incompatibles requieren estrategia de versión.

**Gate:** `CONCEPT READY` cuando OpenAPI conceptual, recursos, errores y reglas de versionado son coherentes con arquitectura.

## Fase 2 — Testeo aislado
Usar handlers/stubs y contract tests para probar:
- request válido → respuesta esperada;
- request inválido → error estable;
- schemas OpenAPI;
- recursos inexistentes;
- paginación/filtros;
- estados serializados correctamente;
- compatibilidad de ejemplos con OpenAPI.

**Gate:** `ISOLATED TEST READY` cuando el contrato puede validarse sin core fiscal real.

## Integración posterior
Conectar con MP03/MP04 para identidad, MP05/MP06 para documentos/estados y MP09 para artefactos/webhooks.
