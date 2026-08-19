import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import {
  canonicalizeFiscalCommand,
  HASH_VERSION,
} from '../../common/fiscal/canonicalization';
import type { FiscalPrincipal } from '../auth/fiscal-principal';
import type { CreateFiscalOperationDto } from './dto/create-fiscal-operation.dto';
import {
  FiscalOperationsRepository,
  IdempotencyConflictError,
  IntakePausedError,
} from './fiscal-operations.repository';

export interface FiscalOperationResponse {
  operation_id: string;
  status: string;
  document_kind: string;
  client_reference: string;
  created_at: string;
  replayed?: boolean;
}

@Injectable()
export class FiscalOperationsService {
  constructor(private readonly repository: FiscalOperationsRepository) {}

  async create(params: {
    principal: FiscalPrincipal;
    idempotencyKey: string;
    command: CreateFiscalOperationDto;
    correlationId?: string;
  }): Promise<FiscalOperationResponse> {
    const canonical = canonicalizeFiscalCommand(params.command);

    try {
      const result = await this.repository.createOrReplay({
        tenantId: params.principal.tenantId,
        actorId: params.principal.credentialId,
        idempotencyKey: params.idempotencyKey,
        semanticHashHex: canonical.hashHex,
        hashVersion: HASH_VERSION,
        command: params.command,
        correlationId: params.correlationId,
      });
      return this.toResponse(result.operation, result.replayed);
    } catch (error) {
      if (error instanceof IdempotencyConflictError) {
        throw new ConflictException({
          error: 'IDEMPOTENCY_CONFLICT',
          message: 'Idempotency-Key is already used by another command',
        });
      }
      if (error instanceof IntakePausedError) {
        throw new ServiceUnavailableException({
          error: 'INTAKE_PAUSED',
          message: 'New fiscal operations are temporarily paused',
        });
      }
      throw error;
    }
  }

  async get(
    principal: FiscalPrincipal,
    operationId: string,
  ): Promise<FiscalOperationResponse> {
    const operation = await this.repository.findById(
      principal.tenantId,
      operationId,
    );
    if (!operation) {
      throw new NotFoundException({ error: 'OPERATION_NOT_FOUND' });
    }
    return this.toResponse(operation);
  }

  private toResponse(
    operation: Awaited<
      ReturnType<FiscalOperationsRepository['findById']>
    > extends infer T
      ? NonNullable<T>
      : never,
    replayed?: boolean,
  ): FiscalOperationResponse {
    return {
      operation_id: operation.id,
      status: operation.status,
      document_kind: operation.document_type,
      client_reference: operation.request_payload.client_reference,
      created_at: operation.created_at.toISOString(),
      ...(replayed === undefined ? {} : { replayed }),
    };
  }
}
