# F4 — Contrato POS → API fiscal V1

**Fecha:** 2026-08-18  
**Estado:** Cerrado para implementación posterior  
**Autoridad:** ADR-007 + `docs/v1-requisitos.md`

## 1. Objetivo

Definir el contrato interno estable que usa el POS sin acoplarlo al Proveedor Tecnológico.

```text
POS domain
   ↓ JSON v1
API-DIAN canonical domain
   ↓ adapter mapping
PT-specific API
```

El contrato no pretende ser API pública comercial.

## 2. Headers

Mutaciones:

```http
Authorization: Bearer <credential>
Idempotency-Key: <opaque unique key>
Content-Type: application/json
X-Correlation-Id: <optional trace id>
```

- `Authorization` identifica una instalación POS y resuelve un tenant.
- `Idempotency-Key` identifica una intención fiscal lógica dentro del tenant.
- `X-Correlation-Id` es observabilidad, no identidad fiscal ni parte del semantic hash.

## 3. Endpoint de creación

```http
POST /v1/fiscal-operations
```

### Envelope

```json
{
  "schema_version": "1.0",
  "document_kind": "FEV",
  "client_reference": "sale:01J6...",
  "occurred_at": "2026-08-18T22:30:10-05:00",
  "currency": "COP",
  "document": {},
  "trace_metadata": {}
}
```

`trace_metadata` se conserva de forma controlada para soporte/auditoría, pero no modifica por sí sola la intención fiscal y no entra al semantic hash.

## 4. Tipos de documento

```text
FEV
CREDIT_NOTE
DEBIT_NOTE
ELECTRONIC_POS
POS_ADJUSTMENT
```

No se aceptan nombres de tipos propietarios del PT.

## 5. Modelo común de venta

Forma lógica simplificada para FEV/ELECTRONIC_POS:

```json
{
  "schema_version": "1.0",
  "document_kind": "FEV",
  "client_reference": "sale:af0d3a7d",
  "occurred_at": "2026-08-18T22:30:10-05:00",
  "currency": "COP",
  "document": {
    "customer": {
      "identification": {
        "type": "NIT",
        "number": "900123456",
        "check_digit": "7"
      },
      "legal_name": "CLIENTE EJEMPLO SAS",
      "email": "facturacion@example.invalid"
    },
    "lines": [
      {
        "line_no": 1,
        "item_reference": "SKU-001",
        "description": "Producto ejemplo",
        "quantity": "2",
        "unit": "UNIT",
        "unit_price": "12500.00",
        "discounts": [],
        "taxes": [
          {
            "kind": "IVA",
            "rate": "19.00",
            "base": "25000.00",
            "amount": "4750.00"
          }
        ],
        "net_amount": "25000.00"
      }
    ],
    "totals": {
      "net": "25000.00",
      "discounts": "0.00",
      "taxes": "4750.00",
      "payable": "29750.00"
    },
    "payment": {
      "means": "CASH",
      "due_date": null
    }
  },
  "trace_metadata": {
    "operator_reference": "cashier:12",
    "pos_terminal_reference": "terminal:3"
  }
}
```

El ejemplo es contractual, no una afirmación de que esos campos sean suficientes para todo caso regulatorio. Los campos exactos de DIAN/PT se validan en mapping y matriz regulatoria antes de producción.

## 6. Emisor

El cuerpo no acepta identidad autoritativa del emisor.

La API resuelve:

```text
credential → tenant → fiscal profile → provider binding
```

El snapshot/version del perfil usado debe asociarse a la operación/attempt para trazabilidad.

## 7. Notas crédito/débito

Las notas referencian el documento original:

```json
{
  "schema_version": "1.0",
  "document_kind": "CREDIT_NOTE",
  "client_reference": "refund:991",
  "occurred_at": "2026-08-18T22:35:00-05:00",
  "currency": "COP",
  "document": {
    "related_operation_id": "2e8ea8df-8b6c-4efa-bf54-204d1a111111",
    "reason_code": "RETURN",
    "reason": "Devolución de mercancía",
    "lines": [],
    "totals": {}
  }
}
```

