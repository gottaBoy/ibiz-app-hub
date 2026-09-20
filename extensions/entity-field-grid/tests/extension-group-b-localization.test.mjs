import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { build } from 'esbuild';
import { join, relative, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const testRoot = resolve(
  join(fileURLToPath(new URL('.', import.meta.url)), '..'),
);
const repoRoot = resolve(testRoot, '../..');
const extensions = {
  entityFieldGrid: {
    directory: join(repoRoot, 'extensions/entity-field-grid'),
    namespace: 'entityFieldGrid',
    zh: 'entityFieldGridZhCN',
    en: 'entityFieldGridEn',
    translate: 'entityFieldGridT',
  },
  viewPlugin: {
    directory: join(repoRoot, 'extensions/view-plugin'),
    namespace: 'viewPlugin',
    zh: 'viewPluginZhCN',
    en: 'viewPluginEn',
    translate: 'viewPluginT',
  },
};

async function loadLocale(extension) {
  const result = await build({
    entryPoints: [join(extension.directory, 'src/locale/index.ts')],
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node20',
    write: false,
    logLevel: 'silent',
  });
  const module = { exports: {} };
  new Function('module', 'exports', result.outputFiles[0].text)(
    module,
    module.exports,
  );
  return module.exports;
}

const loaded = Object.fromEntries(
  await Promise.all(
    Object.entries(extensions).map(async ([name, extension]) => [
      name,
      { ...extension, module: await loadLocale(extension) },
    ]),
  ),
);

function leafMessages(value, prefix = '', result = {}) {
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === 'string') result[path] = child;
    else leafMessages(child, path, result);
  }
  return result;
}

function placeholders(value) {
  return [...value.matchAll(/\{(\w+)\}/g)]
    .map(match => match[1])
    .sort();
}

function readMessage(messages, tag) {
  return tag.split('.').reduce((value, key) => value?.[key], messages);
}

function merge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === 'object'
    ) {
      merge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function createHost(language, initial = {}) {
  const host = {
    language,
    messages: structuredClone(initial),
    merges: [],
    getLang() {
      return this.language;
    },
    mergeLocaleMessage(locale, messages) {
      this.merges.push(locale);
      this.messages[locale] = merge(this.messages[locale] || {}, messages);
    },
    t(tag, _fallback, params = {}) {
      const locale = params.locale || this.language;
      return readMessage(this.messages[locale], tag) || tag;
    },
  };
  return host;
}

function setHost(t, host) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'ibiz');
  Object.defineProperty(globalThis, 'ibiz', {
    value: host ? { i18n: host } : undefined,
    configurable: true,
    writable: true,
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'ibiz', previous);
    else delete globalThis.ibiz;
  });
}

function interpolate(value, params) {
  return value.replace(/\{(\w+)\}/g, (token, key) =>
    Object.prototype.hasOwnProperty.call(params, key)
      ? String(params[key])
      : token,
  );
}

test('entity-field-grid and view-plugin dictionaries have matching keys', () => {
  for (const extension of Object.values(loaded)) {
    const chinese = extension.module[extension.zh][extension.namespace];
    const english = extension.module[extension.en][extension.namespace];
    const zhMessages = leafMessages(chinese);
    const enMessages = leafMessages(english);
    assert.deepEqual(Object.keys(zhMessages).sort(), Object.keys(enMessages).sort());
    for (const key of Object.keys(zhMessages)) {
      assert.ok(zhMessages[key].trim(), key);
      assert.ok(enMessages[key].trim(), key);
      assert.doesNotMatch(enMessages[key], /[\u3400-\u9fff]/u, key);
      assert.deepEqual(placeholders(zhMessages[key]), placeholders(enMessages[key]), key);
    }
  }
});

