import { plainToInstance, Transform } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

/**
 * Variables de entorno obligatorias tras `validate`.
 * `PORT` es opcional y por defecto 3000.
 */
export class EnvironmentVariables {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return 3000;
    const n = parseInt(String(value), 10);
    return Number.isNaN(n) ? 3000 : n;
  })
  @IsNumber()
  PORT?: number;

  @IsIn(['development', 'staging', 'production'])
  NODE_ENV!: string;

  @IsString()
  @MinLength(1)
  DATABASE_URL!: string;

  @IsString()
  @MinLength(1)
  REDIS_URL!: string;

  @IsString()
  @MinLength(1)
  SUPABASE_URL!: string;

  @IsString()
  @MinLength(1)
  SUPABASE_ANON_KEY!: string;

  @IsString()
  @MinLength(1)
  SUPABASE_SERVICE_KEY!: string;

  @IsString()
  @MinLength(1)
  JWT_SECRET!: string;

  @IsString()
  @MinLength(1)
  STORAGE_ENDPOINT!: string;

  @IsString()
  @MinLength(1)
  STORAGE_ACCESS_KEY!: string;

  @IsString()
  @MinLength(1)
  STORAGE_SECRET_KEY!: string;

  @IsString()
  @MinLength(1)
  STORAGE_BUCKET!: string;
}

export function validateEnv(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, {
    skipMissingProperties: false,
    forbidUnknownValues: false,
  });

  if (errors.length > 0) {
    const messages = errors.flatMap((e) =>
      e.constraints ? Object.values(e.constraints) : [],
    );
    throw new Error(`Config validation error: ${messages.join('; ')}`);
  }

  return validated;
}
