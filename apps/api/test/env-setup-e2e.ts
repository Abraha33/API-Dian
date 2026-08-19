process.env.NODE_ENV ??= 'test';
process.env.PORT ??= '3000';
process.env.DATABASE_URL ??= 'postgresql://ci_api:ci_api@localhost:5432/ci';
process.env.DATABASE_POOL_MAX ??= '3';
process.env.AUTH_PEPPER ??= 'f6-test-pepper-0123456789abcdef-32bytes';
