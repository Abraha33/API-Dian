# Experiencia del desarrollador

**Fecha de corte:** 2026-10-01

## Evidencia concreta

| Competidor | Evidencia | Evaluacion limitada |
|---|---|---|
| HKA | Wiki extensa, DEMO, API ConsultarDocumento, XML/PDF, guia de timeout | Fuerte para referencia y operacion; alta asistida |
| Dataico | REST, POST FEV/NC/ND, GET por consecutivo, POS, Postman | Fuerte para inicio; ambiguedad de consulta POS pendiente |
| Factus | v2 bills/credit-notes/debit-notes, sandbox, XML/PDF, ejemplos comunitarios | Accesible; endpoint ND y DEE POS presentan contradicciones |
| Matias | REST/sandbox reportados y repositorio Lopezsoft de docs | Parcial; validar version y soporte contractual |
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
