import assert from 'node:assert/strict';
import test from 'node:test';
import {
  flattenMessages,
  hostRequire,
  loadLocaleModule,
  placeholders,
} from '../test-support/plugin-locale-runtime.mjs';

const { createI18n } = hostRequire('vue-i18n');
const pluginIds = [
  'ibiz-ai-chat', 'ibiz-bi-report', 'ibiz-data-view', 'ibiz-gantt', 'ibiz-template-devtools',
];

async function loadPlugin(id) {
  const root = `plugins/${id}/src/locale`;
  const module = await loadLocaleModule(`${root}/index.ts`);
  if (id === 'ibiz-ai-chat') return {
    namespace: 'aiChat',
    chinese: module.aiChatLocale['zh-CN'].aiChat,
    english: module.aiChatLocale.en.aiChat,
    translate: module.t,
  };
  if (id === 'ibiz-bi-report') return {
    namespace: 'biReport',
    chinese: (await loadLocaleModule(`${root}/zh-CN.ts`)).default,
    english: (await loadLocaleModule(`${root}/en.ts`)).default,
    translate: module.biReportT,
  };
  if (id === 'ibiz-data-view') return {
    namespace: 'dataView',
    chinese: module.dataViewZhCN.dataView,
    english: module.dataViewEn.dataView,
    translate: module.dataViewT,
  };
  if (id === 'ibiz-gantt') return {
    namespace: 'gantt',
    chinese: module.zhCN,
    english: module.en,
    translate: (key, _params, language) => module.translateGantt(key, language),
    register: module.registerGanttLocale,
  };
  const helper = await loadLocaleModule(`${root}/helper.ts`);
  return {
    namespace: 'devtool',
    chinese: module.zhCn.devtool,
    english: module.en.devtool,
    translate: helper.devtoolT,
    register: helper.registerDevtoolLocale,
  };
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

function parameters(value) {
  return Object.fromEntries(placeholders(value).map(key => [key, 0]));
}

function interpolate(value, params) {
  return value.replace(/\{(\w+)\}/g, (_match, key) => String(params[key]));
}

for (const id of pluginIds) {
  test(`${id}: independent Chinese and English resources cover the same messages`, async () => {
    const plugin = await loadPlugin(id);
    const chinese = flattenMessages(plugin.chinese);
    const english = flattenMessages(plugin.english);
    assert.ok(Object.keys(chinese).length > 0);
    assert.deepEqual(Object.keys(chinese).sort(), Object.keys(english).sort());
    for (const [key, value] of Object.entries(chinese)) {
      assert.ok(value.trim(), key);
      assert.ok(english[key].trim(), key);
      assert.doesNotMatch(english[key], /[\u3400-\u9fff]/u, `${id}.${key} is not translated`);
      assert.deepEqual(placeholders(value), placeholders(english[key]), key);
    }
  });

  for (const language of ['zh-CN', 'zh-cn', 'en', 'en-US', 'en-GB']) {
    test(`${id}: all ${language} messages resolve with the real vue-i18n formatter`, async t => {
      const formatter = createI18n({
        legacy: false,
        locale: language,
        fallbackLocale: language.startsWith('en') ? 'en' : 'zh-CN',
        missingWarn: false,
        fallbackWarn: false,
      }).global;
      setHost(t, {
        getLang: () => language,
        t: (key, fallbackOrParams, params) => typeof fallbackOrParams === 'string'
          ? formatter.t(key, params ?? {}, { ...params, default: fallbackOrParams })
          : formatter.t(key, fallbackOrParams ?? {}),
        mergeLocaleMessage: formatter.mergeLocaleMessage.bind(formatter),
      });
      const plugin = await loadPlugin(id);
      plugin.register?.();
      const expected = flattenMessages(language.startsWith('en') ? plugin.english : plugin.chinese);
      for (const [key, value] of Object.entries(expected)) {
        const params = parameters(value);
        assert.equal(plugin.translate(key, params, language), interpolate(value, params), `${id}.${key}`);
      }
    });
  }

  for (const language of ['zh-CN', 'en-US']) {
    test(`${id}: ${language} fallback resolves every message when the host returns raw keys`, async t => {
      setHost(t, { getLang: () => language, t: key => key });
      const plugin = await loadPlugin(id);
      const expected = flattenMessages(language.startsWith('en') ? plugin.english : plugin.chinese);
      for (const [key, value] of Object.entries(expected)) {
        const params = parameters(value);
        assert.equal(plugin.translate(key, params, language), interpolate(value, params), `${id}.${key}`);
      }
    });
  }
}
