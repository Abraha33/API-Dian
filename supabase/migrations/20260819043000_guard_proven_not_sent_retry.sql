-- F6-B2: permit SUBMITTING -> READY only when the latest persisted provider
-- attempt conclusively proves that no remote side effect occurred.

CREATE OR REPLACE FUNCTION app.guard_fiscal_operation_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  latest_attempt_outcome text;
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

  IF OLD.status = 'SUBMITTING' AND NEW.status = 'READY' THEN
    SELECT pa.outcome_code
      INTO latest_attempt_outcome
    FROM app.provider_attempts AS pa
    WHERE pa.tenant_id = OLD.tenant_id
      AND pa.operation_id = OLD.id
    ORDER BY pa.attempt_no DESC
    LIMIT 1;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT (
      (OLD.status = 'PERSISTED' AND NEW.status IN ('READY', 'REJECTED_LOCAL'))
      OR (OLD.status = 'READY' AND NEW.status = 'SUBMITTING')
      OR (OLD.status = 'SUBMITTING' AND NEW.status IN ('ACCEPTED', 'REJECTED_REMOTE', 'UNKNOWN'))
      OR (
        OLD.status = 'SUBMITTING'
        AND NEW.status = 'READY'
        AND latest_attempt_outcome = 'PROVEN_NOT_SENT'
      )
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

ALTER FUNCTION app.guard_fiscal_operation_update() OWNER TO app_migrator;

COMMENT ON FUNCTION app.guard_fiscal_operation_update() IS
  'Guards immutable fiscal fields and allowed state transitions. SUBMITTING->READY requires latest provider attempt outcome PROVEN_NOT_SENT.';
