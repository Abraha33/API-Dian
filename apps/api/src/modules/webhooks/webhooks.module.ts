import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WebhookDeliveriesController } from './webhook-deliveries.controller';
import { WebhookDeliveryRepository } from './webhook-delivery.repository';
import { WebhookEndpointsController } from './webhook-endpoints.controller';
import { WebhookEndpointsRepository } from './webhook-endpoints.repository';
import { WebhookEndpointsService } from './webhook-endpoints.service';

/**
 * API-side module: tenant CRUD for endpoints + read-only delivery/attempt
 * history. Contains no HTTP-sending code and no worker loop — see
 * WebhookWorkerModule for the separate delivery loop.
 */
@Module({
  imports: [AuthModule],
  controllers: [WebhookEndpointsController, WebhookDeliveriesController],
  providers: [
    WebhookEndpointsRepository,
    WebhookEndpointsService,
    WebhookDeliveryRepository,
  ],
})
export class WebhooksModule {}
