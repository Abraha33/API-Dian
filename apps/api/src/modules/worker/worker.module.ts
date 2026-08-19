import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FakeFiscalProvider } from '../provider/fake-fiscal-provider';
import {
  FISCAL_PROVIDER,
  type FiscalProvider,
} from '../provider/fiscal-provider';
import { FiscalWorkerRepository } from './fiscal-worker.repository';
import { FiscalWorkerService } from './fiscal-worker.service';

@Module({
  providers: [
    FiscalWorkerRepository,
    {
      provide: FISCAL_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService): FiscalProvider =>
        new FakeFiscalProvider(config.getOrThrow('FAKE_PROVIDER_SCENARIO')),
    },
    FiscalWorkerService,
  ],
  exports: [FiscalWorkerRepository, FiscalWorkerService],
})
export class WorkerModule {}
