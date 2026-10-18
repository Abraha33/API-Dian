import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = process.env.GOVERNANCE_ROOT
  ? path.resolve(process.env.GOVERNANCE_ROOT)
  : path.resolve(scriptDirectory, '..', '..');

// Keep exceptions explicit, local to this contract, and justified when one is needed.
const legacyDependencyExceptions = Object.freeze({});
const prohibitedDirectDependencies = ['jest', 'ts-jest', 'redis', 'bullmq', 'prisma'];

const requiredAgentMarkers = [
  {
    label: 'autoridades',
    patterns: [/^##\s+Autoridad\b/im, /source of truth/i, /fuentes? de verdad/i],
  },
  {
    label: 'permitido',
    patterns: [/\*\*PERMITIDO:\*\*/i, /^##\s+Permisos\b/im],
  },
  {
    label: 'autorización',
    patterns: [/\*\*REQUIERE AUTORIZACIÓN:\*\*/i, /\bauthori[sz]ation\b/i],
  },
  {
    label: 'prohibido',
    patterns: [/\*\*PROHIBIDO(?: SIN[^*]*)?:\*\*/i, /\bforbidden\b/i],
  },
  {
    label: 'verificación/entrega',
    patterns: [
      /^##\s+Evidencia\b/im,
      /^##\s+Definition of Done\b/im,
      /^##\s+Entrega y bloqueos\b/im,
    ],
  },
];

const workflowRequirements = [
  { label: 'ci', candidates: ['.github/workflows/ci.yml'] },
  { label: 'security', candidates: ['.github/workflows/security.yml', '.github/workflows/security-audit.yml'] },
  { label: 'docker', candidates: ['.github/workflows/docker.yml', '.github/workflows/docker-security.yml'] },
];

const activeDocumentation = [
  { path: 'README.md', status: 'ACTIVE' },
  { path: 'ROADMAP.md', status: 'ACTIVE' },
  { path: 'docs/PRODUCT-DEFINITION-V1-FINAL.md', status: 'FROZEN' },
  { path: 'docs/session-context.md', status: 'ACTIVE' },
  { path: 'docs/v1-requisitos.md', status: 'Cerrado' },
  { path: 'docs/SYSTEM-ARCHITECTURE-V1.md', status: 'FROZEN' },
  { path: 'ADR/ADR-003-arquitectura-v1-monolito-postgres.md', status: 'Aprobado' },
];

const requiredProductPhrase = /API fiscal comercial\s+multitenant/i;
const forbiddenLegacyProductLines = [
  /^API fiscal interna para comercio colombiano\.$/im,
  /^No es API pública comercial V1\.$/im,
  /^V1 no es API pública;$/im,
];

const failures = [];

function checkFileExists(relativePath, label = relativePath) {
  const absolutePath = path.join(repositoryRoot, relativePath);
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    failures.push(`${label}: falta ${relativePath}`);
    return false;
  }

  console.log(`[PASS] ${label}: ${relativePath}`);
  return true;
}

function readUtf8(relativePath, label) {
  const absolutePath = path.join(repositoryRoot, relativePath);
  if (!checkFileExists(relativePath, label)) return null;

  try {
    return fs.readFileSync(absolutePath, 'utf8');
  } catch (error) {
    failures.push(`${label}: no se pudo leer ${relativePath} (${error.message})`);
    return null;
  }
}

const agentsContent = readUtf8('AGENTS.md', 'AGENTS.md');
if (agentsContent !== null) {
  for (const marker of requiredAgentMarkers) {
    if (marker.patterns.some((pattern) => pattern.test(agentsContent))) {
      console.log(`[PASS] AGENTS.md marker: ${marker.label}`);
    } else {
      failures.push(`AGENTS.md: falta marker mínimo de ${marker.label}`);
    }
  }
}

const cursorContent = readUtf8('.cursor/rules/project.mdc', '.cursor/rules/project.mdc');
if (cursorContent !== null) {
  if (/AGENTS\.md/i.test(cursorContent)) {
    console.log('[PASS] Cursor rule references AGENTS.md');
  } else {
    failures.push('.cursor/rules/project.mdc: no referencia AGENTS.md');
  }
  if (/alwaysApply:\s*true/i.test(cursorContent)) {
    console.log('[PASS] Cursor rule is always applied');
  } else {
    failures.push('.cursor/rules/project.mdc: no declara alwaysApply: true');
  }
  if (fs.existsSync(path.join(repositoryRoot, 'AGENTS.md'))) {
    console.log('[PASS] Cursor rule target AGENTS.md exists');
  } else {
    failures.push('.cursor/rules/project.mdc: el AGENTS.md referenciado no existe');
  }
}

const packageRelativePath = 'apps/api/package.json';
const packageContent = readUtf8(packageRelativePath, 'package.json');
if (packageContent !== null) {
  try {
    const packageJson = JSON.parse(packageContent);
    const directDependencies = {
      ...(packageJson.dependencies ?? {}),
      ...(packageJson.devDependencies ?? {}),
    };
    const violations = prohibitedDirectDependencies.filter(
      (dependency) => dependency in directDependencies && !(dependency in legacyDependencyExceptions),
    );

    if (violations.length === 0) {
      console.log('[PASS] package.json: no hay dependencias directas históricas prohibidas');
    } else {
      failures.push(`package.json: dependencias directas prohibidas sin excepción: ${violations.join(', ')}`);
    }
  } catch (error) {
    failures.push(`package.json: JSON inválido (${error.message})`);
  }
}

for (const requirement of workflowRequirements) {
  const existingWorkflow = requirement.candidates.find((candidate) =>
    fs.existsSync(path.join(repositoryRoot, candidate)),
  );

  if (existingWorkflow) {
    console.log(`[PASS] workflow ${requirement.label}: ${existingWorkflow}`);
  } else {
    failures.push(
      `workflow ${requirement.label}: falta uno de ${requirement.candidates.join(', ')}`,
    );
  }
}

const ciWorkflow = readUtf8('.github/workflows/ci.yml', 'workflow CI');
if (ciWorkflow !== null) {
  const requiredCiSignals = [
    /pull_request:/i,
    /push:/i,
    /branches:\s*\[dev,\s*main\]/i,
    /Agent governance contract/i,
    /node scripts\/ci\/verify-governance\.mjs/i,
  ];
  for (const signal of requiredCiSignals) {
    if (!signal.test(ciWorkflow)) {
      failures.push(`.github/workflows/ci.yml: falta señal requerida ${signal}`);
    }
  }
}

for (const document of activeDocumentation) {
  const content = readUtf8(document.path, `documento ${document.status}`);
  if (content === null) continue;

  if (requiredProductPhrase.test(content)) {
    console.log(`[PASS] ${document.path}: definición comercial vigente presente`);
  } else {
    failures.push(`${document.path}: falta la definición vigente "API fiscal comercial multitenant"`);
  }

  if (content.includes(document.status)) {
    console.log(`[PASS] ${document.path}: estado ${document.status}`);
  } else {
    failures.push(`${document.path}: falta estado documental ${document.status}`);
  }

  for (const pattern of forbiddenLegacyProductLines) {
    if (pattern.test(content)) {
      failures.push(`${document.path}: contiene una definición de producto histórica contradictoria (${pattern})`);
    }
  }

  const markdownLinks = content.matchAll(/\]\((?!https?:\/\/|mailto:|#)([^)#]+)(?:#[^)]*)?\)/g);
  for (const match of markdownLinks) {
    const target = match[1].trim();
    const targetPath = path.resolve(path.dirname(path.join(repositoryRoot, document.path)), target);
    if (!fs.existsSync(targetPath)) {
      failures.push(`${document.path}: referencia Markdown inexistente ${target}`);
    }
  }
}

if (failures.length > 0) {
  console.error('\nAgent governance contract: FAIL');
  for (const failure of failures) console.error(`[FAIL] ${failure}`);
  process.exitCode = 1;
} else {
  console.log('\nAgent governance contract: PASS');
}
