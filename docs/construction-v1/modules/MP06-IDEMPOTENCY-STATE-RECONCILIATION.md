# MP06 — Idempotencia, estados y reconciliación

## Pregunta
¿Cómo garantizamos una sola operación fiscal lógica y manejamos resultados inciertos sin duplicar documentos?

## Fase 1 — Conceptualización
Definir:
- `Idempotency-Key` obligatoria para POST fiscales;
- semantic hash/version;
- snapshot inmutable del comando;
- máquina de estados;
- control de concurrencia/state version;
- estados `accepted`, `rejected_dian`, `unknown`, `reconciling`, etc.;
- reglas de retry vs no-retry;
- reconciliación por identificadores/evidencia.

Invariantes:
- misma key + misma intención → misma operación;
- misma key + intención distinta → conflicto;
- `UNKNOWN != REEMITIR`;
- timeout tras posible envío nunca autoriza retry ciego.

Dependencias simulables: documento canónico y provider falsos.

## Fase 2 — Testeo aislado
Probar:
- repetición serial y concurrente de misma key;
- misma key con payload distinto;
- crash entre persistencia y procesamiento;
- timeout después de posible envío;
- rechazo determinista;
- `PROVEN_NOT_SENT`;
- reconciliación que encuentra aceptación/rechazo;
- reconciliación que permanece incierta.

**Gate:** cero duplicados y ninguna transición ilegal en pruebas de concurrencia/fallo.

## Integración posterior
MP07 ejecuta trabajo durable; MP08 aporta evidencia del provider; MP01 expone estados públicos.
