-- F6 internal hardening: dedicated operational roles and kill-switch history.
-- app_ops is cross-tenant read-only and intentionally BYPASSRLS, but receives
-- only narrow SELECT privileges.
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

CREATE TABLE IF NOT EXISTS app.runtime_control_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  previous_accept_new_operations boolean NOT NULL,
  previous_provider_mutations_enabled boolean NOT NULL,
  accept_new_operations boolean NOT NULL,
  provider_mutations_enabled boolean NOT NULL,
  reason text,
  changed_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app.runtime_control_events OWNER TO app_migrator;
REVOKE ALL ON app.runtime_control_events FROM PUBLIC, app_api, app_worker, app_ops, app_ops_control;

CREATE OR REPLACE FUNCTION app.audit_runtime_control_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, app
AS $$
BEGIN
  INSERT INTO app.runtime_control_events (
    previous_accept_new_operations,
    previous_provider_mutations_enabled,
    accept_new_operations,
    provider_mutations_enabled,
    reason,
    changed_by
  )
  VALUES (
    OLD.accept_new_operations,
    OLD.provider_mutations_enabled,
    NEW.accept_new_operations,
    NEW.provider_mutations_enabled,
    NEW.reason,
    NEW.updated_by
  );

  RETURN NEW;
END
$$;

ALTER FUNCTION app.audit_runtime_control_update() OWNER TO app_migrator;
REVOKE ALL ON FUNCTION app.audit_runtime_control_update() FROM PUBLIC, app_api, app_worker, app_ops, app_ops_control;

DROP TRIGGER IF EXISTS runtime_controls_audit_update ON app.runtime_controls;
CREATE TRIGGER runtime_controls_audit_update
AFTER UPDATE ON app.runtime_controls
FOR EACH ROW EXECUTE FUNCTION app.audit_runtime_control_update();

INSERT INTO app.runtime_control_events (
  previous_accept_new_operations,
  previous_provider_mutations_enabled,
  accept_new_operations,
  provider_mutations_enabled,
  reason,
  changed_by
)
SELECT
  rc.accept_new_operations,
  rc.provider_mutations_enabled,
  rc.accept_new_operations,
  rc.provider_mutations_enabled,
  COALESCE(rc.reason, 'operational audit baseline'),
  'migration'
FROM app.runtime_controls AS rc
WHERE rc.singleton_id = 1
  AND NOT EXISTS (SELECT 1 FROM app.runtime_control_events);

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
GRANT SELECT ON app.runtime_control_events TO app_ops;

GRANT SELECT ON app.runtime_controls TO app_ops_control;
GRANT UPDATE (
  accept_new_operations,
  provider_mutations_enabled,
  reason,
  updated_at,
  updated_by
) ON app.runtime_controls TO app_ops_control;

COMMENT ON TABLE app.runtime_control_events IS
  'Append-only operational history of runtime kill-switch changes. Runtime roles cannot write it directly.';
COMMENT ON FUNCTION app.audit_runtime_control_update() IS
  'SECURITY DEFINER trigger that records every runtime_controls update in append-only operational history.';
COMMENT ON ROLE app_ops IS
  'NOLOGIN cross-tenant operational observer. BYPASSRLS but only narrow SELECT grants; use via explicit SET ROLE from an authorized operator login.';
COMMENT ON ROLE app_ops_control IS
  'NOLOGIN operational control role. Can read runtime_controls and update kill-switch metadata only; no fiscal table mutation privileges.';
