# Experiencia del desarrollador

**Fecha de corte:** 2026-10-01

## Evidencia concreta

| Competidor | Evidencia | Evaluacion limitada |
|---|---|---|
| HKA | Wiki extensa, DEMO, API ConsultarDocumento, XML/PDF, guia de timeout | Fuerte para referencia y operacion; alta asistida |
| Dataico | REST, POST FEV/NC/ND, GET por consecutivo, POS, Postman | Fuerte para inicio; ambiguedad de consulta POS pendiente |
| Factus | v2 bills/credit-notes/debit-notes, sandbox, XML/PDF, ejemplos comunitarios | Accesible; endpoint ND y DEE POS presentan contradicciones |
| Matias | Quickstart oficial enumera FEV/salud, NC/ND, POS, soporte, nomina, RADIAN, estados, archivos, resoluciones y webhooks; valores magicos fuerzan errores | Referencia fuerte de amplitud en sandbox; produccion, SLA y precio no quedan probados |
| Plemsi | URLs sandbox/produccion y endpoints observados en integraciones | Parcial; falta referencia oficial consolidada |
| Alanube | Webhooks/docs reportados | Parcial; precio y prueba no verificados |
| ESTELA | No se encontro referencia publica equivalente | No evaluable |

No se asigna una nota estetica. Cada valoracion se apoya en recursos o endpoints observados.

## Rubrica para shortlist (0-2)

| Criterio | 0 | 1 | 2 |
|---|---|---|---|
| Acceso | Sin docs | Docs publicas | Cuenta sandbox autoservicio |
| Quickstart | Ausente | Parcial | Solicitud completa reproducible |
| Referencia | Campos incompletos | Endpoints | OpenAPI actualizado |
| Ejemplos | Ninguno | Happy path | Cuatro documentos + errores |
| Estado/error | Opaco | Lista | Maquina y remediacion |
| Webhook | Ausente | Payload | Firma, retry y prueba |
| Artefactos | No claro | PDF/XML | Respuesta DIAN y retencion |
| Produccion | No explicado | Contacto | Checklist y SLA |

## DX minima de nuestro MVP

Un desarrollador debe poder obtener credencial de prueba, crear emisor ficticio, emitir los cuatro tipos, forzar aceptado/rechazado/timeout, consultar, descargar artefactos y verificar webhook sin hablar con ventas. Produccion si requiere validacion.

### Errores

Cada error: codigo estable propio, categoria, mensaje accionable, campos, `retryable`, correlacion y codigo/mensaje original PT/DIAN separado.

### Webhooks

Firma HMAC, timestamp, ID unico, numero de intento, tolerancia a duplicados, backoff, historial, reenvio y rotacion de secreto.

### Tiempo de integracion

No afirmar “horas” o “dias” por apariencia. Medir con tres integradores: tiempo desde cuenta hasta primer FEV aceptado, luego hasta los cuatro documentos y manejo de un timeout.

## DX de la suite completa

- Un quickstart por familia y un inicio comun de autenticacion/empresa; no una guia enorme para todo el portafolio.
- Esquemas y versiones separados para ventas, DEE, soporte, nomina, eventos, salud y transporte.
- Escenarios deterministas por modulo: aceptado, rechazado, duplicado, timeout, correccion y consulta.
- Estados externos separados: DIAN, PT, MUV y RNDC nunca deben colapsarse en un unico `status`.
- Credenciales y permisos por entorno, empresa y modulo.
- Colecciones OpenAPI/Postman parciales para que un integrador descargue solo lo contratado.

El repositorio oficial de Matias es un benchmark util de cobertura. No basta para declarar una experiencia productiva superior: faltan mediciones de onboarding, soporte, disponibilidad y reconciliacion real.
