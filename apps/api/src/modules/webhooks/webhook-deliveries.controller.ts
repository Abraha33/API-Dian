import {
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CredentialGuard } from '../auth/credential.guard';
import type { FiscalRequest } from '../auth/fiscal-principal';
import { WebhookDeliveryRepository } from './webhook-delivery.repository';

/**
 * Read-only observability for a tenant's own webhook deliveries, including
 * DEAD (dead-letter) rows — the "queryable/visible for operators" part of
 * the mandate. Tenant-scoped via CredentialGuard + RLS, same as every other
 * public endpoint.
 */
@Controller('v1/webhook-deliveries')
@UseGuards(CredentialGuard)
export class WebhookDeliveriesController {
  constructor(private readonly deliveries: WebhookDeliveryRepository) {}

  @Get()
  list(
    @Req() request: FiscalRequest,
    @Query('endpoint_id') endpointId?: string,
  ) {
    const principal = request.fiscalPrincipal;
    if (!principal) throw new UnauthorizedException('Invalid credential');
    return this.deliveries.listForTenant(principal.tenantId, endpointId);
  }
}
