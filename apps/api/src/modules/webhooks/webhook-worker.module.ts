import { Module } from '@nestjs/common';
import { PinoLoggerService } from '../../common/logger/pino-logger.service';
import { WebhookDeliveryRepository } from './webhook-delivery.repository';
import { WebhookSenderService } from './webhook-sender.service';
import { WebhookWorkerService } from './webhook-worker.service';

/**
 * Standalone worker module for the webhook delivery loop
 * (apps/api/src/webhook-worker.ts). Deliberately separate from
 * WorkerModule (fiscal worker) so the two loops run as independent
 * processes and a webhook outage can never block/slow fiscal processing.
 */
@Module({
  providers: [
    PinoLoggerService,
    WebhookDeliveryRepository,
    WebhookSenderService,
    WebhookWorkerService,
  ],
  exports: [WebhookWorkerService],
})
export class WebhookWorkerModule {}
