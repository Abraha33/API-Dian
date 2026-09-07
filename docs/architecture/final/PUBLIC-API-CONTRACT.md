# Contrato de API pública V1

## Convenciones

- Base: `https://api.example.com/v1` y `https://sandbox.api.example.com/v1`.
- JSON UTF-8; fechas RFC 3339; IDs opacos; montos como cadenas decimales.
- `Authorization: Bearer <api_key>`.
- `Idempotency-Key` obligatorio en POST fiscal, longitud 16–128 y entropía suficiente.
- `X-Request-Id` aceptado si es válido o generado; `traceparent` soportado.
- Respuesta siempre contiene `request_id`; `correlation_id` identifica workflow/documento.
- OpenAPI 3.1 es contrato ejecutable; breaking changes requieren `/v2`.

## Superficie

| Método y ruta | Propósito | Scope |
|---|---|---|
| `POST /documents` | crear FEV/NC/ND/contingencia | `documents:write` |
| `GET /documents/{id}` | estado y resumen | `documents:read` |
| `GET /documents` | lista con cursor/filtros | `documents:read` |
| `GET /documents/{id}/events` | historial público | `documents:read` |
| `GET /documents/{id}/artifacts/{kind}` | URL corta o streaming autorizado | `artifacts:read` |
| `POST /received-documents` | V1.2: ingerir documento recibido | `received:write` |
| `POST /events` | V1.2: evento de recepción | `events:write` |
| `GET/POST/PATCH /organizations` | gestión del emisor | `organizations:*` |
| `GET/POST/PATCH /applications` | apps y grants | `applications:*` |
| `POST /applications/{id}/credentials` | crear/rotar credencial; secreto una vez | `credentials:write` |
| `DELETE /credentials/{id}` | revocar | `credentials:write` |
| `GET/POST /certificates` | binding/metadata o flujo seguro PT | `certificates:*` |
| `GET/POST/PATCH/DELETE /webhook-endpoints` | destinos y secretos | `webhooks:*` |
| `POST /webhook-deliveries/{id}/retry` | retry manual auditado | `webhooks:write` |
| `GET /usage` | medición por periodo/app/org | `usage:read` |
| `GET /health/live`, `GET /health/ready` | salud técnica sin datos sensibles | público/restringido |

Se usa un recurso `/documents` con discriminador `document_type`; evita duplicar lifecycle. OpenAPI publica esquemas `oneOf` por tipo.

## Creación

```json
{
  "organization_id": "org_01...",
  "document_type": "invoice",
  "external_reference": "sale-98431",
  "issue_at": "2026-09-07T10:15:00-05:00",
  "currency": "COP",
  "customer": {"identity_type": "NIT", "identity_number": "900000000", "name": "Cliente SAS"},
  "lines": [{"description": "Producto", "quantity": "2", "unit_price": "10000.00", "taxes": [{"code": "VAT", "rate": "19.00"}]}],
  "payment": {"means": "cash", "due_at": null},
  "references": [],
  "metadata": {"source": "pos-main"}
}
```

Respuesta normal: `202 Accepted`, `Location: /v1/documents/doc_...`.

```json
{
  "id": "doc_01...",
  "status": "queued",
  "document_type": "invoice",
  "request_id": "req_01...",
  "correlation_id": "cor_01...",
  "created_at": "2026-09-07T15:15:01Z"
}
```

`Prefer: wait=5` permite esperar hasta cinco segundos por un estado más avanzado, sin cambiar idempotencia ni identidad. El cliente nunca debe asumir aceptación DIAN a partir del HTTP 202.

## Idempotencia

- misma clave + mismo hash semántico: se devuelve el recurso original, incluso tras timeout;
- misma clave + payload diferente: `409 idempotency_conflict`;
- clave en procesamiento: `202` con el mismo recurso;
- retención de claves como mínimo igual a la ventana contractual de retries; documentos conservan identidad permanente.

## Estados públicos

`received`, `validating`, `rejected_local`, `queued`, `submitting`, `accepted`, `rejected_dian`, `unknown`, `reconciling`, `contingency_pending`, `failed_terminal`.

`unknown` prohíbe reenvío ciego. Solo query/reconciliación o evidencia de `proven_not_sent` permite nuevo submit.

## Error estándar

```json
{
  "type": "https://docs.example.com/errors/validation_failed",
  "title": "Validation failed",
  "status": 422,
  "code": "validation_failed",
  "detail": "The document contains invalid fields.",
  "errors": [{"pointer": "/lines/0/taxes/0/rate", "code": "invalid_rate"}],
  "request_id": "req_01...",
  "correlation_id": "cor_01..."
}
```

HTTP: 400 sintaxis, 401 auth, 403 scope/grant, 404 opaco, 409 conflicto, 422 regla fiscal, 429 límite/cuota, 503 dependencia no disponible. Errores PT se normalizan; la respuesta cruda no se expone.

## Listas, filtros y jobs

Paginación por cursor opaco (`limit` máximo 100). Filtros allowlist: organización, tipo, estado, `created_from/to`, referencia externa. Reportes grandes crean un job asíncrono y artefacto con expiración.

## Versionado

- additive compatible dentro de V1; clientes deben ignorar campos desconocidos;
- enums nuevos se anuncian y se modela `unknown` en SDKs;
- breaking change solo en nueva major path;
- deprecación con documentación, telemetría de uso y aviso mínimo contractual de 180 días, salvo emergencia regulatoria/seguridad;
- versiones de reglas fiscales se separan de versión HTTP.

