import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {
  flattenMessages,
  hostRequire,
  repositoryRoot,
} from '../test-support/plugin-locale-runtime.mjs';

const { createI18n } = hostRequire('vue-i18n');
const specs = [
  ['extensions/ac-item-plugin', 'acItem', 't', 'registerAcItemLocale'],
  ['extensions/control-plugin', 'controlPlugin', 't', 'registerControlLocale'],
  ['extensions/counter-plugin', 'counterPlugin', 't', 'registerCounterLocale'],
  ['extensions/de-action-plugin', 'deAction', 't', 'registerDeActionLocale'],
  ['extensions/editor-plugin', 'editorPlugin', 't', 'registerEditorLocale'],
  [
    'extensions/entity-field-grid',
    'entityFieldGrid',
    't',
    'registerEntityFieldGridLocale',
  ],
  [
    'extensions/form-user-control-plugin',
    'formUserControlPlugin',
    't',
    'registerFormUserControlLocale',
  ],
  [
    'extensions/global-plugin',
    'globalPlugin',
    't',
    'registerGlobalPluginLocale',
  ],
  [
    'extensions/grid-column-plugin',
    'gridColumnPlugin',
    't',
    'registerGridColumnLocale',
  ],
  [
    'extensions/panel-item-plugin',
    'panelItemPlugin',
    't',
    'registerPanelItemLocale',
  ],
  ['extensions/portlet-plugin', 'portletPlugin', 't', 'registerPortletLocale'],
  [
    'extensions/replace-default-demo',
    'replaceDefaultDemo',
    't',
    'registerReplaceDefaultDemoLocale',
  ],
  ['extensions/theme-plugin', 'themePlugin', 't', 'registerThemePluginLocale'],
  [
    'extensions/toolbar-item-plugin',
    'toolbarItemPlugin',
    't',
    'registerToolbarItemLocale',
  ],
  ['extensions/ui-action-plugin', 'uiAction', 't', 'registerUiActionLocale'],
  [
    'extensions/ui-logic-node-plugin',
    'uiLogicNode',
    't',
    'registerUiLogicNodeLocale',
  ],
  ['extensions/view-plugin', 'viewPlugin', 't', 'registerViewPluginLocale'],
  ['plugins/ibiz-ai-chat', 'aiChat', 't', 'registerAiChatLocale'],
  ['plugins/ibiz-bi-report', 'biReport', 'biReportT', 'registerBiReportLocale'],
  ['plugins/ibiz-data-view', 'dataView', 'dataViewT', 'registerDataViewLocale'],
  ['plugins/ibiz-gantt', 'gantt', 'translateGantt', 'registerGanttLocale'],
  [
    'plugins/ibiz-template-devtools',
    'devtool',
    'devtoolT',
    'registerDevtoolLocale',
    'helper',
  ],
];

for (const [
  directory,
  namespace,
  translateName,
  registerName,
  entry = 'index',
] of specs) {
  const result = await build({
    stdin: {
      resolveDir: resolve(repositoryRoot, directory),
      contents: `
        export * from './src/locale/${entry}';
        export * as english from './src/locale/en';
        export * as chinese from './src/locale/zh-CN';
      `,
    },
    bundle: true,
    packages: 'external',
    platform: 'node',
    format: 'cjs',
    target: 'node20',
    write: false,
    logLevel: 'silent',
  });
  function fixture() {
    const context = vm.createContext({
      module: { exports: {} },
      require: hostRequire,
    });
    vm.runInContext(result.outputFiles[0].text, context);
    const api = context.module.exports;
    const dictionary = exports => {
      const messages = Object.values(exports).find(
        value => value && typeof value === 'object',
      );
      return flattenMessages(messages[namespace] || messages);
    };
    return {
      context,
      api,
      zh: dictionary(api.chinese),
      en: dictionary(api.english),
      register: () => api[registerName](),
      translate: (key, params = {}, language = 'en') =>
        namespace === 'gantt'
          ? api[translateName](key, language)
          : api[translateName](key, params),
    };
  }

  test(`${directory}: every key switches underscore and regional aliases with a real formatter`, () => {
    const f = fixture();
    const formatter = createI18n({
      legacy: false,
      locale: 'zh-CN',
      fallbackLocale: 'zh-CN',
      missingWarn: false,
      fallbackWarn: false,
    }).global;
    f.context.ibiz = {
      i18n: {
        getLang: () => formatter.locale.value,
        mergeLocaleMessage: formatter.mergeLocaleMessage.bind(formatter),
        t(tag, fallbackOrParams, params) {
          return typeof fallbackOrParams === 'string'
            ? formatter.t(tag, params ?? {}, {
                ...params,
                default: fallbackOrParams,
              })
            : formatter.t(tag, fallbackOrParams ?? {});
        },
      },
    };
    for (const language of [
      'zh-CN',
      'en_US',
      'zh_CN',
      'en-GB',
      'zh-cn',
      'EN_us',
    ]) {
      formatter.locale.value = language;
      f.register();
      const dictionary = /^en/i.test(language) ? f.en : f.zh;
      for (const [key, expected] of Object.entries(dictionary)) {
        const params = Object.fromEntries(
          [...expected.matchAll(/\{(\w+)\}/g)].map(match => [match[1], 0]),
        );
        assert.equal(
          f.translate(key, params, language),
          expected.replace(/\{(\w+)\}/g, '0'),
          `${language}:${key}`,
        );
      }
    }
  });

  test(`${directory}: unavailable host properties cannot break import, registration or translation`, () => {
    const f = fixture();
    const key = Object.keys(f.zh)[0];
    const fail = () => {
      throw new Error('Locale service unavailable');
    };
    const check = expected => {
      assert.doesNotThrow(f.register);
      assert.equal(f.translate(key), expected);
    };
    Object.defineProperty(f.context, 'ibiz', { configurable: true, get: fail });
    check(namespace === 'gantt' ? f.en[key] : f.zh[key]);
    Object.defineProperty(f.context, 'ibiz', {
      configurable: true,
      writable: true,
      value: {},
    });
    Object.defineProperty(f.context.ibiz, 'i18n', { get: fail });
    check(namespace === 'gantt' ? f.en[key] : f.zh[key]);
    for (const member of ['getLang', 't', 'mergeLocaleMessage']) {
      const host = { getLang: () => 'en_US', t: tag => tag };
      Object.defineProperty(host, member, { get: fail });
      f.context.ibiz = { i18n: host };
      check(
        member === 'getLang' && namespace !== 'gantt' ? f.zh[key] : f.en[key],
      );
    }
    const broken = vm.createContext({
      module: { exports: {} },
      require: hostRequire,
    });
    Object.defineProperty(broken, 'ibiz', { get: fail });
    assert.doesNotThrow(() =>
      vm.runInContext(result.outputFiles[0].text, broken),
    );
  });

  test(`${directory}: host-formatted user text is never interpolated twice`, () => {
    const f = fixture();
    const key = Object.keys(f.en)[0];
    const params = { name: 'Customer {count} $&', count: 0 };
    f.context.ibiz = {
      i18n: {
        getLang: () => 'en',
        t() {
          return `Custom ${params.name}`;
        },
      },
    };
    assert.equal(f.translate(key, params), 'Custom Customer {count} $&');
    assert.equal(params.name, 'Customer {count} $&');
  });
}
