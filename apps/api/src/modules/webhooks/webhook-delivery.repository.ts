import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { PoolClient, QueryResultRow } from 'pg';
import { DatabaseService } from '../../common/database/database.service';
import type { WebhookEnvelope, WebhookEventType } from './webhook-events';
import { nextRetryDelaySeconds } from './webhook-events';

export interface WebhookDeliveryRecord extends QueryResultRow {
  id: string;
  tenant_id: string;
  endpoint_id: string;
  operation_id: string | null;
  event_id: string;
  event_type: string;
  payload: WebhookEnvelope;
  status: 'PENDING' | 'CLAIMED' | 'DELIVERED' | 'RETRY' | 'DEAD';
  attempt_count: number;
  last_error_code: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ClaimedWebhookDelivery extends QueryResultRow {
  id: string;
  tenant_id: string;
  endpoint_id: string;
  operation_id: string | null;
  event_id: string;
  event_type: WebhookEventType;
  payload: WebhookEnvelope;
  attempt_count: number;
  lease_until: Date;
}

interface EndpointRow extends QueryResultRow {
  id: string;
  url: string;
  secret: string;
  status: 'ACTIVE' | 'DISABLED';
  event_types: string[];
}

export interface DeliveryTargetEndpoint {
  id: string;
  url: string;
  secret: string;
}

export type AttemptOutcome =
  | 'SUCCESS'
  | 'HTTP_4XX'
  | 'HTTP_5XX'
  | 'TIMEOUT'
  | 'CONNECTION_ERROR'
  | 'DEAD';

@Injectable()
export class WebhookDeliveryRepository {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Fan-out one fiscal event to every ACTIVE endpoint subscribed to it, for
   * the tenant whose transaction is already open. Called from within the
   * SAME transaction that persists the fiscal state transition (durable
   * creation, per the hard invariant that a down webhook endpoint must never
   * affect the fiscal outcome — this only ever writes a row, it never makes
   * a network call).
   */
  async enqueueForEvent(
    client: PoolClient,
    params: {
      tenantId: string;
      operationId: string | null;
      eventType: WebhookEventType;
      data: Record<string, unknown>;
    },
  ): Promise<void> {
    const endpoints = await client.query<EndpointRow>(
      `SELECT id, url, secret, status, event_types
       FROM app.webhook_endpoints
       WHERE status = 'ACTIVE' AND $1 = ANY(event_types)`,
      [params.eventType],
    );

    for (const endpoint of endpoints.rows) {
      const eventId = `evt_${randomUUID()}`;
      const envelope: WebhookEnvelope = {
        id: eventId,
        type: params.eventType,
        created_at: new Date().toISOString(),
        tenant_id: params.tenantId,
        data: params.data,
      };

      await client.query(
        `INSERT INTO app.webhook_deliveries (
           tenant_id, endpoint_id, operation_id, event_id, event_type, payload
         )
         VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5, $6::jsonb)
         ON CONFLICT (tenant_id, event_id) DO NOTHING`,
        [
          params.tenantId,
          endpoint.id,
          params.operationId,
          eventId,
          params.eventType,
          JSON.stringify(envelope),
        ],
      );
    }
  }

  async claimNext(
    workerId: string,
    leaseSeconds: number,
  ): Promise<ClaimedWebhookDelivery | null> {
    const result = await this.db.query<ClaimedWebhookDelivery>(
      'SELECT * FROM app.claim_webhook_delivery($1, $2)',
      [workerId, leaseSeconds],
    );
    return result.rows[0] ?? null;
  }

  resolveEndpoint(
    delivery: ClaimedWebhookDelivery,
  ): Promise<DeliveryTargetEndpoint | null> {
    return this.db.withTenantTransaction(delivery.tenant_id, async (client) => {
      const result = await client.query<EndpointRow>(
        `SELECT id, url, secret FROM app.webhook_endpoints WHERE id = $1::uuid`,
        [delivery.endpoint_id],
      );
      return result.rows[0] ?? null;
    });
  }

