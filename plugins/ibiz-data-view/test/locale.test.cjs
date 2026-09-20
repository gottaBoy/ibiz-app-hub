const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const day = require('dayjs');

const root = path.resolve(__dirname, '..');

// Compile in memory so tests need neither a browser host nor generated files.
function fixture() {
  const context = vm.createContext({});
  const cache = new Map();
  class Controller {
    onInit() {}
  }
  function load(file) {
    const filename = path.resolve(root, file);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText;
    const run = vm.runInContext(
      `(function(require, module, exports) { ${source}\n})`,
      context,
    );
    run(
      id => {
        if (id === '@ibiz-template/runtime') {
          return {
            EditorController: Controller,
            PortletPartController: Controller,
          };
        }
        assert.ok(id.startsWith('.'), `Unexpected dependency: ${id}`);
        return load(path.resolve(path.dirname(filename), `${id}.ts`));
      },
      module,
      module.exports,
    );
    return module.exports;
  }
  return {
    context,
    load,
    ...load('src/locale/helper.ts'),
    en: load('src/locale/en.ts').dataViewEn,
    zh: load('src/locale/zh-CN.ts').dataViewZhCN,
  };
}

function leafKeys(data, prefix = '') {
  return Object.entries(data).flatMap(([key, value]) => {
    const tag = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [tag] : leafKeys(value, tag);
  });
}

test('dictionaries have identical leaf keys and interpolation parameters', () => {
  const { en, zh } = fixture();
  assert.deepEqual(leafKeys(en), leafKeys(zh));
  for (const tag of leafKeys(en)) {
    const read = data =>
      tag.split('.').reduce((value, key) => value[key], data);
    const parameters = data => read(data).match(/\{\w+\}/g) || [];
    assert.deepEqual(parameters(en), parameters(zh));
  }
});

test('normalizes language aliases and defaults to Chinese without a host', () => {
  const f = fixture();
  assert.equal(f.dataViewT('week.monday'), f.zh.dataView.week.monday);
  for (const lang of ['zh-CN', 'zh-cn', 'en', 'en-US', 'en-GB']) {
    f.context.ibiz = { i18n: { getLang: () => lang, t: tag => tag } };
    const dictionary = lang.startsWith('zh') ? f.zh : f.en;
    assert.equal(f.dataViewT('week.monday'), dictionary.dataView.week.monday);
  }
});

test('falls back for full/short keys, empty and non-string host results', () => {
  const f = fixture();
  for (const value of ['dataView.week.monday', 'week.monday', '', null, 0]) {
    f.context.ibiz = {
      i18n: { getLang: () => 'en-GB', t: () => value },
    };
    assert.equal(f.dataViewT('week.monday'), f.en.dataView.week.monday);
  }
  assert.equal(f.dataViewT('missing.key'), 'missing.key');
});

test('host reads and methods may throw without breaking translation', () => {
  const f = fixture();
  const fail = () => {
    throw new Error('Not initialized');
  };
  const check = expected => {
    assert.doesNotThrow(() => f.registerDataViewLocale());
    assert.equal(f.dataViewT('week.monday'), expected);
  };
  Object.defineProperty(f.context, 'ibiz', { configurable: true, get: fail });
  check(f.zh.dataView.week.monday);
  Object.defineProperty(f.context, 'ibiz', {
    configurable: true,
    writable: true,
    value: {},
  });
  Object.defineProperty(f.context.ibiz, 'i18n', { get: fail });
  check(f.zh.dataView.week.monday);
  for (const member of ['getLang', 't', 'mergeLocaleMessage']) {
    for (const getter of [true, false]) {
      const host = { getLang: () => 'en-US', t: tag => tag };
      Object.defineProperty(
        host,
        member,
        getter ? { get: fail } : { value: fail },
      );
      f.context.ibiz = { i18n: host };
      check(
        member === 'getLang'
          ? f.zh.dataView.week.monday
          : f.en.dataView.week.monday,
      );
    }
  }
});

test('interpolates zero, preserves missing parameters and forwards params', () => {
  const f = fixture();
  f.zh.dataView.warnings.invalidColorArray = '{count}/{missing}';
  const params = { count: 0 };
  assert.equal(
    f.dataViewT('warnings.invalidColorArray', params),
    '0/{missing}',
  );
  f.context.ibiz = {
    i18n: {
      t(tag, fallback, received) {
        assert.equal(tag, 'dataView.warnings.invalidColorArray');
        assert.equal(received, params);
        return 'custom {count}/{missing}';
      },
    },
  };
  assert.equal(
    f.dataViewT('warnings.invalidColorArray', params),
    'custom 0/{missing}',
  );
});

