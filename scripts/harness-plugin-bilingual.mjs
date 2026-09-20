#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const specs = [
  ['ibiz-ai-chat', 'test/localization.test.mjs', 'typescript/lib/tsc.js'],
  ['ibiz-bi-report', 'tests/localization.test.cjs', 'vue-tsc/bin/vue-tsc.js'],
  ['ibiz-data-view', 'test/locale.test.cjs', 'typescript/lib/tsc.js'],
  ['ibiz-gantt', 'tests/locale.test.mjs', 'vue-tsc/bin/vue-tsc.js'],
  ['ibiz-template-devtools', 'test/locale.test.cjs', 'typescript/lib/tsc.js'],
];
const args = process.argv.slice(2);
if (args.some(arg => !['--tests-only', '--help'].includes(arg))) {
  console.error('Usage: node scripts/harness-plugin-bilingual.mjs [--tests-only]');
  process.exit(2);
}
if (args.includes('--help')) {
  console.log('Runs bilingual behavior tests, typechecks, and source builds for five workspace plugins.\n--tests-only omits builds and typechecks; it does not certify their success.\nBrowser and upstream-platform acceptance are reported separately as unverified.');
  process.exit(0);
}
const testsOnly = args.includes('--tests-only');
const output = resolve(root, '../.artifacts/plugin-bilingual',
  `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}`);
await mkdir(output, { recursive: true });
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

async function fingerprints() {
  const files = {};
  async function visit(directory) {
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', 'dist', 'lib', 'es', '.git'].includes(entry.name)) await visit(path);
      } else if (entry.isFile() && /\.(?:[cm]?[jt]sx?|vue|json|scss|yaml)$/.test(entry.name)) {
        files[path] = hash(await readFile(join(root, path)));
      }
    }
  }
  for (const [id] of specs) await visit(`plugins/${id}`);
  for (const platform of ['ibiz-next-vue3', 'ibiz-next-mob-vue3']) {
    await visit(`components/${platform}/src/locale`);
  }
  await visit('scripts/tests');
  await visit('scripts/test-support');
  for (const name of ['package.json', 'pnpm-lock.yaml', 'scripts/harness-plugin-bilingual.mjs']) {
    files[name] = hash(await readFile(join(root, name)));
  }
  return Object.fromEntries(Object.entries(files).sort(([a], [b]) => a.localeCompare(b)));
}

const report = {
  schemaVersion: 1,
  scope: 'five-workspace-runtime-plugins-bilingual-source',
  startedAt: new Date().toISOString(),
  testsOnly,
  steps: [],
  browserAcceptance: 'unverified',
  upstreamPlatformIntegration: 'unverified',
  completenessVerified: false,
  inputFiles: await fingerprints(),
};

async function run(id, command, parameters, cwd = root) {
  const started = Date.now();
  let stdout = '';
  let stderr = '';
  const result = await new Promise(resolveResult => {
    let timedOut = false;
    const child = spawn(command, parameters, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); }, 180000);
    const kill = setTimeout(() => child.kill('SIGKILL'), 185000);
    child.once('error', error => {
      clearTimeout(timer); clearTimeout(kill);
      stderr += error.message;
      resolveResult({ exitCode: null, signal: null, timedOut, error: error.code });
    });
    child.once('close', (exitCode, signal) => {
      clearTimeout(timer); clearTimeout(kill);
      resolveResult({ exitCode, signal, timedOut });
    });
  });
  const logFile = `${id}.log`;
  await writeFile(join(output, logFile), `${stdout}\n${stderr}`);
  const step = {
    id, command: [command, ...parameters], cwd, ...result,
    status: result.exitCode === 0 && !result.timedOut ? 'pass' : 'fail',
    elapsedMs: Date.now() - started,
    logFile,
    logSha256: hash(`${stdout}\n${stderr}`),
  };
  report.steps.push(step);
  console.log(`${step.status.toUpperCase()} ${id} (${step.elapsedMs} ms)`);
}

await run('bilingual-behavior', process.execPath, [
  '--test',
  'scripts/tests/harness-plugin-localization.test.mjs',
  'scripts/tests/plugin-locale-host.test.mjs',
  'scripts/tests/plugin-bilingual.test.mjs',
  ...specs.map(([id, testFile]) => `plugins/${id}/${testFile}`),
]);
if (!testsOnly) {
  for (const [id, , typeChecker] of specs) {
    const directory = join(root, 'plugins', id);
    const require = createRequire(join(directory, 'package.json'));
    try {
      await run(`${id}-types`, process.execPath, [
        require.resolve(typeChecker), '--noEmit', '--incremental', 'false', '--composite', 'false', '-p', 'tsconfig.json',
      ], directory);
    } catch (error) {
      report.steps.push({ id: `${id}-types`, status: 'fail', error: error.message });
    }
    await run(`${id}-build`, 'npm', ['run', 'build'], directory);
  }
}
const after = await fingerprints();
report.inputSnapshotStable = JSON.stringify(after) === JSON.stringify(report.inputFiles);
report.completedAt = new Date().toISOString();
report.status = report.steps.every(step => step.status === 'pass') && report.inputSnapshotStable ? 'pass' : 'fail';
await writeFile(join(output, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Report: ${join(output, 'report.json')}`);
console.log(`Source checks: ${report.status}; browser/upstream completeness: unverified`);
process.exitCode = report.status === 'pass' ? 0 : 1;
