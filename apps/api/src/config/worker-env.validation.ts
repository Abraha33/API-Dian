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

const FAKE_SCENARIOS = [
  'ACCEPT',
  'REJECT',
  'PROVEN_NOT_SENT',
  'AMBIGUOUS_TIMEOUT',
  'DELAYED_VISIBILITY',
  'MALFORMED_RESPONSE',
  'RATE_LIMIT',
  'UNAVAILABLE',
  'ARTIFACT_FAILURE',
] as const;

function integerTransform(defaultValue: number) {
  return Transform(({ value }) => {
    if (value === undefined || value === '') return defaultValue;
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  });
}

export class WorkerEnvironmentVariables {
  @IsIn(['development', 'staging', 'production', 'test'])
  NODE_ENV!: string;

  @IsString()
  @MinLength(1)
  DATABASE_URL!: string;

  @IsString()
  @MinLength(1)
  WORKER_ID!: string;

  @IsOptional()
  @integerTransform(30)
  @IsNumber()
  @Min(1)
  WORKER_LEASE_SECONDS?: number;

  @IsOptional()
  @integerTransform(5)
  @IsNumber()
  @Min(0)
  WORKER_MUTATION_PAUSE_SECONDS?: number;

  @IsOptional()
  @integerTransform(5)
  @IsNumber()
  @Min(0)
  WORKER_RECONCILE_RETRY_SECONDS?: number;

  @IsOptional()
  @integerTransform(5)
  @IsNumber()
  @Min(1)
  WORKER_RECONCILE_MAX_ATTEMPTS?: number;

  @IsOptional()
  @integerTransform(250)
  @IsNumber()
  @Min(10)
  WORKER_IDLE_MS?: number;

  @IsIn(FAKE_SCENARIOS)
  FAKE_PROVIDER_SCENARIO!: (typeof FAKE_SCENARIOS)[number];
}

export function validateWorkerEnv(
  config: Record<string, unknown>,
): WorkerEnvironmentVariables {
  const validated = plainToInstance(WorkerEnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validated, {
    skipMissingProperties: false,
    forbidUnknownValues: false,
  });

  if (errors.length > 0) {
    const messages = errors.flatMap((error) =>
      error.constraints ? Object.values(error.constraints) : [],
    );
    throw new Error(`Worker config validation error: ${messages.join('; ')}`);
  }

  return validated;
}
