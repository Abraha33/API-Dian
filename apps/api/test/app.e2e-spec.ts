import './env-setup-e2e';

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Pool } from 'pg';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DatabaseService } from './../src/common/database/database.service';
import { PinoLoggerService } from './../src/common/logger/pino-logger.service';
import { FakeFiscalProvider } from './../src/modules/provider/fake-fiscal-provider';
import { FiscalWorkerRepository } from './../src/modules/worker/fiscal-worker.repository';
import { FiscalWorkerService } from './../src/modules/worker/fiscal-worker.service';

const AUTH_TOKEN =
  'adn_v1.aaaaaaaa-0000-4000-8000-000000000001.BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwc';
const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const TENANT_B_OPERATION = 'bbbbbbbb-0000-4000-8000-000000000099';

interface OperationBody {
  operation_id: string;
  status: string;
  replayed?: boolean;
}

interface ErrorBody {
  error: string;
}

function commandFor(clientReference: string) {
  return {
    schema_version: '1.0',
    document_kind: 'FEV',
    client_reference: clientReference,
    occurred_at: '2026-08-18T22:30:10-05:00',
    currency: 'COP',
    document: {
      lines: [
        {
          line_no: 1,
          description: 'Producto prueba',
          quantity: '2.00',
          unit_price: '12500.00',
        },
      ],
      totals: {
        net: '25000.00',
        taxes: '4750.00',
        payable: '29750.00',
      },
    },
  };
}

