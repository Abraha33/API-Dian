import { validateWorkerEnv } from './worker-env.validation';

const baseConfig = {
  NODE_ENV: 'development',
  DATABASE_URL: 'postgresql://api-role@localhost/api_dian',
  WORKER_ID: 'worker-test',
  FAKE_PROVIDER_SCENARIO: 'ACCEPT',
};

describe('validateWorkerEnv', () => {
  it('prefers WORKER_DATABASE_URL when both runtime URLs are present', () => {
    const validated = validateWorkerEnv({
      ...baseConfig,
      WORKER_DATABASE_URL: 'postgresql://worker-role@localhost/api_dian',
    });

    expect(validated.DATABASE_URL).toBe(
      'postgresql://worker-role@localhost/api_dian',
    );
  });

  it('keeps DATABASE_URL as deployment fallback', () => {
    const validated = validateWorkerEnv(baseConfig);

    expect(validated.DATABASE_URL).toBe(
      'postgresql://api-role@localhost/api_dian',
    );
  });
});
