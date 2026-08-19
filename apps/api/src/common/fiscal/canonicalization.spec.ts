import {
  canonicalizeFiscalCommand,
  normalizeDecimalString,
} from './canonicalization';

const baseCommand = {
  schema_version: '1.0',
  document_kind: 'FEV',
  client_reference: 'sale:1',
  occurred_at: '2026-08-18T22:30:10-05:00',
  currency: 'COP',
  document: {
    totals: {
      payable: '29750.00',
      taxes: '4750.00',
      net: '25000.00',
      discounts: '0.00',
    },
    lines: [
      {
        line_no: 1,
        quantity: '2.0',
        unit_price: '12500.00',
        description: 'Cafe\u0301',
      },
    ],
  },
  trace_metadata: { request_source: 'terminal-a' },
};

describe('fiscal command canonicalization', () => {
  it('normalizes equivalent decimal strings', () => {
    expect(normalizeDecimalString('12500.00')).toBe('12500');
    expect(normalizeDecimalString('12500.0')).toBe('12500');
    expect(normalizeDecimalString('-0.00')).toBe('0');
  });

  it('ignores non-semantic representation differences', () => {
    const left = canonicalizeFiscalCommand(baseCommand);
    const right = canonicalizeFiscalCommand({
      ...baseCommand,
      trace_metadata: { request_source: 'terminal-b' },
      document: {
        lines: [
          {
            description: 'Café',
            unit_price: '12500.0',
            quantity: '2.00',
            line_no: 1,
          },
        ],
        totals: {
          discounts: '0',
          net: '25000.0',
          taxes: '4750',
          payable: '29750',
        },
      },
    });

    expect(right.hashHex).toBe(left.hashHex);
    expect(right.canonicalJson).toBe(left.canonicalJson);
  });

  it('changes the hash when fiscal semantics change', () => {
    const left = canonicalizeFiscalCommand(baseCommand);
    const right = canonicalizeFiscalCommand({
      ...baseCommand,
      document: {
        ...baseCommand.document,
        totals: {
          ...baseCommand.document.totals,
          payable: '29751.00',
        },
      },
    });

    expect(right.hashHex).not.toBe(left.hashHex);
  });

  it('rejects non-integer JSON numbers in semantic projection', () => {
    expect(() =>
      canonicalizeFiscalCommand({
        ...baseCommand,
        document: { amount_as_number: 10.5 },
      }),
    ).toThrow('Non-integer JSON numbers');
  });
});
