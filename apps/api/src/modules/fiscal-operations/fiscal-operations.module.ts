import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FiscalOperationsController } from './fiscal-operations.controller';
import { FiscalOperationsRepository } from './fiscal-operations.repository';
import { FiscalOperationsService } from './fiscal-operations.service';

@Module({
  imports: [AuthModule],
  controllers: [FiscalOperationsController],
  providers: [FiscalOperationsRepository, FiscalOperationsService],
})
export class FiscalOperationsModule {}
