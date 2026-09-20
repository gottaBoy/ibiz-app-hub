import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const { build } = require('esbuild');
const ts = require('typescript');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { outputFiles } = await build({
  stdin: {
    contents: `
      export * from './src/locale';
      export { default as zhCN } from './src/locale/zh-CN';
      export { default as en } from './src/locale/en';
    `,
    resolveDir: root,
  },
  bundle: true,
  platform: 'node',
  format: 'cjs',
  write: false,
});

function runtime(ibiz, language) {
  const context = { module: { exports: {} } };
  if (ibiz !== undefined) context.ibiz = ibiz;
  if (language !== undefined) context.navigator = { language };
  vm.runInNewContext(outputFiles[0].text, context);
  return { ...context.module.exports, context };
}

function host(lang = 'en') {
  return {
    lang,
    messages: {},
    merges: [],
    getLang() {
      return this.lang;
    },
    mergeLocaleMessage(locale, messages) {
      this.merges.push(locale);
      this.messages[locale] ??= { aiChat: {} };
      Object.assign(this.messages[locale].aiChat, messages.aiChat);
    },
    t(key, params) {
      assert.equal(arguments.length, 2);
      const value = this.messages[this.lang]?.aiChat[key.split('.')[1]];
      return (
        value?.replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match) ??
        key
      );
    },
  };
}

test('independent dictionaries have identical keys, placeholders and real translations', () => {
  const { zhCN, en, aiChatLocale } = runtime();
  assert.notEqual(zhCN, en);
  assert.equal(aiChatLocale['zh-CN'].aiChat, zhCN);
  assert.equal(aiChatLocale.en.aiChat, en);
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zhCN).sort());
  const placeholders = value =>
    [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();
  for (const key of Object.keys(zhCN)) {
    assert.ok(zhCN[key].trim(), key);
    assert.ok(en[key].trim(), key);
    assert.match(zhCN[key], /[\u3400-\u9fff]/u, key);
    assert.doesNotMatch(en[key], /[\u3400-\u9fff]/u, key);
    assert.notEqual(en[key], key);
    assert.deepEqual(placeholders(en[key]), placeholders(zhCN[key]), key);
  }
});

test('standalone rendering defaults to Chinese without browser or host globals', () => {
  const { t, zhCN, registerAiChatLocale } = runtime();
  assert.doesNotThrow(registerAiChatLocale);
  assert.equal(t('send'), zhCN.send);
  assert.equal(
    t('dataNotFound', { key: 0 }),
    zhCN.dataNotFound.replace('{key}', '0'),
  );
});

test('normalizes host and browser language variants, with host taking precedence', () => {
  for (const lang of [
    'en',
    'en-US',
    'en-GB',
    ' EN-us ',
    'en_US',
    'zh-CN',
    'zh-cn',
  ]) {
    const expected = lang.trim().toLowerCase().startsWith('en') ? 'en' : 'zhCN';
    const local = runtime({ i18n: { getLang: () => lang } }, 'en-GB');
    assert.equal(local.t('send'), local[expected].send, lang);
    const browser = runtime(undefined, lang);
    assert.equal(browser.t('send'), browser[expected].send, lang);
  }
  const unknown = runtime({ i18n: { getLang: () => 'fr' } }, 'en-US');
  assert.equal(unknown.t('send'), unknown.zhCN.send);
  for (const getLang of [
    undefined,
    () => '',
    () => {
      throw new Error('not ready');
    },
  ]) {
    const local = runtime({ i18n: { getLang } }, 'en-US');
    assert.equal(local.t('send'), local.en.send);
  }
});

test('missing, throwing, empty or key-returning translators fall back in the selected language', () => {
  for (const lang of ['en-GB', 'zh-cn']) {
    const translations = [
      undefined,
      () => {
        throw new Error('not ready');
      },
      key => key,
      key => key.split('.')[1],
      () => '',
      () => undefined,
      () => 42,
    ];
    for (const translate of translations) {
      const local = runtime({ i18n: { getLang: () => lang, t: translate } });
      const dict = lang === 'en-GB' ? local.en : local.zhCN;
      assert.equal(
        local.t('sourceSummary', { count: 0 }),
        dict.sourceSummary.replace('{count}', '0'),
      );
      assert.equal(
        local.t('hitSubsections', { count: 0 }),
        dict.hitSubsections.replace('{count}', '0'),
      );
    }
  }
});

