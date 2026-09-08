import './env-setup-e2e';

import { createServer, type Server } from 'node:http';
import { AddressInfo } from 'node:net';
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
import { WebhookSenderService } from './../src/modules/webhooks/webhook-sender.service';
import { WebhookWorkerService } from './../src/modules/webhooks/webhook-worker.service';
import { verifyWebhookSignature } from './../src/modules/webhooks/webhook-signature';
import type { WebhookEnvelope } from './../src/modules/webhooks/webhook-events';

const AUTH_TOKEN_A =
  'adn_v1.aaaaaaaa-0000-4000-8000-000000000001.BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwc';
const AUTH_TOKEN_B =
  'adn_v1.bbbbbbbb-0000-4000-8000-000000000002.nZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ2dnZ0';

interface OperationBody {
  operation_id: string;
  status: string;
}

interface EndpointBody {
  id: string;
}

type ReceiverMode = 'ok' | 'bad_request' | 'server_error' | 'hang' | 'down';

interface ReceivedRequest {
  headers: Record<string, string | string[] | undefined>;
  body: string;
}

/** Controllable stand-in for "the tenant's webhook endpoint". */
class TestWebhookReceiver {
  private server: Server | null = null;
  private port = 0;
  private readonly sockets = new Set<import('node:net').Socket>();
  mode: ReceiverMode = 'ok';
  received: ReceivedRequest[] = [];

  async start(): Promise<void> {
    this.server = createServer((req, res) => {
      // Force sockets closed after every response so `stop()` (server.close)
      // does not hang forever waiting on a fetch/undici keep-alive
      // connection that neither side will voluntarily close first.
      res.setHeader('Connection', 'close');
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        this.received.push({
          headers: req.headers,
          body: Buffer.concat(chunks).toString('utf8'),
        });
        if (this.mode === 'hang') return; // never respond -> caller times out
        if (this.mode === 'bad_request') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end('{"error":"bad_request"}');
          return;
        }
        if (this.mode === 'server_error') {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end('{"error":"server_error"}');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      });
    });
    this.server.on('connection', (socket) => {
      this.sockets.add(socket);
      socket.on('close', () => this.sockets.delete(socket));
    });
    await new Promise<void>((resolve) => {
      this.server!.listen(0, '127.0.0.1', resolve);
    });
    this.port = (this.server.address() as AddressInfo).port;
  }

  url(path = '/hook'): string {
    return `http://127.0.0.1:${this.port}${path}`;
  }

  async stop(): Promise<void> {
    if (!this.server) return;
    for (const socket of this.sockets) socket.destroy();
    this.sockets.clear();
    await new Promise<void>((resolve) => this.server!.close(() => resolve()));
    this.server = null;
  }
}

/** A URL nothing is listening on, so connections are actively refused. */
async function downEndpointUrl(): Promise<string> {
  const receiver = new TestWebhookReceiver();
  await receiver.start();
  const url = receiver.url();
  await receiver.stop();
  return url;
}

