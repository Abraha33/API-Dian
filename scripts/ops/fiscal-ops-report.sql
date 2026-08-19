\set ON_ERROR_STOP on

BEGIN TRANSACTION READ ONLY;
SET LOCAL ROLE app_ops;

\echo '=== runtime controls ==='
SELECT
  accept_new_operations,
  provider_mutations_enabled,
  reason,
  updated_at,
  updated_by
FROM app.runtime_controls
WHERE singleton_id = 1;

\echo '=== recent runtime control changes ==='
SELECT
  previous_accept_new_operations,
  previous_provider_mutations_enabled,
  accept_new_operations,
  provider_mutations_enabled,
  reason,
  changed_by,
  created_at
FROM app.runtime_control_events
ORDER BY created_at DESC
LIMIT 20;

\echo '=== fiscal operations by state ==='
SELECT status, count(status) AS total
FROM app.fiscal_operations
GROUP BY status
ORDER BY status;

\echo '=== work queue by kind/status ==='
SELECT kind, status, count(id) AS total
FROM app.work_items
GROUP BY kind, status
ORDER BY kind, status;

\echo '=== oldest runnable work ==='
SELECT
  id,
  tenant_id,
  operation_id,
  kind,
  status,
  attempt_count,
  available_at,
  now() - available_at AS waiting_for,
  last_error_code
FROM app.work_items
WHERE status IN ('PENDING', 'RETRY')
ORDER BY available_at, id
LIMIT 25;

\echo '=== expired claims ==='
SELECT
  id,
  tenant_id,
  operation_id,
  kind,
  lease_owner,
  lease_until,
  now() - lease_until AS lease_expired_by,
  attempt_count
FROM app.work_items
WHERE status = 'CLAIMED'
  AND lease_until <= now()
ORDER BY lease_until
LIMIT 25;

\echo '=== ambiguous/reconciling operations ==='
SELECT
  id,
  tenant_id,
  document_type,
  status,
  state_version,
  updated_at,
  now() - updated_at AS state_age
FROM app.fiscal_operations
WHERE status IN ('UNKNOWN', 'RECONCILING')
ORDER BY updated_at
LIMIT 50;

\echo '=== operations requiring human attention ==='
SELECT
  id,
  tenant_id,
  document_type,
  status,
  state_version,
  updated_at,
  now() - updated_at AS state_age
FROM app.fiscal_operations
WHERE status = 'NEEDS_ATTENTION'
ORDER BY updated_at
LIMIT 50;

\echo '=== open/ambiguous provider attempts ==='
SELECT
  id,
  tenant_id,
  operation_id,
  attempt_no,
  status,
  outcome_code,
  started_at,
  finished_at,
  now() - started_at AS attempt_age
FROM app.provider_attempts
WHERE finished_at IS NULL
   OR status = 'AMBIGUOUS'
ORDER BY started_at
LIMIT 50;

COMMIT;
