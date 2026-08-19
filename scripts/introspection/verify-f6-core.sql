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
