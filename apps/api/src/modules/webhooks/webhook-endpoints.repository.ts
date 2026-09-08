import { Injectable } from '@nestjs/common';
import type { QueryResultRow } from 'pg';
import { DatabaseService } from '../../common/database/database.service';
import type { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';
import { WEBHOOK_EVENT_TYPES } from './webhook-events';

export interface WebhookEndpointRecord extends QueryResultRow {
  id: string;
  tenant_id: string;
  url: string;
  secret: string;
  description: string | null;
  event_types: string[];
  status: 'ACTIVE' | 'DISABLED';
  created_at: Date;
  updated_at: Date;
}

export type WebhookEndpointPublic = Omit<WebhookEndpointRecord, 'secret'>;

function toPublic(record: WebhookEndpointRecord): WebhookEndpointPublic {
  return {
    id: record.id,
    tenant_id: record.tenant_id,
    url: record.url,
    description: record.description,
    event_types: record.event_types,
    status: record.status,
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

@Injectable()
export class WebhookEndpointsRepository {
  constructor(private readonly db: DatabaseService) {}

  create(
    tenantId: string,
    dto: CreateWebhookEndpointDto,
  ): Promise<WebhookEndpointPublic> {
    return this.db.withTenantTransaction(tenantId, async (client) => {
      const result = await client.query<WebhookEndpointRecord>(
        `INSERT INTO app.webhook_endpoints (
           tenant_id, url, secret, description, event_types
         )
         VALUES ($1::uuid, $2, $3, $4, $5::text[])
         RETURNING *`,
        [
          tenantId,
          dto.url,
          dto.secret,
          dto.description ?? null,
          dto.event_types ?? WEBHOOK_EVENT_TYPES,
        ],
      );
      const created = result.rows[0];
      if (!created) throw new Error('Webhook endpoint was not created');

      await client.query(
        `INSERT INTO app.audit_events (
           tenant_id, event_type, entity_type, entity_id,
           actor_type, actor_id, to_state, reason_code
         )
         VALUES ($1::uuid, 'WEBHOOK_ENDPOINT_CREATED', 'WEBHOOK_ENDPOINT', $2::uuid,
                 'API', 'tenant-admin', 'ACTIVE', 'ENDPOINT_REGISTERED')`,
        [tenantId, created.id],
      );

      return toPublic(created);
    });
  }

  list(tenantId: string): Promise<WebhookEndpointPublic[]> {
    return this.db.withTenantTransaction(tenantId, async (client) => {
      const result = await client.query<WebhookEndpointRecord>(
        `SELECT * FROM app.webhook_endpoints ORDER BY created_at DESC`,
      );
      return result.rows.map(toPublic);
    });
  }

  findById(
    tenantId: string,
    endpointId: string,
  ): Promise<WebhookEndpointPublic | null> {
    return this.db.withTenantTransaction(tenantId, async (client) => {
      const result = await client.query<WebhookEndpointRecord>(
        `SELECT * FROM app.webhook_endpoints WHERE id = $1::uuid`,
        [endpointId],
      );
      const row = result.rows[0];
      return row ? toPublic(row) : null;
    });
  }

  disable(
    tenantId: string,
    endpointId: string,
  ): Promise<WebhookEndpointPublic | null> {
    return this.db.withTenantTransaction(tenantId, async (client) => {
      const result = await client.query<WebhookEndpointRecord>(
        `UPDATE app.webhook_endpoints
         SET status = 'DISABLED'
         WHERE id = $1::uuid
         RETURNING *`,
        [endpointId],
      );
      const row = result.rows[0];
      if (!row) return null;

      await client.query(
        `INSERT INTO app.audit_events (
           tenant_id, event_type, entity_type, entity_id,
           actor_type, actor_id, to_state, reason_code
         )
         VALUES ($1::uuid, 'WEBHOOK_ENDPOINT_DISABLED', 'WEBHOOK_ENDPOINT', $2::uuid,
                 'API', 'tenant-admin', 'DISABLED', 'ENDPOINT_DISABLED_BY_TENANT')`,
        [tenantId, endpointId],
      );

      return toPublic(row);
    });
  }
}
