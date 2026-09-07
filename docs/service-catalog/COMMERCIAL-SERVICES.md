# Servicios comerciales generales

## Núcleo

La FEV, nota crédito y nota débito forman la primera familia comercial. V1 añade estado, artefactos, contingencia mínima, reconciliación y webhooks para que un tercero pueda integrar el ciclo completo, no solo “enviar un JSON”.

La expedición comprende generación, transmisión, validación y entrega; la factura electrónica tiene validación previa. Referencias: [Resolución 165/2023, artículos compilados](https://normograma.dian.gov.co/dian/compilacion/docs/resolucion_dian_0165_2023.htm) y [micrositio DIAN](https://micrositios.dian.gov.co/sistema-de-facturacion-electronica/factura-electronica/).

## Expansión inmediata

1. **V1.1:** DEE POS y su nota de ajuste, por afinidad con POS de terceros y alto volumen.
2. **V1.1:** documento soporte de adquisiciones a no obligados y su ajuste, por valor para ERP/compras.
3. **V1.2:** recepción de documentos y eventos del adquirente, por valor contable y de cuentas por pagar.
4. **V2:** nómina y RADIAN, como dominios separados por complejidad regulatoria y operacional.

## Lo que no es una familia independiente

Firma, XML, PDF, correo, consulta, reportes, almacenamiento y webhooks son capacidades transversales. Perfiles como exportación, mandato, AIU o moneda extranjera se implementan como reglas/versiones de FEV cuando el anexo vigente así lo defina, no como productos duplicados.

## Frontera plataforma–PT

La plataforma siempre conserva identidad, autorización, idempotencia, estado canónico, auditoría, uso y contrato público. El PT puede realizar firma, generación final, transmisión y consulta remota según contrato. Esa asignación se registra por capacidad y nunca se infiere.

