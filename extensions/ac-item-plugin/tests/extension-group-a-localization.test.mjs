import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const { build } = require('esbuild');
const ts = require('typescript');
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workspaceRoot = resolve(packageRoot, '../..');
const packages = [
  ['ac-item-plugin', 'acItem', 'registerAcItemLocale'],
  ['control-plugin', 'controlPlugin', 'registerControlLocale'],
  ['counter-plugin', 'counterPlugin', 'registerCounterLocale'],
  ['de-action-plugin', 'deAction', 'registerDeActionLocale'],
  ['editor-plugin', 'editorPlugin', 'registerEditorLocale'],
  [
    'form-user-control-plugin',
    'formUserControlPlugin',
    'registerFormUserControlLocale',
  ],
  ['grid-column-plugin', 'gridColumnPlugin', 'registerGridColumnLocale'],
  ['panel-item-plugin', 'panelItemPlugin', 'registerPanelItemLocale'],
  ['portlet-plugin', 'portletPlugin', 'registerPortletLocale'],
  ['toolbar-item-plugin', 'toolbarItemPlugin', 'registerToolbarItemLocale'],
  ['ui-action-plugin', 'uiAction', 'registerUiActionLocale'],
  ['ui-logic-node-plugin', 'uiLogicNode', 'registerUiLogicNodeLocale'],
];

function flatten(value, prefix = '') {
  const result = {};
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === 'string') result[path] = child;
    else Object.assign(result, flatten(child, path));
  }
  return result;
}

function placeholders(value) {
  return [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
}

function loadLocale(id) {
  const entry = join(workspaceRoot, 'extensions', id, 'src/locale/index.ts');
  return build({
    entryPoints: [entry],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node18',
    write: false,
  }).then(({ outputFiles }) => {
    const module = { exports: {} };
    const context = { module, exports: module.exports };
    vm.runInNewContext(outputFiles[0].text, context, { filename: entry });
    return { ...module.exports, context };
  });
}

function setupHost(context, host) {
  if (host === undefined) delete context.ibiz;
  else context.ibiz = { i18n: host };
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//gu, '')
    .replace(/(^|\s)\/\/[^\n]*/gu, '$1');
}

function sourceFiles(directory) {
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'locale') result.push(...sourceFiles(path));
    } else if (/\.(?:ts|tsx)$/u.test(entry.name)) {
      result.push(path);
    }
  }
  return result;
}

test('group A has independent bilingual dictionaries and safe fallback helpers', async () => {
  for (const [id, namespace, registerName] of packages) {
    const locale = await loadLocale(id);
    const chinese = flatten(locale.zhCN[namespace]);
    const english = flatten(locale.en[namespace]);
    assert.notEqual(
      locale.zhCN,
      locale.en,
      `${id} dictionaries are independent`,
    );
    assert.deepEqual(
      Object.keys(chinese).sort(),
      Object.keys(english).sort(),
      id,
    );
    assert.ok(Object.keys(chinese).length > 0, id);
    for (const key of Object.keys(chinese)) {
      assert.match(chinese[key], /[\u3400-\u9fff]/u, `${id}.${key}`);
      assert.doesNotMatch(english[key], /[\u3400-\u9fff]/u, `${id}.${key}`);
      assert.notEqual(chinese[key], english[key], `${id}.${key}`);
      assert.deepEqual(
        placeholders(chinese[key]),
        placeholders(english[key]),
        `${id}.${key}`,
      );
    }
    assert.equal(typeof locale[registerName], 'function', `${id} registration`);

    for (const language of ['zh-cn', 'en-US', 'en-GB']) {
      setupHost(locale.context, {
        getLang: () => language,
        t: key => key,
      });
      const selected = language.startsWith('en') ? english : chinese;
      const key = Object.keys(selected)[0];
      assert.equal(locale.t(key), selected[key], `${id} ${language}`);
    }

    setupHost(locale.context, undefined);
    assert.equal(
      locale.t(Object.keys(chinese)[0]),
      Object.values(chinese)[0],
      `${id} host missing`,
    );
    setupHost(locale.context, {
      getLang: () => 'en-US',
      t: () => {
        throw new Error('host not ready');
      },
    });
    assert.equal(
      locale.t(Object.keys(english)[0]),
      Object.values(english)[0],
      `${id} host throws`,
    );

    if (id === 'de-action-plugin') {
      setupHost(locale.context, { getLang: () => 'en-US', t: key => key });
      assert.equal(
        locale.t('dynamicCodeListItem', { index: 0 }),
        'Dynamic code list item 0',
      );
      setupHost(locale.context, { getLang: () => 'zh-cn', t: key => key });
      assert.equal(
        locale.t('dynamicCodeListItem', { index: 0 }),
        '动态代码表项0',
      );
    }

    const merges = [];
    setupHost(locale.context, {
      mergeLocaleMessage: (language, messages) =>
        merges.push([language, messages]),
    });
    locale[registerName]();
    assert.deepEqual(
      merges.map(([language]) => language).sort(),
      ['en', 'zh-CN'],
      `${id} merge registration`,
    );
  }
});

test('group A entry points register locale without changing provider registrations', () => {
  for (const [id, _namespace, registerName] of packages) {
    const entry = readFileSync(
      join(workspaceRoot, 'extensions', id, 'src/index.ts'),
      'utf8',
    );
    assert.match(entry, /from ['"]\.\/locale['"]/u, `${id} locale import`);
    assert.match(
      entry,
      new RegExp(`${registerName}\\(\\)`),
      `${id} locale call`,
    );
    assert.match(
      entry,
      /register[A-Za-z]+Provider\(/u,
      `${id} provider registration`,
    );
  }
});

test('group A source has no business Chinese literals outside locale and developer logs/comments', () => {
  for (const [id] of packages) {
    const sourceRoot = join(workspaceRoot, 'extensions', id, 'src');
    for (const path of sourceFiles(sourceRoot)) {
      const source = stripComments(readFileSync(path, 'utf8')).replace(
        /ibiz\.log\.[A-Za-z]+\([^;\n]*\);?/gu,
        '',
      );
      const sourceFile = ts.createSourceFile(
        path,
        source,
        ts.ScriptTarget.Latest,
        true,
      );
      let hasBusinessChinese = false;
      function visit(node) {
        if (
          (ts.isStringLiteralLike(node) || ts.isJsxText(node)) &&
          /[\u3400-\u9fff]/u.test(node.text)
        ) {
          hasBusinessChinese = true;
        }
        ts.forEachChild(node, visit);
      }
      visit(sourceFile);
      assert.equal(hasBusinessChinese, false, path);
    }
  }
});
