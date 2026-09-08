import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import configuration from './config/configuration';
import { validateWebhookWorkerEnv } from './config/webhook-worker-env.validation';
import { WebhookWorkerModule } from './modules/webhooks/webhook-worker.module';

/**
 * Bootstrap module for the standalone webhook-delivery worker process.
 * Intentionally does not import WorkerModule (fiscal worker): the two loops
 * run as separate OS processes so a webhook outage cannot slow or block
 * fiscal document processing.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateWebhookWorkerEnv,
      load: [configuration],
    }),
    DatabaseModule,
    WebhookWorkerModule,
  ],
})
export class WebhookWorkerAppModule {}
