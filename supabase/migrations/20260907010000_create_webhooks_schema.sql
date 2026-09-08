-- Phase 6 webhook delivery module for API-DIAN V1.
-- Authority: docs/architecture/final/PROCESSING-QUEUES-WEBHOOKS.md
-- (events, envelope shape, HMAC signing, retry schedule) and ADR-005/ADR-011
-- (tenant isolation model). Mirrors the existing work_items lease/claim
-- pattern from 20260819041000_create_f6_core_schema.sql rather than
-- inventing new infrastructure: webhooks are durable Postgres rows, drained
-- by a separate worker loop, never delivered inline from the fiscal state
-- machine or the HTTP request path.

CREATE TABLE app.webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  -- HTTPS only in production; http://127.0.0.1|localhost is allowed solely
  -- so local fault-injection tests can exercise real delivery attempts
  -- without provisioning TLS certs (see CreateWebhookEndpointDto).
  url text NOT NULL CHECK (url ~ '^(https://|http://127\.0\.0\.1|http://localhost)'),
  secret text NOT NULL CHECK (char_length(secret) >= 16),
  description text,
  event_types text[] NOT NULL DEFAULT ARRAY[
    'document.received', 'document.accepted', 'document.rejected',
    'document.unknown', 'document.reconciled'
  ],
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id)
);

COMMENT ON COLUMN app.webhook_endpoints.secret IS
  'Plaintext HMAC-SHA256 signing secret. Stored as plaintext (not hashed) '
  'because the sender must reproduce the signature on every delivery '
  '(unlike api_credentials, which only ever verifies a hash). Accepted V1 '
  'risk, documented in PHASE-6-WEBHOOKS evidence: mitigate operationally '
  '(DB access control, encryption at rest at the volume/RDS layer).';

CREATE TABLE app.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  endpoint_id uuid NOT NULL,
  operation_id uuid,
  event_id text NOT NULL CHECK (char_length(event_id) BETWEEN 1 AND 100),
  event_type text NOT NULL CHECK (event_type IN (
    'document.received', 'document.accepted', 'document.rejected',
    'document.unknown', 'document.reconciled'
  )),
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN (
    'PENDING', 'CLAIMED', 'DELIVERED', 'RETRY', 'DEAD'
  )),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  available_at timestamptz NOT NULL DEFAULT now(),
  lease_owner text,
  lease_until timestamptz,
  last_error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, event_id),
  CONSTRAINT webhook_deliveries_endpoint_fk
    FOREIGN KEY (tenant_id, endpoint_id)
    REFERENCES app.webhook_endpoints(tenant_id, id),
  CONSTRAINT webhook_deliveries_operation_fk
    FOREIGN KEY (tenant_id, operation_id)
    REFERENCES app.fiscal_operations(tenant_id, id),
  CHECK (
    (status = 'CLAIMED' AND lease_owner IS NOT NULL AND lease_until IS NOT NULL)
    OR (status <> 'CLAIMED' AND lease_owner IS NULL AND lease_until IS NULL)
  )
);

CREATE INDEX webhook_deliveries_claim_idx
  ON app.webhook_deliveries(status, available_at, id);

CREATE INDEX webhook_deliveries_endpoint_idx
  ON app.webhook_deliveries(tenant_id, endpoint_id, created_at DESC);

CREATE TABLE app.webhook_delivery_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES app.tenants(id),
  delivery_id uuid NOT NULL,
  attempt_no integer NOT NULL CHECK (attempt_no >= 1),
  outcome text NOT NULL DEFAULT 'IN_FLIGHT' CHECK (outcome IN (
    'IN_FLIGHT', 'SUCCESS', 'HTTP_4XX', 'HTTP_5XX', 'TIMEOUT',
    'CONNECTION_ERROR', 'DEAD'
  )),
  http_status integer,
  error_code text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  duration_ms integer,
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, delivery_id, attempt_no),
  CONSTRAINT webhook_delivery_attempts_delivery_fk
    FOREIGN KEY (tenant_id, delivery_id)
    REFERENCES app.webhook_deliveries(tenant_id, id)
);

CREATE INDEX webhook_delivery_attempts_delivery_idx
  ON app.webhook_delivery_attempts(tenant_id, delivery_id, attempt_no DESC);

