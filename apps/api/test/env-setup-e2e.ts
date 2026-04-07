/**
 * Variables mínimas para que `ConfigModule` valide al cargar `AppModule` en e2e.
 * Debe cargarse antes de importar `./app.module`.
 */
process.env.NODE_ENV = 'development';
process.env.PORT = '3000';
process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5432/api_dian_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key';
process.env.JWT_SECRET = 'test-jwt-secret-min-16-chars';
process.env.STORAGE_ENDPOINT = 'http://localhost:9000';
process.env.STORAGE_ACCESS_KEY = 'minio';
process.env.STORAGE_SECRET_KEY = 'minio12345';
process.env.STORAGE_BUCKET = 'api-dian-docs';
