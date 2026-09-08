import { Writable } from 'node:stream';
import { PinoLoggerService } from './pino-logger.service';

/**
 * Phase 6 "secrets-in-logs" evidence: proves, with a real pino instance (not
 * a mock), that fields shaped like credentials/secrets/tokens never reach
 * the log sink in the clear — this is what stands behind the webhook module
 * never logging `webhook_endpoints.secret`, the `Authorization` header, or
 * AUTH_PEPPER anywhere (grep of apps/api/src confirms no log call ever
 * interpolates those values directly; this spec proves the safety net
 * behind that discipline actually redacts if it ever happened).
 */
describe('PinoLoggerService secret redaction', () => {
  it('redacts secret/token/credential-shaped fields from real log output', () => {
    const chunks: string[] = [];
    const sink = new Writable({
      write(chunk: Buffer, _enc, callback) {
        chunks.push(chunk.toString('utf8'));
        callback();
      },
    });

    // Pass a real in-memory destination stream — see the constructor doc
    // for why this is the only way to assert on pino's actual output
    // synchronously in a test.
    const logger = new PinoLoggerService(sink);
    const raw = logger.child({});

    raw.info(
      {
        secret: 'webhook-signing-secret-should-not-leak',
        authorization: 'Bearer adn_v1.super-secret-token',
        token: 'raw-token-value',
        pepper: 'auth-pepper-value',
        password: 'super-secret-password',
        headers: { authorization: 'Bearer nested-secret-token' },
        DATABASE_URL: 'postgresql://user:password@host/db',
        safe_field: 'this-is-fine-to-log',
      },
      'test_event_with_secrets',
    );

    const output = chunks.join('');
    expect(output).toContain('test_event_with_secrets');
    expect(output).toContain('this-is-fine-to-log');

    // None of the sensitive raw values may appear anywhere in the output.
    expect(output).not.toContain('webhook-signing-secret-should-not-leak');
    expect(output).not.toContain('adn_v1.super-secret-token');
    expect(output).not.toContain('raw-token-value');
    expect(output).not.toContain('auth-pepper-value');
    expect(output).not.toContain('super-secret-password');
    expect(output).not.toContain('nested-secret-token');
    expect(output).not.toContain('user:password@host');

    // And the redact marker must actually be present (proves the fields
    // were matched and censored, not silently dropped or never logged).
    expect(output).toContain('[REDACTED]');
  });
});