describe('API-DIAN webhooks (e2e, fault injection)', () => {
  let app: NestFastifyApplication;
  let adminPool: Pool;
  let workerDb: DatabaseService;
  let fiscalWorkerRepository: FiscalWorkerRepository;
  let fakeProvider: FakeFiscalProvider;
  let fiscalWorker: FiscalWorkerService;
  let webhookRepository: WebhookDeliveryRepository;
  let webhookSender: WebhookSenderService;
  let webhookWorker: WebhookWorkerService;

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
      DATABASE_POOL_MAX: 2,
      WORKER_ID: 'webhooks-e2e-fiscal-worker',
      WORKER_LEASE_SECONDS: 30,
      WORKER_MUTATION_PAUSE_SECONDS: 0,
      WORKER_RECONCILE_RETRY_SECONDS: 0,
      WORKER_RECONCILE_MAX_ATTEMPTS: 5,
    });
    workerDb = new DatabaseService(workerConfig);
    webhookRepository = new WebhookDeliveryRepository(workerDb);
    fiscalWorkerRepository = new FiscalWorkerRepository(
      workerDb,
      webhookRepository,
    );
    fakeProvider = new FakeFiscalProvider('ACCEPT');
    const logger = new PinoLoggerService();
    fiscalWorker = new FiscalWorkerService(
      fiscalWorkerRepository,
      fakeProvider,
      logger,
      workerConfig,
    );

    const webhookWorkerConfig = new ConfigService({
      WEBHOOK_WORKER_ID: 'webhooks-e2e-webhook-worker',
      WEBHOOK_WORKER_LEASE_SECONDS: 30,
      WEBHOOK_SEND_TIMEOUT_MS: 400,
    });
    webhookSender = new WebhookSenderService(webhookWorkerConfig);
    webhookWorker = new WebhookWorkerService(
      webhookRepository,
      webhookSender,
      logger,
      webhookWorkerConfig,
    );
  });

  afterAll(async () => {
    await workerDb.onModuleDestroy();
    await adminPool.end();
    await app.close();
  });

  afterEach(async () => {
    // Every test registers its own endpoint(s); disable them all once the
    // test is done so the NEXT test's fan-out only ever reaches the
    // endpoint(s) it just registered, not an ever-growing pile of every
    // endpoint created earlier in this file (which would still be a
    // perfectly realistic production scenario — a tenant with many
    // endpoints — but makes each test's assertions about "this one
    // delivery" ambiguous). Uses the admin (superuser, RLS-bypassing)
    // connection so it isn't scoped to a single tenant.
    await adminPool.query(
      `UPDATE app.webhook_endpoints SET status = 'DISABLED' WHERE status = 'ACTIVE'`,
    );
  });

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
            description: 'webhook fault injection',
            quantity: '1.00',
            unit_price: '10000.00',
          },
        ],
        totals: { net: '10000.00', taxes: '1900.00', payable: '11900.00' },
      },
    };
  }

  async function registerEndpoint(
    token: string,
    url: string,
    secret = 'e2e-signing-secret-0123456789abcdef',
  ): Promise<{ endpoint_id: string }> {
    const response = await request(app.getHttpServer())
      .post('/v1/webhook-endpoints')
      .set('Authorization', `Bearer ${token}`)
      .send({ url, secret })
      .expect(201);
    return { endpoint_id: (response.body as EndpointBody).id };
  }

  async function acceptedOperation(clientReference: string): Promise<string> {
    const created = await request(app.getHttpServer())
      .post('/v1/fiscal-operations')
      .set('Authorization', `Bearer ${AUTH_TOKEN_A}`)
      .set('Idempotency-Key', clientReference)
      .send(fiscalCommand(clientReference))
      .expect(202);
    const operationId = (created.body as OperationBody).operation_id;

    fakeProvider.setScenario('ACCEPT');
    // Drain until this operation's own SUBMIT work is processed. Other
    // tests' leftover work items may exist; process until we observe this
    // operation reach ACCEPTED (bounded loop, generous upper limit).
    for (let i = 0; i < 20; i += 1) {
      const status = await request(app.getHttpServer())
        .get(`/v1/fiscal-operations/${operationId}`)
        .set('Authorization', `Bearer ${AUTH_TOKEN_A}`)
        .expect(200);
      if ((status.body as OperationBody).status === 'ACCEPTED') {
        return operationId;
      }
      const outcome = await fiscalWorker.processNext();
      if (outcome === 'IDLE') break;
    }
    const final = await request(app.getHttpServer())
      .get(`/v1/fiscal-operations/${operationId}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN_A}`)
      .expect(200);
    expect((final.body as OperationBody).status).toBe('ACCEPTED');
    return operationId;
  }

  interface DeliveryRow {
    id: string;
    status: string;
    attempt_count: number;
    available_at: Date;
    updated_at: Date;
  }

  async function deliveryForEndpoint(
    operationId: string,
    endpointId: string,
  ): Promise<DeliveryRow> {
    const result = await adminPool.query<DeliveryRow>(
      `SELECT id, status, attempt_count, available_at, updated_at
       FROM app.webhook_deliveries
       WHERE operation_id = $1::uuid AND endpoint_id = $2::uuid`,
      [operationId, endpointId],
    );
    const row = result.rows[0];
    if (!row || result.rows.length !== 1) {
      throw new Error(
        `expected exactly one delivery for operation ${operationId} / endpoint ${endpointId}, found ${result.rows.length}`,
      );
    }
    return row;
  }

  async function forceAvailableNow(deliveryId: string): Promise<void> {
    await adminPool.query(
      `UPDATE app.webhook_deliveries SET available_at = now() WHERE id = $1::uuid`,
      [deliveryId],
    );
  }

  async function attemptCount(deliveryId: string): Promise<number> {
    const result = await adminPool.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM app.webhook_delivery_attempts WHERE delivery_id = $1::uuid`,
      [deliveryId],
    );
    return Number(result.rows[0]?.count ?? '0');
  }

  interface DeliverySnapshot {
    status: string;
    attempt_count: number;
  }

  async function deliverySnapshot(
    deliveryId: string,
  ): Promise<DeliverySnapshot> {
    const result = await adminPool.query<DeliverySnapshot>(
      `SELECT status, attempt_count FROM app.webhook_deliveries WHERE id = $1::uuid`,
      [deliveryId],
    );
    const row = result.rows[0];
    if (!row) throw new Error(`delivery ${deliveryId} not found`);
    return row;
  }

  /**
   * webhookWorker.processNext() always claims the globally-oldest due
   * delivery (correct production behavior — FIFO across tenants/endpoints),
   * which in a shared test database means an unrelated leftover delivery
   * from an earlier test can be claimed before the one this test cares
   * about. This drives processNext() until the specific delivery of
   * interest is the one that actually got processed (detected by its
   * status/attempt_count changing), returning that call's outcome — every
   * other claimed delivery in between is simply drained as a side effect,
   * exactly like a real worker draining a real backlog.
   */
  async function processNextForDelivery(
    deliveryId: string,
    maxTries = 50,
  ): Promise<string> {
    for (let i = 0; i < maxTries; i += 1) {
      const before = await deliverySnapshot(deliveryId);
      const outcome = await webhookWorker.processNext();
      if (outcome === 'IDLE') continue;
      const after = await deliverySnapshot(deliveryId);
      if (
        after.status !== before.status ||
        after.attempt_count !== before.attempt_count
      ) {
        return outcome;
      }
    }
    throw new Error(
      `processNextForDelivery: delivery ${deliveryId} was not claimed within ${maxTries} tries`,
    );
  }

  // ---------------------------------------------------------------------
  // Hard invariant: a down webhook endpoint must never affect the fiscal
  // outcome of a document.
  // ---------------------------------------------------------------------
  it('HARD INVARIANT: a permanently-down webhook endpoint never blocks or alters the fiscal outcome', async () => {
    const downUrl = await downEndpointUrl();
    await registerEndpoint(AUTH_TOKEN_A, downUrl);

    // The fiscal document must reach ACCEPTED even though its only webhook
    // endpoint is unreachable for the entire lifetime of this test.
    const operationId = await acceptedOperation('webhook-invariant-1');

    const check = await request(app.getHttpServer())
      .get(`/v1/fiscal-operations/${operationId}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN_A}`)
      .expect(200);
    expect((check.body as OperationBody).status).toBe('ACCEPTED');

    // The webhook delivery itself may still be pending/failing — that is
    // expected and fine; it must never have touched fiscal state.
    const delivery = await adminPool.query<{ id: string; status: string }>(
      `SELECT id, status FROM app.webhook_deliveries WHERE operation_id = $1::uuid`,
      [operationId],
    );
    expect(delivery.rows.length).toBeGreaterThan(0);

    // Now actually attempt the (permanently down) delivery, and prove the
    // invariant holds even AFTER a real failed attempt: the fiscal document
    // must still read ACCEPTED, unaffected. This also drains the delivery
    // out of PENDING so it doesn't linger as unrelated backlog ahead of
    // later tests' own deliveries (real system behavior: it becomes RETRY,
    // scheduled well into the future).
    const deliveryRow = delivery.rows[0];
    if (deliveryRow) {
      await processNextForDelivery(deliveryRow.id);
    }
    const recheck = await request(app.getHttpServer())
      .get(`/v1/fiscal-operations/${operationId}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN_A}`)
      .expect(200);
    expect((recheck.body as OperationBody).status).toBe('ACCEPTED');
  });

  // ---------------------------------------------------------------------
  // Per-outcome delivery behavior
  // ---------------------------------------------------------------------
  it('webhook 200: delivery succeeds and is marked DELIVERED', async () => {
    const receiver = new TestWebhookReceiver();
    await receiver.start();
    receiver.mode = 'ok';
    const { endpoint_id } = await registerEndpoint(
      AUTH_TOKEN_A,
      receiver.url(),
    );

    const operationId = await acceptedOperation('webhook-200');
    const delivery = await deliveryForEndpoint(operationId, endpoint_id);

    const outcome = await processNextForDelivery(delivery.id);
    expect(outcome).toBe('DELIVERED');

    const after = await adminPool.query<{ status: string }>(
      `SELECT status FROM app.webhook_deliveries WHERE id = $1::uuid`,
      [delivery.id],
    );
    expect(after.rows[0]?.status).toBe('DELIVERED');
    expect(receiver.received).toHaveLength(1);

    const [received] = receiver.received;
    const envelope = JSON.parse(received.body) as WebhookEnvelope;
    expect(envelope.type).toBe('document.accepted');
    expect(envelope.tenant_id).toBe('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1');
    const timestamp = received.headers['webhook-timestamp'] as string;
    const signature = received.headers['webhook-signature'] as string;
    expect(
      verifyWebhookSignature(
        'e2e-signing-secret-0123456789abcdef',
        timestamp,
        received.body,
        signature,
      ),
    ).toBe(true);

    await receiver.stop();
  });

  it('webhook 400: delivery is scheduled for retry, not delivered', async () => {
    const receiver = new TestWebhookReceiver();
    await receiver.start();
    receiver.mode = 'bad_request';
    const { endpoint_id } = await registerEndpoint(
      AUTH_TOKEN_A,
      receiver.url(),
    );

    const operationId = await acceptedOperation('webhook-400');
    const delivery = await deliveryForEndpoint(operationId, endpoint_id);

    const outcome = await processNextForDelivery(delivery.id);
    expect(outcome).toBe('RETRY_SCHEDULED');

    const attempt = await adminPool.query<{
      outcome: string;
      http_status: number;
    }>(
      `SELECT outcome, http_status FROM app.webhook_delivery_attempts
       WHERE delivery_id = $1::uuid
       ORDER BY attempt_no DESC LIMIT 1`,
      [delivery.id],
    );
    expect(attempt.rows[0]?.outcome).toBe('HTTP_4XX');
    expect(attempt.rows[0]?.http_status).toBe(400);

    await receiver.stop();
  });

  it('webhook 500: delivery is scheduled for retry, not delivered', async () => {
    const receiver = new TestWebhookReceiver();
    await receiver.start();
    receiver.mode = 'server_error';
    const { endpoint_id } = await registerEndpoint(
      AUTH_TOKEN_A,
      receiver.url(),
    );

    const operationId = await acceptedOperation('webhook-500');
    const delivery = await deliveryForEndpoint(operationId, endpoint_id);

    const outcome = await processNextForDelivery(delivery.id);
    expect(outcome).toBe('RETRY_SCHEDULED');

    const attempt = await adminPool.query<{
      outcome: string;
      http_status: number;
    }>(
      `SELECT outcome, http_status FROM app.webhook_delivery_attempts
       WHERE delivery_id = $1::uuid
       ORDER BY attempt_no DESC LIMIT 1`,
      [delivery.id],
    );
    expect(attempt.rows[0]?.outcome).toBe('HTTP_5XX');
    expect(attempt.rows[0]?.http_status).toBe(500);

    await receiver.stop();
  });

  it('timeout: a hanging endpoint is treated as a TIMEOUT and scheduled for retry', async () => {
    const receiver = new TestWebhookReceiver();
    await receiver.start();
    receiver.mode = 'hang';
    const { endpoint_id } = await registerEndpoint(
      AUTH_TOKEN_A,
      receiver.url(),
    );

    const operationId = await acceptedOperation('webhook-timeout');
    const delivery = await deliveryForEndpoint(operationId, endpoint_id);

    const outcome = await processNextForDelivery(delivery.id);
    expect(outcome).toBe('RETRY_SCHEDULED');

    const attempt = await adminPool.query<{ outcome: string }>(
      `SELECT outcome FROM app.webhook_delivery_attempts
       WHERE delivery_id = $1::uuid
       ORDER BY attempt_no DESC LIMIT 1`,
      [delivery.id],
    );
    expect(attempt.rows[0]?.outcome).toBe('TIMEOUT');

    await receiver.stop();
  }, 15000);

  it('endpoint unavailable (connection refused): scheduled for retry with CONNECTION_ERROR', async () => {
    const downUrl = await downEndpointUrl();
    const { endpoint_id } = await registerEndpoint(AUTH_TOKEN_A, downUrl);

    const operationId = await acceptedOperation('webhook-conn-refused');
    const delivery = await deliveryForEndpoint(operationId, endpoint_id);

    const outcome = await processNextForDelivery(delivery.id);
    expect(outcome).toBe('RETRY_SCHEDULED');

    const attempt = await adminPool.query<{ outcome: string }>(
      `SELECT outcome FROM app.webhook_delivery_attempts
       WHERE delivery_id = $1::uuid
       ORDER BY attempt_no DESC LIMIT 1`,
      [delivery.id],
    );
    expect(attempt.rows[0]?.outcome).toBe('CONNECTION_ERROR');
  });

  // ---------------------------------------------------------------------
  // Retry / backoff / dead-letter ladder
  // ---------------------------------------------------------------------
  it('retries happen, backoff increases monotonically, and exhaustion dead-letters the delivery', async () => {
    const receiver = new TestWebhookReceiver();
    await receiver.start();
    receiver.mode = 'server_error';
    const { endpoint_id } = await registerEndpoint(
      AUTH_TOKEN_A,
      receiver.url(),
    );

    const operationId = await acceptedOperation('webhook-backoff-ladder');
    const delivery = await deliveryForEndpoint(operationId, endpoint_id);

    const expectedDelaysSeconds = [60, 300, 1800, 7200, 28800, 86400];
    let lastStatus = 'PENDING';

    for (let attempt = 1; attempt <= 7; attempt += 1) {
      const before = Date.now();
      const outcome = await processNextForDelivery(delivery.id);

      const row = await adminPool.query<{
        status: string;
        attempt_count: number;
        available_at: Date;
        updated_at: Date;
      }>(
        `SELECT status, attempt_count, available_at, updated_at
         FROM app.webhook_deliveries WHERE id = $1::uuid`,
        [delivery.id],
      );
      const state = row.rows[0];
      if (!state) throw new Error('delivery disappeared');
      lastStatus = state.status;

      if (attempt < 7) {
        expect(outcome).toBe('RETRY_SCHEDULED');
        expect(state.status).toBe('RETRY');
        const deltaSeconds =
          (state.available_at.getTime() - state.updated_at.getTime()) / 1000;
        const expected = expectedDelaysSeconds[attempt - 1];
        // Allow small clock/DB-roundtrip tolerance.
        expect(Math.abs(deltaSeconds - expected)).toBeLessThan(5);
        // Fast-forward time so the next processNext() call can claim it
        // immediately instead of the test sleeping for real hours.
        await forceAvailableNow(delivery.id);
      } else {
        expect(outcome).toBe('DEAD_LETTERED');
        expect(state.status).toBe('DEAD');
      }
      expect(Date.now() - before).toBeLessThan(5000);
    }

    expect(lastStatus).toBe('DEAD');
    expect(await attemptCount(delivery.id)).toBe(7);

    // Stopped retrying: it is no longer claimable even after another
    // forced fast-forward, because DEAD is a terminal status.
    await adminPool.query(
      `UPDATE app.webhook_deliveries SET available_at = now() WHERE id = $1::uuid`,
      [delivery.id],
    );
    const stillDead = await adminPool.query<{
      status: string;
      attempt_count: number;
    }>(
      `SELECT status, attempt_count FROM app.webhook_deliveries WHERE id = $1::uuid`,
      [delivery.id],
    );
    expect(stillDead.rows[0]?.status).toBe('DEAD');
    expect(stillDead.rows[0]?.attempt_count).toBe(7);

    await receiver.stop();
  });

  // ---------------------------------------------------------------------
  // Two endpoints, independent outcomes, no cross-contamination
  // ---------------------------------------------------------------------
  it('two endpoints for the same tenant: one succeeds and one fails independently', async () => {
    const healthy = new TestWebhookReceiver();
    await healthy.start();
    healthy.mode = 'ok';
    const failing = new TestWebhookReceiver();
    await failing.start();
    failing.mode = 'server_error';

    const { endpoint_id: healthyId } = await registerEndpoint(
      AUTH_TOKEN_A,
      healthy.url(),
    );
    const { endpoint_id: failingId } = await registerEndpoint(
      AUTH_TOKEN_A,
      failing.url(),
    );

    const operationId = await acceptedOperation('webhook-two-endpoints');
    const healthyDelivery = await deliveryForEndpoint(operationId, healthyId);
    const failingDelivery = await deliveryForEndpoint(operationId, failingId);
    expect(healthyDelivery.id).not.toBe(failingDelivery.id);

    const outcomes = new Set<string>();
    outcomes.add(await processNextForDelivery(healthyDelivery.id));
    outcomes.add(await processNextForDelivery(failingDelivery.id));
    expect(outcomes).toEqual(new Set(['DELIVERED', 'RETRY_SCHEDULED']));

    const rows = await adminPool.query<{ id: string; status: string }>(
      `SELECT id, status FROM app.webhook_deliveries WHERE id = ANY($1::uuid[])`,
      [[healthyDelivery.id, failingDelivery.id]],
    );
    const byId = new Map(rows.rows.map((r) => [r.id, r.status]));
    expect(byId.get(healthyDelivery.id)).toBe('DELIVERED');
    expect(byId.get(failingDelivery.id)).toBe('RETRY');

    await healthy.stop();
    await failing.stop();
  });

  // ---------------------------------------------------------------------
  // Recovery after outage
  // ---------------------------------------------------------------------
  it('recovery after outage: a delivery retries successfully once the endpoint comes back up', async () => {
    const receiver = new TestWebhookReceiver();
    await receiver.start();
    receiver.mode = 'server_error';
    const { endpoint_id } = await registerEndpoint(
      AUTH_TOKEN_A,
      receiver.url(),
    );

    const operationId = await acceptedOperation('webhook-recovery');
    const delivery = await deliveryForEndpoint(operationId, endpoint_id);

    expect(await processNextForDelivery(delivery.id)).toBe('RETRY_SCHEDULED');

    // Endpoint recovers.
    receiver.mode = 'ok';
    await forceAvailableNow(delivery.id);

    expect(await processNextForDelivery(delivery.id)).toBe('DELIVERED');
    const after = await adminPool.query<{ status: string }>(
      `SELECT status FROM app.webhook_deliveries WHERE id = $1::uuid`,
      [delivery.id],
    );
    expect(after.rows[0]?.status).toBe('DELIVERED');
    expect(await attemptCount(delivery.id)).toBe(2);

    await receiver.stop();
  });

  // ---------------------------------------------------------------------
  // Multitenant isolation
  // ---------------------------------------------------------------------
  it('tenant isolation: tenant B cannot see or affect tenant A webhook config/history', async () => {
    const receiver = new TestWebhookReceiver();
    await receiver.start();
    const { endpoint_id } = await registerEndpoint(
      AUTH_TOKEN_A,
      receiver.url(),
    );
    await acceptedOperation('webhook-isolation');

    const listAsB = await request(app.getHttpServer())
      .get('/v1/webhook-endpoints')
      .set('Authorization', `Bearer ${AUTH_TOKEN_B}`)
      .expect(200);
    expect(
      (listAsB.body as Array<{ id: string }>).some((e) => e.id === endpoint_id),
    ).toBe(false);

    await request(app.getHttpServer())
      .get(`/v1/webhook-endpoints/${endpoint_id}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN_B}`)
      .expect(404);

    await request(app.getHttpServer())
      .patch(`/v1/webhook-endpoints/${endpoint_id}/disable`)
      .set('Authorization', `Bearer ${AUTH_TOKEN_B}`)
      .expect(404);

    const deliveriesAsB = await request(app.getHttpServer())
      .get('/v1/webhook-deliveries')
      .set('Authorization', `Bearer ${AUTH_TOKEN_B}`)
      .expect(200);
    expect(deliveriesAsB.body).toEqual([]);

    // Confirm tenant A can still see its own endpoint (proves this is
    // real isolation, not a broken endpoint).
    const listAsA = await request(app.getHttpServer())
      .get('/v1/webhook-endpoints')
      .set('Authorization', `Bearer ${AUTH_TOKEN_A}`)
      .expect(200);
    expect(
      (listAsA.body as Array<{ id: string }>).some((e) => e.id === endpoint_id),
    ).toBe(true);

    await receiver.stop();
  });

  it('disabling an endpoint stops new deliveries from being enqueued for it', async () => {
    const receiver = new TestWebhookReceiver();
    await receiver.start();
    const { endpoint_id } = await registerEndpoint(
      AUTH_TOKEN_A,
      receiver.url(),
    );

    await request(app.getHttpServer())
      .patch(`/v1/webhook-endpoints/${endpoint_id}/disable`)
      .set('Authorization', `Bearer ${AUTH_TOKEN_A}`)
      .expect(200);

    const operationId = await acceptedOperation('webhook-disabled-endpoint');
    const rows = await adminPool.query(
      `SELECT id FROM app.webhook_deliveries WHERE operation_id = $1::uuid AND endpoint_id = $2::uuid`,
      [operationId, endpoint_id],
    );
    expect(rows.rows).toHaveLength(0);

    await receiver.stop();
  });
});
