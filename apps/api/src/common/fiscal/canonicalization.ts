import { createHash } from 'node:crypto';

export const CONTRACT_VERSION = '1.0' as const;
export const CANONICALIZATION_VERSION = '1' as const;
export const HASH_VERSION =
  `sha256:fiscal-command-c14n/${CANONICALIZATION_VERSION}` as const;

const DECIMAL_FIELD_NAMES = new Set([
  'quantity',
  'unit_price',
  'rate',
  'base',
  'amount',
  'net_amount',
  'net',
  'discounts',
  'taxes',
  'payable',
]);

const DECIMAL_PATTERN = /^-?(0|[1-9][0-9]*)(\.[0-9]+)?$/;

type CanonicalPrimitive = string | number | boolean | null;
type CanonicalValue =
  | CanonicalPrimitive
  | CanonicalValue[]
  | { [key: string]: CanonicalValue };

export interface FiscalCommandEnvelope {
  schema_version: string;
  document_kind: string;
  client_reference: string;
  occurred_at: string;
  currency: string;
  document: Record<string, unknown>;
  trace_metadata?: Record<string, unknown>;
}

export interface CanonicalizedCommand {
  projection: CanonicalValue;
  canonicalJson: string;
  hashHex: string;
  hashVersion: typeof HASH_VERSION;
}

export function normalizeDecimalString(value: string): string {
  if (!DECIMAL_PATTERN.test(value)) {
    throw new Error(`Invalid decimal string: ${value}`);
  }

  const negative = value.startsWith('-');
  const unsigned = negative ? value.slice(1) : value;
  const [integerPart, fractionalPart = ''] = unsigned.split('.');
  const trimmedFraction = fractionalPart.replace(/0+$/, '');
  const normalizedUnsigned =
    trimmedFraction.length > 0
      ? `${integerPart}.${trimmedFraction}`
      : integerPart;
  const isZero = normalizedUnsigned === '0';

  return negative && !isZero ? `-${normalizedUnsigned}` : normalizedUnsigned;
}

function normalizeValue(value: unknown, fieldName?: string): CanonicalValue {
  if (value === null) return null;

  if (typeof value === 'string') {
    const normalized = value.normalize('NFC');
    if (fieldName && DECIMAL_FIELD_NAMES.has(fieldName)) {
      return normalizeDecimalString(normalized);
    }
    return normalized;
  }

  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) {
      throw new Error(
        'Non-integer JSON numbers are not allowed in canonical fiscal commands',
      );
    }
    return value;
  }

  if (typeof value === 'boolean') return value;

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value) as object | null;
    if (prototype !== Object.prototype && prototype !== null) {
      throw new Error(
        'Only plain JSON objects are allowed in canonical fiscal commands',
      );
    }

    const source = value as Record<string, unknown>;
    const result: Record<string, CanonicalValue> = {};
    const entries = Object.entries(source)
      .filter(([, child]) => child !== undefined)
      .map(([key, child]) => [key.normalize('NFC'), child] as const)
      .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));

    for (const [key, child] of entries) {
      if (Object.prototype.hasOwnProperty.call(result, key)) {
        throw new Error(
          `Duplicate object key after Unicode normalization: ${key}`,
        );
      }
      result[key] = normalizeValue(child, key);
    }

    return result;
  }

  throw new Error(
    `Unsupported value in canonical fiscal command: ${typeof value}`,
  );
}

export function buildSemanticProjection(
  command: FiscalCommandEnvelope,
): CanonicalValue {
  if (command.schema_version !== CONTRACT_VERSION) {
    throw new Error(`Unsupported schema_version: ${command.schema_version}`);
  }

  return normalizeValue({
    schema_version: command.schema_version,
    document_kind: command.document_kind,
    client_reference: command.client_reference,
    occurred_at: command.occurred_at,
    currency: command.currency,
    document: command.document,
  });
}

export function stableStringify(value: CanonicalValue): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }

  const entries = Object.entries(value);
  return `{${entries
    .map(([key, child]) => `${JSON.stringify(key)}:${stableStringify(child)}`)
    .join(',')}}`;
}

export function canonicalizeFiscalCommand(
  command: FiscalCommandEnvelope,
): CanonicalizedCommand {
  const projection = buildSemanticProjection(command);
  const canonicalJson = stableStringify(projection);
  const preimage =
    `API-DIAN|contract=${CONTRACT_VERSION}|` +
    `c14n=${CANONICALIZATION_VERSION}|${canonicalJson}`;
  const hashHex = createHash('sha256').update(preimage, 'utf8').digest('hex');

  return { projection, canonicalJson, hashHex, hashVersion: HASH_VERSION };
}
