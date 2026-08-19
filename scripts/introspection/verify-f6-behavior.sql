\set ON_ERROR_STOP on

INSERT INTO app.tenants(id, external_ref)
VALUES
  ('00000000-0000-4000-8000-000000000001', 'verify-tenant-a'),
  ('00000000-0000-4000-8000-000000000002', 'verify-tenant-b');

INSERT INTO app.fiscal_operations(
  id, tenant_id, idempotency_key, semantic_hash, hash_version,
  document_type, contract_version, request_payload
)
VALUES
  (
    '10000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    'verify-a', decode(repeat('11', 32), 'hex'),
    'sha256:fiscal-command-c14n/1', 'FEV', '1.0', '{}'::jsonb
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000002',
    'verify-b', decode(repeat('22', 32), 'hex'),
    'sha256:fiscal-command-c14n/1', 'FEV', '1.0', '{}'::jsonb
  );

INSERT INTO app.work_items(id, tenant_id, operation_id, kind)
VALUES
  (
    '20000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001', 'SUBMIT'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002', 'SUBMIT'
  );

BEGIN;
SET ROLE app_api;
SELECT set_config('app.tenant_id', '00000000-0000-4000-8000-000000000001', true);

DO $$
DECLARE
  visible_count integer;
BEGIN
  SELECT count(*) INTO visible_count FROM app.fiscal_operations;
  IF visible_count <> 1 THEN
    RAISE EXCEPTION 'RLS isolation failed for app_api: visible rows=%', visible_count;
  END IF;
END
$$;

RESET ROLE;
COMMIT;

BEGIN;
SET ROLE app_worker;
SELECT set_config('app.tenant_id', '00000000-0000-4000-8000-000000000001', true);

DO $$
DECLARE
  touched integer;
BEGIN
  UPDATE app.fiscal_operations
  SET status = 'READY', state_version = 2
  WHERE id = '10000000-0000-4000-8000-000000000002';
  GET DIAGNOSTICS touched = ROW_COUNT;

  IF touched <> 0 THEN
    RAISE EXCEPTION 'worker crossed tenant boundary';
  END IF;
END
$$;

DO $$
BEGIN
  BEGIN
    UPDATE app.fiscal_operations
    SET status = 'UNKNOWN', state_version = 2
    WHERE id = '10000000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'invalid PERSISTED -> UNKNOWN transition was accepted';
  EXCEPTION
    WHEN check_violation THEN
      NULL;
  END;
END
$$;

UPDATE app.fiscal_operations
SET status = 'READY', state_version = 2
WHERE id = '10000000-0000-4000-8000-000000000001';

RESET ROLE;
COMMIT;

SET ROLE app_worker;
DO $$
DECLARE
  first_id uuid;
  second_id uuid;
BEGIN
  SELECT id INTO first_id FROM app.claim_work_item('verify-worker-1', 30);
  SELECT id INTO second_id FROM app.claim_work_item('verify-worker-2', 30);

  IF first_id IS NULL OR second_id IS NULL OR first_id = second_id THEN
    RAISE EXCEPTION 'work claim did not return two distinct jobs';
  END IF;
END
$$;
RESET ROLE;

SELECT 'F6 behavioral verification PASS' AS result;
