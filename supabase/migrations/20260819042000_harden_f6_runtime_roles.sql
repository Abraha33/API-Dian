-- F6-A hardening: separate object ownership from runtime permissions.
-- This migration intentionally narrows runtime privileges after the core schema exists.

REVOKE UPDATE ON app.fiscal_operations FROM app_api;
REVOKE INSERT ON app.fiscal_operations FROM app_worker;

ALTER SCHEMA app OWNER TO app_migrator;

ALTER TABLE app.tenants OWNER TO app_migrator;
ALTER TABLE app.api_credentials OWNER TO app_migrator;
ALTER TABLE app.fiscal_operations OWNER TO app_migrator;
ALTER TABLE app.provider_attempts OWNER TO app_migrator;
ALTER TABLE app.work_items OWNER TO app_migrator;
ALTER TABLE app.evidence_records OWNER TO app_migrator;
ALTER TABLE app.artifacts OWNER TO app_migrator;
ALTER TABLE app.audit_events OWNER TO app_migrator;
ALTER TABLE app.runtime_controls OWNER TO app_migrator;

ALTER FUNCTION app.current_tenant_id() OWNER TO app_migrator;
ALTER FUNCTION app.lookup_api_credential(uuid) OWNER TO app_migrator;
ALTER FUNCTION app.claim_work_item(text, integer) OWNER TO app_migrator;
ALTER FUNCTION app.guard_fiscal_operation_update() OWNER TO app_migrator;
ALTER FUNCTION app.guard_provider_attempt_insert() OWNER TO app_migrator;
ALTER FUNCTION app.guard_provider_attempt_update() OWNER TO app_migrator;

ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator IN SCHEMA app
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator IN SCHEMA app
  REVOKE ALL ON TABLES FROM PUBLIC;

COMMENT ON ROLE app_api IS
  'API runtime: tenant-scoped reads/inserts only; cannot advance fiscal state.';
COMMENT ON ROLE app_worker IS
  'Worker runtime: advances persisted operations and performs provider workflow; no DDL.';
COMMENT ON ROLE app_migrator IS
  'NOLOGIN owner role for app schema and migrations; never used as normal runtime identity.';
