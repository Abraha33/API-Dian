import { createHash } from 'node:crypto';
import type {
  FiscalProvider,
  ProviderArtifact,
  ProviderAttemptContext,
  ProviderDocumentQuery,
  ProviderDocumentStatus,
  ProviderFiscalCommand,
  ProviderReconciliationQuery,
  ProviderReconciliationResult,
  ProviderSubmissionResult,
} from '../../src/modules/provider/fiscal-provider';

export type EvidenceKind =
  | 'SANDBOX_CAPTURE'
  | 'PROVIDER_DOCUMENTATION'
  | 'CONTRACT'
  | 'PROVIDER_CONFIRMATION';

export interface EvidenceReference {
  id: string;
  kind: EvidenceKind;
  locator: string;
  observed_at: string;
  sanitized: true;
}

export interface RiskProof {
  basis: string;
  evidence_ref_ids: string[];
}

interface FixtureBase {
  fixture_version: '1';
  case_id: string;
  document_kind: string;
  gate_conclusion: 'PASS';
  evidence: EvidenceReference[];
  proof_of_no_remote_side_effect?: RiskProof;
  proof_not_found_is_conclusive?: RiskProof;
}

export interface SubmitContractFixture extends FixtureBase {
  method: 'submit';
  command: ProviderFiscalCommand;
  context: ProviderAttemptContext;
  expected: ProviderSubmissionResult;
}

export interface ReconcileContractFixture extends FixtureBase {
  method: 'reconcile';
  query: ProviderReconciliationQuery;
  expected: ProviderReconciliationResult;
}

export interface StatusContractFixture extends FixtureBase {
  method: 'getStatus';
  query: ProviderDocumentQuery;
  expected: ProviderDocumentStatus;
}

export interface ArtifactExpectation {
  content_type: string;
  sha256: string;
  min_bytes: number;
}

export interface ArtifactContractFixture extends FixtureBase {
  method: 'fetchXml' | 'fetchPdf';
  query: ProviderDocumentQuery;
  expected: ArtifactExpectation;
}

export type ProviderContractFixture =
  | SubmitContractFixture
  | ReconcileContractFixture
  | StatusContractFixture
  | ArtifactContractFixture;

export interface ProviderContractTestDriver {
  provider: FiscalProvider;
  arrange(fixture: ProviderContractFixture): Promise<void>;
  cleanup?(fixture: ProviderContractFixture): Promise<void>;
}

function assertNonEmpty(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${label} must not be empty`);
  }
}

function assertEvidence(fixture: ProviderContractFixture): void {
  assertNonEmpty(fixture.case_id, 'case_id');
  assertNonEmpty(fixture.document_kind, 'document_kind');

  if (fixture.evidence.length === 0) {
    throw new Error(`${fixture.case_id}: at least one evidence reference is required`);
  }

  const ids = new Set<string>();
  for (const reference of fixture.evidence) {
    assertNonEmpty(reference.id, 'evidence.id');
    assertNonEmpty(reference.locator, 'evidence.locator');
    if (ids.has(reference.id)) {
      throw new Error(`${fixture.case_id}: duplicate evidence id ${reference.id}`);
    }
    ids.add(reference.id);

    if (reference.sanitized !== true) {
      throw new Error(`${fixture.case_id}: evidence must be sanitized before commit`);
    }
    if (Number.isNaN(Date.parse(reference.observed_at))) {
      throw new Error(`${fixture.case_id}: invalid evidence observed_at`);
    }
  }

  const assertProof = (proof: RiskProof | undefined, label: string) => {
    if (!proof) throw new Error(`${fixture.case_id}: ${label} is required`);
    assertNonEmpty(proof.basis, `${label}.basis`);
    if (proof.evidence_ref_ids.length === 0) {
      throw new Error(`${fixture.case_id}: ${label} needs evidence references`);
    }
    for (const refId of proof.evidence_ref_ids) {
      if (!ids.has(refId)) {
        throw new Error(`${fixture.case_id}: ${label} references unknown evidence ${refId}`);
      }
    }
  };

  if (
    fixture.method === 'submit' &&
    fixture.expected.outcome === 'TRANSPORT_PROVEN_NOT_SENT'
  ) {
    assertProof(
      fixture.proof_of_no_remote_side_effect,
      'proof_of_no_remote_side_effect',
    );
  }

  if (
    fixture.method === 'reconcile' &&
    fixture.expected.outcome === 'NOT_FOUND_CONCLUSIVE'
  ) {
    assertProof(
      fixture.proof_not_found_is_conclusive,
      'proof_not_found_is_conclusive',
    );
  }
}

function assertArtifact(
  actual: ProviderArtifact,
  expected: ArtifactExpectation,
): void {
  expect(actual.contentType).toBe(expected.content_type);
  expect(actual.bytes.byteLength).toBeGreaterThanOrEqual(expected.min_bytes);
  const digest = createHash('sha256').update(actual.bytes).digest('hex');
  expect(digest).toBe(expected.sha256);
}

export async function executeProviderContractFixture(
  driver: ProviderContractTestDriver,
  fixture: ProviderContractFixture,
): Promise<void> {
  assertEvidence(fixture);
  await driver.arrange(fixture);

  try {
    switch (fixture.method) {
      case 'submit': {
        const actual = await driver.provider.submit(
          fixture.command,
          fixture.context,
        );
        expect(actual).toEqual(fixture.expected);
        return;
      }
      case 'reconcile': {
        const actual = await driver.provider.reconcile(fixture.query);
        expect(actual).toEqual(fixture.expected);
        return;
      }
      case 'getStatus': {
        const actual = await driver.provider.getStatus(fixture.query);
        expect(actual).toEqual(fixture.expected);
        return;
      }
      case 'fetchXml': {
        const actual = await driver.provider.fetchXml(fixture.query);
        assertArtifact(actual, fixture.expected);
        return;
      }
      case 'fetchPdf': {
        const actual = await driver.provider.fetchPdf(fixture.query);
        assertArtifact(actual, fixture.expected);
        return;
      }
    }
  } finally {
    await driver.cleanup?.(fixture);
  }
}
