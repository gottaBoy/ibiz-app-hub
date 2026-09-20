import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { loadLocaleModule, flattenMessages } from '../scripts/test-support/plugin-locale-runtime.mjs';

const groups = [
  {
    id: 'global-plugin',
    locale: 'extensions/global-plugin/src/locale/index.ts',
    namespace: 'globalPlugin',
    resource: 'globalPluginLocale',
    translate: 'globalPluginT',
    register: 'registerGlobalPluginLocale',
    normalize: 'normalizeGlobalPluginLocale',
  },
  {
    id: 'replace-default-demo',
    locale: 'extensions/replace-default-demo/src/locale/index.ts',
    namespace: 'replaceDefaultDemo',
    resource: 'replaceDefaultDemoLocale',
    translate: 'replaceDefaultDemoT',
    register: 'registerReplaceDefaultDemoLocale',
    normalize: 'normalizeReplaceDefaultDemoLocale',
  },
  {
    id: 'theme-plugin',
    locale: 'extensions/theme-plugin/src/locale/index.ts',
    namespace: 'themePlugin',
    resource: 'themePluginLocale',
    translate: 'themePluginT',
    register: 'registerThemePluginLocale',
    normalize: 'normalizeThemePluginLocale',
  },
];

function setHost(t, i18n) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'ibiz');
  Object.defineProperty(globalThis, 'ibiz', {
    configurable: true,
    writable: true,
    value: i18n === undefined ? undefined : { i18n },
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'ibiz', previous);
    else delete globalThis.ibiz;
  });
}

function dictionary(module, group, language) {
  return module[group.resource][language][group.namespace];
}

function protocolShape(value) {
  if (Array.isArray(value)) return value.map(protocolShape);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      key === 'caption' ? '<localized>' : protocolShape(child),
    ]),
  );
}

function findById(value, id) {
  if (Array.isArray(value)) {
    for (const child of value) {
      const found = findById(child, id);
      if (found) return found;
    }
    return undefined;
  }
  if (!value || typeof value !== 'object') return undefined;
  if (value.id === id) return value;
  for (const child of Object.values(value)) {
    const found = findById(child, id);
    if (found) return found;
  }
  return undefined;
}

test('group C resources expose identical keys and translated English values', async () => {
  for (const group of groups) {
    const module = await loadLocaleModule(group.locale);
    const chinese = flattenMessages(dictionary(module, group, 'zh-CN'));
    const english = flattenMessages(dictionary(module, group, 'en'));
    assert.ok(Object.keys(chinese).length > 0, group.id);
    assert.deepEqual(Object.keys(chinese).sort(), Object.keys(english).sort(), group.id);
    for (const key of Object.keys(chinese)) {
      assert.ok(chinese[key].trim(), `${group.id}.${key}`);
      assert.ok(english[key].trim(), `${group.id}.${key}`);
      assert.doesNotMatch(english[key], /[\u3400-\u9fff]/u, `${group.id}.${key}`);
      assert.notEqual(english[key], key, `${group.id}.${key}`);
    }
  }
});

test('group C helpers switch aliases at call time and survive host failures', async t => {
  for (const group of groups) {
    const module = await loadLocaleModule(group.locale);
    const chinese = dictionary(module, group, 'zh-CN');
    const english = dictionary(module, group, 'en');
    const firstKey = Object.keys(chinese)[0];
    const host = { language: 'zh-CN', getLang: () => host.language, t: key => key };
    setHost(t, host);
    for (const [language, expected] of [
      ['zh-CN', chinese[firstKey]],
      ['zh-cn', chinese[firstKey]],
      ['en', english[firstKey]],
      ['en-US', english[firstKey]],
      ['en_US', english[firstKey]],
    ]) {
      host.language = language;
      assert.equal(module[group.normalize](language), language.startsWith('en') ? 'en' : 'zh-CN');
      assert.equal(module[group.translate](firstKey), expected, `${group.id}:${language}`);
    }
    assert.equal(module[group.translate](firstKey), english[firstKey]);

    setHost(t, {
      getLang: () => {
        throw new Error('host not ready');
      },
      t: () => {
        throw new Error('host not ready');
      },
      mergeLocaleMessage: () => {
        throw new Error('host not ready');
      },
    });
    assert.doesNotThrow(() => module[group.register]());
    assert.equal(module[group.translate](firstKey), chinese[firstKey], `${group.id}:fallback`);
  }
});

test('theme layout translates owned captions without changing protocol data', async t => {
  const module = await loadLocaleModule('extensions/theme-plugin/src/locale/index.ts');
  const layoutModule = await loadLocaleModule(
    'extensions/theme-plugin/src/layout/de-grid-view-layout.ts',
  );
  const chinese = module.themePluginLocale['zh-CN'].themePlugin;
  const english = module.themePluginLocale.en.themePlugin;
  const host = { language: 'zh-CN', getLang: () => host.language, t: key => key };
  setHost(t, host);

  const layout = layoutModule.default;
  const originalShape = protocolShape(layout);
  assert.equal(layout.rootPanelItems[0].caption, chinese.viewMessagePlaceholder);
  assert.equal(findById(layout, 'captionbar').caption, chinese.pageTitle);
  assert.equal(findById(layout, 'searchbar').caption, chinese.searchBar);
  assert.equal(findById(layout, 'toolbar').caption, chinese.toolbar);
  assert.equal(findById(layout, 'searchform').caption, chinese.searchForm);
  assert.equal(findById(layout, 'grid').caption, chinese.grid);
  assert.equal(findById(layout, 'static_label').caption, chinese.label);
  assert.equal(findById(layout, 'static_label').rawItem.caption, chinese.customLayout);
  assert.equal(layout.logicName, '\u8868\u683C\u89C6\u56FE\u5E03\u5C40(\u9884\u7F6E\u6A21\u578B)');
  assert.equal(layout.appDataEntityId, 'frontmodel.viewlayoutmodelrepository');
  assert.equal(findById(layout, 'static_label').appId, 'sztrainsys__web');

  host.language = 'en-GB';
  assert.equal(layout.rootPanelItems[0].caption, english.viewMessagePlaceholder);
  assert.equal(findById(layout, 'captionbar').caption, english.pageTitle);
  assert.equal(findById(layout, 'searchbar').caption, english.searchBar);
  assert.equal(findById(layout, 'toolbar').caption, english.toolbar);
  assert.equal(findById(layout, 'searchform').caption, english.searchForm);
  assert.equal(findById(layout, 'grid').caption, english.grid);
  assert.equal(findById(layout, 'static_label').caption, english.label);
  assert.equal(findById(layout, 'static_label').rawItem.caption, english.customLayout);
  assert.equal(layout.logicName, '\u8868\u683C\u89C6\u56FE\u5E03\u5C40(\u9884\u7F6E\u6A21\u578B)');
  assert.deepEqual(protocolShape(layout), originalShape);
  assert.doesNotMatch(JSON.stringify(layout), /__theme-plugin-locale:/u);
});

test('business source leaves visible Chinese text to locale resources', () => {
  for (const file of [
    'extensions/global-plugin/src/grid-view-engine.ts',
    'extensions/replace-default-demo/src/replace-default-demo.tsx',
    'extensions/theme-plugin/src/layout/de-grid-view-layout.ts',
  ]) {
    const source = readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//gu, '')
      .replace(/\/\/.*$/gmu, '');
    assert.doesNotMatch(source, /['"`][^'"`]*[\u3400-\u9fff][^'"`]*['"`]/u, file);
  }
});
