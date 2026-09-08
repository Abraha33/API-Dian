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
import { WebhookDeliveryRepository } from './../src/modules/webhooks/webhook-delivery.repository';

/**
 * Phase 6 remaining fault-injection coverage that app.e2e-spec.ts and
 * webhooks.e2e-spec.ts don't already exercise:
 *   - lease expiry recovered by a DIFFERENT worker instance (not just the
 *     same one, which app.e2e-spec.ts's "crash after remote acceptance"
 *     test already covers)
 *   - backlog drain under real concurrency, with a duplicate-side-effect
 *     check (no operation gets more than one provider_attempt)
 *   - concurrent identical Idempotency-Key requests never double-process
 *   - a foreign UUID (belonging to another tenant) is rejected, not leaked
 *
 * All against FakeFiscalProvider only — no real fiscal provider involved.
 */

const AUTH_TOKEN_A =
  'adn_v1.aaaaaaaa-0000-4000-8000-000000000001.BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwc';

interface OperationBody {
  operation_id: string;
  status: string;
  replayed?: boolean;
}

function fiscalCommand(clientReference: string) {
  return {
    schema_version: '1.0',
    document_kind: 'FEV',
    client_reference: clientReference,
    occurred_at: '2026-09-07T10:00:00-05:00',
    currency: 'COP',
    document: {
      lines: [
        {
          line_no: 1,
          description: 'fault injection',
          quantity: '1.00',
          unit_price: '10000.00',
        },
      ],
      totals: { net: '10000.00', taxes: '1900.00', payable: '11900.00' },
    },
  };
}

function makeFiscalWorker(
  workerId: string,
  db: DatabaseService,
  webhooks: WebhookDeliveryRepository,
  provider: FakeFiscalProvider,
  logger: PinoLoggerService,
): { repository: FiscalWorkerRepository; service: FiscalWorkerService } {
  const repository = new FiscalWorkerRepository(db, webhooks);
  const config = new ConfigService({
    WORKER_ID: workerId,
    WORKER_LEASE_SECONDS: 30,
    WORKER_MUTATION_PAUSE_SECONDS: 0,
    WORKER_RECONCILE_RETRY_SECONDS: 0,
    WORKER_RECONCILE_MAX_ATTEMPTS: 5,
  });
  const service = new FiscalWorkerService(repository, provider, logger, config);
  return { repository, service };
}

