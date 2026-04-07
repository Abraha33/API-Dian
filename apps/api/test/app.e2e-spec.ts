import './env-setup-e2e';

import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Health (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/health (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    const body = res.body as {
      status: string;
      timestamp: string;
      version: string;
    };
    expect(body.status).toBe('ok');
    expect(body.timestamp).toBeDefined();
    expect(body.version).toBeDefined();
  });

  it('/ready (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/ready').expect(200);
    const body = res.body as {
      status: string;
      checks: { db: string; redis: string };
    };
    expect(body.status).toBe('ok');
    expect(body.checks.db).toBe('ok');
    expect(body.checks.redis).toBe('ok');
  });

  afterEach(async () => {
    await app.close();
  });
});
