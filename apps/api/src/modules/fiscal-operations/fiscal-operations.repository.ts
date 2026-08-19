import { Injectable } from '@nestjs/common';
import type { PoolClient, QueryResultRow } from 'pg';
import { DatabaseService } from '../../common/database/database.service';
import type { CreateFiscalOperationDto } from './dto/create-fiscal-operation.dto';

export class IdempotencyConflictError extends Error {}
export class IntakePausedError extends Error {}

export interface FiscalOperationRecord extends QueryResultRow {
  id: string;
  tenant_id: string;
  idempotency_key: string;
  semantic_hash: Buffer;
  hash_version: string;
  document_type: string;
  contract_version: string;
  request_payload: CreateFiscalOperationDto;
  status: string;
  state_version: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOrReplayResult {
  operation: FiscalOperationRecord;
  replayed: boolean;
}

@Injectable()
export class FiscalOperationsRepository {
  constructor(private readonly db: DatabaseService) {}

  createOrReplay(params: {
    tenantId: string;
    actorId: string;
    idempotencyKey: string;
    semanticHashHex: string;
    hashVersion: string;
    command: CreateFiscalOperationDto;
    correlationId?: string;
  }): Promise<CreateOrReplayResult> {
    return this.db.withTenantTransaction(params.tenantId, async (client) => {
      const existing = await this.findByIdempotencyKey(
        client,
        params.idempotencyKey,
      );
      if (existing) {
        this.assertSameSemanticCommand(existing, params);
        return { operation: existing, replayed: true };
      }

      const controls = await client.query<{ accept_new_operations: boolean }>(
        `SELECT accept_new_operations
         FROM app.runtime_controls
         WHERE singleton_id = 1`,
      );
      if (!controls.rows[0]?.accept_new_operations) {
        throw new IntakePausedError('New fiscal operations are paused');
      }

      const hash = Buffer.from(params.semanticHashHex, 'hex');
      const inserted = await client.query<FiscalOperationRecord>(
        `INSERT INTO app.fiscal_operations (
           tenant_id, idempotency_key, semantic_hash, hash_version,
           document_type, contract_version, request_payload, status
         )
         VALUES ($1::uuid, $2, $3, $4, $5, $6, $7::jsonb, 'READY')
         ON CONFLICT (tenant_id, idempotency_key) DO NOTHING
         RETURNING *`,
        [
          params.tenantId,
          params.idempotencyKey,
          hash,
          params.hashVersion,
          params.command.document_kind,
          params.command.schema_version,
          JSON.stringify(params.command),
        ],
      );

      const operation = inserted.rows[0];
      if (!operation) {
        const racedOperation = await this.findByIdempotencyKey(
          client,
          params.idempotencyKey,
        );
        if (!racedOperation) {
          throw new Error('Idempotency conflict resolved without visible row');
        }
        this.assertSameSemanticCommand(racedOperation, params);
        return { operation: racedOperation, replayed: true };
      }

      await client.query(
        `INSERT INTO app.work_items (tenant_id, operation_id, kind)
         VALUES ($1::uuid, $2::uuid, 'SUBMIT')`,
        [params.tenantId, operation.id],
      );

      await client.query(
        `INSERT INTO app.audit_events (
           tenant_id, event_type, entity_type, entity_id,
           actor_type, actor_id, correlation_id, to_state, reason_code
         )
         VALUES ($1::uuid, 'OPERATION_ACCEPTED', 'FISCAL_OPERATION', $2::uuid,
                 'POS', $3, $4, 'READY', 'COMMAND_ACCEPTED')`,
        [
          params.tenantId,
          operation.id,
          params.actorId,
          params.correlationId ?? null,
        ],
      );

      return { operation, replayed: false };
    });
  }

  findById(
    tenantId: string,
    operationId: string,
  ): Promise<FiscalOperationRecord | null> {
    return this.db.withTenantTransaction(tenantId, async (client) => {
      const result = await client.query<FiscalOperationRecord>(
        `SELECT * FROM app.fiscal_operations WHERE id = $1::uuid`,
        [operationId],
      );
      return result.rows[0] ?? null;
    });
  }

  private async findByIdempotencyKey(
    client: PoolClient,
    key: string,
  ): Promise<FiscalOperationRecord | null> {
    const result = await client.query<FiscalOperationRecord>(
      `SELECT * FROM app.fiscal_operations WHERE idempotency_key = $1`,
      [key],
    );
    return result.rows[0] ?? null;
  }

  private assertSameSemanticCommand(
    operation: FiscalOperationRecord,
    params: { semanticHashHex: string; hashVersion: string },
  ): void {
    const expected = Buffer.from(params.semanticHashHex, 'hex');
    if (
      operation.hash_version !== params.hashVersion ||
      !operation.semantic_hash.equals(expected)
    ) {
      throw new IdempotencyConflictError(
        'Idempotency key already belongs to a different command',
      );
    }
  }
}
