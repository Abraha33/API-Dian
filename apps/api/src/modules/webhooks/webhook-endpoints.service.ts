import { Injectable, NotFoundException } from '@nestjs/common';
import type { FiscalPrincipal } from '../auth/fiscal-principal';
import type { CreateWebhookEndpointDto } from './dto/create-webhook-endpoint.dto';
import {
  WebhookEndpointsRepository,
  type WebhookEndpointPublic,
} from './webhook-endpoints.repository';

@Injectable()
export class WebhookEndpointsService {
  constructor(private readonly repository: WebhookEndpointsRepository) {}

  create(
    principal: FiscalPrincipal,
    dto: CreateWebhookEndpointDto,
  ): Promise<WebhookEndpointPublic> {
    return this.repository.create(principal.tenantId, dto);
  }

  list(principal: FiscalPrincipal): Promise<WebhookEndpointPublic[]> {
    return this.repository.list(principal.tenantId);
  }

  async get(
    principal: FiscalPrincipal,
    endpointId: string,
  ): Promise<WebhookEndpointPublic> {
    const endpoint = await this.repository.findById(
      principal.tenantId,
      endpointId,
    );
    if (!endpoint) throw new NotFoundException({ error: 'ENDPOINT_NOT_FOUND' });
    return endpoint;
  }

  async disable(
    principal: FiscalPrincipal,
    endpointId: string,
  ): Promise<WebhookEndpointPublic> {
    const endpoint = await this.repository.disable(
      principal.tenantId,
      endpointId,
    );
    if (!endpoint) throw new NotFoundException({ error: 'ENDPOINT_NOT_FOUND' });
    return endpoint;
  }
}
