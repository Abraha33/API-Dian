import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FiscalWorkerService } from './modules/worker/fiscal-worker.service';
import { WorkerAppModule } from './worker-app.module';

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function bootstrap(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'F6B FakeFiscalProvider worker is forbidden in production; wait for F6C adapter',
    );
  }

  const app = await NestFactory.createApplicationContext(WorkerAppModule, {
    logger: false,
  });
  const worker = app.get(FiscalWorkerService);
  const config = app.get(ConfigService);
  const idleMs = config.get<number>('WORKER_IDLE_MS', 250);
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
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
