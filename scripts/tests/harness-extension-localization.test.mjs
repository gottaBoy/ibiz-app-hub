import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import {
  auditExtensionLocalization,
  EXPECTED_EXTENSIONS,
} from '../harness-extension-localization.mjs';

function write(path, content) {
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, content);
}

function fixture(t, source = '') {
  const root = mkdtempSync(join(tmpdir(), 'harness-extension-localization-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const id of EXPECTED_EXTENSIONS) {
    const base = join(root, id, 'src');
    write(join(base, 'index.ts'), "import { registerExtensionLocale } from './locale'; registerExtensionLocale();\n");
    write(join(base, 'locale', 'index.ts'), 'export function registerExtensionLocale() {}\n');
    write(join(base, 'locale', 'zh-CN.ts'), 'export default { label: "中文" };\n');
    write(join(base, 'locale', 'en.ts'), 'export default { label: "English" };\n');
    write(join(base, 'component.tsx'), source);
  }
  return root;
}

test('checks every extension locale contract', t => {
  const report = auditExtensionLocalization({ extensions: fixture(t) });
  assert.equal(report.contractPass, true);
  assert.equal(report.summary.passed, EXPECTED_EXTENSIONS.length);
});

test('keeps source CJK as an audit warning instead of confusing it with locale completeness', t => {
  const report = auditExtensionLocalization({
    extensions: fixture(t, '// 中文注释\nconst label = "内置中文";\n'),
  });
  assert.equal(report.contractPass, true);
  assert.equal(report.summary.sourceCjkWarnings, EXPECTED_EXTENSIONS.length);
});
