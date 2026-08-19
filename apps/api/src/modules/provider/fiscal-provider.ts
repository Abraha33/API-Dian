export const FISCAL_PROVIDER = Symbol('FISCAL_PROVIDER');

export type SubmissionOutcome =
  | 'CONCLUSIVE_ACCEPTED'
  | 'CONCLUSIVE_REJECTED'
  | 'TRANSPORT_PROVEN_NOT_SENT'
  | 'TRANSPORT_AMBIGUOUS';

export type ReconciliationOutcome =
  | 'FOUND_ACCEPTED'
  | 'FOUND_REJECTED'
  | 'NOT_FOUND_CONCLUSIVE'
  | 'INDETERMINATE';

export interface ProviderAttemptContext {
  operationId: string;
  attemptId: string;
  tenantId: string;
  providerBindingRef: string;
  clientCorrelationRef: string;
  mappingVersion: string;
}

export interface ProviderFiscalCommand {
  documentKind: string;
  payload: Record<string, unknown>;
}

export interface ProviderSubmissionResult {
  outcome: SubmissionOutcome;
  providerReference?: string;
  normalizedCode?: string;
}

export interface ProviderReconciliationQuery {
  tenantId: string;
  operationId: string;
  clientCorrelationRef: string;
  providerReference?: string;
}

export interface ProviderReconciliationResult {
  outcome: ReconciliationOutcome;
  providerReference?: string;
  normalizedCode?: string;
}

export type ProviderDocumentQuery = ProviderReconciliationQuery;

export interface ProviderDocumentStatus {
  status: 'ACCEPTED' | 'REJECTED' | 'UNKNOWN';
}

export interface ProviderArtifact {
  bytes: Uint8Array;
  contentType: string;
}

export interface FiscalProvider {
  submit(
    command: ProviderFiscalCommand,
    context: ProviderAttemptContext,
  ): Promise<ProviderSubmissionResult>;
  reconcile(
    query: ProviderReconciliationQuery,
  ): Promise<ProviderReconciliationResult>;
  getStatus(query: ProviderDocumentQuery): Promise<ProviderDocumentStatus>;
  fetchXml(query: ProviderDocumentQuery): Promise<ProviderArtifact>;
  fetchPdf(query: ProviderDocumentQuery): Promise<ProviderArtifact>;
}
