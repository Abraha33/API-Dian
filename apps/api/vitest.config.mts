import { defineConfig } from 'vitest/config';

process.env.NODE_ENV ??= 'test';

export default defineConfig({
  envDir: './test',
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*-spec.ts', 'test/**/*.spec.ts'],
    fileParallelism: false,
    pool: 'forks',
    testTimeout: 30_000,
    hookTimeout: 30_000,
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
    },
  },
});
