# ADR-007: Contratos internos V1 e idempotencia semántica

- **Estado:** Aprobado
- **Fecha:** 2026-08-18
- **Depende de:** ADR-003, ADR-004, ADR-005, ADR-006
- **Detalle:** `docs/f4-contrato-pos-api-v1.md`

## Contexto

V1 necesita un contrato estable entre el POS y la API fiscal sin exponer el contrato propietario del Proveedor Tecnológico (PT). El contrato debe preservar idempotencia incluso ante retries, desconexiones y evolución del adapter.

La semántica fiscal interna no puede depender de nombres de campos, códigos de error o estados específicos del PT.

## Decisión

### 1. Superficie HTTP mínima

V1 expone únicamente la superficie necesaria al POS:

```text
POST /v1/fiscal-operations
GET  /v1/fiscal-operations/{operation_id}
GET  /v1/fiscal-operations/{operation_id}/artifacts/xml
GET  /v1/fiscal-operations/{operation_id}/artifacts/pdf
```

No existen endpoints públicos de `retry`, `resend`, `force`, `provider` ni `DIAN`.

Una operación humana de recuperación tampoco invoca directamente al PT; crea trabajo durable sujeto a ADR-004.

### 2. Tenant fuera del payload

El tenant se deriva exclusivamente de la credencial autenticada según ADR-006.

El request fiscal no contiene un `tenant_id` seleccionable por el POS.

### 3. Idempotency-Key obligatoria

Toda mutación requiere header:

```text
Idempotency-Key: <opaque-client-generated-key>
```

La key:

- tiene scope por tenant;
- se conserva de forma durable;
- no se reutiliza para otra intención fiscal;
- no contiene secretos;
- tiene longitud limitada por implementación;
- puede ser UUID/ULID u otro valor opaco suficientemente único generado por el POS.

La unicidad persistida sigue siendo `(tenant_id, idempotency_key)`.

### 4. Contrato semántico versionado

El cuerpo contiene `schema_version = "1.0"` y `document_kind` restringido a:

```text
FEV
CREDIT_NOTE
DEBIT_NOTE
ELECTRONIC_POS
POS_ADJUSTMENT
```

El modelo común usa conceptos de comercio/fiscalidad que necesita el POS: fecha/hora, moneda, adquirente cuando aplique, líneas, cantidades, importes, descuentos, impuestos, totales, medios de pago y relación con documento original.

No replica UBL ni el JSON de un PT.

### 5. Emisor resuelto por tenant

El POS no envía NIT/razón social del emisor como autoridad.

La API resuelve el perfil fiscal activo del tenant y conserva la versión/snapshot necesario para mapear y auditar la operación. Esto evita que una instalación POS pueda cambiar de emisor manipulando el payload.

### 6. Decimales como strings

Cantidades, tasas e importes del contrato JSON se expresan como strings decimales validadas, nunca como números IEEE-754 del JSON.

Ejemplos:

```json
"quantity": "2"
"unit_price": "12500.00"
"rate": "19.00"
"amount": "4750.00"
```

El modelo interno usa aritmética decimal exacta y la persistencia concreta se fija en migraciones.

### 7. Fecha/hora

V1 exige timestamp RFC3339 con offset explícito para el hecho de venta. Para operaciones colombianas normales se espera `-05:00`.

La API conserva además timestamps de recepción/procesamiento propios; no sustituye la hora del negocio por la hora del servidor.

### 8. Relaciones entre documentos

NC, ND y POS_ADJUSTMENT deben referenciar preferentemente el `operation_id` interno del documento original.

La API resuelve desde allí CUFE/CUDE, número, prefijo y demás referencias requeridas para el PT. No se acepta una relación que cruce tenant.

Casos de migración/importación que solo dispongan de identificador fiscal externo quedan fuera del camino principal y requieren diseño explícito antes de entrar.

### 9. Contingencia no seleccionable libremente por POS

El POS puede aportar hechos operativos necesarios, pero no puede elegir arbitrariamente un código de contingencia DIAN/PT.

La clasificación fiscal de contingencia pertenece al dominio API y a la política validada en F5 contra regulación y PT seleccionado.

