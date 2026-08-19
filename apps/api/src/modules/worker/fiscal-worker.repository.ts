import { Injectable } from '@nestjs/common';
import type { QueryResultRow } from 'pg';
import { DatabaseService } from '../../common/database/database.service';
import type {
  ProviderAttemptContext,
  ProviderFiscalCommand,
  ProviderReconciliationQuery,
  ProviderReconciliationResult,
  ProviderSubmissionResult,
} from '../provider/fiscal-provider';

export interface ClaimedWorkItem extends QueryResultRow {
  id: string;
  tenant_id: string;
  operation_id: string;
  kind: 'SUBMIT' | 'RECONCILE' | 'FETCH_XML' | 'FETCH_PDF';
  attempt_count: number;
  lease_until: Date;
}

interface WorkerOperationRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  semantic_hash: Buffer;
  document_type: string;
  request_payload: Record<string, unknown>;
  status: string;
  state_version: string;
}

interface ProviderAttemptRow extends QueryResultRow {
  id: string;
  correlation_key: string;
  adapter_version: string;
  provider_reference: string | null;
}

export type PrepareSubmissionResult =
  | {
      action: 'SUBMIT';
      attemptId: string;
      command: ProviderFiscalCommand;
      context: ProviderAttemptContext;
    }
  | { action: 'RECOVERED_UNKNOWN' | 'SKIPPED' };

export interface PreparedReconciliation {
  attemptId: string;
  query: ProviderReconciliationQuery;
}

@Injectable()
export class FiscalWorkerRepository {
  constructor(private readonly db: DatabaseService) {}

  async claimNext(
    workerId: string,
    leaseSeconds: number,
  ): Promise<ClaimedWorkItem | null> {
    const result = await this.db.query<ClaimedWorkItem>(
      'SELECT * FROM app.claim_work_item($1, $2)',
      [workerId, leaseSeconds],
    );
    return result.rows[0] ?? null;
  }

  async providerMutationsEnabled(): Promise<boolean> {
    const result = await this.db.query<{ provider_mutations_enabled: boolean }>(
      `SELECT provider_mutations_enabled
       FROM app.runtime_controls
       WHERE singleton_id = 1`,
    );
    return result.rows[0]?.provider_mutations_enabled ?? false;
  }

  async rescheduleWork(
    job: ClaimedWorkItem,
    delaySeconds: number,
    errorCode: string,
  ): Promise<void> {
    await this.db.query(
      `UPDATE app.work_items
       SET status = 'RETRY',
           available_at = now() + make_interval(secs => $2),
           lease_owner = NULL,
           lease_until = NULL,
           last_error_code = $3,
           updated_at = now()
       WHERE id = $1::uuid AND status = 'CLAIMED'`,
      [job.id, Math.max(0, delaySeconds), errorCode],
    );
  }

  async deadLetterWork(
    job: ClaimedWorkItem,
    errorCode: string,
  ): Promise<void> {
    await this.db.query(
      `UPDATE app.work_items
       SET status = 'DEAD',
           lease_owner = NULL,
           lease_until = NULL,
           last_error_code = $2,
           updated_at = now()
       WHERE id = $1::uuid AND status = 'CLAIMED'`,
      [job.id, errorCode],
    );
  }

