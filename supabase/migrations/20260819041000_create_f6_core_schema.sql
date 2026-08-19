-- F6-A core persistence for API-DIAN V1.
-- Authority: ADR-003..009. No provider-specific schema lives here.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_api') THEN
    CREATE ROLE app_api NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_worker') THEN
    CREATE ROLE app_worker NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_migrator') THEN
    CREATE ROLE app_migrator NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
  END IF;
END
$$;

CREATE SCHEMA IF NOT EXISTS app;
REVOKE ALL ON SCHEMA app FROM PUBLIC;
GRANT USAGE ON SCHEMA app TO app_api, app_worker, app_migrator;

CREATE OR REPLACE FUNCTION app.current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
PARALLEL SAFE
AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid
$$;

REVOKE ALL ON FUNCTION app.current_tenant_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.current_tenant_id() TO app_api, app_worker;

CREATE TABLE app.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_ref text,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id)
);

CREATE TABLE app.api_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  secret_digest bytea NOT NULL,
  digest_version text NOT NULL,
  label text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  last_used_at timestamptz,
  CHECK ((status = 'REVOKED') = (revoked_at IS NOT NULL))
);

CREATE TABLE app.fiscal_operations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  idempotency_key text NOT NULL CHECK (char_length(idempotency_key) BETWEEN 1 AND 200),
  semantic_hash bytea NOT NULL CHECK (octet_length(semantic_hash) = 32),
  hash_version text NOT NULL,
  command_type text NOT NULL DEFAULT 'SUBMIT' CHECK (command_type IN ('SUBMIT')),
  document_type text NOT NULL CHECK (document_type IN ('FEV', 'CREDIT_NOTE', 'DEBIT_NOTE', 'ELECTRONIC_POS', 'POS_ADJUSTMENT')),
  contract_version text NOT NULL,
  request_payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PERSISTED' CHECK (status IN (
    'PERSISTED', 'READY', 'SUBMITTING', 'ACCEPTED', 'REJECTED_LOCAL',
    'REJECTED_REMOTE', 'UNKNOWN', 'RECONCILING', 'NEEDS_ATTENTION'
  )),
  state_version bigint NOT NULL DEFAULT 1 CHECK (state_version >= 1),
  related_operation_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, idempotency_key),
  CONSTRAINT fiscal_operations_related_fk
    FOREIGN KEY (tenant_id, related_operation_id)
    REFERENCES app.fiscal_operations(tenant_id, id)
);

CREATE TABLE app.provider_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  operation_id uuid NOT NULL,
  attempt_no integer NOT NULL CHECK (attempt_no >= 1),
  correlation_key text NOT NULL CHECK (char_length(correlation_key) BETWEEN 1 AND 200),
  adapter_version text NOT NULL,
  request_hash bytea NOT NULL CHECK (octet_length(request_hash) = 32),
  status text NOT NULL DEFAULT 'PREPARED' CHECK (status IN ('PREPARED', 'COMPLETED', 'AMBIGUOUS')),
  provider_reference text,
  outcome_code text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, operation_id, attempt_no),
  UNIQUE (correlation_key),
  CONSTRAINT provider_attempts_operation_fk
    FOREIGN KEY (tenant_id, operation_id)
    REFERENCES app.fiscal_operations(tenant_id, id)
);

CREATE UNIQUE INDEX provider_attempts_one_open_mutation_per_operation
  ON app.provider_attempts(tenant_id, operation_id)
  WHERE finished_at IS NULL;

CREATE TABLE app.work_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  operation_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('SUBMIT', 'RECONCILE', 'FETCH_XML', 'FETCH_PDF')),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CLAIMED', 'RETRY', 'DONE', 'DEAD')),
  available_at timestamptz NOT NULL DEFAULT now(),
  lease_owner text,
  lease_until timestamptz,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  CONSTRAINT work_items_operation_fk
    FOREIGN KEY (tenant_id, operation_id)
    REFERENCES app.fiscal_operations(tenant_id, id),
  CHECK (
    (status = 'CLAIMED' AND lease_owner IS NOT NULL AND lease_until IS NOT NULL)
    OR (status <> 'CLAIMED' AND lease_owner IS NULL AND lease_until IS NULL)
  )
);

