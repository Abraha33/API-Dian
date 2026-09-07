# MP08 — Puerto/adaptador de Proveedor Tecnológico

## Pregunta
¿Cómo podemos cambiar o probar PT sin contaminar el núcleo fiscal ni el contrato público?

## Fase 1 — Conceptualización
Definir un puerto mínimo `FiscalProvider` con capacidades explícitas, por ejemplo:
- submit;
- consultar/reconciliar;
- recuperar evidencia/artefactos cuando aplique;
- capability map.

Resultados internos deben distinguir:
- aceptación verificable;
- rechazo determinista;
- `PROVEN_NOT_SENT`;
- `UNKNOWN`;
- error temporal/throttling.

Invariantes:
- ningún DTO propietario del PT sale del adapter;
- ninguna respuesta ambigua se convierte en rechazo/éxito inventado;
- cambio de PT no cambia el modelo público;
- capacidades no confirmadas por contrato/sandbox se marcan unsupported/unknown.

## Fase 2 — Testeo aislado
Construir `FakeFiscalProvider` configurable para simular:
- accepted;
- rejected;
- 429;
- 5xx;
- latencia;
- timeout antes de envío;
- timeout después de posible aceptación;
- respuesta incompleta/inconsistente;
- consultas de reconciliación.

**Gate:** todos los resultados se traducen al modelo interno sin violar `UNKNOWN != REEMITIR`.

## Integración posterior
El adapter real se implementa únicamente cuando el owner reactive la selección PT y exista evidencia contractual/sandbox.