  prepareSubmission(job: ClaimedWorkItem): Promise<PrepareSubmissionResult> {
    return this.db.withTenantTransaction(job.tenant_id, async (client) => {
      const operationResult = await client.query<WorkerOperationRow>(
        `SELECT *
         FROM app.fiscal_operations
         WHERE id = $1::uuid
         FOR UPDATE`,
        [job.operation_id],
      );
      const operation = operationResult.rows[0];
      if (!operation) {
        await this.completeWork(client, job.id, 'OPERATION_NOT_FOUND');
        return { action: 'SKIPPED' };
      }

      if (operation.status === 'SUBMITTING') {
        const latest = await client.query<ProviderAttemptRow>(
          `SELECT id, correlation_key, adapter_version, provider_reference
           FROM app.provider_attempts
           WHERE operation_id = $1::uuid
           ORDER BY attempt_no DESC
           LIMIT 1
           FOR UPDATE`,
          [operation.id],
        );
        const attempt = latest.rows[0];
        if (attempt) {
          await client.query(
            `UPDATE app.provider_attempts
             SET status = 'AMBIGUOUS',
                 outcome_code = 'RECOVERED_AFTER_CRASH',
                 finished_at = COALESCE(finished_at, now())
             WHERE id = $1::uuid`,
            [attempt.id],
          );
        }
        await this.transitionOperation(client, operation.id, 'UNKNOWN');
        await this.completeWork(client, job.id, 'RECOVERED_AFTER_CRASH');
        await this.enqueueWork(client, job.tenant_id, operation.id, 'RECONCILE');
        await this.audit(client, {
          tenantId: job.tenant_id,
          operationId: operation.id,
          eventType: 'SUBMIT_RECOVERED_AS_UNKNOWN',
          fromState: 'SUBMITTING',
          toState: 'UNKNOWN',
          reasonCode: 'WORKER_CRASH_RECOVERY',
        });
        return { action: 'RECOVERED_UNKNOWN' };
      }

      if (operation.status !== 'READY') {
        await this.completeWork(client, job.id, 'STALE_SUBMIT_WORK');
        if (operation.status === 'UNKNOWN') {
          await this.enqueueWork(client, job.tenant_id, operation.id, 'RECONCILE');
        }
        return { action: 'SKIPPED' };
      }

      const attemptNoResult = await client.query<{ next_attempt: number }>(
        `SELECT COALESCE(MAX(attempt_no), 0)::int + 1 AS next_attempt
         FROM app.provider_attempts
         WHERE operation_id = $1::uuid`,
        [operation.id],
      );
      const attemptNo = attemptNoResult.rows[0]?.next_attempt ?? 1;
      const correlationKey = `api-dian:${operation.id}:attempt:${attemptNo}`;
      const adapterVersion = 'fake/1';

      const attemptResult = await client.query<ProviderAttemptRow>(
        `INSERT INTO app.provider_attempts (
           tenant_id, operation_id, attempt_no, correlation_key,
           adapter_version, request_hash, status
         )
         VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, 'PREPARED')
         RETURNING id, correlation_key, adapter_version, provider_reference`,
        [
          job.tenant_id,
          operation.id,
          attemptNo,
          correlationKey,
          adapterVersion,
          operation.semantic_hash,
        ],
      );
      const attempt = attemptResult.rows[0];
      if (!attempt) throw new Error('Provider attempt was not created');

      await this.transitionOperation(client, operation.id, 'SUBMITTING');
      await this.audit(client, {
        tenantId: job.tenant_id,
        operationId: operation.id,
        eventType: 'PROVIDER_ATTEMPT_PREPARED',
        fromState: 'READY',
        toState: 'SUBMITTING',
        reasonCode: 'WORKER_SUBMIT',
      });

      return {
        action: 'SUBMIT',
        attemptId: attempt.id,
        command: {
          documentKind: operation.document_type,
          payload: operation.request_payload,
        },
        context: {
          operationId: operation.id,
          attemptId: attempt.id,
          tenantId: job.tenant_id,
          providerBindingRef: 'fake-v1',
          clientCorrelationRef: attempt.correlation_key,
          mappingVersion: attempt.adapter_version,
        },
      };
    });
  }

