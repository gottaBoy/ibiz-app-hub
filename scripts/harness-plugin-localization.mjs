#!/usr/bin/env node

import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const workspaceRoot = resolve(dirname(scriptPath), '..');

export const EXPECTED_PLUGINS = Object.freeze([
  'ibiz-ai-chat',
  'ibiz-bi-report',
  'ibiz-data-view',
  'ibiz-gantt',
  'ibiz-template-devtools',
]);

export const DEFAULT_INPUTS = Object.freeze({
  plugins: resolve(workspaceRoot, 'plugins'),
  output: resolve(workspaceRoot, '..', '.artifacts', 'plugin-localization'),
});

const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.vue']);
const cjkPattern = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;

function isSourceFile(name) {
  return sourceExtensions.has(name.slice(name.lastIndexOf('.')).toLowerCase());
}

function sourceFiles(root) {
  const files = [];
  const visit = directory => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'locale' && entry.name !== 'dist') visit(path);
      } else if (entry.isFile() && isSourceFile(entry.name)) {
        files.push(path);
      }
    }
  };
  visit(root);
  return files;
}

// Extract quoted literals while ignoring comments. This is deliberately bounded
// to the source shapes used by the plugins; it is not a JavaScript parser.
function cjkLiterals(source) {
  const findings = [];
  const rawLines = new Set();
  let index = 0;
  let line = 1;
  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];
    if (char === '/' && next === '/') {
      index += 2;
      while (index < source.length && source[index] !== '\n') index += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      index += 2;
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
        if (source[index] === '\n') line += 1;
        index += 1;
      }
      index += 2;
      continue;
    }
    if (source.startsWith('<!--', index)) {
      index += 4;
      while (index < source.length && !source.startsWith('-->', index)) {
        if (source[index] === '\n') line += 1;
        index += 1;
      }
      index += 3;
      continue;
    }
    if (!['"', "'", '`'].includes(char)) {
      if (cjkPattern.test(char) && !rawLines.has(line)) {
        rawLines.add(line);
        const lineEnd = source.indexOf('\n', index);
        findings.push({
          line,
          literal: source.slice(index, lineEnd < 0 ? source.length : lineEnd).trim().slice(0, 180),
        });
      }
      if (char === '\n') line += 1;
      index += 1;
      continue;
    }

    const quote = char;
    const startLine = line;
    const start = index;
    let value = '';
    index += 1;
    while (index < source.length) {
      const current = source[index];
      if (current === '\\') {
        value += source[index];
        value += source[index + 1] || '';
        index += 2;
        continue;
      }
      if (current === quote) {
        index += 1;
        break;
      }
      value += current;
      if (current === '\n') line += 1;
      index += 1;
    }
    if (cjkPattern.test(value)) {
      findings.push({
        line: startLine,
        literal: source.slice(start, index).replace(/\s+/g, ' ').slice(0, 180),
      });
    }
  }
  return findings;
}

