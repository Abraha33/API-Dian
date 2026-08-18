# F3 — Modelo de datos V1

**Estado:** cerrado para contratos F4  
**Fecha:** 2026-08-18  
**Autoridad:** ADR-003, ADR-004 y ADR-005

Este documento define el modelo conceptual/relacional antes de escribir migraciones productivas. No define todavía campos UBL/PT específicos.

## 1. Principios

1. PostgreSQL es autoridad.
2. `tenant_id` no nulo en toda entidad fiscal.
3. comando original e idempotencia son inmutables.
4. estado fiscal y estado de job son dimensiones diferentes.
5. cada intento PT tiene identidad propia.
6. evidencia se añade; no se reescribe.
7. referencias entre tenants deben fallar en DB.
8. payload fiscal detallado se versiona y no se fuerza prematuramente a un esquema ligado al PT.

## 2. Schema

Schema lógico: `app`.

No exponerlo directamente al POS/Data API. NestJS accede por conexión PostgreSQL con roles runtime dedicados.

## 3. Entidades

### `app.tenants`

Propósito: identidad interna de empresa/tenant, separada de NIT/documentos fiscales concretos.

Campos mínimos:

| Campo | Tipo lógico | Regla |
|---|---|---|
| `id` | uuid | PK, server generated |
| `external_ref` | text nullable | referencia propia del POS/negocio |
| `status` | text | `ACTIVE`, `SUSPENDED` |
| `created_at` | timestamptz | no nulo |
| `updated_at` | timestamptz | no nulo |

No modelar “tenant = NIT” como invariante irreversible; F4 agrega identidad fiscal según PT.

### `app.api_credentials`

Tabla de bootstrap de autenticación. No contiene datos fiscales.

| Campo | Regla |
|---|---|
| `id` uuid | credential/public ID |
| `tenant_id` | FK tenant, no nulo |
| `secret_digest` bytea | nunca secreto plano |
| `digest_version` text | versión algoritmo/pepper |
| `label` text | instalación/dispositivo |
| `status` text | `ACTIVE`, `REVOKED` |
| `created_at` | obligatorio |
| `expires_at` | nullable |
| `revoked_at` | nullable |
| `last_used_at` | nullable, telemetría no autoritativa |

Índice por `id`; una credencial pertenece a un solo tenant.

### `app.fiscal_operations`

Autoridad de la operación fiscal lógica.

| Campo | Regla |
|---|---|
| `id` uuid | PK |
| `tenant_id` uuid | NOT NULL |
| `idempotency_key` text | NOT NULL, longitud acotada |
| `semantic_hash` bytea | SHA-256, 32 bytes |
| `hash_version` text | algoritmo/canonicalización |
| `command_type` text | emisión/ajuste según contrato |
| `document_type` text | FEV/NC/ND/DEE_POS/DEE_POS_ADJUST |
| `contract_version` text | contrato interno usado |
| `request_payload` jsonb | snapshot inmutable |
| `status` text | estado ADR-004 |
| `state_version` bigint | optimistic concurrency |
| `related_operation_id` uuid nullable | notas/ajustes |
| `created_at` | obligatorio |
| `updated_at` | obligatorio |

Constraints:

```text
PK (id)
UNIQUE (tenant_id, id)        # permite FK compuesta tenant-safe
UNIQUE (tenant_id, idempotency_key)
semantic_hash length = 32
related_operation, si existe, debe referir (tenant_id, id)
```

Estados mínimos:

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

Campos inmutables después del insert:

- `tenant_id`;
- `idempotency_key`;
- `semantic_hash`/`hash_version`;
- `command_type`;
- `document_type`;
- `contract_version`;
- `request_payload`;
- `related_operation_id`.

### `app.provider_attempts`

Un intento mutante controlado hacia PT.

Campos:

| Campo | Regla |
|---|---|
| `id` uuid | PK |
| `tenant_id` | NOT NULL |
| `operation_id` | FK compuesta mismo tenant |
| `attempt_no` integer | >=1 |
| `correlation_key` text | generado antes de llamada, unique |
| `adapter_version` text | mapping/provider code version |
| `request_hash` bytea | hash de request enviado |
| `status` text | `PREPARED`, `COMPLETED`, `AMBIGUOUS` |
| `provider_reference` text nullable | ID remoto si existe |
| `outcome_code` text nullable | normalizado |
| `started_at` | obligatorio |
| `finished_at` | nullable |

Constraints:

```text
UNIQUE (tenant_id, operation_id, attempt_no)
UNIQUE (correlation_key)
partial UNIQUE (tenant_id, operation_id) WHERE finished_at IS NULL
```

Un intento stale activo se reconcilia; no se asume no enviado.

### `app.work_items`

Scheduler durable.

Campos:

| Campo | Regla |
|---|---|
| `id` uuid | PK |
| `tenant_id` | NOT NULL |
| `operation_id` | FK tenant-safe |
| `kind` text | `SUBMIT`, `RECONCILE`, `FETCH_XML`, `FETCH_PDF` |
| `status` text | `PENDING`, `CLAIMED`, `RETRY`, `DONE`, `DEAD` |
| `available_at` | fecha de ejecución |
| `lease_owner` | nullable |
| `lease_until` | nullable |
| `attempt_count` | >=0 |
| `last_error_code` | nullable, sin payload sensible |
| `created_at`/`updated_at` | obligatorios |