  applySubmissionResult(
    job: ClaimedWorkItem,
    attemptId: string,
    result: ProviderSubmissionResult,
  ): Promise<void> {
    return this.db.withTenantTransaction(job.tenant_id, async (client) => {
      const target =
        result.outcome === 'CONCLUSIVE_ACCEPTED'
          ? 'ACCEPTED'
          : result.outcome === 'CONCLUSIVE_REJECTED'
            ? 'REJECTED_REMOTE'
            : result.outcome === 'TRANSPORT_PROVEN_NOT_SENT'
              ? 'READY'
              : 'UNKNOWN';

      const attemptStatus =
        result.outcome === 'TRANSPORT_AMBIGUOUS' ? 'AMBIGUOUS' : 'COMPLETED';
      const outcomeCode =
        result.outcome === 'TRANSPORT_PROVEN_NOT_SENT'
          ? 'PROVEN_NOT_SENT'
          : (result.normalizedCode ?? result.outcome);

      await client.query(
        `UPDATE app.provider_attempts
         SET status = $2,
             provider_reference = COALESCE($3, provider_reference),
             outcome_code = $4,
             finished_at = now()
         WHERE id = $1::uuid`,
        [attemptId, attemptStatus, result.providerReference ?? null, outcomeCode],
      );

      await this.transitionOperation(client, job.operation_id, target);
      await this.completeWork(client, job.id, outcomeCode);

      if (target === 'UNKNOWN') {
        await this.enqueueWork(
          client,
          job.tenant_id,
          job.operation_id,
          'RECONCILE',
        );
      } else if (target === 'READY') {
        await this.enqueueWork(client, job.tenant_id, job.operation_id, 'SUBMIT');
      }

      await this.audit(client, {
        tenantId: job.tenant_id,
        operationId: job.operation_id,
        eventType: 'PROVIDER_SUBMIT_RESULT',
        fromState: 'SUBMITTING',
        toState: target,
        reasonCode: outcomeCode,
      });
    });
  }

  prepareReconciliation(
    job: ClaimedWorkItem,
  ): Promise<PreparedReconciliation | null> {
    return this.db.withTenantTransaction(job.tenant_id, async (client) => {
      const operationResult = await client.query<WorkerOperationRow>(
        `SELECT *
         FROM app.fiscal_operations
         WHERE id = $1::uuid
         FOR UPDATE`,
        [job.operation_id],
      );
      const operation = operationResult.rows[0];
      if (!operation) {
        await this.completeWork(client, job.id, 'OPERATION_NOT_FOUND');
        return null;
      }

      if (operation.status === 'UNKNOWN') {
        await this.transitionOperation(client, operation.id, 'RECONCILING');
        await this.audit(client, {
          tenantId: job.tenant_id,
          operationId: operation.id,
          eventType: 'RECONCILIATION_STARTED',
          fromState: 'UNKNOWN',
          toState: 'RECONCILING',
          reasonCode: 'AMBIGUOUS_PROVIDER_RESULT',
        });
      } else if (operation.status !== 'RECONCILING') {
        await this.completeWork(client, job.id, 'STALE_RECONCILE_WORK');
        return null;
      }

      const attemptResult = await client.query<ProviderAttemptRow>(
        `SELECT id, correlation_key, adapter_version, provider_reference
         FROM app.provider_attempts
         WHERE operation_id = $1::uuid
         ORDER BY attempt_no DESC
         LIMIT 1`,
        [operation.id],
      );
      const attempt = attemptResult.rows[0];
      if (!attempt) throw new Error('Reconciliation requires provider attempt');

      return {
        attemptId: attempt.id,
        query: {
          tenantId: job.tenant_id,
          operationId: operation.id,
          clientCorrelationRef: attempt.correlation_key,
          ...(attempt.provider_reference
            ? { providerReference: attempt.provider_reference }
            : {}),
        },
      };
    });
  }

  applyReconciliationResult(
    job: ClaimedWorkItem,
    attemptId: string,
    result: ProviderReconciliationResult,
    maxAttempts: number,
    retryDelaySeconds: number,
  ): Promise<void> {
    return this.db.withTenantTransaction(job.tenant_id, async (client) => {
      if (result.outcome === 'INDETERMINATE') {
        await client.query(
          `UPDATE app.provider_attempts
           SET status = 'AMBIGUOUS',
               outcome_code = 'RECONCILE_INDETERMINATE'
           WHERE id = $1::uuid`,
          [attemptId],
        );

        if (job.attempt_count >= maxAttempts) {
          await this.transitionOperation(
            client,
            job.operation_id,
            'NEEDS_ATTENTION',
          );
          await this.deadWorkInTransaction(
            client,
            job.id,
            'RECONCILIATION_EXHAUSTED',
          );
          await this.audit(client, {
            tenantId: job.tenant_id,
            operationId: job.operation_id,
            eventType: 'RECONCILIATION_EXHAUSTED',
            fromState: 'RECONCILING',
            toState: 'NEEDS_ATTENTION',
            reasonCode: 'RECONCILIATION_EXHAUSTED',
          });
          return;
        }

        await this.retryWorkInTransaction(
          client,
          job.id,
          retryDelaySeconds,
          'RECONCILE_INDETERMINATE',
        );
        return;
      }

      const target =
        result.outcome === 'FOUND_ACCEPTED'
          ? 'ACCEPTED'
          : result.outcome === 'FOUND_REJECTED'
            ? 'REJECTED_REMOTE'
            : 'READY';
      const outcomeCode = result.normalizedCode ?? result.outcome;

      await client.query(
        `UPDATE app.provider_attempts
         SET status = 'COMPLETED',
             provider_reference = COALESCE($2, provider_reference),
             outcome_code = $3
         WHERE id = $1::uuid`,
        [attemptId, result.providerReference ?? null, outcomeCode],
      );
      await this.transitionOperation(client, job.operation_id, target);
      await this.completeWork(client, job.id, outcomeCode);

      if (target === 'READY') {
        await this.enqueueWork(client, job.tenant_id, job.operation_id, 'SUBMIT');
      }

      await this.audit(client, {
        tenantId: job.tenant_id,
        operationId: job.operation_id,
        eventType: 'RECONCILIATION_RESULT',
        fromState: 'RECONCILING',
        toState: target,
        reasonCode: outcomeCode,
      });
    });
  }