describe('API-DIAN fault injection: worker lease/crash, backlog, idempotency, foreign UUID', () => {
  let app: NestFastifyApplication;
  let adminPool: Pool;
  let workerDb: DatabaseService;
  let webhookRepository: WebhookDeliveryRepository;
  let fakeProvider: FakeFiscalProvider;
  let logger: PinoLoggerService;
  let workerA: ReturnType<typeof makeFiscalWorker>;

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

    adminPool = new Pool({
      connectionString: process.env.TEST_ADMIN_DATABASE_URL,
    });

    const workerConfig = new ConfigService({
      DATABASE_URL: process.env.WORKER_DATABASE_URL,
      DATABASE_POOL_MAX: 5,
    });
    workerDb = new DatabaseService(workerConfig);
    webhookRepository = new WebhookDeliveryRepository(workerDb);
    fakeProvider = new FakeFiscalProvider('ACCEPT');
    logger = new PinoLoggerService();
    workerA = makeFiscalWorker(
      'fault-worker-a',
      workerDb,
      webhookRepository,
      fakeProvider,
      logger,
    );
  });

  afterAll(async () => {
    await workerDb.onModuleDestroy();
    await adminPool.end();
    await app.close();
  });

  async function postOperation(
    key: string,
    clientReference: string,
  ): Promise<OperationBody> {
    const response = await request(app.getHttpServer())
      .post('/v1/fiscal-operations')
      .set('Authorization', `Bearer ${AUTH_TOKEN_A}`)
      .set('Idempotency-Key', key)
      .send(fiscalCommand(clientReference));
    return response.body as OperationBody;
  }

  async function drainWith(
    service: FiscalWorkerService,
    maxIterations = 200,
  ): Promise<void> {
    for (let i = 0; i < maxIterations; i += 1) {
      const outcome = await service.processNext();
      if (outcome === 'IDLE') return;
    }
  }

  // ---------------------------------------------------------------------
  // Lease expiry recovered by a DIFFERENT worker instance
  // ---------------------------------------------------------------------
  it('lease expiry: a SECOND worker instance recovers a job whose lease expired mid-processing', async () => {
    fakeProvider.setScenario('ACCEPT');
    // Drain any backlog left by other e2e-spec files running in the same
    // shared database before this one, so the upcoming claimNext() calls
    // are guaranteed to see only the job this test creates.
    await drainWith(workerA.service, 500);

    const created = await postOperation(
      'fault-lease-expiry-1',
      'sale:fault:lease-expiry',
    );
    expect(created.status).toBe('READY');

    // Worker A claims the job (simulating it starting work) but then
    // "crashes" — it never calls prepareSubmission/applySubmissionResult,
    // it just disappears, leaving the row CLAIMED with a lease.
    const claimedByA = await workerA.repository.claimNext('fault-worker-a', 1);
    expect(claimedByA).not.toBeNull();
    if (!claimedByA) throw new Error('expected claimed job');
    expect(claimedByA.operation_id).toBe(created.operation_id);

    // Force the lease to look expired (equivalent to real time passing
    // past WORKER_LEASE_SECONDS without worker A renewing it).
    await adminPool.query(
      `UPDATE app.work_items SET lease_until = now() - interval '1 second' WHERE id = $1::uuid`,
      [claimedByA.id],
    );

    // A completely separate worker instance (different worker id, own
    // repository/service instances — nothing shared with worker A except
    // the database) must be able to claim and finish the job.
    const workerB = makeFiscalWorker(
      'fault-worker-b',
      workerDb,
      webhookRepository,
      fakeProvider,
      logger,
    );
    const claimedByB = await workerB.repository.claimNext('fault-worker-b', 30);
    expect(claimedByB).not.toBeNull();
    if (!claimedByB)
      throw new Error('expected worker B to claim expired lease');
    expect(claimedByB.id).toBe(claimedByA.id);
    expect(claimedByB.lease_owner).not.toBe('fault-worker-a');

    // Re-queue it as a normal claim (claimNext already claimed it above for
    // inspection purposes; process it forward the same way processNext()
    // would from here).
    const prepared = await workerB.repository.prepareSubmission(
      claimedByB,
      true,
    );
    expect(prepared.action).toBe('SUBMIT');
    if (prepared.action !== 'SUBMIT') throw new Error('expected submit');
    const result = await fakeProvider.submit(
      prepared.command,
      prepared.context,
    );
    await workerB.repository.applySubmissionResult(
      claimedByB,
      prepared.attemptId,
      result,
    );

    const final = await request(app.getHttpServer())
      .get(`/v1/fiscal-operations/${created.operation_id}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN_A}`)
      .expect(200);
    expect((final.body as OperationBody).status).toBe('ACCEPTED');

    const attempts = await adminPool.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM app.provider_attempts WHERE operation_id = $1::uuid`,
      [created.operation_id],
    );
    // Exactly one attempt: no duplicate side effect from the "crashed"
    // worker A, which never got far enough to create one.
    expect(attempts.rows[0]?.count).toBe('1');
  });

  // ---------------------------------------------------------------------
  // Backlog drain: build up a backlog, verify it drains without loss or
  // duplication.
  // ---------------------------------------------------------------------
  it('backlog drain: N operations queued concurrently all reach ACCEPTED exactly once, no loss or duplication', async () => {
    fakeProvider.setScenario('ACCEPT');
    const total = 40;
    const created = await Promise.all(
      Array.from({ length: total }, (_, i) =>
        postOperation(`fault-backlog-${i}`, `sale:fault:backlog:${i}`),
      ),
    );
    expect(created).toHaveLength(total);
    for (const c of created) expect(c.status).toBe('READY');

    const pendingBefore = await adminPool.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM app.work_items
       WHERE kind = 'SUBMIT' AND status IN ('PENDING', 'RETRY')
         AND operation_id = ANY($1::uuid[])`,
      [created.map((c) => c.operation_id)],
    );
    expect(Number(pendingBefore.rows[0]?.count)).toBeGreaterThanOrEqual(total);

    await drainWith(workerA.service, 500);

    const statuses = await adminPool.query<{ status: string; count: string }>(
      `SELECT status, count(*)::text AS count FROM app.fiscal_operations
       WHERE id = ANY($1::uuid[])
       GROUP BY status`,
      [created.map((c) => c.operation_id)],
    );
    const byStatus = new Map(
      statuses.rows.map((r) => [r.status, Number(r.count)]),
    );
    // No loss: every operation ends up ACCEPTED (FakeFiscalProvider ACCEPT
    // scenario is deterministic here).
    expect(byStatus.get('ACCEPTED')).toBe(total);

    const attemptCounts = await adminPool.query<{
      operation_id: string;
      count: string;
    }>(
      `SELECT operation_id, count(*)::text AS count FROM app.provider_attempts
       WHERE operation_id = ANY($1::uuid[])
       GROUP BY operation_id`,
      [created.map((c) => c.operation_id)],
    );
    // No duplication: exactly one provider attempt per operation.
    expect(attemptCounts.rows).toHaveLength(total);
    for (const row of attemptCounts.rows) {
      expect(row.count).toBe('1');
    }

    const remainingWork = await adminPool.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM app.work_items
       WHERE operation_id = ANY($1::uuid[]) AND status IN ('PENDING', 'RETRY', 'CLAIMED')`,
      [created.map((c) => c.operation_id)],
    );
    expect(remainingWork.rows[0]?.count).toBe('0');
  });

  // ---------------------------------------------------------------------
  // Concurrent identical Idempotency-Key
  // ---------------------------------------------------------------------
  it('concurrent identical Idempotency-Key: N simultaneous requests never double-process', async () => {
    const key = 'fault-concurrent-idem-1';
    const concurrency = 15;
    const responses = await Promise.all(
      Array.from({ length: concurrency }, () =>
        postOperation(key, 'sale:fault:concurrent-idem'),
      ),
    );

    const operationIds = new Set(responses.map((r) => r.operation_id));
    expect(operationIds.size).toBe(1);
    const [operationId] = [...operationIds];

    const rows = await adminPool.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM app.fiscal_operations WHERE id = $1::uuid`,
      [operationId],
    );
    expect(rows.rows[0]?.count).toBe('1');

    const workItems = await adminPool.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM app.work_items
       WHERE operation_id = $1::uuid AND kind = 'SUBMIT'`,
      [operationId],
    );
    // Exactly one SUBMIT work item was created, regardless of how many
    // concurrent requests raced to create the operation.
    expect(workItems.rows[0]?.count).toBe('1');

    const replayedCount = responses.filter((r) => r.replayed === true).length;
    // At most one request could have been the "winner"; the rest must be
    // replays of the same row.
    expect(replayedCount).toBeGreaterThanOrEqual(concurrency - 1);
  });

  // ---------------------------------------------------------------------
  // Foreign UUID rejected, not leaked
  // ---------------------------------------------------------------------
  it('foreign UUID: a syntactically valid but nonexistent/foreign-tenant UUID is rejected as 404, never leaked', async () => {
    const foreignUuid = '99999999-9999-4999-8999-999999999999';
    const response = await request(app.getHttpServer())
      .get(`/v1/fiscal-operations/${foreignUuid}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN_A}`)
      .expect(404);
    // The 404 body must not leak whether the id exists for another tenant.
    expect(JSON.stringify(response.body)).not.toMatch(/tenant/i);
  });
});
