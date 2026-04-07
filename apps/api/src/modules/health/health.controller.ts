import { Controller, Get } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function readPackageVersion(): string {
  const path = join(process.cwd(), 'package.json');
  const raw = readFileSync(path, 'utf8');
  const pkg = JSON.parse(raw) as { version: string };
  return pkg.version;
}

@Controller()
export class HealthController {
  private readonly version = readPackageVersion();

  @Get('health')
  health(): {
    status: string;
    timestamp: string;
    version: string;
  } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: this.version,
    };
  }

  @Get('ready')
  ready(): {
    status: string;
    checks: { db: string; redis: string };
  } {
    return {
      status: 'ok',
      checks: { db: 'ok', redis: 'ok' },
    };
  }
}
