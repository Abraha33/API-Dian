import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { WebhookWorkerService } from './modules/webhooks/webhook-worker.service';
import { WebhookWorkerAppModule } from './webhook-worker-app.module';

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

/**
 * Entry point for the standalone webhook delivery worker. Runs as its own
 * process (`npm run start:webhook-worker`), independent from `worker.ts`
 * (fiscal worker) and from the HTTP API process — see
 * docs/experiments/astra-full-build/PHASE-6-WEBHOOKS.md for why this
 * separation is the mechanism behind the "down webhook never blocks fiscal
 * outcome" invariant.
 */
async function bootstrap(): Promise<void> {
  // abortOnError: false is required alongside logger: false — otherwise a
  // fatal bootstrap error (e.g. env validation failure) is swallowed by the
  // disabled logger and Nest calls process.exit(1) silently, with no
  // message at all. Letting the rejection propagate here means the
  // bootstrap().catch() below actually prints it.
  const app = await NestFactory.createApplicationContext(
    WebhookWorkerAppModule,
    { logger: false, abortOnError: false },
  );
  const worker = app.get(WebhookWorkerService);
  const config = app.get(ConfigService);
  const idleMs = config.get<number>('WEBHOOK_WORKER_IDLE_MS', 250);
  let stopping = false;

  const stop = () => {
    stopping = true;
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);

  try {
    while (!stopping) {
      const result = await worker.processNext();
      if (result === 'IDLE') await delay(idleMs);
    }
  } finally {
    await app.close();
  }
}

void bootstrap().catch((error: unknown) => {
  const message =
    error instanceof Error ? (error.stack ?? error.message) : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