CREATE OR REPLACE FUNCTION app.claim_webhook_delivery(
  p_worker_id text,
  p_lease_seconds integer DEFAULT 30
)
RETURNS TABLE (
  id uuid,
  tenant_id uuid,
  endpoint_id uuid,
  operation_id uuid,
  event_id text,
  event_type text,
  payload jsonb,
  attempt_count integer,
  lease_until timestamptz
)
LANGUAGE sql
VOLATILE
AS $$
  WITH candidate AS (
    SELECT d.id
    FROM app.webhook_deliveries AS d
    WHERE (
      (d.status IN ('PENDING', 'RETRY') AND d.available_at <= now())
      OR (d.status = 'CLAIMED' AND d.lease_until <= now())
    )
    ORDER BY d.available_at, d.id
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  UPDATE app.webhook_deliveries AS d
  SET status = 'CLAIMED',
      lease_owner = p_worker_id,
      lease_until = now() + make_interval(secs => GREATEST(p_lease_seconds, 1)),
      attempt_count = d.attempt_count + 1,
      updated_at = now()
  FROM candidate AS c
  WHERE d.id = c.id
  RETURNING d.id, d.tenant_id, d.endpoint_id, d.operation_id, d.event_id,
            d.event_type, d.payload, d.attempt_count, d.lease_until
$$;

REVOKE ALL ON FUNCTION app.claim_webhook_delivery(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app.claim_webhook_delivery(text, integer) TO app_worker;

CREATE OR REPLACE FUNCTION app.touch_webhook_endpoint_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END
$$;

CREATE TRIGGER webhook_endpoints_touch_updated_at
BEFORE UPDATE ON app.webhook_endpoints
FOR EACH ROW EXECUTE FUNCTION app.touch_webhook_endpoint_updated_at();

ALTER TABLE app.webhook_endpoints OWNER TO app_migrator;
ALTER TABLE app.webhook_deliveries OWNER TO app_migrator;
ALTER TABLE app.webhook_delivery_attempts OWNER TO app_migrator;
ALTER FUNCTION app.claim_webhook_delivery(text, integer) OWNER TO app_migrator;
ALTER FUNCTION app.touch_webhook_endpoint_updated_at() OWNER TO app_migrator;

ALTER TABLE app.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.webhook_endpoints FORCE ROW LEVEL SECURITY;
ALTER TABLE app.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.webhook_deliveries FORCE ROW LEVEL SECURITY;
ALTER TABLE app.webhook_delivery_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.webhook_delivery_attempts FORCE ROW LEVEL SECURITY;

-- app_api manages its own tenant's endpoint configuration (no cross-tenant
-- visibility, deny-by-default like every other table in this schema).
CREATE POLICY webhook_endpoints_api_tenant_isolation ON app.webhook_endpoints
  FOR ALL TO app_api
  USING (tenant_id = app.current_tenant_id())
  WITH CHECK (tenant_id = app.current_tenant_id());

-- app_worker reads endpoint url/secret only inside a tenant-scoped
-- transaction (set right after claiming a delivery for that tenant).
CREATE POLICY webhook_endpoints_worker_tenant_isolation ON app.webhook_endpoints
  FOR SELECT TO app_worker
  USING (tenant_id = app.current_tenant_id());

-- Tenants can read their own delivery/attempt history for observability.
CREATE POLICY webhook_deliveries_api_select ON app.webhook_deliveries
  FOR SELECT TO app_api
  USING (tenant_id = app.current_tenant_id());

CREATE POLICY webhook_delivery_attempts_api_select ON app.webhook_delivery_attempts
  FOR SELECT TO app_api
  USING (tenant_id = app.current_tenant_id());

-- app_worker needs cross-tenant visibility to claim the globally-oldest due
-- delivery with SKIP LOCKED (identical rationale/shape to
-- work_items_worker_global in the F6 core migration); every subsequent
-- mutation is still scoped by tenant_id in application SQL.
CREATE POLICY webhook_deliveries_worker_global ON app.webhook_deliveries
  FOR ALL TO app_worker
  USING (true)
  WITH CHECK (true);

CREATE POLICY webhook_delivery_attempts_worker_global ON app.webhook_delivery_attempts
  FOR ALL TO app_worker
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON app.webhook_endpoints FROM app_api, app_worker;
REVOKE ALL ON app.webhook_deliveries FROM app_api, app_worker;
REVOKE ALL ON app.webhook_delivery_attempts FROM app_api, app_worker;

GRANT SELECT, INSERT, UPDATE ON app.webhook_endpoints TO app_api;
GRANT SELECT ON app.webhook_endpoints TO app_worker;
GRANT SELECT ON app.webhook_deliveries TO app_api;
GRANT SELECT, INSERT, UPDATE ON app.webhook_deliveries TO app_worker;
GRANT SELECT ON app.webhook_delivery_attempts TO app_api;
GRANT SELECT, INSERT, UPDATE ON app.webhook_delivery_attempts TO app_worker;

ALTER DEFAULT PRIVILEGES FOR ROLE app_migrator IN SCHEMA app
  REVOKE ALL ON TABLES FROM PUBLIC;

COMMENT ON TABLE app.webhook_deliveries IS
  'Outbox of webhook events, drained by a dedicated webhook worker loop '
  '(apps/api/src/webhook-worker.ts) independent from the fiscal worker '
  'loop. Never delivered inline from the HTTP request path or from the '
  'fiscal state machine transaction, so a down endpoint cannot affect '
  'fiscal outcomes.';
COMMENT ON COLUMN app.webhook_deliveries.event_id IS
  'Stable id sent as the Webhook-Id header and inside the envelope body '
  '(evt_<uuid>). Consumers deduplicate on this value for at-least-once '
  'delivery, per docs/architecture/final/PROCESSING-QUEUES-WEBHOOKS.md.';