### 10. Fingerprint semántico

El hash de idempotencia no se calcula sobre bytes JSON crudos.

Pipeline obligatorio:

```text
parse schema 1.0
→ validate
→ construir SemanticFiscalCommand normalizado
→ canonicalizar determinísticamente
→ SHA-256
```

El hash incluye únicamente campos que cambian la intención fiscal o la referencia estable de negocio.

Se excluyen:

- Authorization;
- correlation/request id;
- timestamps técnicos del servidor;
- metadata puramente observacional;
- estado local;
- campos/IDs añadidos por el adapter PT.

### 11. Canonicalización V1

Versión: `fiscal-command-c14n/1`.

Reglas:

- encoding UTF-8;
- strings Unicode NFC;
- trim solo en campos donde el schema lo declare;
- enums/códigos se transforman a su representación canónica definida;
- decimales se parsean exactamente y serializan en forma canónica sin `+`, exponentes ni ceros redundantes no significativos;
- objetos se serializan con keys ordenadas lexicográficamente;
- campos opcionales ausentes se omiten; `null` solo existe donde el schema le da significado explícito;
- arrays conservan orden cuando es semántico; las líneas usan `line_no` único y estable;
- fechas se validan y serializan en la representación canónica definida por el contrato;
- el hash se domain-separa con versión de contrato/canonicalización.

Forma conceptual:

```text
SHA256("API-DIAN|contract=1.0|c14n=1|" + canonical_json)
```

El payload original aceptado y el semantic hash se conservan según ADR-005.

### 12. Replay idempotente

Misma key + mismo hash:

- nunca crea una segunda operación;
- nunca crea un segundo side effect por el solo hecho del replay;
- devuelve la misma `operation_id` y el estado actual.

Misma key + hash distinto:

```text
HTTP 409
code = IDEMPOTENCY_CONFLICT
```

No se permite “sobrescribir” la intención original.

### 13. Semántica HTTP

Operación nueva persistida:

```text
202 Accepted
```

Replay de operación existente:

```text
200 OK
```

o `202` si la implementación decide mantener semántica uniforme; en ambos casos `operation_id` debe ser el mismo. La diferencia de status HTTP no cambia la idempotencia.

Error de validación antes de persistir operación:

```text
422 Unprocessable Entity
```

Conflicto de key:

```text
409 Conflict
```

No disponibilidad antes de poder persistir con seguridad:

```text
503 Service Unavailable
```

Un rechazo posterior del PT no se representa como error HTTP de la petición original asíncrona: es un estado terminal consultable de la operación.

### 14. Estados expuestos al POS

El POS recibe estados normalizados:

```text
PERSISTED
READY
SUBMITTING
ACCEPTED
REJECTED_LOCAL
REJECTED_REMOTE
UNKNOWN
RECONCILING
NEEDS_ATTENTION
```

`UNKNOWN` se expone explícitamente.

Cuando `status` sea `UNKNOWN` o `RECONCILING`, el contrato debe indicar que crear una operación nueva no es la acción recomendada.

### 15. Errores estables

Categorías mínimas:

```text
AUTH_REQUIRED
AUTH_INVALID
VALIDATION_FAILED
IDEMPOTENCY_CONFLICT
RELATED_DOCUMENT_INVALID
OPERATION_NOT_FOUND
ARTIFACT_NOT_READY
TEMPORARILY_UNAVAILABLE
INTERNAL_ERROR
```

Errores propietarios PT se guardan como evidencia y se mapean; el POS no parsea texto del proveedor.

### 16. Evolución

Cambios incompatibles producen nueva versión de contrato/canonicalización.

Nunca se recalcula retroactivamente el hash histórico con una versión nueva.

Cada operación conserva:

- contract version;
- canonicalization version;
- semantic hash;
- adapter/mapping version usado en cada provider_attempt.

## Consecuencia

La idempotencia queda vinculada a intención fiscal normalizada, no a bytes accidentales del JSON ni al proveedor seleccionado.

El contrato del POS puede mantenerse estable aunque se actualice el mapping del PT, siempre que la semántica V1 no cambie.
