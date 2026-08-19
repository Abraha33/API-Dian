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

export class EnvironmentVariables {
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return 3000;
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? 3000 : parsed;
  })
  @IsNumber()
  @Min(1)
  PORT?: number;

  @IsIn(['development', 'staging', 'production', 'test'])
  NODE_ENV!: string;

  @IsString()
  @MinLength(1)
  DATABASE_URL!: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return 5;
    const parsed = Number.parseInt(String(value), 10);
    return Number.isNaN(parsed) ? 5 : parsed;
  })
  @IsNumber()
  @Min(1)
  DATABASE_POOL_MAX?: number;

  @IsString()
  @MinLength(32)
  AUTH_PEPPER!: string;
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
    const messages = errors.flatMap((error) =>
      error.constraints ? Object.values(error.constraints) : [],
    );
    throw new Error(`Config validation error: ${messages.join('; ')}`);
  }

  return validated;
}