describe('API-DIAN F6B (e2e)', () => {
  let app: NestFastifyApplication;
  let apiPool: Pool;
  let adminPool: Pool;
  let workerDb: DatabaseService;
  let workerRepository: FiscalWorkerRepository;
  let fakeProvider: FakeFiscalProvider;
  let worker: FiscalWorkerService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    apiPool = new Pool({ connectionString: process.env.DATABASE_URL });
    adminPool = new Pool({
      connectionString: process.env.TEST_ADMIN_DATABASE_URL,
    });

    const workerConfig = new ConfigService({
      DATABASE_URL: process.env.WORKER_DATABASE_URL,
      DATABASE_POOL_MAX: 2,
      WORKER_ID: 'e2e-worker',
      WORKER_LEASE_SECONDS: 30,
      WORKER_MUTATION_PAUSE_SECONDS: 0,
      WORKER_RECONCILE_RETRY_SECONDS: 0,
      WORKER_RECONCILE_MAX_ATTEMPTS: 5,
    });
    workerDb = new DatabaseService(workerConfig);
    workerRepository = new FiscalWorkerRepository(workerDb);
    fakeProvider = new FakeFiscalProvider('ACCEPT');
    const workerLogger = moduleFixture.get(PinoLoggerService);
    worker = new FiscalWorkerService(
      workerRepository,
      fakeProvider,
      workerLogger,
      workerConfig,
    );
  });

  async function postOperation(
    key: string,
    clientReference: string,
  ): Promise<OperationBody> {
    const response = await request(app.getHttpServer())
      .post('/v1/fiscal-operations')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .set('Idempotency-Key', key)
      .send(commandFor(clientReference))
      .expect(202);
    return response.body as OperationBody;
  }

  async function readOperation(operationId: string): Promise<OperationBody> {
    const response = await request(app.getHttpServer())
      .get(`/v1/fiscal-operations/${operationId}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .expect(200);
    return response.body as OperationBody;
  }

  async function drainWorker(): Promise<void> {
    while ((await worker.processNext()) !== 'IDLE') {
      // Drain pre-existing work created by earlier tests.
    }
  }

  async function countAttempts(operationId: string): Promise<number> {
    const result = await adminPool.query<{ count: string }>(
      `SELECT count(*)::text AS count
       FROM app.provider_attempts
       WHERE operation_id = $1::uuid`,
      [operationId],
    );
    return Number(result.rows[0]?.count ?? '0');
  }

  async function readProviderAttempt(operationId: string): Promise<{
    status: string;
    outcome_code: string | null;
  }> {
    const result = await adminPool.query<{
      status: string;
      outcome_code: string | null;
    }>(
      `SELECT status, outcome_code
       FROM app.provider_attempts
       WHERE operation_id = $1::uuid
       ORDER BY attempt_no DESC
       LIMIT 1`,
      [operationId],
    );
    const row = result.rows[0];
    if (!row) throw new Error('provider attempt not found');
    return row;
  }

  async function setProviderMutations(enabled: boolean): Promise<void> {
    await adminPool.query(
      `UPDATE app.runtime_controls
       SET provider_mutations_enabled = $1,
           reason = 'e2e',
           updated_at = now(),
           updated_by = 'e2e'
       WHERE singleton_id = 1`,
      [enabled],
    );
  }

  it('/health and /ready expose real DB readiness', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
    const ready = await request(app.getHttpServer()).get('/ready').expect(200);
    expect(ready.body).toEqual({ status: 'ok', checks: { db: 'ok' } });
  });

  it('rejects missing credential', async () => {
    await request(app.getHttpServer())
      .post('/v1/fiscal-operations')
      .set('Idempotency-Key', 'f6b-no-auth')
      .send(commandFor('sale:no-auth'))
      .expect(401);
  });

  it('persists one logical operation and one work item, then replays it', async () => {
    const first = await postOperation('f6b-idempotency-1', 'sale:f6b:1');

    expect(first.status).toBe('READY');
    expect(first.replayed).toBe(false);
    const operationId = first.operation_id;

    const replay = await postOperation('f6b-idempotency-1', 'sale:f6b:1');

    expect(replay.operation_id).toBe(operationId);
    expect(replay.replayed).toBe(true);

    const client = await apiPool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT set_config('app.tenant_id', $1, true)", [
        TENANT_A,
      ]);
      const work = await client.query<{ count: string }>(
        `SELECT count(*)::text AS count
         FROM app.work_items
         WHERE operation_id = $1::uuid AND kind = 'SUBMIT'`,
        [operationId],
      );
      expect(work.rows[0]?.count).toBe('1');
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  });

  it('rejects reuse of idempotency key with changed fiscal semantics', async () => {
    const original = commandFor('sale:f6b:conflict');
    await request(app.getHttpServer())
      .post('/v1/fiscal-operations')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .set('Idempotency-Key', 'f6b-idempotency-conflict')
      .send(original)
      .expect(202);

    const changed = {
      ...original,
      document: {
        ...original.document,
        totals: { ...original.document.totals, payable: '29751.00' },
      },
    };

    const response = await request(app.getHttpServer())
      .post('/v1/fiscal-operations')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .set('Idempotency-Key', 'f6b-idempotency-conflict')
      .send(changed)
      .expect(409);
    const errorBody = response.body as ErrorBody;

    expect(errorBody.error).toBe('IDEMPOTENCY_CONFLICT');
  });

  it('does not reveal an operation from another tenant', async () => {
    await request(app.getHttpServer())
      .get(`/v1/fiscal-operations/${TENANT_B_OPERATION}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .expect(404);
  });

  it('worker accepts a READY operation with one persisted provider attempt', async () => {
    await drainWorker();
    fakeProvider.setScenario('ACCEPT');
    const created = await postOperation(
      'f6b-worker-accept',
      'sale:worker:accept',
    );

    expect(await worker.processNext()).toBe('SUBMITTED');
    expect((await readOperation(created.operation_id)).status).toBe('ACCEPTED');
    expect(await countAttempts(created.operation_id)).toBe(1);
  });

  it('ambiguous submit becomes UNKNOWN and reconciles without a second submit', async () => {
    fakeProvider.setScenario('AMBIGUOUS_TIMEOUT');
    const created = await postOperation(
      'f6b-worker-ambiguous',
      'sale:worker:ambiguous',
    );

    expect(await worker.processNext()).toBe('SUBMITTED');
    expect((await readOperation(created.operation_id)).status).toBe('UNKNOWN');
    expect(await countAttempts(created.operation_id)).toBe(1);

    fakeProvider.setScenario('ACCEPT');
    expect(await worker.processNext()).toBe('RECONCILED');
    expect((await readOperation(created.operation_id)).status).toBe('ACCEPTED');
    expect(await countAttempts(created.operation_id)).toBe(1);
  });

  it('retries read-only reconciliation during delayed provider visibility', async () => {
    fakeProvider.setScenario('DELAYED_VISIBILITY');
    const created = await postOperation(
      'f6b-worker-delayed',
      'sale:worker:delayed',
    );

    expect(await worker.processNext()).toBe('SUBMITTED');
    expect((await readOperation(created.operation_id)).status).toBe('UNKNOWN');

    expect(await worker.processNext()).toBe('RETRY_SCHEDULED');
    expect((await readOperation(created.operation_id)).status).toBe(
      'RECONCILING',
    );

    expect(await worker.processNext()).toBe('RECONCILED');
    expect((await readOperation(created.operation_id)).status).toBe('ACCEPTED');
    expect(await countAttempts(created.operation_id)).toBe(1);
  });

  it('retries a mutation only after PROVEN_NOT_SENT is persisted', async () => {
    fakeProvider.setScenario('PROVEN_NOT_SENT');
    const created = await postOperation(
      'f6b-worker-not-sent',
      'sale:worker:not-sent',
    );

    expect(await worker.processNext()).toBe('SUBMITTED');
    expect((await readOperation(created.operation_id)).status).toBe('READY');
    expect((await readProviderAttempt(created.operation_id)).outcome_code).toBe(
      'PROVEN_NOT_SENT',
    );
    expect(await countAttempts(created.operation_id)).toBe(1);

    fakeProvider.setScenario('ACCEPT');
    expect(await worker.processNext()).toBe('SUBMITTED');
    expect((await readOperation(created.operation_id)).status).toBe('ACCEPTED');
    expect(await countAttempts(created.operation_id)).toBe(2);
  });

  it('kill switch pauses new submits without creating provider attempts', async () => {
    const created = await postOperation(
      'f6b-worker-kill-switch',
      'sale:worker:kill-switch',
    );
    await setProviderMutations(false);

    expect(await worker.processNext()).toBe('MUTATIONS_PAUSED');
    expect((await readOperation(created.operation_id)).status).toBe('READY');
    expect(await countAttempts(created.operation_id)).toBe(0);

    await setProviderMutations(true);
    fakeProvider.setScenario('ACCEPT');
    expect(await worker.processNext()).toBe('SUBMITTED');
    expect((await readOperation(created.operation_id)).status).toBe('ACCEPTED');
  });

  it('crash after remote acceptance recovers through UNKNOWN and reconciliation', async () => {
    fakeProvider.setScenario('ACCEPT');
    const created = await postOperation(
      'f6b-worker-crash',
      'sale:worker:crash',
    );

    const job = await workerRepository.claimNext('crash-sim', 1);
    expect(job).not.toBeNull();
    if (!job) throw new Error('expected claimed job');

    const prepared = await workerRepository.prepareSubmission(job, true);
    expect(prepared.action).toBe('SUBMIT');
    if (prepared.action !== 'SUBMIT') throw new Error('expected submit');

    const remote = await fakeProvider.submit(
      prepared.command,
      prepared.context,
    );
    expect(remote.outcome).toBe('CONCLUSIVE_ACCEPTED');

    await adminPool.query(
      `UPDATE app.work_items
       SET lease_until = now() - interval '1 second'
       WHERE id = $1::uuid`,
      [job.id],
    );

    expect(await worker.processNext()).toBe('RECOVERED_UNKNOWN');
    expect((await readOperation(created.operation_id)).status).toBe('UNKNOWN');
    expect(await countAttempts(created.operation_id)).toBe(1);

    expect(await worker.processNext()).toBe('RECONCILED');
    expect((await readOperation(created.operation_id)).status).toBe('ACCEPTED');
    expect(await countAttempts(created.operation_id)).toBe(1);
  });

  afterAll(async () => {
    await setProviderMutations(true);
    await workerDb.onModuleDestroy();
    await apiPool.end();
    await adminPool.end();
    await app.close();
  });
});
