\set ON_ERROR_STOP on

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ci_api') THEN
    CREATE ROLE ci_api LOGIN PASSWORD 'ci_api' IN ROLE app_api;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ci_worker') THEN
    CREATE ROLE ci_worker LOGIN PASSWORD 'ci_worker' IN ROLE app_worker;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ci_ops') THEN
    CREATE ROLE ci_ops LOGIN PASSWORD 'ci_ops';
  END IF;
END
$$;

GRANT app_ops, app_ops_control TO ci_ops;

INSERT INTO app.tenants(id, external_ref)
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'f6b-tenant-a'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'f6b-tenant-b')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app.api_credentials(
  id, tenant_id, secret_digest, digest_version, label, status
)
VALUES (
  'aaaaaaaa-0000-4000-8000-000000000001',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  decode('0bc38b69de00eb6d21beb6c1afd35b7f227ed1b40b9fc495207ec21ff320767c', 'hex'),
  'hmac-sha256-v1',
  'f6b-e2e',
  'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO app.fiscal_operations(
  id, tenant_id, idempotency_key, semantic_hash, hash_version,
  document_type, contract_version, request_payload, status
)
VALUES (
  'bbbbbbbb-0000-4000-8000-000000000099',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  'tenant-b-seeded',
  decode(repeat('33', 32), 'hex'),
  'sha256:fiscal-command-c14n/1',
  'FEV', '1.0',
  '{"schema_version":"1.0","document_kind":"FEV","client_reference":"tenant-b","occurred_at":"2026-08-18T22:30:10-05:00","currency":"COP","document":{}}'::jsonb,
  'ACCEPTED'
)
ON CONFLICT (tenant_id, idempotency_key) DO NOTHING;

UPDATE app.runtime_controls
SET accept_new_operations = true,
    provider_mutations_enabled = true,
    reason = 'F6B CI only',
    updated_at = now(),
    updated_by = 'provision-f6b-ci'
WHERE singleton_id = 1;