Reglas:

- related operation debe pertenecer al mismo tenant;
- debe estar en estado compatible;
- la API obtiene la referencia fiscal real desde su propia evidencia;
- no se confía en CUFE/CUDE libre enviado por el POS en el camino normal.

Los códigos finales de motivo se mapean a catálogo regulatorio/PT en F4-C/F5; el POS usa semántica interna estable.

## 8. Nota de ajuste POS

Mismo principio:

```json
{
  "schema_version": "1.0",
  "document_kind": "POS_ADJUSTMENT",
  "client_reference": "pos-adjustment:771",
  "occurred_at": "2026-08-18T22:40:00-05:00",
  "currency": "COP",
  "document": {
    "related_operation_id": "...",
    "adjustment_kind": "CANCELLATION",
    "reason": "Anulación de venta"
  }
}
```

`adjustment_kind` interno no sustituye el catálogo legal/PT; el adapter lo traduce solo tras validación.

## 9. Contingencias

El contrato V1 no permite:

```json
{"dian_contingency_code": "..."}
```

como elección arbitraria del POS.

El POS puede reportar hechos del entorno cuando el flujo F5 lo requiera; la API decide la clasificación fiscal según causa, regulación vigente y capacidades del PT.

Esto evita que un bug/cliente convierta un fallo ordinario en una contingencia fiscal incorrecta.

## 10. Decimales

Todo valor cuantitativo sensible usa string decimal:

```text
^-?(0|[1-9][0-9]*)(\.[0-9]+)?$
```

La validación de signo/escala máxima depende del campo.

Prohibido usar `number` JSON como autoridad para dinero, tasa o cantidad fiscal.

## 11. Canonicalización

### Entrada

Se parte del DTO ya parseado y validado, no de la cadena JSON cruda.

### Semantic projection

Incluye:

- schema/document kind;
- client reference;
- occurred_at;
- currency;
- customer fiscal semantics;
- lines en orden estable;
- cantidades/precios/descuentos/impuestos/totales;
- relación con operación original;
- razón/ajuste cuando afecten la intención fiscal.

Excluye:

- auth;
- correlation ID;
- trace metadata no fiscal;
- timestamps del servidor;
- IDs locales generados después;
- provider mapping/response.

### Normalización

1. Unicode NFC.
2. Enums a representación canónica.
3. Decimales a forma exacta canónica.
4. Objetos con keys ordenadas.
5. Arrays con orden semántico conservado.
6. Optional ausente se omite.
7. `null` solo si el schema lo permite y distingue de ausencia.
8. Serialización UTF-8 determinista.

### Hash

```text
semantic_hash = SHA256(
  "API-DIAN|contract=1.0|c14n=1|" || canonical_json
)
```

Nunca se recalcula una operación histórica con otra versión.

## 12. Respuesta de creación

```json
{
  "operation_id": "2e8ea8df-8b6c-4efa-bf54-204d1a111111",
  "document_kind": "FEV",
  "status": "PERSISTED",
  "status_version": 1,
  "client_reference": "sale:af0d3a7d",
  "created_at": "2026-08-19T03:30:11Z",
  "updated_at": "2026-08-19T03:30:11Z",
  "fiscal_result": {
    "document_number": null,
    "cufe": null,
    "cude": null
  },
  "artifacts": {
    "xml": "PENDING",
    "pdf": "PENDING"
  },
  "next_action": "WAIT"
}
```

Nueva operación: `202 Accepted`.

Replay misma key/hash: misma `operation_id`; no se crea nuevo side effect.

## 13. Consulta

```http
GET /v1/fiscal-operations/{operation_id}
```

Devuelve el estado normalizado actual.

El POS no consulta directamente el PT para decidir qué mostrar/hacer.

### Semántica de `UNKNOWN`

```json
{
  "status": "UNKNOWN",
  "next_action": "WAIT_RECONCILIATION"
}
```

