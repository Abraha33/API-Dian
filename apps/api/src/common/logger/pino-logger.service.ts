import { Injectable, LoggerService } from '@nestjs/common';
import pino, { Logger } from 'pino';

export type HttpRequestLog = {
  method: string;
  url: string;
  statusCode: number;
  elapsed_ms: number;
  correlation_id: string;
};

export type FiscalEventLog = {
  tenant_id: string;
  document_id: string;
  correlation_id: string;
  status: string;
  elapsed_ms: number;
  level: string;
};

export type WorkerEventLog = {
  event:
    | 'worker_job_completed'
    | 'provider_submit_result'
    | 'provider_reconcile_result';
  worker_id: string;
  work_id: string;
  operation_id: string;
  tenant_id: string;
  work_kind: string;
  attempt_count: number;
  elapsed_ms: number;
  outcome: string;
  attempt_id?: string;
  normalized_code?: string;
};

@Injectable()
export class PinoLoggerService implements LoggerService {
  private readonly root: Logger;

  constructor() {
    const isProd = process.env.NODE_ENV === 'production';
    this.root = pino({
      level: isProd ? 'info' : 'debug',
      redact: {
        paths: [
          'authorization',
          'headers.authorization',
          'token',
          'secret',
          'pepper',
          'password',
          'credential',
          'DATABASE_URL',
        ],
        censor: '[REDACTED]',
      },
      ...(!isProd && {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, singleLine: true },
        },
      }),
    });
  }

  log(message: string, context?: string): void {
    this.root.info({ context }, message);
  }

  error(message: string, trace?: string, context?: string): void {
    this.root.error({ context, trace }, message);
  }

  warn(message: string, context?: string): void {
    this.root.warn({ context }, message);
  }

  debug(message: string, context?: string): void {
    this.root.debug({ context }, message);
  }

  verbose(message: string, context?: string): void {
    this.root.trace({ context }, message);
  }

  /**
   * Logger hijo con contexto de request (tenant/correlación cuando existan).
   */
  child(bindings: Record<string, string>): Logger {
    return this.root.child(bindings);
  }

  logHttp(meta: HttpRequestLog): void {
    this.root.info(meta, 'http_request');
  }

  logFiscalEvent(meta: FiscalEventLog): void {
    this.root.info(meta, 'fiscal_event');
  }

  logWorkerEvent(meta: WorkerEventLog): void {
    const warnOutcomes = new Set([
      'TRANSPORT_AMBIGUOUS',
      'INDETERMINATE',
      'RECOVERED_UNKNOWN',
      'RETRY_SCHEDULED',
      'DEAD_LETTERED',
      'MUTATIONS_PAUSED',
    ]);

    if (warnOutcomes.has(meta.outcome)) {
      this.root.warn(meta, meta.event);
      return;
    }

    this.root.info(meta, meta.event);
  }
}
