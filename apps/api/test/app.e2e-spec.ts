import './env-setup-e2e';

import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Pool } from 'pg';
import request from 'supertest';
import { AppModule } from './../src/app.module';

const AUTH_TOKEN =
  'adn_v1.aaaaaaaa-0000-4000-8000-000000000001.BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwc';
const TENANT_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const TENANT_B_OPERATION = 'bbbbbbbb-0000-4000-8000-000000000099';

const command = {
  schema_version: '1.0',
  document_kind: 'FEV',
  client_reference: 'sale:f6b:1',
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

describe('API-DIAN F6B (e2e)', () => {
  let app: NestFastifyApplication;
  let pool: Pool;

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

    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  });

  it('/health and /ready expose real DB readiness', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
    const ready = await request(app.getHttpServer()).get('/ready').expect(200);
    expect(ready.body).toEqual({ status: 'ok', checks: { db: 'ok' } });
  });

  it('rejects missing credential', async () => {
    await request(app.getHttpServer())
      .post('/v1/fiscal-operations')
      .set('Idempotency-Key', 'f6b-no-auth')
      .send(command)
      .expect(401);
  });

  it('persists one logical operation and one work item, then replays it', async () => {
    const first = await request(app.getHttpServer())
      .post('/v1/fiscal-operations')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .set('Idempotency-Key', 'f6b-idempotency-1')
      .send(command)
      .expect(202);

    expect(first.body.status).toBe('READY');
    expect(first.body.replayed).toBe(false);
    const operationId = first.body.operation_id as string;

    const replay = await request(app.getHttpServer())
      .post('/v1/fiscal-operations')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .set('Idempotency-Key', 'f6b-idempotency-1')
      .send(command)
      .expect(202);

    expect(replay.body.operation_id).toBe(operationId);
    expect(replay.body.replayed).toBe(true);

    const client = await pool.connect();
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
    await request(app.getHttpServer())
      .post('/v1/fiscal-operations')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .set('Idempotency-Key', 'f6b-idempotency-conflict')
      .send(command)
      .expect(202);

    const changed = {
      ...command,
      document: {
        ...command.document,
        totals: { ...command.document.totals, payable: '29751.00' },
      },
    };

    const response = await request(app.getHttpServer())
      .post('/v1/fiscal-operations')
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .set('Idempotency-Key', 'f6b-idempotency-conflict')
      .send(changed)
      .expect(409);

    expect(response.body.error).toBe('IDEMPOTENCY_CONFLICT');
  });

  it('does not reveal an operation from another tenant', async () => {
    await request(app.getHttpServer())
      .get(`/v1/fiscal-operations/${TENANT_B_OPERATION}`)
      .set('Authorization', `Bearer ${AUTH_TOKEN}`)
      .expect(404);
  });

  afterAll(async () => {
    await pool.end();
    await app.close();
  });
});
