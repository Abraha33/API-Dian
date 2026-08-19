import { createHash } from 'node:crypto';
import type {
  FiscalProvider,
  ProviderArtifact,
  ProviderDocumentQuery,
  ProviderDocumentStatus,
  ProviderReconciliationQuery,
  ProviderReconciliationResult,
  ProviderSubmissionResult,
} from '../../src/modules/provider/fiscal-provider';
import {
  executeProviderContractFixture,
  type ProviderContractFixture,
  type ProviderContractTestDriver,
} from './provider-contract-harness';

class StubProvider implements FiscalProvider {
  submission: ProviderSubmissionResult = { outcome: 'CONCLUSIVE_ACCEPTED' };
  reconciliation: ProviderReconciliationResult = { outcome: 'FOUND_ACCEPTED' };
  status: ProviderDocumentStatus = { status: 'ACCEPTED' };
  artifact: ProviderArtifact = {
    bytes: new TextEncoder().encode('sanitized-artifact'),
    contentType: 'application/octet-stream',
  };

  async submit(): Promise<ProviderSubmissionResult> {
    return this.submission;
  }

  async reconcile(
    _query: ProviderReconciliationQuery,
  ): Promise<ProviderReconciliationResult> {
    return this.reconciliation;
  }

  async getStatus(
    _query: ProviderDocumentQuery,
  ): Promise<ProviderDocumentStatus> {
    return this.status;
  }

  async fetchXml(_query: ProviderDocumentQuery): Promise<ProviderArtifact> {
    return this.artifact;
  }

  async fetchPdf(_query: ProviderDocumentQuery): Promise<ProviderArtifact> {
    return this.artifact;
  }
}

const evidence = [
  {
    id: 'sandbox-capture-1',
    kind: 'SANDBOX_CAPTURE' as const,
    locator: 'sanitized://evidence/case-1',
    observed_at: '2026-08-19T17:00:00Z',
    sanitized: true as const,
  },
];

const command = {
  documentKind: 'FEV',
  payload: { fixture: true },
};

const context = {
  operationId: '11111111-1111-4111-8111-111111111111',
  attemptId: '22222222-2222-4222-8222-222222222222',
  tenantId: '33333333-3333-4333-8333-333333333333',
  providerBindingRef: 'future-adapter',
  clientCorrelationRef: 'fixture-correlation',
  mappingVersion: 'fixture/1',
};

const query = {
  tenantId: context.tenantId,
  operationId: context.operationId,
  clientCorrelationRef: context.clientCorrelationRef,
};

function driver(provider = new StubProvider()) {
  const arrange = jest.fn(async (_fixture: ProviderContractFixture) => undefined);
  const cleanup = jest.fn(async (_fixture: ProviderContractFixture) => undefined);
  const value: ProviderContractTestDriver = { provider, arrange, cleanup };
  return { value, provider, arrange, cleanup };
}

describe('provider contract evidence harness', () => {
  it('executes an evidence-backed conclusive submit case', async () => {
    const testDriver = driver();
    const fixture: ProviderContractFixture = {
      fixture_version: '1',
      case_id: 'submit-accepted',
      document_kind: 'FEV',
      gate_conclusion: 'PASS',
      evidence,
      method: 'submit',
      command,
      context,
      expected: { outcome: 'CONCLUSIVE_ACCEPTED' },
    };

    await executeProviderContractFixture(testDriver.value, fixture);

    expect(testDriver.arrange).toHaveBeenCalledTimes(1);
    expect(testDriver.cleanup).toHaveBeenCalledTimes(1);
  });

  it('rejects PROVEN_NOT_SENT without explicit evidence-backed proof', async () => {
    const testDriver = driver();
    testDriver.provider.submission = { outcome: 'TRANSPORT_PROVEN_NOT_SENT' };
    const fixture: ProviderContractFixture = {
      fixture_version: '1',
      case_id: 'submit-not-sent-no-proof',
      document_kind: 'FEV',
      gate_conclusion: 'PASS',
      evidence,
      method: 'submit',
      command,
      context,
      expected: { outcome: 'TRANSPORT_PROVEN_NOT_SENT' },
    };

    await expect(
      executeProviderContractFixture(testDriver.value, fixture),
    ).rejects.toThrow('proof_of_no_remote_side_effect is required');
    expect(testDriver.arrange).not.toHaveBeenCalled();
  });

  it('allows PROVEN_NOT_SENT only when its proof references known evidence', async () => {
    const testDriver = driver();
    testDriver.provider.submission = { outcome: 'TRANSPORT_PROVEN_NOT_SENT' };
    const fixture: ProviderContractFixture = {
      fixture_version: '1',
      case_id: 'submit-not-sent-proven',
      document_kind: 'FEV',
      gate_conclusion: 'PASS',
      evidence,
      proof_of_no_remote_side_effect: {
        basis: 'Sandbox capture proves request never crossed the mutation boundary.',
        evidence_ref_ids: ['sandbox-capture-1'],
      },
      method: 'submit',
      command,
      context,
      expected: { outcome: 'TRANSPORT_PROVEN_NOT_SENT' },
    };

    await executeProviderContractFixture(testDriver.value, fixture);
  });

  it('rejects NOT_FOUND_CONCLUSIVE without explicit conclusive-not-found proof', async () => {
    const testDriver = driver();
    testDriver.provider.reconciliation = { outcome: 'NOT_FOUND_CONCLUSIVE' };
    const fixture: ProviderContractFixture = {
      fixture_version: '1',
      case_id: 'reconcile-not-found-no-proof',
      document_kind: 'FEV',
      gate_conclusion: 'PASS',
      evidence,
      method: 'reconcile',
      query,
      expected: { outcome: 'NOT_FOUND_CONCLUSIVE' },
    };

    await expect(
      executeProviderContractFixture(testDriver.value, fixture),
    ).rejects.toThrow('proof_not_found_is_conclusive is required');
  });

  it('verifies sanitized artifact integrity by content type, size and SHA-256', async () => {
    const testDriver = driver();
    const bytes = testDriver.provider.artifact.bytes;
    const fixture: ProviderContractFixture = {
      fixture_version: '1',
      case_id: 'artifact-xml',
      document_kind: 'FEV',
      gate_conclusion: 'PASS',
      evidence,
      method: 'fetchXml',
      query,
      expected: {
        content_type: 'application/octet-stream',
        min_bytes: 1,
        sha256: createHash('sha256').update(bytes).digest('hex'),
      },
    };

    await executeProviderContractFixture(testDriver.value, fixture);
  });

  it('rejects fixtures with no evidence before arranging transport', async () => {
    const testDriver = driver();
    const fixture: ProviderContractFixture = {
      fixture_version: '1',
      case_id: 'missing-evidence',
      document_kind: 'FEV',
      gate_conclusion: 'PASS',
      evidence: [],
      method: 'getStatus',
      query,
      expected: { status: 'ACCEPTED' },
    };

    await expect(
      executeProviderContractFixture(testDriver.value, fixture),
    ).rejects.toThrow('at least one evidence reference is required');
    expect(testDriver.arrange).not.toHaveBeenCalled();
  });
});