test('local helpers support aliases, invalid hosts, and zero interpolation', () => {
  for (const extension of Object.values(loaded)) {
    const zh = extension.module[extension.zh][extension.namespace];
    const en = extension.module[extension.en][extension.namespace];
    const translate = extension.module[extension.translate];
    for (const [language, dictionary] of [
      ['zh-CN', zh],
      ['zh-cn', zh],
      ['en', en],
      ['en-US', en],
      ['en-GB', en],
    ]) {
      globalThis.ibiz = {
        i18n: {
          language,
          getLang() { return this.language; },
          t: tag => tag,
        },
      };
      const key = extension.namespace === 'viewPlugin' ? 'footer' : 'itemsSelected';
      assert.equal(
        translate(key, { length: 0 }),
        interpolate(dictionary[key], { length: 0 }),
      );
    }
    delete globalThis.ibiz;
    assert.equal(translate('footer' in zh ? 'footer' : 'empty'), zh.footer || zh.empty);
    for (const host of [
      undefined,
      {},
      { getLang: () => { throw new Error('not ready'); } },
      { getLang: () => 'en-US', t: () => { throw new Error('not ready'); } },
      { getLang: () => 'en-US', t: tag => tag },
      { getLang: () => 'en-US', t: tag => tag.split('.')[1] },
      { getLang: () => 'en-US', t: () => '' },
      { getLang: () => 'en-US', t: () => 0 },
    ]) {
      globalThis.ibiz = host ? { i18n: host } : undefined;
      let dictionary = zh;
      try {
        const language = host?.getLang?.();
        if (typeof language === 'string' && language.toLowerCase().startsWith('en')) {
          dictionary = en;
        }
      } catch {
        dictionary = zh;
      }
      const key = extension.namespace === 'viewPlugin' ? 'footer' : 'add';
      assert.equal(
        translate(key),
        dictionary[key],
      );
    }
  }
  delete globalThis.ibiz;
});

test('registration and language switching preserve host data and user model data', t => {
  const userModel = {
    id: 'customer_grid',
    caption: '客户名称',
    protocolField: 'srfkey',
  };
  const userData = {
    srfkey: 'customer-001',
    customer_name: '用户数据',
  };
  const modelSnapshot = structuredClone(userModel);
  const dataSnapshot = structuredClone(userData);

  for (const extension of Object.values(loaded)) {
    const customKey = `${extension.namespace}.${extension.namespace === 'viewPlugin' ? 'footer' : 'add'}`;
    const host = createHost('zh-CN', {
      en: {
        [extension.namespace]: {
          [extension.namespace === 'viewPlugin' ? 'footer' : 'add']:
            'Host customization',
        },
      },
      'en-US': {
        [extension.namespace]: {
          [extension.namespace === 'viewPlugin' ? 'footer' : 'add']:
            'Host customization',
        },
      },
    });
    setHost(t, host);
    const register = extension.module[
      extension.namespace === 'viewPlugin'
        ? 'registerViewPluginLocale'
        : 'registerEntityFieldGridLocale'
    ];
    const translate = extension.module[extension.translate];
    register();
    assert.ok(host.merges.includes('zh-CN'));
    assert.ok(host.merges.includes('en'));
    const key = extension.namespace === 'viewPlugin' ? 'footer' : 'add';
    assert.equal(
      translate(key),
      extension.module[extension.zh][extension.namespace][key],
    );
    host.language = 'en-US';
    assert.equal(translate(key), 'Host customization');
    assert.ok(host.merges.includes('en-US'));
    assert.equal(customKey, `${extension.namespace}.${key}`);
    assert.deepEqual(userModel, modelSnapshot);
    assert.deepEqual(userData, dataSnapshot);
  }
});

test('component source routes owned UI text through locale keys without translating model data', () => {
  const expectations = {
    entityFieldGrid: [
      "entityFieldGridT('empty')",
      "entityFieldGridT('itemsSelected'",
      "entityFieldGridT('loadMore')",
      "entityFieldGridT('add')",
      "entityFieldGridT('errors.tableReference')",
      "entityFieldGridT('errors.rowDom')",
      "entityFieldGridT('errors.popover')",
    ],
    viewPlugin: [
      "viewPluginT('emptyViewType'",
      "viewPluginT('noTeleportTag'",
      "viewPluginT('footer')",
    ],
  };
  const violations = [];
  for (const extension of Object.values(loaded)) {
    const sourceFiles = [];
    function walk(directory) {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'locale') walk(path);
        } else if (/\.(?:ts|tsx)$/u.test(entry.name)) {
          sourceFiles.push(path);
        }
      }
    }
    walk(join(extension.directory, 'src'));
    const source = sourceFiles.map(path => readFileSync(path, 'utf8')).join('\n');
    for (const expected of expectations[extension.namespace]) {
      assert.match(source, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }
    for (const path of sourceFiles) {
      const ast = ts.createSourceFile(
        path,
        readFileSync(path, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
      );
      function visit(node) {
        if (
          (ts.isStringLiteralLike(node) ||
            ts.isTemplateHead(node) ||
            ts.isTemplateMiddle(node) ||
            ts.isTemplateTail(node) ||
            ts.isJsxText(node)) &&
          /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u.test(node.text)
        ) {
          violations.push(`${relative(repoRoot, path)}: ${node.text}`);
        }
        ts.forEachChild(node, visit);
      }
      visit(ast);
    }
  }
  assert.deepEqual(violations, []);
});