test('registers when the host arrives and preserves custom translations', () => {
  const f = fixture();
  f.registerDataViewLocale();
  const messages = {
    en: { 'dataView.week.monday': 'Custom Monday' },
  };
  const merges = [];
  const host = {
    getLang: () => 'en-US',
    t(tag, fallback, params) {
      const lang = params?.locale || 'en';
      return messages[lang]?.[tag] || tag;
    },
    mergeLocaleMessage(lang, data) {
      merges.push(lang);
      messages[lang] ||= {};
      for (const tag of leafKeys(data)) {
        messages[lang][tag] = tag
          .split('.')
          .reduce((value, key) => value[key], data);
      }
    },
  };
  f.context.ibiz = { i18n: host };
  assert.equal(f.dataViewT('week.monday'), 'Custom Monday');
  assert.deepEqual(merges, ['zh-CN', 'en', 'en-US']);
  messages.en['dataView.week.monday'] = 'Updated Monday';
  f.registerDataViewLocale();
  assert.equal(f.dataViewT('week.monday'), 'Updated Monday');
  assert.equal(merges.length, 3);
  host.getLang = () => 'en-GB';
  f.registerDataViewLocale();
  assert.equal(merges.at(-1), 'en-GB');
  f.context.ibiz = { i18n: { ...host } };
  f.registerDataViewLocale();
  assert.equal(f.dataViewT('week.monday'), 'Updated Monday');
});

test('retries a failed registration without repeating successful languages', () => {
  const f = fixture();
  const calls = [];
  let ready = false;
  f.context.ibiz = {
    i18n: {
      getLang: () => 'zh-cn',
      t: tag => tag,
      mergeLocaleMessage(lang) {
        calls.push(lang);
        if (lang === 'en' && !ready) throw new Error('Not initialized');
      },
    },
  };
  f.registerDataViewLocale();
  ready = true;
  f.registerDataViewLocale();
  f.registerDataViewLocale();
  assert.deepEqual(calls, ['zh-CN', 'en', 'zh-cn', 'en']);
});

test('real-time defaults have no Chinese date literals; custom formats survive', async () => {
  const f = fixture();
  f.context.ibiz = { i18n: { getLang: () => 'en-US', t: tag => tag } };
  const classes = [
    f.load('src/screen-real-time/screen-real-time.controller.ts')
      .ScreenRealTimeController,
    f.load(
      'src/screen-portlet-real-time/screen-portlet-real-time.controller.ts',
    ).ScreenPortletRealTimeController,
  ];
  const custom = 'YYYY[\u5e74]MM[\u6708]DD[\u65e5]';
  for (const Controller of classes) {
    const controller = new Controller();
    controller.parent = {};
    controller.model = {};
    await controller.onInit();
    assert.equal(day('2026-09-14').format(controller.leftTime), '2026-09-14');
    assert.equal(controller.rightTime, 'HH:mm:ss');
    controller.parent.valueFormat = `${custom},week,HH:mm`;
    controller.model.controlParam = {
      ctrlParams: { VALUEFORMAT: `${custom},week,HH:mm` },
    };
    await controller.onInit();
    assert.equal(controller.leftTime, custom);
    assert.equal(controller.rightTime, 'HH:mm');
    assert.equal(controller.showWeek, true);
  }
});

test('business source contains no Chinese string/template/JSX literals', () => {
  function scan(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'locale') scan(file);
      } else if (/\.tsx?$/.test(file)) {
        const source = ts.createSourceFile(
          file,
          fs.readFileSync(file, 'utf8'),
          ts.ScriptTarget.Latest,
          true,
        );
        function visit(node) {
          if (
            ts.isStringLiteralLike(node) ||
            ts.isTemplateHead(node) ||
            ts.isTemplateMiddle(node) ||
            ts.isTemplateTail(node) ||
            ts.isJsxText(node)
          ) {
            assert.ok(!/\p{Script=Han}/u.test(node.text), file);
          }
          ts.forEachChild(node, visit);
        }
        visit(source);
      }
    }
  }
  scan(path.join(root, 'src'));
});
