import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { QueryResultRow } from 'pg';
import { DatabaseService } from '../../common/database/database.service';
import type { FiscalPrincipal } from './fiscal-principal';

const TOKEN_PATTERN =
  /^adn_v1\.([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})\.([A-Za-z0-9_-]{43})$/;
const DIGEST_VERSION = 'hmac-sha256-v1';

interface CredentialRow extends QueryResultRow {
  credential_id: string;
  tenant_id: string;
  secret_digest: Buffer;
  digest_version: string;
  credential_status: string;
  expires_at: Date | null;
  revoked_at: Date | null;
}

@Injectable()
export class CredentialService {
  private readonly pepper: string;

  constructor(
    private readonly db: DatabaseService,
    config: ConfigService,
  ) {
    this.pepper = config.getOrThrow<string>('AUTH_PEPPER');
  }

  async authenticate(token: string): Promise<FiscalPrincipal> {
    const match = TOKEN_PATTERN.exec(token);
    if (!match) throw new UnauthorizedException('Invalid credential');

    const [, credentialId, encodedSecret] = match;
    const secret = Buffer.from(encodedSecret, 'base64url');
    if (secret.length !== 32) {
      throw new UnauthorizedException('Invalid credential');
    }

    const result = await this.db.query<CredentialRow>(
      'SELECT * FROM app.lookup_api_credential($1::uuid)',
      [credentialId],
    );
    const row = result.rows[0];
    if (!row || row.credential_status !== 'ACTIVE' || row.revoked_at) {
      throw new UnauthorizedException('Invalid credential');
    }
    if (row.expires_at && row.expires_at.getTime() <= Date.now()) {
      throw new UnauthorizedException('Invalid credential');
    }
    if (row.digest_version !== DIGEST_VERSION) {
      throw new UnauthorizedException('Invalid credential');
    }

    const candidate = createHmac('sha256', this.pepper)
      .update(secret)
      .digest();
    if (
      row.secret_digest.length !== candidate.length ||
      !timingSafeEqual(row.secret_digest, candidate)
    ) {
      throw new UnauthorizedException('Invalid credential');
    }

    return { credentialId: row.credential_id, tenantId: row.tenant_id };
  }
}
