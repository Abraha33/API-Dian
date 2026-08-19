# Runbook operativo — worker fiscal V1

**Corte:** 2026-08-19  
**Ámbito:** operación interna API-DIAN antes de F6C  
**Regla principal:** `UNKNOWN != REEMITIR`

Este runbook cubre únicamente el protocolo interno ya implementado y probado con `FakeFiscalProvider`. Cuando exista un PT real, sus procedimientos específicos se agregan solo después de F4C/F5B.

## 1. Roles operativos

Los procesos normales no deben usarse para administración:

- `app_api`: runtime HTTP tenant-scoped;
- `app_worker`: runtime worker;
- `app_ops`: observación cross-tenant, **NOLOGIN**, BYPASSRLS, solo columnas operativas explícitamente permitidas;
- `app_ops_control`: control de kill switches, **NOLOGIN**, sin BYPASSRLS y sin permisos sobre tablas fiscales;
- `app_migrator`: dueño de schema/DDL, no es rol operativo normal.

El login humano/automatizado de operaciones debe ser miembro de `app_ops` y `app_ops_control`, y usar `SET ROLE` explícito. No debe ser miembro de `app_api`, `app_worker` ni usar superusuario para operación cotidiana.

## 2. Reporte operativo

Ejecutar con el login de operaciones:

```bash
psql "$OPS_DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f scripts/ops/fiscal-ops-report.sql
```

El script ejecuta `SET LOCAL ROLE app_ops` dentro de una transacción read-only y no consulta payloads fiscales, credenciales ni hashes de request.

Revisar en este orden:

1. `runtime_controls`;
2. historial reciente de cambios de controles;
3. operaciones por estado;
4. work queue por estado/tipo;
5. trabajos ejecutables más antiguos;
6. leases expirados;
7. `UNKNOWN` / `RECONCILING`;
8. `NEEDS_ATTENTION`;
9. attempts abiertos o ambiguos.

## 3. Interpretación rápida

### `UNKNOWN`

Significa que **no sabemos** si el side effect remoto ocurrió.

Acción:

- no crear un nuevo SUBMIT;
- no editar el estado manualmente;
- permitir/forzar únicamente el flujo de reconciliación ya modelado;
- correlacionar logs por `operation_id`, `work_id` y `attempt_id`.

### `RECONCILING`

La operación está buscando evidencia concluyente.

Acción:

- no reemitir;
- si el número crece de forma anormal, considerar apagar nuevas mutaciones del proveedor mientras la reconciliación sigue activa.

### `NEEDS_ATTENTION`

La reconciliación automática agotó su política o no pudo resolver la ambigüedad.

Acción:

- tratar como caso manual prioritario;
- no alterar `fiscal_operations.status` por SQL;
- conservar evidencia y referencias;
- con PT real, consultar únicamente mecanismos documentados/contractuales antes de decidir cualquier reenvío.

### `CLAIMED` con lease expirado

Puede indicar caída del worker o trabajo abandonado.

Acción:

- verificar/reiniciar el worker;
- no limpiar `lease_owner`/`lease_until` manualmente;
- `app.claim_work_item` ya puede reclamar leases vencidos de forma durable.

### `PENDING`/`RETRY` envejecido

Acción:

- confirmar que el worker está vivo;
- revisar `provider_mutations_enabled`;
- revisar logs `worker_job_completed`;
- cuando exista PT real, revisar además disponibilidad/rate limits del proveedor según contrato real.

## 4. Telemetría estructurada del worker

El worker emite estos eventos sin payloads ni credenciales:

```text
worker_job_completed
provider_submit_result
provider_reconcile_result
```

Campos principales:

```text
worker_id
work_id
operation_id
tenant_id
work_kind
attempt_count
attempt_id (cuando aplica)
outcome
normalized_code (cuando aplica)
elapsed_ms
```

Resultados ambiguos, retries, recuperación a UNKNOWN, dead-letter, pausa de mutaciones y errores no manejados se registran a nivel warning.

No agregar a logs:

