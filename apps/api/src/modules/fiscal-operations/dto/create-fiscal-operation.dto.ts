import {
  IsISO8601,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export const DOCUMENT_KINDS = [
  'FEV',
  'CREDIT_NOTE',
  'DEBIT_NOTE',
  'ELECTRONIC_POS',
  'POS_ADJUSTMENT',
] as const;

export class CreateFiscalOperationDto {
  @IsIn(['1.0'])
  schema_version!: string;

  @IsIn(DOCUMENT_KINDS)
  document_kind!: (typeof DOCUMENT_KINDS)[number];

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  client_reference!: string;

  @IsISO8601({ strict: true })
  occurred_at!: string;

  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency!: string;

  @IsObject()
  document!: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  trace_metadata?: Record<string, unknown>;
}
