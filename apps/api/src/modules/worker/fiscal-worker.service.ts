import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FISCAL_PROVIDER,
  type FiscalProvider,
  type ProviderReconciliationResult,
  type ProviderSubmissionResult,
} from '../provider/fiscal-provider';
import {
  FiscalWorkerRepository,
  type ClaimedWorkItem,
} from './fiscal-worker.repository';

export type WorkerProcessResult =
  | 'IDLE'
  | 'MUTATIONS_PAUSED'
  | 'SUBMITTED'
  | 'RECOVERED_UNKNOWN'
  | 'RECONCILED'
  | 'RETRY_SCHEDULED'
  | 'SKIPPED'
  | 'DEAD_LETTERED';

@Injectable()
export class FiscalWorkerService {
  private readonly workerId: string;
  private readonly leaseSeconds: number;
  private readonly mutationPauseSeconds: number;
  private readonly reconcileRetrySeconds: number;
  private readonly reconcileMaxAttempts: number;

  constructor(
    private readonly repository: FiscalWorkerRepository,
    @Inject(FISCAL_PROVIDER) private readonly provider: FiscalProvider,
    config: ConfigService,
  ) {
    this.workerId = config.get<string>('WORKER_ID', 'worker-1');
    this.leaseSeconds = config.get<number>('WORKER_LEASE_SECONDS', 30);
    this.mutationPauseSeconds = config.get<number>(
      'WORKER_MUTATION_PAUSE_SECONDS',
      5,
    );
    this.reconcileRetrySeconds = config.get<number>(
      'WORKER_RECONCILE_RETRY_SECONDS',
      5,
    );
    this.reconcileMaxAttempts = config.get<number>(
      'WORKER_RECONCILE_MAX_ATTEMPTS',
      5,
    );
  }

  async processNext(): Promise<WorkerProcessResult> {
    const job = await this.repository.claimNext(
      this.workerId,
      this.leaseSeconds,
    );
    if (!job) return 'IDLE';

    if (job.kind === 'SUBMIT') {
      return this.processSubmit(job);
    }
    if (job.kind === 'RECONCILE') {
      return this.processReconcile(job);
    }

    await this.repository.deadLetterWork(job, 'UNSUPPORTED_WORK_KIND');
    return 'DEAD_LETTERED';
  }

  private async processSubmit(
    job: ClaimedWorkItem,
  ): Promise<WorkerProcessResult> {
    const mutationsEnabled = await this.repository.providerMutationsEnabled();
    const prepared = await this.repository.prepareSubmission(
      job,
      mutationsEnabled,
    );

    if (prepared.action === 'RECOVERED_UNKNOWN') {
      return 'RECOVERED_UNKNOWN';
    }
    if (prepared.action === 'SKIPPED') {
      return 'SKIPPED';
    }
    if (prepared.action === 'PAUSED') {
      await this.repository.rescheduleWork(
        job,
        this.mutationPauseSeconds,
        'PROVIDER_MUTATIONS_DISABLED',
      );
      return 'MUTATIONS_PAUSED';
    }
    if (prepared.action !== 'SUBMIT') {
      return 'SKIPPED';
    }

    let result: ProviderSubmissionResult;
    try {
      result = await this.provider.submit(prepared.command, prepared.context);
    } catch {
      result = {
        outcome: 'TRANSPORT_AMBIGUOUS',
        normalizedCode: 'UNEXPECTED_PROVIDER_ERROR',
      };
    }

    await this.repository.applySubmissionResult(
      job,
      prepared.attemptId,
      result,
    );
    return 'SUBMITTED';
  }

  private async processReconcile(
    job: ClaimedWorkItem,
  ): Promise<WorkerProcessResult> {
    const prepared = await this.repository.prepareReconciliation(job);
    if (!prepared) return 'SKIPPED';

    let result: ProviderReconciliationResult;
    try {
      result = await this.provider.reconcile(prepared.query);
    } catch {
      result = {
        outcome: 'INDETERMINATE',
        normalizedCode: 'UNEXPECTED_RECONCILIATION_ERROR',
      };
    }

    await this.repository.applyReconciliationResult(
      job,
      prepared.attemptId,
      result,
      this.reconcileMaxAttempts,
      this.reconcileRetrySeconds,
    );

    return result.outcome === 'INDETERMINATE'
      ? 'RETRY_SCHEDULED'
      : 'RECONCILED';
  }
}
