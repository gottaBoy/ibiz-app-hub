const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

// Execute the actual TS/TSX modules without loading the host application.
function loadModules() {
  const context = vm.createContext({});
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const source = readFileSync(filename, 'utf8');
    const module = { exports: {} };
    cache.set(filename, module);
    const code = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.React,
        jsxFactory: 'createVNode',
      },
    }).outputText;
    function localRequire(id) {
      if (id.endsWith('.scss')) return {};
      if (id === 'vue') return { defineComponent: value => value };
      if (!id.startsWith('.')) return {};
      const base = path.resolve(path.dirname(filename), id);
      try {
        return load(`${base}.ts`);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
        return load(path.join(base, 'index.ts'));
      }
    }
    const execute = vm.runInContext(
      `(function(require, module, exports, createVNode) { ${code}\n})`,
      context,
    );
    execute(
      localRequire,
      module,
      module.exports,
      (type, props, ...children) => ({
        type,
        props,
        children,
      }),
    );
    return module.exports;
  }
  const root = path.resolve(__dirname, '../src');
  return {
    context,
    helper: load(path.join(root, 'locale/helper.ts')),
    en: load(path.join(root, 'locale/en/index.ts')).en.devtool,
    zhCn: load(path.join(root, 'locale/zh-CN/index.ts')).zhCn.devtool,
    loadSelect: () =>
      load(
        path.join(root, 'components/select/devtool-select/devtool-select.tsx'),
      ).DevtoolSelect,
  };
}

test('both dictionaries cover every key; no host defaults to Chinese', () => {
  const { helper, en, zhCn } = loadModules();
  assert.deepEqual(Object.keys(en).sort(), Object.keys(zhCn).sort());
  for (const key of Object.keys(zhCn)) {
    assert.ok(en[key]);
    assert.ok(zhCn[key]);
    assert.equal(helper.devtoolT(key), zhCn[key]);
  }
  assert.doesNotThrow(() => helper.registerDevtoolLocale());
});

test('language aliases select complete local dictionaries at call time', () => {
  const { helper, context, en, zhCn } = loadModules();
  for (const lang of ['en', 'en-US', 'en-GB', 'EN-us', 'zh-CN', 'zh-cn']) {
    context.ibiz = { i18n: { getLang: () => lang } };
    const dictionary = lang.toLowerCase().startsWith('en') ? en : zhCn;
    for (const key of Object.keys(dictionary)) {
      assert.equal(helper.devtoolT(key), dictionary[key]);
    }
  }
});

test('missing, throwing and invalid host methods fall back locally', () => {
  const { helper, context, en, zhCn } = loadModules();
  for (const i18n of [undefined, {}, { t: true, getLang: true }]) {
    context.ibiz = { i18n };
    assert.equal(helper.devtoolT('save'), zhCn.save);
  }
  context.ibiz = {
    i18n: {
      getLang: () => {
        throw new Error('not ready');
      },
      t: () => {
        throw new Error('not ready');
      },
    },
  };
  assert.equal(helper.devtoolT('save'), zhCn.save);
  for (const result of ['devtool.save', 'save', '', ' ', undefined, null, 0]) {
    context.ibiz.i18n = { getLang: () => 'en-US', t: () => result };
    assert.equal(helper.devtoolT('save'), en.save);
  }
  context.ibiz.i18n.t = () => {
    throw new Error('not ready');
  };
  assert.equal(helper.devtoolT('save'), en.save);
});

test('host translations preserve this and receive interpolation options', () => {
  const { helper, context } = loadModules();
  const options = { name: 0 };
  const host = {
    getLang: () => 'en-GB',
    t(tag, received) {
      assert.equal(this, host);
      assert.equal(tag, 'devtool.entityCachedData');
      assert.equal(received, options);
      return 'Host translation';
    },
  };
  context.ibiz = { i18n: host };
  assert.equal(
    helper.devtoolT('entityCachedData', options),
    'Host translation',
  );
});

test('local interpolation preserves zero, false, empty strings and literal values', () => {
  const { helper, context, en, zhCn } = loadModules();
  for (const [lang, dictionary] of [
    ['en-US', en],
    ['zh-cn', zhCn],
  ]) {
    context.ibiz = { i18n: { getLang: () => lang, t: tag => tag } };
    for (const name of [0, false, '', '$&', 'Entity']) {
      assert.equal(
        helper.devtoolT('entityCachedData', { name }),
        dictionary.entityCachedData.replace('{name}', () => String(name)),
      );
    }
    assert.equal(
      helper.devtoolT('entityCachedData'),
      dictionary.entityCachedData,
    );
  }
});

test('registration checks callability and isolates each failed language merge', () => {
  const { helper, context } = loadModules();
  for (const mergeLocaleMessage of [undefined, null, true]) {
    context.ibiz = { i18n: { mergeLocaleMessage } };
    assert.doesNotThrow(() => helper.registerDevtoolLocale());
  }
  const calls = [];
  const host = {
    mergeLocaleMessage(lang, data) {
      assert.equal(this, host);
      calls.push(lang);
      assert.ok(data.devtool.save);
      throw new Error('not ready');
    },
  };
  context.ibiz = { i18n: host };
  assert.doesNotThrow(() => helper.registerDevtoolLocale());
  assert.deepEqual(calls.sort(), ['en', 'zh-CN']);
  const merged = {};
  host.mergeLocaleMessage = (lang, data) => {
    merged[lang] = data;
  };
  helper.registerDevtoolLocale();
  assert.ok(merged.en.devtool.save);
  assert.ok(merged['zh-CN'].devtool.save);
});

test('placeholder translates during render and preserves explicit custom values', () => {
  const { context, loadSelect, en, zhCn } = loadModules();
  const select = loadSelect();
  assert.equal(select.props.placeholder.default, undefined);
  const instance = {
    ns: { b: () => 'select', e: name => name },
    width: 182,
    curLabel: '',
    placeholder: undefined,
    isShow: false,
    renderSvg: () => null,
    $slots: {},
  };
  const placeholder = () =>
    select.render.call(instance).children[0].children[0].children[0];
  assert.equal(placeholder(), zhCn.selectPlaceholder);
  context.ibiz = { i18n: { getLang: () => 'en-US' } };
  assert.equal(placeholder(), en.selectPlaceholder);
  instance.placeholder = 'Custom placeholder';
  assert.equal(placeholder(), 'Custom placeholder');
  instance.placeholder = '';
  assert.equal(placeholder(), '');
});
