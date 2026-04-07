import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { PinoLoggerService } from '../logger/pino-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<FastifyRequest>();
    const res = http.getResponse<FastifyReply>();
    const started = Date.now();
    const headerValue = req.headers['x-correlation-id'];
    const correlationId =
      typeof headerValue === 'string' && headerValue.length > 0
        ? headerValue
        : randomUUID();

    return next.handle().pipe(
      finalize(() => {
        const elapsed_ms = Date.now() - started;
        const statusCode =
          typeof res.statusCode === 'number' && res.statusCode > 0
            ? res.statusCode
            : 200;
        this.logger.logHttp({
          method: req.method,
          url: req.url,
          statusCode,
          elapsed_ms,
          correlation_id: correlationId,
        });
      }),
    );
  }
}
