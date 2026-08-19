import { FakeFiscalProvider } from './fake-fiscal-provider';
import type {
  ProviderAttemptContext,
  ProviderFiscalCommand,
} from './fiscal-provider';

const context: ProviderAttemptContext = {
  operationId: 'operation-1',
  attemptId: 'attempt-1',
  tenantId: 'tenant-1',
  providerBindingRef: 'binding-1',
  clientCorrelationRef: 'correlation-1',
  mappingVersion: 'fake/1',
};

const command: ProviderFiscalCommand = {
  documentKind: 'FEV',
  payload: {},
};

describe('FakeFiscalProvider', () => {
  it('models delayed visibility without re-submitting', async () => {
    const provider = new FakeFiscalProvider('DELAYED_VISIBILITY');

    await expect(provider.submit(command, context)).resolves.toMatchObject({
      outcome: 'TRANSPORT_AMBIGUOUS',
    });
    await expect(provider.reconcile(context)).resolves.toMatchObject({
      outcome: 'INDETERMINATE',
    });
    await expect(provider.reconcile(context)).resolves.toMatchObject({
      outcome: 'INDETERMINATE',
    });
    await expect(provider.reconcile(context)).resolves.toMatchObject({
      outcome: 'FOUND_ACCEPTED',
    });
  });

  it('keeps artifact failure separate from fiscal acceptance', async () => {
    const provider = new FakeFiscalProvider('ARTIFACT_FAILURE');

    await expect(provider.submit(command, context)).resolves.toMatchObject({
      outcome: 'CONCLUSIVE_ACCEPTED',
    });
    await expect(provider.fetchXml(context)).rejects.toThrow(
      'FAKE_ARTIFACT_FAILURE',
    );
  });

  it('can prove a simulated request was not sent', async () => {
    const provider = new FakeFiscalProvider('PROVEN_NOT_SENT');

    await expect(provider.submit(command, context)).resolves.toMatchObject({
      outcome: 'TRANSPORT_PROVEN_NOT_SENT',
    });
    await expect(provider.reconcile(context)).resolves.toMatchObject({
      outcome: 'NOT_FOUND_CONCLUSIVE',
    });
  });
});
