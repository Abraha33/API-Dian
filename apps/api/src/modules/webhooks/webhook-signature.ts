import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * HMAC-SHA256 signing over `${timestamp}.${body}`, per
 * docs/architecture/final/PROCESSING-QUEUES-WEBHOOKS.md ("Firma HMAC
 * SHA-256 sobre timestamp.body; headers Webhook-Id, Webhook-Timestamp,
 * Webhook-Signature"). Nothing more specific than "HMAC SHA-256" was
 * mandated for the exact header/encoding scheme, so this follows the
 * Svix/Stripe-style convention referenced by that doc's header names.
 */
export function signWebhookPayload(
  secret: string,
  timestamp: string,
  rawBody: string,
): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(`${timestamp}.${rawBody}`);
  return `v1,${hmac.digest('base64')}`;
}

export function verifyWebhookSignature(
  secret: string,
  timestamp: string,
  rawBody: string,
  signatureHeader: string,
): boolean {
  const expected = signWebhookPayload(secret, timestamp, rawBody);
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signatureHeader);
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
