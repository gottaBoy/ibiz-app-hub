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

export const EXPECTED_EXTENSIONS = Object.freeze([
  'ac-item-plugin',
  'control-plugin',
  'counter-plugin',
  'de-action-plugin',
  'editor-plugin',
  'entity-field-grid',
  'form-user-control-plugin',
  'global-plugin',
  'grid-column-plugin',
  'panel-item-plugin',
  'portlet-plugin',
  'replace-default-demo',
  'theme-plugin',
  'toolbar-item-plugin',
  'ui-action-plugin',
  'ui-logic-node-plugin',
  'view-plugin',
]);

export const DEFAULT_INPUTS = Object.freeze({
  extensions: resolve(workspaceRoot, 'extensions'),
  output: resolve(workspaceRoot, '..', '.artifacts', 'extension-localization'),
});

const cjk = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;
const sourcePattern = /\.(?:[cm]?[jt]sx?|vue)$/iu;

function safeStat(path) {
  try {
    return statSync(path);
  } catch {
    return undefined;
  }
}

function files(root) {
  const result = [];
  const visit = directory => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!['node_modules', 'dist', 'es', 'lib', '.git', 'locale'].includes(entry.name)) {
          visit(path);
        }
      } else if (entry.isFile() && sourcePattern.test(entry.name)) {
        result.push(path);
      }
    }
  };
  visit(root);
  return result;
}

function stripComments(source) {
  return source
    .replace(/<!--[\s\S]*?-->/gu, '')
    .replace(/\/\*[\s\S]*?\*\//gu, '')
    .replace(/(^|\s)\/\/[^\n]*/gu, '$1');
}

function sourceCjk(source) {
  const value = stripComments(source);
  const findings = [];
  value.split('\n').forEach((line, index) => {
    if (!cjk.test(line)) return;
    const normalized = line.trim();
    if (normalized) findings.push({ line: index + 1, text: normalized.slice(0, 180) });
  });
  return findings;
}

function translationKeys(source) {
  const keys = [];
  for (const match of source.matchAll(/['"`]([^'"`]*\{?\w*[^'"`]*)['"`]/gu)) {
    const value = match[1];
    if (value && !cjk.test(value) && !value.includes('http')) keys.push(value);
  }
  return [...new Set(keys)].sort();
}

function localeCandidates(root) {
  const directory = join(root, 'src', 'locale');
  const candidates = {
    index: [join(directory, 'index.ts'), join(directory, 'index.js')],
    zhCN: [
      join(directory, 'zh-CN.ts'),
      join(directory, 'zh-CN.js'),
      join(directory, 'zh-CN', 'index.ts'),
      join(directory, 'zh-CN', 'index.js'),
    ],
    en: [
      join(directory, 'en.ts'),
      join(directory, 'en.js'),
      join(directory, 'en', 'index.ts'),
      join(directory, 'en', 'index.js'),
    ],
  };
  return Object.fromEntries(
    Object.entries(candidates).map(([name, values]) => [
      name,
      values.find(path => safeStat(path)?.isFile()) || null,
    ]),
  );
}

function inspect(extensionsRoot, id) {
  const root = join(extensionsRoot, id);
  if (!safeStat(root)?.isDirectory()) {
    return { id, status: 'fail', violations: ['extension-directory-missing'], warnings: [] };
  }
  const locale = localeCandidates(root);
  const violations = [];
  for (const name of ['index', 'zhCN', 'en']) {
    if (!locale[name]) violations.push(`locale-${name}-missing`);
  }
  const localeText = Object.values(locale)
    .filter(Boolean)
    .map(path => readFileSync(path, 'utf8'))
    .join('\n');
  if (locale.en && cjk.test(readFileSync(locale.en, 'utf8'))) {
    violations.push('english-locale-contains-cjk');
  }
  if (!cjk.test(localeText)) violations.push('chinese-locale-content-missing');
  if (!/[A-Za-z]{2,}/u.test(localeText)) violations.push('english-locale-content-missing');

  const source = files(join(root, 'src'));
  const sourceText = source.map(path => readFileSync(path, 'utf8')).join('\n');
  if (!/register[A-Za-z]*Locale\s*\(/u.test(sourceText) &&
      !/mergeLocaleMessage\s*\(/u.test(sourceText)) {
    violations.push('locale-registration-missing');
  }
  const warnings = source
    .flatMap(path => sourceCjk(readFileSync(path, 'utf8')).map(finding => ({
      code: 'source-cjk-audit',
      file: path.slice(root.length + 1),
      ...finding,
    })));
  return {
    id,
    status: violations.length ? 'fail' : 'pass',
    locale: Object.fromEntries(Object.entries(locale).map(([name, path]) => [name, Boolean(path)])),
    sourceFiles: source.length,
    sourceTranslationKeys: translationKeys(sourceText).length,
    warnings,
    violations,
  };
}

export function auditExtensionLocalization(options = {}) {
  const extensionsRoot = resolve(options.extensions ?? DEFAULT_INPUTS.extensions);
  const extensions = EXPECTED_EXTENSIONS.map(id => inspect(extensionsRoot, id));
  return {
    generatedAt: new Date().toISOString(),
    scope: 'workspace-extension-locale-contract',
    completenessVerified: false,
    expectedExtensions: [...EXPECTED_EXTENSIONS],
    extensions,
    summary: {
      total: extensions.length,
      passed: extensions.filter(item => item.status === 'pass').length,
      failed: extensions.filter(item => item.status === 'fail').length,
      sourceCjkWarnings: extensions.reduce((sum, item) => sum + item.warnings.length, 0),
    },
    contractPass: extensions.every(item => item.status === 'pass'),
  };
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--help') return { help: true };
    if (arg === '--extensions' || arg === '--output') {
      const value = argv[++index];
      if (!value) throw new Error(`${arg} requires a value`);
      options[arg.slice(2)] = value;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
}

function writeReport(report, outputRoot) {
  mkdirSync(outputRoot, { recursive: true });
  const run = new Date().toISOString().replace(/[:.]/gu, '-');
  const directory = join(outputRoot, run);
  mkdirSync(directory, { recursive: true });
  const path = join(directory, 'report.json');
  writeFileSync(path, `${JSON.stringify(report, null, 2)}\n`);
  return path;
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log('Usage: node scripts/harness-extension-localization.mjs [--extensions path] [--output path]');
      process.exit(0);
    }
    const report = auditExtensionLocalization(options);
    const path = writeReport(report, resolve(options.output ?? DEFAULT_INPUTS.output));
    console.log(JSON.stringify({ ...report.summary, contractPass: report.contractPass, report: path }, null, 2));
    process.exit(report.contractPass ? 0 : 1);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(2);
  }
}
