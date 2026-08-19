\set ON_ERROR_STOP on

DO $$
DECLARE
  role_name text;
BEGIN
  FOREACH role_name IN ARRAY ARRAY['app_api', 'app_worker', 'app_migrator'] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_roles
      WHERE rolname = role_name
        AND NOT rolsuper
        AND NOT rolcreatedb
        AND NOT rolcreaterole
        AND NOT rolbypassrls
    ) THEN
      RAISE EXCEPTION 'role % missing or over-privileged', role_name;
    END IF;
  END LOOP;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'app_ops'
      AND NOT rolcanlogin
      AND NOT rolsuper
      AND NOT rolcreatedb
      AND NOT rolcreaterole
      AND rolbypassrls
  ) THEN
    RAISE EXCEPTION 'app_ops missing or role attributes are unsafe';
  END IF;
END
$$;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'tenants', 'fiscal_operations', 'provider_attempts', 'work_items',
    'evidence_records', 'artifacts', 'audit_events'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'app'
        AND c.relname = table_name
        AND c.relrowsecurity
        AND c.relforcerowsecurity
    ) THEN
      RAISE EXCEPTION 'RLS/FORCE RLS missing on app.%', table_name;
    END IF;
  END LOOP;
END
$$;

DO $$
BEGIN
  IF has_table_privilege('app_api', 'app.api_credentials', 'SELECT')
     OR has_table_privilege('app_worker', 'app.api_credentials', 'SELECT') THEN
    RAISE EXCEPTION 'runtime role has direct SELECT on api_credentials';
  END IF;

  IF has_table_privilege('app_api', 'app.fiscal_operations', 'UPDATE') THEN
    RAISE EXCEPTION 'app_api must not advance fiscal operation state';
  END IF;

  IF has_table_privilege('app_worker', 'app.fiscal_operations', 'INSERT') THEN
    RAISE EXCEPTION 'app_worker must not create POS fiscal operations';
  END IF;

  IF NOT has_function_privilege(
    'app_api', 'app.lookup_api_credential(uuid)', 'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'app_api cannot execute credential lookup function';
  END IF;

  IF NOT has_function_privilege(
    'app_worker', 'app.claim_work_item(text,integer)', 'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'app_worker cannot execute work claim function';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT has_column_privilege(
    'app_ops', 'app.fiscal_operations', 'status', 'SELECT'
  ) THEN
    RAISE EXCEPTION 'app_ops cannot read fiscal status';
  END IF;

  IF NOT has_column_privilege(
    'app_ops', 'app.work_items', 'lease_until', 'SELECT'
  ) THEN
    RAISE EXCEPTION 'app_ops cannot inspect queue leases';
  END IF;

  IF NOT has_column_privilege(
    'app_ops', 'app.runtime_controls', 'provider_mutations_enabled', 'SELECT'
  ) THEN
    RAISE EXCEPTION 'app_ops cannot inspect runtime controls';
  END IF;

  IF has_column_privilege(
    'app_ops', 'app.fiscal_operations', 'request_payload', 'SELECT'
  ) THEN
    RAISE EXCEPTION 'app_ops must not read fiscal request payloads';
  END IF;

  IF has_column_privilege(
    'app_ops', 'app.provider_attempts', 'request_hash', 'SELECT'
  ) THEN
    RAISE EXCEPTION 'app_ops must not read provider request hashes';
  END IF;

  IF has_table_privilege('app_ops', 'app.api_credentials', 'SELECT')
     OR has_column_privilege(
       'app_ops', 'app.api_credentials', 'secret_digest', 'SELECT'
     ) THEN
    RAISE EXCEPTION 'app_ops must not read API credential material';
  END IF;

  IF has_table_privilege('app_ops', 'app.fiscal_operations', 'UPDATE')
     OR has_table_privilege('app_ops', 'app.work_items', 'UPDATE')
     OR has_table_privilege('app_ops', 'app.runtime_controls', 'UPDATE') THEN
    RAISE EXCEPTION 'app_ops must be read-only';
  END IF;
END
$$;

DO $$
DECLARE
  controls app.runtime_controls%ROWTYPE;
BEGIN
  SELECT * INTO STRICT controls
  FROM app.runtime_controls
  WHERE singleton_id = 1;

  IF controls.accept_new_operations OR controls.provider_mutations_enabled THEN
    RAISE EXCEPTION 'runtime kill switches must default fail-closed';
  END IF;
END
$$;

DO $$
DECLARE
  object_name text;
  object_owner text;
BEGIN
  FOREACH object_name IN ARRAY ARRAY[
    'tenants', 'api_credentials', 'fiscal_operations', 'provider_attempts',
    'work_items', 'evidence_records', 'artifacts', 'audit_events',
    'runtime_controls'
  ] LOOP
    SELECT pg_get_userbyid(c.relowner)
      INTO object_owner
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'app' AND c.relname = object_name AND c.relkind = 'r';

    IF object_owner IS DISTINCT FROM 'app_migrator' THEN
      RAISE EXCEPTION 'app.% owner is %, expected app_migrator', object_name, object_owner;
    END IF;
  END LOOP;
END
$$;

DO $$
BEGIN
  IF to_regclass('app.provider_attempts_one_open_mutation_per_operation') IS NULL THEN
    RAISE EXCEPTION 'provider attempt active uniqueness index missing';
  END IF;
  IF to_regclass('app.work_items_one_active_equivalent') IS NULL THEN
    RAISE EXCEPTION 'work item active uniqueness index missing';
  END IF;
  IF to_regclass('app.work_items_claim_idx') IS NULL THEN
    RAISE EXCEPTION 'work claim index missing';
  END IF;
END
$$;

SELECT 'F6 core schema verification PASS' AS result;
