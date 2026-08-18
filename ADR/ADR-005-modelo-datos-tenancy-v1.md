# ADR-005: Modelo de datos, tenancy e invariantes de persistencia V1

- **Estado:** Aprobado
- **Fecha:** 2026-08-18
- **Depende de:** ADR-003 y ADR-004
- **Detalle:** `docs/f3-modelo-datos-v1.md`

## Contexto

V1 necesita que duplicación, cruce de tenants, pérdida de intentos y corrupción de estados sean difíciles incluso ante bugs futuros. No basta con convenciones en TypeScript.

## Decisión

### 1. Un esquema privado de aplicación

Las tablas V1 vivirán bajo un esquema PostgreSQL dedicado (`app`) que no se expondrá como API de datos pública.

Si se usa Supabase, la aplicación NestJS seguirá accediendo por conexión PostgreSQL directa. El Data API no se utilizará para exponer las tablas fiscales al POS.

### 2. IDs

Los IDs internos serán UUID aleatorios generados por servidor/base de datos. V1 no necesita IDs secuenciales públicos ni una dependencia adicional solo por UUIDv7.

Los IDs impredecibles son defensa adicional contra enumeración, pero **no sustituyen autorización**.

### 3. Tablas núcleo

El modelo mínimo contiene:

- `tenants`;
- `api_credentials`;
- `fiscal_operations`;
- `provider_attempts`;
- `work_items`;
- `evidence_records`;
- `artifacts`;
- `audit_events`.

El detalle de campos/constraints está en `docs/f3-modelo-datos-v1.md`.

### 4. Tenant obligatorio

Toda entidad fiscal/evidencia/artefacto/trabajo debe llevar `tenant_id NOT NULL`.

Referencias entre entidades tenant-owned usarán claves/constraints que impidan relacionar accidentalmente filas de tenants distintos.

### 5. Tenant derivado de autenticación

El POS **no elige el tenant mediante body/query/header arbitrario**.

La credencial autenticada resuelve exactamente un tenant V1. Ese contexto se propaga al acceso de datos.

### 6. RLS como segunda barrera

Las tablas tenant-owned habilitarán PostgreSQL Row-Level Security y, donde aplique, `FORCE ROW LEVEL SECURITY`.

Los roles runtime:

- no serán propietarios de tablas;
- no tendrán `BYPASSRLS`;
- no usarán `postgres`, `service_role` ni otra credencial administrativa como identidad normal de aplicación.

El contexto tenant se fijará localmente por transacción (`SET LOCAL`/`set_config(..., true)` o equivalente) para evitar contaminación entre conexiones de pool.

### 7. Roles DB separados

Como mínimo:

- `app_api`: acceso del runtime HTTP;
- `app_worker`: procesamiento/reconciliación;
- `app_migrator`: DDL/migraciones, nunca runtime.

`app_api` no necesita secreto del PT ni permiso para reclamar trabajo global.

`app_worker` puede reclamar `work_items` de todos los tenants, pero después procesa cada operación bajo contexto tenant explícito. `work_items` no contendrá el payload fiscal completo.

### 8. Idempotencia en DB

`fiscal_operations` tendrá unicidad estricta por:

```text
(tenant_id, idempotency_key)
```

Es deliberadamente más estricta que permitir reutilizar la misma key por endpoint/tipo de operación.

También se almacena `semantic_hash` y versión de canonicalización/contrato para detectar reutilización de key con contenido diferente.

### 9. Payload de ingreso inmutable

La operación conserva un snapshot JSON versionado del comando aceptado y su hash. `tenant_id`, idempotency key, hash, tipo documental, versión y payload original no se modifican después de crear la operación.

El modelo fiscal detallado de FEV/NC/ND/DEE se define con el contrato F4; F3 no inventa columnas regulatorias antes de conocer el contrato interno/PT.

### 10. Concurrencia

Cada operación llevará `state_version` y las transiciones usarán expected-state/locking para impedir lost updates.

La base impondrá, como mínimo:

- unicidad de idempotencia;
- como máximo un `provider_attempt` mutante activo por operación;
- unicidad de número de intento por operación;
- como máximo un trabajo activo equivalente por operación/tipo cuando corresponda;
- foreign keys tenant-consistentes;
- checks de estados/tipos válidos.

Las transiciones autorizadas de ADR-004 se implementarán y probarán centralmente; no se permitirá que controllers escriban estados arbitrarios.

### 11. Evidencia append-only

`evidence_records` y `audit_events` no tendrán UPDATE/DELETE para roles runtime normales.

Correcciones generan nuevos eventos/registros. No se “limpia” evidencia histórica sobrescribiéndola.

No se introduce hash-chain criptográfico V1: añadir complejidad criptográfica sin una raíz de confianza externa no sustituye controles de acceso, backups y auditoría.

### 12. Trabajo durable separado del estado fiscal

`work_items` es mutable y operacional. Puede reintentarse, expirarse o compactarse según política futura.

Nunca será la única evidencia de que una operación fiscal existe ni determinará por sí solo su resultado.

### 13. Artefactos

Los binarios viven en object storage privado. PostgreSQL conserva metadatos, checksum SHA-256, tamaño, tipo, tenant, operación, procedencia y key interna.

No se almacenan URLs públicas permanentes.

### 14. Backups

La base productiva debe usar backup administrado con recuperación puntual o equivalente suficiente para no aceptar una ventana de pérdida de un día completo como postura normal de un sistema fiscal.

El RPO/RTO final se fija y mide con el proveedor productivo antes del piloto. La restauración real sigue siendo gate obligatorio.

## Decisiones rechazadas

- schema/base por tenant;
- tenant tomado del request sin vínculo con credencial;
- filtros `WHERE tenant_id` como única defensa;
- `service_role`/superusuario como credencial general de runtime;
- IDs secuenciales expuestos como defensa de seguridad;
- almacenar solo hash sin snapshot de comando;
- actualizar/borrar evidencia para corregir errores;
- guardar payload fiscal completo dentro de la cola.

## Evidencia externa relevante

PostgreSQL documenta que RLS aplica políticas por fila y que propietarios/BYPASSRLS pueden eludirlas salvo controles específicos. Supabase documenta que claves secret/service role tienen acceso elevado y pueden bypass RLS. Por ello la separación de roles es parte de la decisión, no una recomendación opcional.
