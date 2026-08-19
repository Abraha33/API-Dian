import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import configuration from './config/configuration';
import { validateWorkerEnv } from './config/worker-env.validation';
import { WorkerModule } from './modules/worker/worker.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateWorkerEnv,
      load: [configuration],
    }),
    DatabaseModule,
    WorkerModule,
  ],
})
export class WorkerAppModule {}
