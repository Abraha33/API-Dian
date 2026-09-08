import { plainToInstance, Transform } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

function integerTransform(defaultValue: number) {
  return Transform(({ value }) => {
    if (value === undefined || value === '') return defaultValue;
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  });
}

export class WebhookWorkerEnvironmentVariables {
  @IsIn(['development', 'staging', 'production', 'test'])
  NODE_ENV!: string;

  @IsString()
  @MinLength(1)
  DATABASE_URL!: string;

  @IsString()
  @MinLength(1)
  WEBHOOK_WORKER_ID!: string;

  @IsOptional()
  @integerTransform(30)
  @IsNumber()
  @Min(1)
  WEBHOOK_WORKER_LEASE_SECONDS?: number;

  @IsOptional()
  @integerTransform(5000)
  @IsNumber()
  @Min(100)
  WEBHOOK_SEND_TIMEOUT_MS?: number;

  @IsOptional()
  @integerTransform(250)
  @IsNumber()
  @Min(10)
  WEBHOOK_WORKER_IDLE_MS?: number;
}

export function validateWebhookWorkerEnv(
  config: Record<string, unknown>,
): WebhookWorkerEnvironmentVariables {
  const normalized = {
    ...config,
    DATABASE_URL: config.WORKER_DATABASE_URL ?? config.DATABASE_URL,
  };
  const validated = plainToInstance(
    WebhookWorkerEnvironmentVariables,
    normalized,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validated, {
    skipMissingProperties: false,
    forbidUnknownValues: false,
  });

  if (errors.length > 0) {
    const messages = errors.flatMap((error) =>
      error.constraints ? Object.values(error.constraints) : [],
    );
    throw new Error(
      `Webhook worker config validation error: ${messages.join('; ')}`,
    );
  }

  return validated;
}
