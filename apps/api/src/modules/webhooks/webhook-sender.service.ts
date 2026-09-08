import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { WebhookEnvelope } from './webhook-events';
import { signWebhookPayload } from './webhook-signature';
import type { AttemptOutcome } from './webhook-delivery.repository';

export interface WebhookSendResult {
  outcome: AttemptOutcome;
  httpStatus?: number;
  errorCode?: string;
  durationMs: number;
}

/**
 * Node's undici `fetch` does not consistently throw a bare `AbortError` for
 * a timed-out request across versions: it may surface as a `DOMException`
 * named 'AbortError', or as a `TypeError: fetch failed` whose `.cause` is
 * that DOMException. Check both shapes rather than only `error.name`.
 */
function isAbortError(error: unknown): boolean {
  if (error instanceof Error && error.name === 'AbortError') return true;
  if (
    error &&
    typeof error === 'object' &&
    'cause' in error &&
    error.cause instanceof Error &&
    error.cause.name === 'AbortError'
  ) {
    return true;
  }
  return false;
}

/**
 * Performs the actual outbound HTTP call for one webhook delivery attempt.
 * Isolated from WebhookWorkerService so fault-injection tests can point it
 * at a local http server standing in for "the tenant's endpoint" without
 * touching any real network.
 */
@Injectable()
export class WebhookSenderService {
  private readonly timeoutMs: number;

  constructor(config: ConfigService) {
    this.timeoutMs = config.get<number>('WEBHOOK_SEND_TIMEOUT_MS', 5000);
  }

  async send(
    endpoint: { url: string; secret: string },
    envelope: WebhookEnvelope,
    attemptNo: number,
  ): Promise<WebhookSendResult> {
    const rawBody = JSON.stringify(envelope);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = signWebhookPayload(endpoint.secret, timestamp, rawBody);
    const started = Date.now();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Webhook-Id': envelope.id,
          'Webhook-Timestamp': timestamp,
          'Webhook-Signature': signature,
          'Webhook-Attempt': String(attemptNo),
        },
        body: rawBody,
        signal: controller.signal,
      });

      const durationMs = Date.now() - started;
      if (response.status >= 200 && response.status < 300) {
        return { outcome: 'SUCCESS', httpStatus: response.status, durationMs };
      }
      if (
        response.status >= 400 &&
        response.status < 500 &&
        response.status !== 429
      ) {
        // Permanent-ish client error (per architecture doc: "3xx/4xx no
        // permanentes según política" — but without a documented allowlist
        // of retryable 4xx beyond 429, we treat other 4xx as retryable too,
        // capped by the same bounded schedule as everything else, since a
        // misconfigured tenant endpoint recovering later is a real case we
        // must not foreclose. 429 always retries.).
        return {
          outcome: 'HTTP_4XX',
          httpStatus: response.status,
          errorCode: `HTTP_${response.status}`,
          durationMs,
        };
      }
      return {
        outcome: 'HTTP_5XX',
        httpStatus: response.status,
        errorCode: `HTTP_${response.status}`,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - started;
      if (isAbortError(error) || controller.signal.aborted) {
        return { outcome: 'TIMEOUT', errorCode: 'TIMEOUT', durationMs };
      }
      const code =
        error && typeof error === 'object' && 'cause' in error
          ? String(
              (error as { cause?: { code?: string } }).cause?.code ??
                'CONNECTION_ERROR',
            )
          : 'CONNECTION_ERROR';
      return { outcome: 'CONNECTION_ERROR', errorCode: code, durationMs };
    } finally {
      clearTimeout(timeout);
    }
  }
}