CREATE INDEX work_items_claim_idx
  ON app.work_items(status, available_at, id);

CREATE UNIQUE INDEX work_items_one_active_equivalent
  ON app.work_items(tenant_id, operation_id, kind)
  WHERE status IN ('PENDING', 'CLAIMED', 'RETRY');

CREATE TABLE app.evidence_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  operation_id uuid NOT NULL,
  provider_attempt_id uuid,
  kind text NOT NULL,
  content_json jsonb,
  object_key text,
  sha256 bytea NOT NULL CHECK (octet_length(sha256) = 32),
  content_type text NOT NULL,
  source text NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  CONSTRAINT evidence_operation_fk
    FOREIGN KEY (tenant_id, operation_id)
    REFERENCES app.fiscal_operations(tenant_id, id),
  CONSTRAINT evidence_attempt_fk
    FOREIGN KEY (tenant_id, provider_attempt_id)
    REFERENCES app.provider_attempts(tenant_id, id),
  CHECK (content_json IS NOT NULL OR object_key IS NOT NULL)
);

CREATE TABLE app.artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  operation_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('XML_VALIDATED', 'PDF_RENDERING')),
  storage_key text NOT NULL,
  sha256 bytea NOT NULL CHECK (octet_length(sha256) = 32),
  byte_size bigint NOT NULL CHECK (byte_size >= 0),
  content_type text NOT NULL,
  provider_reference text,
  retrieved_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  CONSTRAINT artifacts_operation_fk
    FOREIGN KEY (tenant_id, operation_id)
    REFERENCES app.fiscal_operations(tenant_id, id)
);

CREATE TABLE app.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  actor_type text NOT NULL CHECK (actor_type IN ('POS', 'API', 'WORKER', 'OPERATOR', 'SYSTEM')),
  actor_id text,
  correlation_id text,
  from_state text,
  to_state text,
  reason_code text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id)
);

CREATE TABLE app.runtime_controls (
  singleton_id smallint PRIMARY KEY DEFAULT 1 CHECK (singleton_id = 1),
  accept_new_operations boolean NOT NULL DEFAULT false,
  provider_mutations_enabled boolean NOT NULL DEFAULT false,
  reason text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text NOT NULL DEFAULT 'migration'
);

INSERT INTO app.runtime_controls(singleton_id)
VALUES (1)
ON CONFLICT (singleton_id) DO NOTHING;

