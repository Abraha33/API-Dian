import './env-setup-e2e';

import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Pool, type QueryResultRow } from 'pg';
import request from 'supertest';
import { AppModule } from './../src/app.module';

jest.setTimeout(30_000);

const AUTH_TOKEN =
  'adn_v1.aaaaaaaa-0000-4000-8000-000000000001.BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwc';
const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const SAME_KEY_PARALLELISM = 32;
const DISTINCT_PARALLELISM = 40;

interface OperationBody {
  operation_id: string;
  status: string;
  replayed?: boolean;
}

interface CountRow extends QueryResultRow {
  count: string;
}

interface ClaimedRow extends QueryResultRow {
  id: string;
  tenant_id: string;
  operation_id: string;
  kind: string;
  attempt_count: number;
}

function commandFor(clientReference: string, payable = '29750.00') {
  return {
    schema_version: '1.0',
    document_kind: 'FEV',
    client_reference: clientReference,
    occurred_at: '2026-08-19T12:00:00-05:00',
    currency: 'COP',
    document: {
      lines: [
        {
          line_no: 1,
          description: 'Concurrency gate',
          quantity: '2.00',
          unit_price: '12500.00',
        },
      ],
      totals: {
        net: '25000.00',
        taxes: '4750.00',
        payable,
      },
    },
  };
}