  private async transitionOperation(
    client: import('pg').PoolClient,
    operationId: string,
    target: string,
  ): Promise<void> {
    const result = await client.query(
      `UPDATE app.fiscal_operations
       SET status = $2,
           state_version = state_version + 1
       WHERE id = $1::uuid
       RETURNING id`,
      [operationId, target],
    );
    if (result.rowCount !== 1) {
      throw new Error(`Fiscal operation transition failed: ${operationId}`);
    }
  }

  private completeWork(
    client: import('pg').PoolClient,
    workId: string,
    reasonCode: string,
  ): Promise<unknown> {
    return client.query(
      `UPDATE app.work_items
       SET status = 'DONE',
           lease_owner = NULL,
           lease_until = NULL,
           last_error_code = $2,
           updated_at = now()
       WHERE id = $1::uuid`,
      [workId, reasonCode],
    );
  }

  private retryWorkInTransaction(
    client: import('pg').PoolClient,
    workId: string,
    delaySeconds: number,
    reasonCode: string,
  ): Promise<unknown> {
    return client.query(
      `UPDATE app.work_items
       SET status = 'RETRY',
           available_at = now() + make_interval(secs => $2),
           lease_owner = NULL,
           lease_until = NULL,
           last_error_code = $3,
           updated_at = now()
       WHERE id = $1::uuid`,
      [workId, Math.max(0, delaySeconds), reasonCode],
    );
  }

  private deadWorkInTransaction(
    client: import('pg').PoolClient,
    workId: string,
    reasonCode: string,
  ): Promise<unknown> {
    return client.query(
      `UPDATE app.work_items
       SET status = 'DEAD',
           lease_owner = NULL,
           lease_until = NULL,
           last_error_code = $2,
           updated_at = now()
       WHERE id = $1::uuid`,
      [workId, reasonCode],
    );
  }

  private enqueueWork(
    client: import('pg').PoolClient,
    tenantId: string,
    operationId: string,
    kind: 'SUBMIT' | 'RECONCILE',
  ): Promise<unknown> {
    return client.query(
      `INSERT INTO app.work_items (tenant_id, operation_id, kind)
       VALUES ($1::uuid, $2::uuid, $3)
       ON CONFLICT DO NOTHING`,
      [tenantId, operationId, kind],
    );
  }

  private audit(
    client: import('pg').PoolClient,
    event: {
      tenantId: string;
      operationId: string;
      eventType: string;
      fromState: string;
      toState: string;
      reasonCode: string;
    },
  ): Promise<unknown> {
    return client.query(
      `INSERT INTO app.audit_events (
         tenant_id, event_type, entity_type, entity_id,
         actor_type, actor_id, from_state, to_state, reason_code
       )
       VALUES ($1::uuid, $2, 'FISCAL_OPERATION', $3::uuid,
               'WORKER', 'fiscal-worker', $4, $5, $6)`,
      [
        event.tenantId,
        event.eventType,
        event.operationId,
        event.fromState,
        event.toState,
        event.reasonCode,
      ],
    );
  }
}