CREATE OR REPLACE FUNCTION app.lookup_api_credential(p_credential_id uuid)
RETURNS TABLE (
  credential_id uuid,
  tenant_id uuid,
  secret_digest bytea,
  digest_version text,
  credential_status text,
  expires_at timestamptz,
  revoked_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, app
AS $$
  SELECT c.id, c.tenant_id, c.secret_digest, c.digest_version, c.status, c.expires_at, c.revoked_at
  FROM app.api_credentials AS c
  WHERE c.id = p_credential_id
$$;

REVOKE ALL ON FUNCTION app.lookup_api_credential(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.lookup_api_credential(uuid) TO app_api;

CREATE OR REPLACE FUNCTION app.claim_work_item(
  p_worker_id text,
  p_lease_seconds integer DEFAULT 30
)
RETURNS TABLE (
  id uuid,
  tenant_id uuid,
  operation_id uuid,
  kind text,
  attempt_count integer,
  lease_until timestamptz
)
LANGUAGE sql
VOLATILE
AS $$
  WITH candidate AS (
    SELECT w.id
    FROM app.work_items AS w
    WHERE (
      (w.status IN ('PENDING', 'RETRY') AND w.available_at <= now())
      OR (w.status = 'CLAIMED' AND w.lease_until <= now())
    )
    ORDER BY w.available_at, w.id
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  UPDATE app.work_items AS w
  SET status = 'CLAIMED',
      lease_owner = p_worker_id,
      lease_until = now() + make_interval(secs => GREATEST(p_lease_seconds, 1)),
      attempt_count = w.attempt_count + 1,
      updated_at = now()
  FROM candidate AS c
  WHERE w.id = c.id
  RETURNING w.id, w.tenant_id, w.operation_id, w.kind, w.attempt_count, w.lease_until
$$;

REVOKE ALL ON FUNCTION app.claim_work_item(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.claim_work_item(text, integer) TO app_worker;

CREATE OR REPLACE FUNCTION app.guard_fiscal_operation_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
     OR NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key
     OR NEW.semantic_hash IS DISTINCT FROM OLD.semantic_hash
     OR NEW.hash_version IS DISTINCT FROM OLD.hash_version
     OR NEW.command_type IS DISTINCT FROM OLD.command_type
     OR NEW.document_type IS DISTINCT FROM OLD.document_type
     OR NEW.contract_version IS DISTINCT FROM OLD.contract_version
     OR NEW.request_payload IS DISTINCT FROM OLD.request_payload
     OR NEW.related_operation_id IS DISTINCT FROM OLD.related_operation_id THEN
    RAISE EXCEPTION 'immutable fiscal operation fields cannot be changed' USING ERRCODE = '23514';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (
      (OLD.status = 'PERSISTED' AND NEW.status IN ('READY', 'REJECTED_LOCAL'))
      OR (OLD.status = 'READY' AND NEW.status = 'SUBMITTING')
      OR (OLD.status = 'SUBMITTING' AND NEW.status IN ('ACCEPTED', 'REJECTED_REMOTE', 'UNKNOWN'))
      OR (OLD.status = 'UNKNOWN' AND NEW.status = 'RECONCILING')
      OR (OLD.status = 'RECONCILING' AND NEW.status IN ('ACCEPTED', 'REJECTED_REMOTE', 'READY', 'NEEDS_ATTENTION'))
    ) THEN
      RAISE EXCEPTION 'invalid fiscal state transition: % -> %', OLD.status, NEW.status USING ERRCODE = '23514';
    END IF;

    IF NEW.state_version <> OLD.state_version + 1 THEN
      RAISE EXCEPTION 'state_version must increase exactly once on status transition' USING ERRCODE = '23514';
    END IF;
  ELSIF NEW.state_version <> OLD.state_version THEN
    RAISE EXCEPTION 'state_version cannot change without a status transition' USING ERRCODE = '23514';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END
$$;

CREATE TRIGGER fiscal_operations_guard_update
BEFORE UPDATE ON app.fiscal_operations
FOR EACH ROW EXECUTE FUNCTION app.guard_fiscal_operation_update();

CREATE OR REPLACE FUNCTION app.guard_provider_attempt_insert()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  operation_status text;
BEGIN
  SELECT status INTO operation_status
  FROM app.fiscal_operations
  WHERE tenant_id = NEW.tenant_id AND id = NEW.operation_id
  FOR UPDATE;

  IF operation_status IS NULL THEN
    RAISE EXCEPTION 'fiscal operation not visible in current tenant context' USING ERRCODE = '23503';
  END IF;

  IF operation_status <> 'READY' THEN
    RAISE EXCEPTION 'provider attempt requires READY operation; current=%', operation_status USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END
$$;

CREATE TRIGGER provider_attempts_guard_insert
BEFORE INSERT ON app.provider_attempts
FOR EACH ROW EXECUTE FUNCTION app.guard_provider_attempt_insert();

CREATE OR REPLACE FUNCTION app.guard_provider_attempt_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
     OR NEW.operation_id IS DISTINCT FROM OLD.operation_id
     OR NEW.attempt_no IS DISTINCT FROM OLD.attempt_no
     OR NEW.correlation_key IS DISTINCT FROM OLD.correlation_key
     OR NEW.adapter_version IS DISTINCT FROM OLD.adapter_version
     OR NEW.request_hash IS DISTINCT FROM OLD.request_hash
     OR NEW.started_at IS DISTINCT FROM OLD.started_at THEN
    RAISE EXCEPTION 'immutable provider attempt fields cannot be changed' USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END
$$;

CREATE TRIGGER provider_attempts_guard_update
BEFORE UPDATE ON app.provider_attempts
FOR EACH ROW EXECUTE FUNCTION app.guard_provider_attempt_update();

ALTER TABLE app.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.tenants FORCE ROW LEVEL SECURITY;
ALTER TABLE app.fiscal_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.fiscal_operations FORCE ROW LEVEL SECURITY;
ALTER TABLE app.provider_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.provider_attempts FORCE ROW LEVEL SECURITY;
ALTER TABLE app.work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.work_items FORCE ROW LEVEL SECURITY;
ALTER TABLE app.evidence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.evidence_records FORCE ROW LEVEL SECURITY;
ALTER TABLE app.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.artifacts FORCE ROW LEVEL SECURITY;
ALTER TABLE app.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.audit_events FORCE ROW LEVEL SECURITY;

CREATE POLICY tenants_tenant_isolation ON app.tenants
  FOR ALL TO app_api, app_worker
  USING (id = app.current_tenant_id())
  WITH CHECK (id = app.current_tenant_id());

CREATE POLICY fiscal_operations_tenant_isolation ON app.fiscal_operations
  FOR ALL TO app_api, app_worker
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY provider_attempts_worker_tenant_isolation ON app.provider_attempts
  FOR ALL TO app_worker
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY work_items_api_select ON app.work_items
  FOR SELECT TO app_api
  USING (tenant_id = app.current_tenant_id());

CREATE POLICY work_items_api_insert ON app.work_items
  FOR INSERT TO app_api
  WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY work_items_worker_global ON app.work_items
  FOR ALL TO app_worker
  USING (true)
  WITH CHECK (true);

CREATE POLICY evidence_worker_tenant_isolation ON app.evidence_records
  FOR ALL TO app_worker
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY artifacts_api_select ON app.artifacts
  FOR SELECT TO app_api
  USING (tenant_id = app.current_tenant_id());

CREATE POLICY artifacts_worker_tenant_isolation ON app.artifacts
  FOR ALL TO app_worker
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

CREATE POLICY audit_events_tenant_isolation ON app.audit_events
  FOR ALL TO app_api, app_worker
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

REVOKE ALL ON ALL TABLES IN SCHEMA app FROM app_api, app_worker;
GRANT SELECT ON app.tenants TO app_api, app_worker;
GRANT SELECT, INSERT, UPDATE ON app.fiscal_operations TO app_api, app_worker;
GRANT SELECT, INSERT, UPDATE ON app.provider_attempts TO app_worker;
GRANT SELECT, INSERT ON app.work_items TO app_api;
GRANT SELECT, INSERT, UPDATE ON app.work_items TO app_worker;
GRANT SELECT, INSERT ON app.evidence_records TO app_worker;
GRANT SELECT ON app.artifacts TO app_api;
GRANT SELECT, INSERT ON app.artifacts TO app_worker;
GRANT SELECT, INSERT ON app.audit_events TO app_api, app_worker;
GRANT SELECT ON app.runtime_controls TO app_api, app_worker;
REVOKE ALL ON app.api_credentials FROM app_api, app_worker;

COMMENT ON TABLE app.runtime_controls IS
  'Operational kill switches. Mutations default disabled; runtime roles are read-only.';
COMMENT ON COLUMN app.runtime_controls.provider_mutations_enabled IS
  'Disables new provider mutations only; reconciliation/read paths remain available.';
