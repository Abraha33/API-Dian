-- F6 internal hardening: dedicated operational roles.
-- app_ops is cross-tenant read-only and intentionally BYPASSRLS, but receives
-- only narrow column-level SELECT privileges.
-- app_ops_control cannot bypass RLS and can update only runtime kill switches.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_ops') THEN
    CREATE ROLE app_ops
      NOLOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOREPLICATION
      BYPASSRLS;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_ops_control') THEN
    CREATE ROLE app_ops_control
      NOLOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOREPLICATION
      NOBYPASSRLS;
  END IF;
END
$$;

REVOKE ALL ON SCHEMA app FROM app_ops, app_ops_control;
GRANT USAGE ON SCHEMA app TO app_ops, app_ops_control;

REVOKE ALL ON ALL TABLES IN SCHEMA app FROM app_ops, app_ops_control;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app FROM app_ops, app_ops_control;

GRANT SELECT (
  id,
  tenant_id,
  document_type,
  status,
  state_version,
  created_at,
  updated_at
) ON app.fiscal_operations TO app_ops;

GRANT SELECT (
  id,
  tenant_id,
  operation_id,
  attempt_no,
  status,
  outcome_code,
  started_at,
  finished_at
) ON app.provider_attempts TO app_ops;

GRANT SELECT (
  id,
  tenant_id,
  operation_id,
  kind,
  status,
  available_at,
  lease_owner,
  lease_until,
  attempt_count,
  last_error_code,
  created_at,
  updated_at
) ON app.work_items TO app_ops;

GRANT SELECT (
  singleton_id,
  accept_new_operations,
  provider_mutations_enabled,
  reason,
  updated_at,
  updated_by
) ON app.runtime_controls TO app_ops;

GRANT SELECT ON app.runtime_controls TO app_ops_control;
GRANT UPDATE (
  accept_new_operations,
  provider_mutations_enabled,
  reason,
  updated_at,
  updated_by
) ON app.runtime_controls TO app_ops_control;

COMMENT ON ROLE app_ops IS
  'NOLOGIN cross-tenant operational observer. BYPASSRLS but only narrow column-level SELECT grants; use via explicit SET ROLE from an authorized operator login.';
COMMENT ON ROLE app_ops_control IS
  'NOLOGIN operational control role. Can read runtime_controls and update kill-switch metadata only; no fiscal table mutation privileges.';
