import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './common/database/database.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PinoLoggerService } from './common/logger/pino-logger.service';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { FiscalOperationsModule } from './modules/fiscal-operations/fiscal-operations.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    FiscalOperationsModule,
  ],
  providers: [
    PinoLoggerService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
