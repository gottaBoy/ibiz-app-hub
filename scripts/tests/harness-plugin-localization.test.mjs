import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import {
  auditPluginLocalization,
  EXPECTED_PLUGINS,
} from '../harness-plugin-localization.mjs';

function write(path, content) {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content);
}

function fixture(t, source = '') {
  const root = mkdtempSync(join(tmpdir(), 'harness-plugin-localization-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const plugin of EXPECTED_PLUGINS) {
    const base = join(root, plugin, 'src');
    write(join(base, 'index.ts'), "import { registerLocale } from './locale'; registerLocale();\n");
    write(join(base, 'locale', 'index.ts'), 'export function registerLocale() {};\n');
    write(join(base, 'locale', 'zh-CN', 'index.ts'), 'export default { plugin: { label: "中文" } };\n');
    write(join(base, 'locale', 'en', 'index.ts'), 'export default { plugin: { label: "English" } };\n');
    write(join(base, 'component.tsx'), source);
  }
  return root;
}

test('requires all plugin locale resources and registration', t => {
  const root = fixture(t);
  const report = auditPluginLocalization({ plugins: root });
  assert.equal(report.contractPass, true);
  assert.equal(report.completenessVerified, false);
  assert.equal(report.summary.passed, EXPECTED_PLUGINS.length);
});

test('ignores comments and reports hardcoded CJK as an audit warning', t => {
  const root = fixture(t, '// 中文注释\nconst label = "需要翻译";\n');
  const report = auditPluginLocalization({ plugins: root });
  assert.equal(report.contractPass, true);
  assert.equal(report.completenessVerified, false);
  assert.equal(report.summary.hardcodedCjkLiterals, EXPECTED_PLUGINS.length);
  assert.ok(report.plugins[0].warnings.some(value =>
    typeof value === 'object' && value.code === 'hardcoded-cjk-literal',
  ));
});

test('reports untranslated template text without rejecting a valid locale contract', t => {
  const root = fixture(t, '<template><span>需要翻译</span></template>\n');
  const report = auditPluginLocalization({ plugins: root });
  assert.equal(report.contractPass, true);
  assert.equal(report.summary.hardcodedCjkLiterals, EXPECTED_PLUGINS.length);
});

test('ignores HTML comments', t => {
  const root = fixture(t, '<!-- 中文注释 --><template><span>translated</span></template>\n');
  const report = auditPluginLocalization({ plugins: root });
  assert.equal(report.contractPass, true);
});

test('reports missing plugin directories without mutating inputs', t => {
  const root = mkdtempSync(join(tmpdir(), 'harness-plugin-localization-empty-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const report = auditPluginLocalization({ plugins: root });
  assert.equal(report.summary.failed, EXPECTED_PLUGINS.length);
  assert.equal(report.contractPass, false);
});