- `Authorization`;
- token/secret/pepper;
- `DATABASE_URL`;
- request payload fiscal;
- XML/PDF;
- credenciales del PT.

El logger contiene redacción defensiva de claves sensibles, pero la regla primaria sigue siendo **no loguearlas**.

## 5. Kill switch: detener nuevos side effects al proveedor

Usar cuando existe riesgo de duplicidad, timeout/ambigüedad generalizada, incidente del adapter o comportamiento inesperado del PT.

```bash
psql "$OPS_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
SET LOCAL ROLE app_ops_control;
UPDATE app.runtime_controls
SET provider_mutations_enabled = false,
    reason = 'INC-XXXX: pausa preventiva de mutaciones',
    updated_at = now(),
    updated_by = session_user
WHERE singleton_id = 1;
COMMIT;
SQL
```

Efecto esperado:

- no se inician nuevos `submit` remotos;
- trabajos SUBMIT quedan reprogramados/pausados;
- reconcile/read siguen disponibles;
- recuperación segura de `SUBMITTING → UNKNOWN` sigue permitida porque no crea un nuevo side effect remoto.

Cada UPDATE queda registrado automáticamente en `app.runtime_control_events` mediante trigger append-only.

## 6. Kill switch: detener intake nuevo

Usar cuando no es seguro aceptar más operaciones nuevas, por ejemplo durante una degradación severa o una inconsistencia interna.

```bash
psql "$OPS_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
SET LOCAL ROLE app_ops_control;
UPDATE app.runtime_controls
SET accept_new_operations = false,
    reason = 'INC-XXXX: intake fiscal pausado',
    updated_at = now(),
    updated_by = session_user
WHERE singleton_id = 1;
COMMIT;
SQL
```

Esto no borra ni cancela operaciones ya persistidas.

## 7. Rehabilitar operaciones

No reactivar por intuición. Antes:

1. ejecutar `scripts/ops/fiscal-ops-report.sql`;
2. confirmar que no hay crecimiento inesperado de `UNKNOWN`/`NEEDS_ATTENTION`;
3. confirmar que leases y queue progresan;
4. verificar la causa raíz;
5. cuando exista PT real, confirmar salud/semántica con evidencia del proveedor;
6. registrar un `reason` explícito.

Ejemplo para reactivar mutaciones:

```bash
psql "$OPS_DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
BEGIN;
SET LOCAL ROLE app_ops_control;
UPDATE app.runtime_controls
SET provider_mutations_enabled = true,
    reason = 'INC-XXXX resuelto: mutaciones reanudadas',
    updated_at = now(),
    updated_by = session_user
WHERE singleton_id = 1;
COMMIT;
SQL
```

La reactivación de intake se hace de forma separada cambiando `accept_new_operations = true`. Separar ambos switches evita reabrir dos superficies de riesgo en una sola acción.

## 8. Crash del worker

Si el proceso cae:

1. no modificar filas manualmente;
2. reiniciar el worker con el mismo diseño de permisos (`app_worker`);
3. ejecutar el reporte operativo;
4. verificar operaciones que quedaron `SUBMITTING`.

El protocolo implementado no vuelve a llamar `submit` para una operación recuperada en `SUBMITTING`; primero la mueve a `UNKNOWN` y encola reconciliación.

## 9. Prohibiciones operativas

Nunca durante operación normal:

- `UPDATE app.fiscal_operations SET status = ...` manual;
- borrar `provider_attempts`;
- borrar/recrear work items para “destrabar” una factura;
- limpiar leases por SQL;
- convertir timeout en retry ciego;
- interpretar un 404 futuro del PT como `NOT_FOUND_CONCLUSIVE` sin contrato/prueba;
- usar `app_migrator` o superusuario como login cotidiano;
- compartir credenciales API/worker/ops entre procesos.

## 10. Escalamiento antes de F6C

Mientras no exista PT seleccionado, un incidente que dependa de semántica externa se detiene en el límite del fake. No se inventan endpoints, códigos, backoff, búsquedas ni reglas de retry.

El siguiente documento que habilita comportamiento real del proveedor es el resultado de F4C/F5B, no este runbook.
