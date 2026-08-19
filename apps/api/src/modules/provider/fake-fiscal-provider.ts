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
} from './fiscal-provider';

export type FakeProviderScenario =
  | 'ACCEPT'
  | 'REJECT'
  | 'PROVEN_NOT_SENT'
  | 'AMBIGUOUS_TIMEOUT'
  | 'DELAYED_VISIBILITY'
  | 'MALFORMED_RESPONSE'
  | 'RATE_LIMIT'
  | 'UNAVAILABLE'
  | 'ARTIFACT_FAILURE';

interface FakeRecord {
  scenario: FakeProviderScenario;
  providerReference?: string;
  reconciliationReads: number;
}

export class FakeFiscalProvider implements FiscalProvider {
  private readonly records = new Map<string, FakeRecord>();
  private scenario: FakeProviderScenario;

  constructor(scenario: FakeProviderScenario = 'ACCEPT') {
    this.scenario = scenario;
  }

  setScenario(scenario: FakeProviderScenario): void {
    this.scenario = scenario;
  }

  submit(
    _command: ProviderFiscalCommand,
    context: ProviderAttemptContext,
  ): Promise<ProviderSubmissionResult> {
    const providerReference = `fake:${context.clientCorrelationRef}`;
    this.records.set(context.clientCorrelationRef, {
      scenario: this.scenario,
      providerReference,
      reconciliationReads: 0,
    });

    switch (this.scenario) {
      case 'ACCEPT':
      case 'ARTIFACT_FAILURE':
        return Promise.resolve({
          outcome: 'CONCLUSIVE_ACCEPTED',
          providerReference,
        });
      case 'REJECT':
        return Promise.resolve({
          outcome: 'CONCLUSIVE_REJECTED',
          normalizedCode: 'FAKE_REJECTED',
        });
      case 'PROVEN_NOT_SENT':
      case 'RATE_LIMIT':
      case 'UNAVAILABLE':
        return Promise.resolve({
          outcome: 'TRANSPORT_PROVEN_NOT_SENT',
          normalizedCode: `FAKE_${this.scenario}`,
        });
      case 'AMBIGUOUS_TIMEOUT':
      case 'MALFORMED_RESPONSE':
      case 'DELAYED_VISIBILITY':
        return Promise.resolve({
          outcome: 'TRANSPORT_AMBIGUOUS',
          normalizedCode: `FAKE_${this.scenario}`,
        });
    }
  }

  reconcile(
    query: ProviderReconciliationQuery,
  ): Promise<ProviderReconciliationResult> {
    const record = this.records.get(query.clientCorrelationRef);
    if (!record) {
      return Promise.resolve({ outcome: 'NOT_FOUND_CONCLUSIVE' });
    }

    record.reconciliationReads += 1;

    switch (record.scenario) {
      case 'ACCEPT':
      case 'ARTIFACT_FAILURE':
      case 'AMBIGUOUS_TIMEOUT':
        return Promise.resolve({
          outcome: 'FOUND_ACCEPTED',
          providerReference: record.providerReference,
        });
      case 'DELAYED_VISIBILITY':
        return Promise.resolve(
          record.reconciliationReads < 3
            ? { outcome: 'INDETERMINATE' }
            : {
                outcome: 'FOUND_ACCEPTED',
                providerReference: record.providerReference,
              },
        );
      case 'REJECT':
        return Promise.resolve({
          outcome: 'FOUND_REJECTED',
          normalizedCode: 'FAKE_REJECTED',
        });
      case 'PROVEN_NOT_SENT':
      case 'RATE_LIMIT':
      case 'UNAVAILABLE':
        return Promise.resolve({ outcome: 'NOT_FOUND_CONCLUSIVE' });
      case 'MALFORMED_RESPONSE':
        return Promise.resolve({ outcome: 'INDETERMINATE' });
    }
  }

  getStatus(query: ProviderDocumentQuery): Promise<ProviderDocumentStatus> {
    return this.reconcile(query).then((reconciled) => {
      if (reconciled.outcome === 'FOUND_ACCEPTED') {
        return { status: 'ACCEPTED' };
      }
      if (reconciled.outcome === 'FOUND_REJECTED') {
        return { status: 'REJECTED' };
      }
      return { status: 'UNKNOWN' };
    });
  }

  fetchXml(query: ProviderDocumentQuery): Promise<ProviderArtifact> {
    return this.fetchArtifact(query, 'application/xml', '<fake-xml/>');
  }

  fetchPdf(query: ProviderDocumentQuery): Promise<ProviderArtifact> {
    return this.fetchArtifact(query, 'application/pdf', '%PDF-fake');
  }

  private fetchArtifact(
    query: ProviderDocumentQuery,
    contentType: string,
    content: string,
  ): Promise<ProviderArtifact> {
    const record = this.records.get(query.clientCorrelationRef);
    if (!record || record.scenario === 'ARTIFACT_FAILURE') {
      return Promise.reject(new Error('FAKE_ARTIFACT_FAILURE'));
    }

    return Promise.resolve({
      bytes: new TextEncoder().encode(content),
      contentType,
    });
  }
}