  recordAttemptStart(delivery: ClaimedWebhookDelivery): Promise<string> {
    return this.db.withTenantTransaction(delivery.tenant_id, async (client) => {
      const result = await client.query<{ id: string }>(
        `INSERT INTO app.webhook_delivery_attempts (
           tenant_id, delivery_id, attempt_no, outcome
         )
         VALUES ($1::uuid, $2::uuid, $3, 'IN_FLIGHT')
         RETURNING id`,
        [delivery.tenant_id, delivery.id, delivery.attempt_count],
      );
      const row = result.rows[0];
      if (!row) throw new Error('Webhook delivery attempt was not created');
      return row.id;
    });
  }

  async completeAttempt(
    delivery: ClaimedWebhookDelivery,
    attemptId: string,
    outcome: AttemptOutcome,
    details: { httpStatus?: number; errorCode?: string; durationMs: number },
  ): Promise<'DELIVERED' | 'RETRY_SCHEDULED' | 'DEAD_LETTERED'> {
    return this.db.withTenantTransaction(delivery.tenant_id, async (client) => {
      await client.query(
        `UPDATE app.webhook_delivery_attempts
         SET outcome = $2,
             http_status = $3,
             error_code = $4,
             finished_at = now(),
             duration_ms = $5
         WHERE id = $1::uuid`,
        [
          attemptId,
          outcome,
          details.httpStatus ?? null,
          details.errorCode ?? null,
          details.durationMs,
        ],
      );

      if (outcome === 'SUCCESS') {
        await client.query(
          `UPDATE app.webhook_deliveries
           SET status = 'DELIVERED',
               lease_owner = NULL,
               lease_until = NULL,
               last_error_code = NULL,
               updated_at = now()
           WHERE id = $1::uuid`,
          [delivery.id],
        );
        await this.audit(
          client,
          delivery,
          'WEBHOOK_DELIVERED',
          'DELIVERED',
          outcome,
        );
        return 'DELIVERED';
      }

      const delaySeconds = nextRetryDelaySeconds(delivery.attempt_count);
      if (delaySeconds === null) {
        await client.query(
          `UPDATE app.webhook_deliveries
           SET status = 'DEAD',
               lease_owner = NULL,
               lease_until = NULL,
               last_error_code = $2,
               updated_at = now()
           WHERE id = $1::uuid`,
          [delivery.id, details.errorCode ?? outcome],
        );
        await this.audit(
          client,
          delivery,
          'WEBHOOK_DEAD_LETTERED',
          'DEAD',
          outcome,
        );
        return 'DEAD_LETTERED';
      }

      await client.query(
        `UPDATE app.webhook_deliveries
         SET status = 'RETRY',
             available_at = now() + make_interval(secs => $2),
             lease_owner = NULL,
             lease_until = NULL,
             last_error_code = $3,
             updated_at = now()
         WHERE id = $1::uuid`,
        [delivery.id, delaySeconds, details.errorCode ?? outcome],
      );
      await this.audit(
        client,
        delivery,
        'WEBHOOK_RETRY_SCHEDULED',
        'RETRY',
        outcome,
      );
      return 'RETRY_SCHEDULED';
    });
  }

  listForTenant(
    tenantId: string,
    endpointId?: string,
  ): Promise<WebhookDeliveryRecord[]> {
    return this.db.withTenantTransaction(tenantId, async (client) => {
      const result = endpointId
        ? await client.query<WebhookDeliveryRecord>(
            `SELECT * FROM app.webhook_deliveries
             WHERE endpoint_id = $1::uuid
             ORDER BY created_at DESC
             LIMIT 200`,
            [endpointId],
          )
        : await client.query<WebhookDeliveryRecord>(
            `SELECT * FROM app.webhook_deliveries
             ORDER BY created_at DESC
             LIMIT 200`,
          );
      return result.rows;
    });
  }

  private async audit(
    client: PoolClient,
    delivery: ClaimedWebhookDelivery,
    eventType: string,
    toState: string,
    reasonCode: string,
  ): Promise<void> {
    await client.query(
      `INSERT INTO app.audit_events (
         tenant_id, event_type, entity_type, entity_id,
         actor_type, actor_id, to_state, reason_code
       )
       VALUES ($1::uuid, $2, 'WEBHOOK_DELIVERY', $3::uuid,
               'WORKER', 'webhook-worker', $4, $5)`,
      [delivery.tenant_id, eventType, delivery.id, toState, reasonCode],
    );
  }
}