function inspectPlugin(pluginsRoot, id) {
  const root = join(pluginsRoot, id);
  const violations = [];
  if (!statSafe(root)?.isDirectory()) {
    return { id, status: 'fail', locale: null, sourceFiles: 0, violations: ['plugin-directory-missing'] };
  }

  const locale = {
    directory: join(root, 'src', 'locale'),
    files: {
      index: [join(root, 'src', 'locale', 'index.ts')],
      zhCN: [
        join(root, 'src', 'locale', 'zh-CN', 'index.ts'),
        join(root, 'src', 'locale', 'zh-CN.ts'),
      ],
      en: [
        join(root, 'src', 'locale', 'en', 'index.ts'),
        join(root, 'src', 'locale', 'en.ts'),
      ],
    },
  };
  const localeFiles = {};
  for (const [name, candidates] of Object.entries(locale.files)) {
    const path = candidates.find(candidate => statSafe(candidate)?.isFile());
    localeFiles[name] = path || null;
    if (!path) violations.push(`locale-${name}-missing`);
  }

  const files = sourceFiles(join(root, 'src'));
  let cjkCount = 0;
  const warnings = [];
  for (const path of files) {
    const findings = cjkLiterals(readFileSync(path, 'utf8'));
    if (findings.length > 0) {
      cjkCount += findings.length;
      warnings.push({
        code: 'hardcoded-cjk-literal',
        file: path.slice(root.length + 1),
        findings,
      });
    }
  }

  const entry = files.map(path => readFileSync(path, 'utf8')).join('\n');
  const registersLocale =
    /register[A-Za-z]*Locale\s*\(\s*\)\s*;/u.test(entry) ||
    /mergeLocaleMessage\s*\(/u.test(entry);
  if (!registersLocale) violations.push('locale-registration-missing');
  const localeSource = Object.values(localeFiles)
    .filter(Boolean)
    .map(path => readFileSync(path, 'utf8'))
    .join('\n');
  if (!cjkPattern.test(localeSource)) violations.push('locale-zh-cn-content-missing');
  if (!/[A-Za-z]/u.test(localeSource)) violations.push('locale-en-content-missing');

  return {
    id,
    status: violations.length === 0 ? 'pass' : 'fail',
    locale: {
      files: Object.fromEntries(
        Object.entries(localeFiles).map(([name, path]) => [name, Boolean(path)]),
      ),
      registersLocale,
    },
    sourceFiles: files.length,
    hardcodedCjkLiterals: cjkCount,
    violations,
    warnings,
  };
}

function statSafe(path) {
  try {
    return statSync(path);
  } catch {
    return null;
  }
}

export function auditPluginLocalization(options = {}) {
  const pluginsRoot = resolve(options.plugins ?? DEFAULT_INPUTS.plugins);
  const plugins = EXPECTED_PLUGINS.map(id => inspectPlugin(pluginsRoot, id));
  return {
    generatedAt: new Date().toISOString(),
    scope: 'static-resource-registration-audit',
    completenessVerified: false,
    remainingAcceptance: ['translation-behavior', 'browser-workflows', 'source-builds'],
    inputs: { plugins: pluginsRoot },
    expectedPlugins: [...EXPECTED_PLUGINS],
    plugins,
    summary: {
      total: plugins.length,
      passed: plugins.filter(plugin => plugin.status === 'pass').length,
      failed: plugins.filter(plugin => plugin.status === 'fail').length,
      hardcodedCjkLiterals: plugins.reduce(
        (count, plugin) => count + (plugin.hardcodedCjkLiterals || 0),
        0,
      ),
      warningPlugins: plugins.filter(plugin => plugin.warnings?.length > 0).length,
    },
    contractPass: plugins.every(plugin => plugin.status === 'pass'),
  };
}

function writeReport(report, outputRoot) {
  mkdirSync(outputRoot, { recursive: true });
  const run = new Date().toISOString().replace(/[:.]/g, '-');
  const directory = join(outputRoot, run);
  mkdirSync(directory, { recursive: true });
  const reportPath = join(directory, 'report.json');
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  return { directory, reportPath };
}

function printHelp() {
  console.log(`Usage: node scripts/harness-plugin-localization.mjs [options]

Options:
  --plugins <path>  Plugin workspace root
  --output <path>   Artifact root
  --help            Show this help
`);
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help') return { help: true };
    if (arg === '--plugins' || arg === '--output') {
      const value = argv[++index];
      if (!value) throw new Error(`${arg} requires a value`);
      options[arg.slice(2)] = value;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      process.exit(0);
    }
    const report = auditPluginLocalization(options);
    const artifacts = writeReport(report, resolve(options.output ?? DEFAULT_INPUTS.output));
    console.log(JSON.stringify({
      ...report.summary,
      contractPass: report.contractPass,
      completenessVerified: report.completenessVerified,
      scope: report.scope,
      report: artifacts.reportPath,
    }, null, 2));
    process.exit(report.contractPass ? 0 : 1);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  }
}
