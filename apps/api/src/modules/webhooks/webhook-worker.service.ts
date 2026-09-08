import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLoggerService } from '../../common/logger/pino-logger.service';
import {
  WebhookDeliveryRepository,
  type ClaimedWebhookDelivery,
} from './webhook-delivery.repository';
import { WebhookSenderService } from './webhook-sender.service';

export type WebhookWorkerResult =
  | 'IDLE'
  | 'DELIVERED'
  | 'RETRY_SCHEDULED'
  | 'DEAD_LETTERED'
  | 'ENDPOINT_MISSING';

/**
 * Drains app.webhook_deliveries with its own lease loop, entirely separate
 * from FiscalWorkerService / the fiscal state machine. This is the
 * mechanism that guarantees the hard invariant: a down or slow webhook
 * endpoint can only ever delay/retry a row in this table — it has no path
 * back into app.fiscal_operations.
 */
@Injectable()
export class WebhookWorkerService {
  private readonly workerId: string;
  private readonly leaseSeconds: number;

  constructor(
    private readonly repository: WebhookDeliveryRepository,
    private readonly sender: WebhookSenderService,
    private readonly logger: PinoLoggerService,
    config: ConfigService,
  ) {
    this.workerId = config.get<string>('WEBHOOK_WORKER_ID', 'webhook-worker-1');
    this.leaseSeconds = config.get<number>('WEBHOOK_WORKER_LEASE_SECONDS', 30);
  }

  async processNext(): Promise<WebhookWorkerResult> {
    const delivery = await this.repository.claimNext(
      this.workerId,
      this.leaseSeconds,
    );
    if (!delivery) return 'IDLE';

    const started = Date.now();
    const result = await this.deliver(delivery);
    this.logger.logWorkerEvent({
      event: 'webhook_delivery_completed',
      worker_id: this.workerId,
      work_id: delivery.id,
      operation_id: delivery.operation_id ?? 'none',
      tenant_id: delivery.tenant_id,
      work_kind: 'WEBHOOK_DELIVERY',
      attempt_count: delivery.attempt_count,
      elapsed_ms: Date.now() - started,
      outcome: result,
    });
    return result;
  }

  private async deliver(
    delivery: ClaimedWebhookDelivery,
  ): Promise<WebhookWorkerResult> {
    const endpoint = await this.repository.resolveEndpoint(delivery);
    if (!endpoint) {
      // Endpoint was deleted/disabled between enqueue and claim. Nothing to
      // retry towards; dead-letter immediately rather than spin forever.
      const attemptId = await this.repository.recordAttemptStart(delivery);
      await this.repository.completeAttempt(delivery, attemptId, 'DEAD', {
        errorCode: 'ENDPOINT_MISSING',
        durationMs: 0,
      });
      return 'ENDPOINT_MISSING';
    }

    const attemptId = await this.repository.recordAttemptStart(delivery);
    const sendResult = await this.sender.send(
      endpoint,
      delivery.payload,
      delivery.attempt_count,
    );

    const outcome = await this.repository.completeAttempt(
      delivery,
      attemptId,
      sendResult.outcome,
      {
        httpStatus: sendResult.httpStatus,
        errorCode: sendResult.errorCode,
        durationMs: sendResult.durationMs,
      },
    );

    return outcome;
  }
}