No guardar request fiscal completo aquí.

Índice de claim: `(status, available_at)`; claim con locking/lease. Debe existir constraint/índice para impedir múltiples trabajos activos equivalentes cuando esa duplicación sea peligrosa.

`DEAD` no significa rechazo fiscal; significa que el scheduler requiere atención.

### `app.evidence_records`

Evidencia cruda relevante.

Campos:

- `id` uuid;
- `tenant_id`;
- `operation_id`;
- `provider_attempt_id` nullable;
- `kind` (`PT_RESPONSE`, `PT_ERROR`, `RECONCILIATION_RESPONSE`, etc.);
- `content_json` jsonb nullable;
- `object_key` text nullable;
- `sha256` bytea;
- `content_type`;
- `source`;
- `captured_at`.

Si el contenido es razonablemente pequeño/estructurado puede quedar en DB; binarios/grandes van a storage. El registro de evidencia permanece append-only.

### `app.artifacts`

Metadatos de XML/PDF.

- `id` uuid;
- `tenant_id`;
- `operation_id`;
- `kind` (`XML_VALIDATED`, `PDF_RENDERING`);
- `storage_key` privada;
- `sha256` 32 bytes;
- `byte_size` bigint >=0;
- `content_type`;
- `provider_reference` nullable;
- `retrieved_at`;
- `created_at`.

Cada refetch/cambio material puede crear una nueva fila; no sobrescribir silenciosamente evidencia anterior.

### `app.audit_events`

Registro append-only de acciones relevantes.

Campos mínimos:

- `id` uuid;
- `tenant_id`;
- `event_type`;
- `entity_type`/`entity_id`;
- `actor_type` (`POS`, `API`, `WORKER`, `OPERATOR`, `SYSTEM`);
- `actor_id` no secreto;
- `correlation_id`;
- `from_state`/`to_state` nullable;
- `reason_code`;
- `metadata` jsonb minimizada;
- `created_at`.

Runtime normal: INSERT/SELECT autorizado; no UPDATE/DELETE.

## 4. Relaciones tenant-safe

Una FK simple por `operation_id` no es suficiente para detectar un bug que combine tenant A con ID de B si el ID existe.

Patrón:

```text
fiscal_operations UNIQUE (tenant_id, id)
child FOREIGN KEY (tenant_id, operation_id)
      REFERENCES fiscal_operations (tenant_id, id)
```

Aplicar a attempts, work, evidence, artifacts y referencias entre documentos.

## 5. RLS

Para tablas tenant-owned:

```sql
ALTER TABLE app.<table> ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.<table> FORCE ROW LEVEL SECURITY;
```

Política conceptual:

```text
tenant_id = current transaction tenant
```

El tenant se fija localmente dentro de una transacción después de autenticar. No usar estado de sesión persistente que pueda filtrarse entre conexiones del pool.

El rol de migración/owner no es runtime.

## 6. Excepción controlada: auth y scheduler

`api_credentials` necesita lookup inicial antes de conocer tenant. Dar al módulo/rol API únicamente las columnas/permisos necesarios.

`work_items` necesita claim cross-tenant por worker. El rol worker puede reclamar metadatos operativos globales, pero luego procesa cada operación bajo `tenant_id` explícito/RLS. No se convierte esto en permiso general de lectura fiscal sin contexto.

## 7. Transacciones

### Recepción

Una transacción crea/reutiliza operation y, si nueva, su work item.

### Claim

Transacción corta: seleccionar/lockear trabajo elegible, marcar lease, commit.

### Preparar PT

Transacción corta: verificar estado, crear provider attempt, mover a `SUBMITTING`, audit, commit.

### PT call

Fuera de transacción SQL.

### Resolver

Nueva transacción: guardar evidencia + resultado + transición + finalizar intento.

Nunca mantener lock/transaction SQL durante latencia de red del PT.

## 8. Concurrencia/estado

Usar `state_version` y expected state para actualizaciones. Una transición que esperaba `READY` y encuentra `SUBMITTING` no “corrige” la fila; falla y vuelve a leer.

Las reglas de transición de ADR-004 deben existir en un único componente de dominio y contar con tests de DB/integración. Se recomienda un trigger/guard DB para impedir cambios de columnas inmutables y transiciones imposibles antes del piloto.

## 9. Dinero y cantidades

El envelope F3 no define aún líneas/impuestos completos. Cuando F4 los modele:

- prohibido `float` binario para importes fiscales;
- usar `numeric` con escala definida o entero en unidad mínima cuando la semántica lo permita;
- reglas de redondeo/versionado deben formar parte del contrato.

## 10. Migraciones

- forward-only en producción;
- ninguna migración “arregla” evidencia mediante UPDATE manual masivo sin procedimiento específico;
- cambios destructivos se hacen expand/migrate/contract;
- backup/restauración verificados antes de migraciones de alto riesgo;
- DDL de RLS/grants es código versionado, no click manual en dashboard.

## 11. Pendiente deliberado para F4

- campos exactos del contrato fiscal;
- NIT/responsabilidades/tributos maestros;
- numeración/prefijos/resoluciones según responsabilidades reales del PT;
- provider IDs definitivos;
- canonicalización exacta para `semantic_hash`;
- retención legal exacta.

No son huecos de F3: dependen de contrato fiscal/PT y regulación vigente.
