import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CredentialService } from './credential.service';
import type { FiscalRequest } from './fiscal-principal';

@Injectable()
export class CredentialGuard implements CanActivate {
  constructor(private readonly credentials: CredentialService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<FiscalRequest>();
    const authorization = request.headers.authorization;
    if (!authorization) throw new UnauthorizedException('Invalid credential');

    const [scheme, token, extra] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token || extra) {
      throw new UnauthorizedException('Invalid credential');
    }

    request.fiscalPrincipal = await this.credentials.authenticate(token);
    return true;
  }
}
