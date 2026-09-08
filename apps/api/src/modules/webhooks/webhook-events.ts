/**
 * Canonical webhook event catalog and envelope shape.
 *
 * Authority: docs/architecture/final/PROCESSING-QUEUES-WEBHOOKS.md.
 * V1 implements the document.* subset that the fiscal state machine can
 * actually emit today (`certificate.expiring` / `quota.threshold_reached`
 * have no producer yet and are intentionally out of scope until one exists).
 */

export const WEBHOOK_EVENT_TYPES = [
  'document.received',
  'document.accepted',
  'document.rejected',
  'document.unknown',
  'document.reconciled',
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];

export interface WebhookEnvelope {
  id: string;
  type: WebhookEventType;
  created_at: string;
  tenant_id: string;
  data: Record<string, unknown>;
}

/**
 * Retry schedule in seconds, indexed by 1-based attempt_count *after* the
 * attempt that just failed (i.e. schedule[attempt_count] is the delay before
 * the next attempt). Matches the canonical doc verbatim: "inmediato, 1m, 5m,
 * 30m, 2h, 8h, 24h; luego dead-letter". Index 0 is unused (attempt 1 is
 * always immediate, available_at = now() at creation time).
 */
export const WEBHOOK_RETRY_SCHEDULE_SECONDS = [
  0, 60, 300, 1800, 7200, 28800, 86400,
];

/** Total attempts allowed before a delivery is marked DEAD (dead-letter). */
export const WEBHOOK_MAX_ATTEMPTS = WEBHOOK_RETRY_SCHEDULE_SECONDS.length;

export function nextRetryDelaySeconds(attemptCount: number): number | null {
  if (attemptCount >= WEBHOOK_MAX_ATTEMPTS) return null;
  return (
    WEBHOOK_RETRY_SCHEDULE_SECONDS[attemptCount] ??
    WEBHOOK_RETRY_SCHEDULE_SECONDS.at(-1)!
  );
}