describe('API-DIAN F6 concurrency gates', () => {
  let app: NestFastifyApplication;
  let adminPool: Pool;
  let workerPool: Pool;
  const queuedOperationIds = new Set<string>();

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
    await app.listen(0, '127.0.0.1');

    adminPool = new Pool({
      connectionString: process.env.TEST_ADMIN_DATABASE_URL,
      max: 4,
    });
    workerPool = new Pool({
      connectionString: process.env.WORKER_DATABASE_URL,
      max: 16,
    });
  });

  function post(key: string, body: ReturnType<typeof commandFor>) {
    return request(app.getHttpServer())
      .post('/v1/fiscal-operations')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .set('Idempotency-Key', key)
      .send(body);
  }

  async function settlePosts(tests: Array<ReturnType<typeof post>>) {
    const settled = await Promise.allSettled(tests);
    const failures = settled.filter((result) => result.status === 'rejected');
    if (failures.length > 0) {
      throw new Error(`${failures.length} concurrent HTTP request(s) rejected`);
    }
    return settled.flatMap((result) =>
      result.status === 'fulfilled' ? [result.value] : [],
    );
  }

  it('collapses 32 simultaneous identical commands into one logical operation', async () => {
    const key = 'f6-concurrency-same-key';
    const body = commandFor('sale:concurrency:same-key');

    const responses = await settlePosts(
      Array.from({ length: SAME_KEY_PARALLELISM }, () => post(key, body)),
    );

    expect(responses.every((response) => response.status === 202)).toBe(true);

    const bodies = responses.map((response) => response.body as OperationBody);
    const operationIds = new Set(
      bodies.map((bodyItem) => bodyItem.operation_id),
    );
    expect(operationIds.size).toBe(1);
    expect(
      bodies.filter((bodyItem) => bodyItem.replayed === false),
    ).toHaveLength(1);
    expect(
      bodies.filter((bodyItem) => bodyItem.replayed === true),
    ).toHaveLength(SAME_KEY_PARALLELISM - 1);

    const operationId = bodies[0]?.operation_id;
    if (!operationId) throw new Error('concurrency operation id missing');
    queuedOperationIds.add(operationId);

    const operationCount = await adminPool.query<CountRow>(
      `SELECT count(*)::text AS count
       FROM app.fiscal_operations
       WHERE tenant_id = $1::uuid AND idempotency_key = $2`,
      [TENANT_A, key],
    );
    expect(operationCount.rows[0]?.count).toBe('1');

    const workCount = await adminPool.query<CountRow>(
      `SELECT count(*)::text AS count
       FROM app.work_items
       WHERE tenant_id = $1::uuid
         AND operation_id = $2::uuid
         AND kind = 'SUBMIT'`,
      [TENANT_A, operationId],
    );
    expect(workCount.rows[0]?.count).toBe('1');

    const auditCount = await adminPool.query<CountRow>(
      `SELECT count(*)::text AS count
       FROM app.audit_events
       WHERE tenant_id = $1::uuid
         AND entity_id = $2::uuid
         AND event_type = 'OPERATION_ACCEPTED'`,
      [TENANT_A, operationId],
    );
    expect(auditCount.rows[0]?.count).toBe('1');
  });

  it('allows exactly one semantic winner when different payloads race on one key', async () => {
    const key = 'f6-concurrency-conflict';
    const responses = await settlePosts([
      post(key, commandFor('sale:concurrency:conflict', '29750.00')),
      post(key, commandFor('sale:concurrency:conflict', '29751.00')),
    ]);
    const [left, right] = responses;
    if (!left || !right) throw new Error('semantic race responses missing');

    expect([left.status, right.status].sort((a, b) => a - b)).toEqual([
      202, 409,
    ]);

    const winner = left.status === 202 ? left : right;
    const winnerBody = winner.body as OperationBody;
    queuedOperationIds.add(winnerBody.operation_id);

    const operationCount = await adminPool.query<CountRow>(
      `SELECT count(*)::text AS count
       FROM app.fiscal_operations
       WHERE tenant_id = $1::uuid AND idempotency_key = $2`,
      [TENANT_A, key],
    );
    expect(operationCount.rows[0]?.count).toBe('1');

    const workCount = await adminPool.query<CountRow>(
      `SELECT count(*)::text AS count
       FROM app.work_items
       WHERE operation_id = $1::uuid AND kind = 'SUBMIT'`,
      [winnerBody.operation_id],
    );
    expect(workCount.rows[0]?.count).toBe('1');
  });

  it('persists 40 distinct simultaneous commands without loss or duplication', async () => {
    const responses = await settlePosts(
      Array.from({ length: DISTINCT_PARALLELISM }, (_, index) =>
        post(
          `f6-concurrency-distinct-${index}`,
          commandFor(`sale:concurrency:distinct:${index}`),
        ),
      ),
    );

    expect(responses.every((response) => response.status === 202)).toBe(true);

    const bodies = responses.map((response) => response.body as OperationBody);
    const operationIds = bodies.map((bodyItem) => bodyItem.operation_id);
    expect(new Set(operationIds).size).toBe(DISTINCT_PARALLELISM);
    operationIds.forEach((operationId) => queuedOperationIds.add(operationId));

    const operationCount = await adminPool.query<CountRow>(
      `SELECT count(*)::text AS count
       FROM app.fiscal_operations
       WHERE tenant_id = $1::uuid
         AND idempotency_key LIKE 'f6-concurrency-distinct-%'`,
      [TENANT_A],
    );
    expect(operationCount.rows[0]?.count).toBe(String(DISTINCT_PARALLELISM));

    const workCount = await adminPool.query<CountRow>(
      `SELECT count(*)::text AS count
       FROM app.work_items AS w
       JOIN app.fiscal_operations AS o
         ON o.tenant_id = w.tenant_id AND o.id = w.operation_id
       WHERE o.tenant_id = $1::uuid
         AND o.idempotency_key LIKE 'f6-concurrency-distinct-%'
         AND w.kind = 'SUBMIT'`,
      [TENANT_A],
    );
    expect(workCount.rows[0]?.count).toBe(String(DISTINCT_PARALLELISM));
  });

  it('claims every newly queued work item exactly once under parallel workers', async () => {
    const expectedOperationIds = new Set(queuedOperationIds);
    expect(expectedOperationIds.size).toBe(DISTINCT_PARALLELISM + 2);

    const claims = await Promise.all(
      Array.from({ length: expectedOperationIds.size }, async (_, index) => {
        const result = await workerPool.query<ClaimedRow>(
          'SELECT * FROM app.claim_work_item($1, $2)',
          [`concurrency-worker-${index}`, 60],
        );
        return result.rows[0] ?? null;
      }),
    );

    expect(claims.every((claim) => claim !== null)).toBe(true);
    const claimedRows = claims.filter(
      (claim): claim is ClaimedRow => claim !== null,
    );

    expect(new Set(claimedRows.map((claim) => claim.id)).size).toBe(
      expectedOperationIds.size,
    );
    expect(new Set(claimedRows.map((claim) => claim.operation_id))).toEqual(
      expectedOperationIds,
    );
    expect(claimedRows.every((claim) => claim.attempt_count === 1)).toBe(true);

    const extraClaim = await workerPool.query<ClaimedRow>(
      'SELECT * FROM app.claim_work_item($1, $2)',
      ['concurrency-worker-extra', 60],
    );
    expect(extraClaim.rows).toHaveLength(0);
  });

  afterAll(async () => {
    await workerPool.end();
    await adminPool.end();
    await app.close();
  });
});