El POS **no** debe generar otra idempotency key para repetir la misma venta cuando vea este estado.

## 14. Artefactos

```http
GET /v1/fiscal-operations/{id}/artifacts/xml
GET /v1/fiscal-operations/{id}/artifacts/pdf
```

- `200` si disponible;
- `404` si operation no pertenece al tenant o no existe;
- `409/425` o error estable `ARTIFACT_NOT_READY` si la operación existe pero el artefacto aún no está disponible, según decisión de implementación.

Un fallo de artefacto jamás reabre emisión.

## 15. Errores

Envelope:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request rejected by internal validation",
    "details": [
      {"path": "document.lines[0].quantity", "code": "INVALID_DECIMAL"}
    ],
    "correlation_id": "..."
  }
}
```

No exponer stacktrace, secreto, payload PT crudo ni mensaje DIAN/PT no saneado.

## 16. Contrato `FiscalProvider`

Interfaz conceptual mínima:

```ts
interface FiscalProvider {
  submit(
    command: ProviderFiscalCommand,
    context: ProviderAttemptContext,
  ): Promise<ProviderSubmissionResult>;

  reconcile(
    query: ProviderReconciliationQuery,
  ): Promise<ProviderReconciliationResult>;

  getStatus(query: ProviderDocumentQuery): Promise<ProviderDocumentStatus>;
  fetchXml(query: ProviderDocumentQuery): Promise<ProviderArtifact>;
  fetchPdf(query: ProviderDocumentQuery): Promise<ProviderArtifact>;
}
```

`submit` es el único método mutante fiscal del puerto V1.

No existe `resend()`.

El adapter puede internamente despachar por tipo documental, pero el dominio no aprende endpoints propietarios.

### Contexto de intento

Se crea antes de la llamada:

```ts
interface ProviderAttemptContext {
  operationId: string;
  attemptId: string;
  tenantId: string;
  providerBindingRef: string;
  clientCorrelationRef: string;
  mappingVersion: string;
}
```

`clientCorrelationRef` se genera antes de `submit` y se envía al PT cuando su contrato lo soporte.

### Resultado de submit

El adapter devuelve únicamente semántica normalizada concluyente. Fallos de transporte se clasifican separadamente:

```text
CONCLUSIVE_ACCEPTED
CONCLUSIVE_REJECTED
TRANSPORT_PROVEN_NOT_SENT
TRANSPORT_AMBIGUOUS
```

`TRANSPORT_PROVEN_NOT_SENT` solo puede usarse si existe evidencia técnica suficiente de que el side effect no pudo alcanzar al PT. Ante duda: `TRANSPORT_AMBIGUOUS`.

### Reconciliación

Resultados:

```text
FOUND_ACCEPTED
FOUND_REJECTED
NOT_FOUND_CONCLUSIVE
INDETERMINATE
```

`NOT_FOUND_CONCLUSIVE` tiene una barra alta: solo se usa si el contrato/semántica del PT permite afirmar que no existe side effect y que es seguro evaluar un nuevo intento.

Un HTTP 404 aislado no se convierte automáticamente en `NOT_FOUND_CONCLUSIVE`.

## 17. Mapeos versionados

Cada provider attempt conserva `mapping_version`.

El mapping traduce:

```text
internal semantic command
→ provider payload

provider response/error
→ normalized result/evidence
```

Actualizar mapping no altera operaciones históricas.

## 18. Criterios de aceptación F4-A

- misma key + JSON con distinto orden de properties → mismo hash;
- misma key + `12500.0` vs `12500.00` en decimal semánticamente equivalente → mismo hash;
- misma key + importe diferente → 409;
- cambio solo de correlation/trace metadata → mismo hash;
- cambiar documento relacionado → hash diferente;
- tenant no puede venir del body;
- `UNKNOWN` visible al POS y sin acción `RETRY`;
- contrato no contiene campos propietarios del PT;
- `FiscalProvider` no tiene `resend` ni failover multi-PT.