test('fallback retains absent placeholders, false, empty strings and literal replacement characters', () => {
  const { t, en } = runtime(undefined, 'en-US');
  assert.equal(t('unsupportedMessage'), en.unsupportedMessage);
  assert.equal(
    t('unsupportedMessage', { type: false }),
    'Unsupported message type: false',
  );
  assert.equal(
    t('unsupportedMessage', { type: '' }),
    'Unsupported message type: ',
  );
  assert.equal(
    t('unsupportedMessage', { type: '$&' }),
    'Unsupported message type: $&',
  );
});

test('registers on first use, preserves receiver and host customizations on repeated use', () => {
  const i18n = host();
  const { t, registerAiChatLocale, context } = runtime({ i18n });
  assert.deepEqual(i18n.merges, []);
  assert.equal(t('maxRecall', { count: 0 }), 'Maximum recall: 0');
  assert.deepEqual(i18n.merges, ['zh-CN', 'en']);
  i18n.messages.en.aiChat.send = 'Custom send';
  registerAiChatLocale();
  assert.equal(t('send'), 'Custom send');
  i18n.lang = 'zh-CN';
  t('send');
  assert.deepEqual(i18n.merges, ['zh-CN', 'en']);
  const second = host();
  context.ibiz = { i18n: second };
  t('send');
  context.ibiz = { i18n };
  i18n.lang = 'en';
  assert.equal(t('send'), 'Custom send');
  assert.deepEqual(i18n.merges, ['zh-CN', 'en']);
  assert.deepEqual(second.merges, ['zh-CN', 'en']);
});

test('late host and partially failed registration retry only unregistered languages', () => {
  const local = runtime(undefined, 'en-US');
  assert.equal(local.t('send'), local.en.send);
  local.context.ibiz = {};
  assert.equal(local.t('send'), local.en.send);
  const i18n = host();
  const merge = i18n.mergeLocaleMessage;
  let ready = false;
  i18n.mergeLocaleMessage = function (lang, messages) {
    if (lang === 'en' && !ready) throw new Error('not initialized');
    merge.call(this, lang, messages);
  };
  local.context.ibiz.i18n = i18n;
  assert.equal(local.t('send'), local.en.send);
  i18n.messages['zh-CN'].aiChat.send = 'Custom Chinese send';
  ready = true;
  assert.equal(local.t('send'), local.en.send);
  assert.deepEqual(i18n.merges, ['zh-CN', 'en']);
  assert.equal(i18n.messages['zh-CN'].aiChat.send, 'Custom Chinese send');
});

test('late merge method, failing service getters and reentrant registration are safe', () => {
  const i18n = host();
  const merge = i18n.mergeLocaleMessage;
  delete i18n.mergeLocaleMessage;
  const local = runtime({ i18n });
  assert.equal(local.t('send'), local.en.send);
  i18n.mergeLocaleMessage = function (lang, messages) {
    local.registerAiChatLocale();
    merge.call(this, lang, messages);
  };
  local.t('send');
  assert.deepEqual(i18n.merges, ['zh-CN', 'en']);
  Object.defineProperty(local.context.ibiz, 'i18n', {
    get() {
      throw new Error('not ready');
    },
  });
  assert.equal(local.t('send'), local.zhCN.send);
  delete local.context.ibiz;
  assert.equal(local.t('send'), local.zhCN.send);
});

test('host mutation of registered messages does not alter local fallback dictionaries', () => {
  const i18n = host();
  const local = runtime({ i18n });
  local.t('send');
  i18n.messages.en.aiChat.send = 'Host customization';
  i18n.t = key => key;
  assert.equal(local.t('send'), 'Send message');
});

test('fold controls translate whole phrases, not concatenated fragments', () => {
  const { t } = runtime(undefined, 'en');
  assert.equal(t('collapseExecutionSteps'), 'Collapse execution steps');
  assert.equal(t('expandExecutionSteps'), 'Expand execution steps');
  assert.equal(t('collapseToolCalls'), 'Collapse tool calls');
  assert.equal(t('expandToolCalls'), 'Expand tool calls');
  for (const name of ['chat-step', 'chat-tool-call']) {
    const content = readFileSync(
      join(root, 'src/components', name, `${name}.tsx`),
      'utf8',
    );
    assert.doesNotMatch(content, /aiChatT\('(executionSteps|toolCall)'\)/);
  }
});

test('source has no Chinese literals or JSX text outside locale and comments', () => {
  const violations = [];
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'locale') walk(path);
      } else if (/\.tsx?$/.test(entry.name)) {
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
            violations.push(`${relative(root, path)}: ${node.text}`);
          }
          ts.forEachChild(node, visit);
        }
        visit(ast);
      }
    }
  }
  walk(join(root, 'src'));
  assert.deepEqual(violations, []);
});
