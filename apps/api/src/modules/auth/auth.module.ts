import { Module } from '@nestjs/common';
import { CredentialGuard } from './credential.guard';
import { CredentialService } from './credential.service';

@Module({
  providers: [CredentialService, CredentialGuard],
  exports: [CredentialService, CredentialGuard],
})
export class AuthModule {}
