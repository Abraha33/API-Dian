\set ON_ERROR_STOP on

DO $$
DECLARE
  login_name text;
BEGIN
  FOREACH login_name IN ARRAY ARRAY[
    'api_dian_dev', 'api_dian_worker_dev', 'api_dian_ops_dev'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = login_name
        AND rolcanlogin
        AND NOT rolsuper
        AND NOT rolcreatedb
        AND NOT rolcreaterole
        AND NOT rolreplication
        AND NOT rolbypassrls
    ) THEN
      RAISE EXCEPTION 'local runtime login % missing or over-privileged', login_name;
    END IF;
  END LOOP;
END
$$;

DO $$
BEGIN
  IF NOT pg_has_role('api_dian_dev', 'app_api', 'MEMBER') THEN
    RAISE EXCEPTION 'api_dian_dev is not a member of app_api';
  END IF;
  IF pg_has_role('api_dian_dev', 'app_worker', 'MEMBER')
     OR pg_has_role('api_dian_dev', 'app_ops', 'MEMBER')
     OR pg_has_role('api_dian_dev', 'app_ops_control', 'MEMBER')
     OR pg_has_role('api_dian_dev', 'app_migrator', 'MEMBER') THEN
    RAISE EXCEPTION 'api_dian_dev has forbidden role membership';
  END IF;

  IF NOT pg_has_role('api_dian_worker_dev', 'app_worker', 'MEMBER') THEN
    RAISE EXCEPTION 'api_dian_worker_dev is not a member of app_worker';
  END IF;
  IF pg_has_role('api_dian_worker_dev', 'app_api', 'MEMBER')
     OR pg_has_role('api_dian_worker_dev', 'app_ops', 'MEMBER')
     OR pg_has_role('api_dian_worker_dev', 'app_ops_control', 'MEMBER')
     OR pg_has_role('api_dian_worker_dev', 'app_migrator', 'MEMBER') THEN
    RAISE EXCEPTION 'api_dian_worker_dev has forbidden role membership';
  END IF;

  IF NOT pg_has_role('api_dian_ops_dev', 'app_ops', 'MEMBER')
     OR NOT pg_has_role('api_dian_ops_dev', 'app_ops_control', 'MEMBER') THEN
    RAISE EXCEPTION 'api_dian_ops_dev lacks required ops roles';
  END IF;
  IF pg_has_role('api_dian_ops_dev', 'app_api', 'MEMBER')
     OR pg_has_role('api_dian_ops_dev', 'app_worker', 'MEMBER')
     OR pg_has_role('api_dian_ops_dev', 'app_migrator', 'MEMBER') THEN
    RAISE EXCEPTION 'api_dian_ops_dev has forbidden runtime/migrator membership';
  END IF;
END
$$;

DO $$
BEGIN
  IF has_table_privilege('api_dian_dev', 'app.fiscal_operations', 'UPDATE') THEN
    RAISE EXCEPTION 'local API login can update fiscal operation state';
  END IF;

  IF has_table_privilege('api_dian_worker_dev', 'app.fiscal_operations', 'INSERT') THEN
    RAISE EXCEPTION 'local worker login can create fiscal operations';
  END IF;

  IF has_column_privilege(
    'api_dian_ops_dev', 'app.fiscal_operations', 'request_payload', 'SELECT'
  ) THEN
    RAISE EXCEPTION 'local ops login can read fiscal request payloads';
  END IF;

  IF has_table_privilege('api_dian_ops_dev', 'app.api_credentials', 'SELECT') THEN
    RAISE EXCEPTION 'local ops login can read API credentials';
  END IF;
END
$$;

SELECT 'Local runtime role verification PASS' AS result;
