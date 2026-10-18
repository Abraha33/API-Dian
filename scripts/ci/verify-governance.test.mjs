import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..', '..');
const gatePath = path.join(scriptDirectory, 'verify-governance.mjs');
const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'api-dian-governance-'));

const activeDocuments = [
  ['README.md', 'ACTIVE'],
  ['ROADMAP.md', 'ACTIVE'],
  ['docs/PRODUCT-DEFINITION-V1-FINAL.md', 'FROZEN'],
  ['docs/session-context.md', 'ACTIVE'],
  ['docs/v1-requisitos.md', 'Cerrado'],
  ['docs/SYSTEM-ARCHITECTURE-V1.md', 'FROZEN'],
  ['ADR/ADR-003-arquitectura-v1-monolito-postgres.md', 'Aprobado'],
];

function writeFixture(relativePath, content) {
  const target = path.join(fixtureRoot, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function createBaseline() {
  writeFixture(
    'AGENTS.md',
    `## Autoridad\nSource of truth\n## Permisos\n**PERMITIDO:** local\n**REQUIERE AUTORIZACIÓN:** publish\n**PROHIBIDO SIN AUTORIZACIÓN:** production\n## Evidencia\n## Definition of Done\n## Entrega y bloqueos\n`,
  );
  writeFixture('.cursor/rules/project.mdc', 'alwaysApply: true\nRead AGENTS.md\n');
  writeFixture('apps/api/package.json', JSON.stringify({ dependencies: {} }));
  writeFixture(
    '.github/workflows/ci.yml',
    `on:\n  push:\n    branches: [dev, main]\n  pull_request:\n    branches: [dev, main]\n- name: Agent governance contract\n  run: node scripts/ci/verify-governance.mjs\n`,
  );
  writeFixture('.github/workflows/security-audit.yml', 'name: security\n');
  writeFixture('.github/workflows/docker-security.yml', 'name: docker\n');

  for (const [relativePath, status] of activeDocuments) {
    writeFixture(relativePath, `# ${status}\nAPI fiscal comercial multitenant\n${status}\n`);
  }
}

function runGate() {
  return spawnSync(process.execPath, [gatePath], {
    cwd: repositoryRoot,
    env: { ...process.env, GOVERNANCE_ROOT: fixtureRoot },
    encoding: 'utf8',
  });
}

function expectResult(label, expectedExitCode) {
  const result = runGate();
  assert.equal(
    result.status,
    expectedExitCode,
    `${label}: expected exit ${expectedExitCode}, got ${result.status}\n${result.stdout}\n${result.stderr}`,
  );
  console.log(`[PASS] ${label}: exit ${expectedExitCode}`);
}

try {
  createBaseline();
  expectResult('baseline', 0);

  fs.rmSync(path.join(fixtureRoot, 'AGENTS.md'));
  expectResult('missing AGENTS.md', 1);
  createBaseline();

  writeFixture('AGENTS.md', '# invalid\n');
  expectResult('invalid AGENTS.md', 1);
  createBaseline();

  writeFixture('apps/api/package.json', JSON.stringify({ dependencies: { jest: '^1.0.0' } }));
  expectResult('forbidden dependency', 1);
  createBaseline();

  writeFixture('.cursor/rules/project.mdc', 'alwaysApply: false\n');
  expectResult('bad Cursor rule', 1);
  createBaseline();

  fs.rmSync(path.join(fixtureRoot, '.github/workflows/docker-security.yml'));
  expectResult('missing workflow', 1);
  createBaseline();

  writeFixture('README.md', 'API fiscal interna para comercio colombiano.\nACTIVE\n');
  expectResult('contradictory product definition', 1);
  createBaseline();

  writeFixture('README.md', '# ACTIVE\nAPI fiscal comercial multitenant\nACTIVE\n[missing](does-not-exist.md)\n');
  expectResult('broken Markdown reference', 1);
  createBaseline();

  writeFixture(
    '.github/workflows/ci.yml',
    `on:\n  push:\n    branches: [feature]\n  pull_request:\n    branches: [feature]\n- name: Agent governance contract\n  run: node scripts/ci/verify-governance.mjs\n`,
  );
  expectResult('bad CI trigger', 1);

  console.log('\nGovernance regression probes: PASS');
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
}
