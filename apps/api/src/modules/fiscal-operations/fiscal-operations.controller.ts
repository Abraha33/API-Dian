import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CredentialGuard } from '../auth/credential.guard';
import type { FiscalRequest } from '../auth/fiscal-principal';
import { CreateFiscalOperationDto } from './dto/create-fiscal-operation.dto';
import { FiscalOperationsService } from './fiscal-operations.service';

@Controller('v1/fiscal-operations')
@UseGuards(CredentialGuard)
export class FiscalOperationsController {
  constructor(private readonly operations: FiscalOperationsService) {}

  @Post()
  @HttpCode(202)
  create(
    @Req() request: FiscalRequest,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Headers('x-correlation-id') correlationId: string | undefined,
    @Body() command: CreateFiscalOperationDto,
  ) {
    const principal = request.fiscalPrincipal;
    if (!principal) throw new UnauthorizedException('Invalid credential');

    if (
      !idempotencyKey ||
      idempotencyKey.length > 200 ||
      idempotencyKey.trim() !== idempotencyKey
    ) {
      throw new BadRequestException({ error: 'INVALID_IDEMPOTENCY_KEY' });
    }

    return this.operations.create({
      principal,
      idempotencyKey,
      command,
      correlationId: correlationId || randomUUID(),
    });
  }

  @Get(':operationId')
  get(
    @Req() request: FiscalRequest,
    @Param('operationId', new ParseUUIDPipe({ version: '4' }))
    operationId: string,
  ) {
    const principal = request.fiscalPrincipal;
    if (!principal) throw new UnauthorizedException('Invalid credential');
    return this.operations.get(principal, operationId);
  }
}
