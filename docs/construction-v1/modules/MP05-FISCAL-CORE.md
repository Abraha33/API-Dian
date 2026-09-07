# MP05 — Núcleo fiscal

## Pregunta
¿Cómo representamos y validamos la intención fiscal sin acoplarnos al PT?

## Fase 1 — Conceptualización
Definir para V1:
- FEV;
- nota crédito;
- nota débito;
- relaciones entre documentos;
- datos del emisor/adquirente;
- impuestos, totales y descuentos;
- representación decimal exacta;
- reglas fiscales versionadas;
- canonicalización determinista;
- errores fiscales internos estables;
- configuración fiscal histórica/versionada.

Invariantes:
- el modelo canónico no contiene campos propietarios del PT;
- entradas equivalentes producen representación equivalente;
- cambios de reglas/configuración no reinterpretan documentos históricos;
- aritmética fiscal no usa floats imprecisos.

Dependencias simulables: tenant/organization falsos, numeración/certificado sintéticos, `FakeFiscalProvider`.

## Fase 2 — Testeo aislado
Probar con fixtures:
- FEV válida;
- NC/ND válidas y relaciones;
- campos obligatorios faltantes;
- impuestos/totales incorrectos;
- redondeos;
- reglas versionadas;
- canonicalización;
- casos límite de cantidades/decimales.

**Gate:** `ISOLATED TEST READY` cuando el core puede validar y producir intención fiscal canónica sin PT real.

## Integración posterior
MP06 persiste/gestiona estado; MP08 traduce el modelo canónico al PT real/falso.
