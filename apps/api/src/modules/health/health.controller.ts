import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseService } from '../../common/database/database.service';

function readPackageVersion(): string {
  const path = join(process.cwd(), 'package.json');
  const raw = readFileSync(path, 'utf8');
  const pkg = JSON.parse(raw) as { version: string };
  return pkg.version;
}

@Controller()
export class HealthController {
  private readonly version = readPackageVersion();

  constructor(private readonly database: DatabaseService) {}

  @Get('health')
  health(): { status: string; timestamp: string; version: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: this.version,
    };
  }

  @Get('ready')
  async ready(): Promise<{ status: string; checks: { db: string } }> {
    const db = await this.database.isReady();
    if (!db) {
      throw new ServiceUnavailableException({
        status: 'not_ready',
        checks: { db: 'failed' },
      });
    }
    return { status: 'ok', checks: { db: 'ok' } };
  }
}
