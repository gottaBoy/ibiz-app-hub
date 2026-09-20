const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');
const ts = require('typescript');
const { reactive, effect, stop } = require('vue');

const src = path.resolve(__dirname, '../src');
const cjk = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(filename);
    return filename.endsWith('.ts') || filename.endsWith('.tsx')
      ? [filename]
      : [];
  });
}

function visitSource(filename, visit) {
  const source = ts.createSourceFile(
    filename,
    fs.readFileSync(filename, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  function walk(node) {
    visit(node, source);
    ts.forEachChild(node, walk);
  }
  walk(source);
}

function flatten(value, prefix = '') {
  return Object.fromEntries(
    Object.entries(value).flatMap(([name, item]) => {
      const key = prefix ? `${prefix}.${name}` : name;
      return typeof item === 'string'
        ? [[key, item]]
        : Object.entries(flatten(item, key));
    }),
  );
}

function fixture() {
  const context = vm.createContext({ console });
  const cache = new Map();
  // Only external runtime APIs used by the tested utilities are stubbed.
  const runtime = { ValueOP: new Proxy({}, { get: (_, key) => key }) };
  function load(relative) {
    const filename = path.resolve(src, relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
      fileName: filename,
    }).outputText;
    function localRequire(id) {
      if (id === '@ibiz-template/core') return { RuntimeError: Error };
      if (id === '@ibiz-template/runtime') return runtime;
      if (id.startsWith('.')) {
        const base = path.resolve(path.dirname(filename), id);
        return load(
          fs.existsSync(`${base}.ts`)
            ? `${base}.ts`
            : path.join(base, 'index.ts'),
        );
      }
      return require(id);
    }
    vm.runInContext(
      `(function(require, module, exports) {${output}\n})`,
      context,
    )(localRequire, module, module.exports);
    return module.exports;
  }
  const helper = load('locale/index.ts');
  const zh = flatten(load('locale/zh-CN.ts').default);
  const en = flatten(load('locale/en.ts').default);
  const language = reactive({ value: 'zh-CN' });
  function host(t = key => key) {
    context.ibiz = {
      i18n: {
        getLang: () => language.value,
        mergeLocaleMessage() {},
        t,
      },
    };
    return context.ibiz.i18n;
  }
  return { context, load, helper, zh, en, language, host };
}

test('dictionaries match and every literal key used by source is translated', () => {
  const { zh, en } = fixture();
  assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort());
  for (const [key, text] of Object.entries(en)) {
    assert.ok(text.trim(), key);
    assert.equal(cjk.test(text), false, key);
    assert.deepEqual(
      [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(),
      [...zh[key].matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort(),
      `Interpolation mismatch: ${key}`,
    );
  }
  for (const filename of sourceFiles(src)) {
    visitSource(filename, node => {
      if (
        ts.isCallExpression(node) &&
        ['biReportT', 'biReportScriptText'].includes(
          node.expression.getText(),
        ) &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        const key = node.arguments[0].text;
        assert.ok(zh[key] && en[key], `${filename}: missing ${key}`);
        assert.ok(
          node.arguments.length <= 2,
          'Call sites must not supply fallbacks',
        );
      }
    });
  }
  console.log(
    `Verified ${Object.keys(zh).length} matching bilingual resource keys`,
  );
});

test('missing host, aliases, key-returning and throwing hosts use bundled fallbacks', () => {
  const { helper, host, language, context, zh, en } = fixture();
  assert.equal(helper.biReportT('save'), zh.save);
  assert.equal(
    helper.biReportT('maxItems', { caption: 'Revenue', max: 2 }),
    zh.maxItems.replace('{caption}', 'Revenue').replace('{max}', '2'),
  );
  for (const translate of [
    key => key,
    () => 'save',
    () => '',
    () => {
      throw Error('not ready');
    },
  ]) {
    host(translate);
    for (const alias of ['en', 'en-US', 'en-GB', 'EN-us', 'zh-cn', 'zh-CN']) {
      language.value = alias;
      assert.equal(
        helper.biReportT('save'),
        alias.toLowerCase().startsWith('en') ? en.save : zh.save,
      );
    }
  }
  context.ibiz = {};
  assert.equal(helper.biReportT('save'), zh.save);
  host((key, fallback, params) =>
    key.endsWith('save') ? 'Host override' : fallback,
  );
  assert.equal(helper.biReportT('save'), 'Host override');
});

test('registration retries after initialization failure and handles language aliases', () => {
  const { helper, language, host } = fixture();
  let ready = false;
  const messages = {};
  const i18n = host();
  i18n.mergeLocaleMessage = (lang, data) => {
    if (!ready) throw Error('not initialized');
    messages[lang] = data;
  };
  helper.registerBiReportLocale();
  assert.equal(Object.keys(messages).length, 0);
  ready = true;
  for (const alias of ['en-US', 'en-GB', 'zh-cn']) {
    language.value = alias;
    helper.registerBiReportLocale();
    assert.ok(messages[alias].biReport.save);
  }
  assert.notEqual(
    messages['en-GB'].biReport.save,
    messages['zh-cn'].biReport.save,
  );
});

test('all static property config labels have full English coverage and remain live', () => {
  const { helper, load, language, host, zh, en } = fixture();
  const defaults = new Map(
    Object.entries(zh).map(([key, text]) => [text, key]),
  );
  host();
  let count = 0;
  for (const filename of sourceFiles(path.join(src, 'config'))) {
    visitSource(filename, (node, source) => {
      if (
        ts.isPropertyAssignment(node) &&
        ['caption', 'subCaption', 'label'].includes(
          node.name.getText(source),
        ) &&
        ts.isStringLiteral(node.initializer) &&
        cjk.test(node.initializer.text)
      ) {
        const text = node.initializer.text;
        const key = defaults.get(text);
        assert.ok(key && en[key], `${filename}: unmapped ${text}`);
        const input = {
          caption: text,
          id: 'protocol',
          children: [{ label: text }],
        };
        const translated = helper.localizeBiReportConfig(input);
        language.value = 'en-GB';
        assert.equal(translated.caption, en[key]);
        assert.equal(translated.children[0].label, en[key]);
        assert.equal(translated.id, input.id);
        assert.equal(input.caption, text);
        assert.equal(helper.localizeBiReportConfig(translated), translated);
        language.value = 'zh-cn';
        assert.equal(translated.caption, zh[key]);
        count += 1;
      }
    });
  }
  const config = load('config/index.ts');
  const chartTypes = load('config/chart-types.ts').ChartTypes;
  for (const type of chartTypes) {
    const data = config.getChartConfig(type.type);
    const label = data.chartConfig.data.details[0];
    language.value = 'en-US';
    assert.equal(cjk.test(label.caption), false);
    language.value = 'zh-CN';
    assert.equal(cjk.test(label.caption), true);
  }
  console.log(
    `Verified ${count} static caption/subCaption/label occurrences across ${chartTypes.length} chart types`,
  );
});

test('chart types, aggregation and operators resolve after import and track language changes', () => {
  const { helper, load, language, host, zh, en } = fixture();
  const charts = load('config/chart-types.ts').ChartTypes;
  const agg = load('util/constant-data.ts').aggModeList;
  const modes = load('util/fliter-util.ts').FilterModes;
  host();
  let rendered;
  const runner = effect(() => {
    rendered = [
      charts[0].caption,
      agg[0].name,
      modes[0].label,
      helper.biReportT('save'),
    ];
  });
  assert.deepEqual(rendered, [
    zh['chartTypes.number'],
    zh.total,
    zh['operators.equal'],
    zh.save,
  ]);
  language.value = 'en-GB';
  assert.deepEqual(rendered, [
    en['chartTypes.number'],
    en.total,
    en['operators.equal'],
    en.save,
  ]);
  language.value = 'zh-cn';
  assert.equal(rendered[0], zh['chartTypes.number']);
  stop(runner);
});

test('date units, validation messages and PQL errors resolve at use time', () => {
  const { load, helper, host, context, language, zh, en } = fixture();
  host();
  const errors = [];
  context.ibiz.log = { error: message => errors.push(message) };
  const { formatDate } = load('util/date-util.ts');
  const { BIVerifyController } = load('controller/bi-verify.controller.ts');
  const { parseCustomCond } = load('util/pql-util.ts');
  const verifier = new BIVerifyController();
  verifier.init([], {
    details: [{ id: 'measure', caption: zh.measure, required: true }],
  });
  const error = verifier.verifyState('measure', [], ['REQUIRE']);
  assert.equal(
    error.msg,
    helper.biReportT('required', { caption: zh.measure }),
  );
  language.value = 'en-US';
  assert.equal(
    error.msg,
    helper.biReportT('required', { caption: en.measure }),
  );
  assert.equal(formatDate('DAY', '20260914'), '2026-09-14');
  assert.equal(formatDate('MONTH', '202609'), '2026-09');
  assert.equal(formatDate('WEEK', '2026W38'), '2026 W38');
  assert.equal(formatDate('QUARTER', '2026Q3'), '2026 Q3');
  assert.equal(formatDate('YEAR', '2026'), '2026');
  assert.equal(formatDate('DAY', 'custom caption'), 'custom caption');
  assert.equal(parseCustomCond('bad input'), undefined);
  assert.equal(errors.at(-1), en.pqlParseError);
});

test('palette, font and position defaults have matching English translations', () => {
  const { helper, zh, en, host, language } = fixture();
  const defaults = new Map(
    Object.entries(zh).map(([key, text]) => [text, key]),
  );
  host();
  language.value = 'en-US';
  for (const relative of [
    'components/common/color-scheme/color-scheme.tsx',
    'components/common/font-border-select/font-border-select.tsx',
    'components/common/position-select/position-select-iocns.ts',
  ]) {
    visitSource(path.join(src, relative), (node, source) => {
      if (
        ts.isPropertyAssignment(node) &&
        ['text', 'caption', 'label'].includes(node.name.getText(source)) &&
        ts.isStringLiteral(node.initializer) &&
        cjk.test(node.initializer.text)
      ) {
        const text = node.initializer.text;
        assert.ok(defaults.has(text), `${relative}: unmapped ${text}`);
        assert.equal(helper.biReportDefaultText(text), en[defaults.get(text)]);
      }
    });
  }
});

test('SVG titles translate at render time without altering path data or resource IDs', () => {
  const { Window } = require('happy-dom');
  const window = new Window();
  const { context, helper, load, host, language } = fixture();
  context.DOMParser = window.DOMParser;
  const charts = load('config/chart-types.ts').ChartTypes;
  host();
  language.value = 'en-GB';
  for (const chart of charts) {
    const parse = svg =>
      new window.DOMParser().parseFromString(svg, 'text/html');
    const before = parse(chart.icon);
    const after = parse(helper.biReportChartIcon(chart.icon, chart.caption));
    assert.equal(after.querySelector('title').textContent, chart.caption);
    assert.equal(cjk.test(after.querySelector('title').textContent), false);
    for (const attribute of ['id', 'd', 'points', 'transform']) {
      const attributes = doc =>
        Array.from(doc.querySelectorAll(`[${attribute}]`)).map(node =>
          node.getAttribute(attribute),
        );
      assert.deepEqual(attributes(after), attributes(before));
    }
    language.value = 'zh-cn';
    assert.equal(
      parse(helper.biReportChartIcon(chart.icon, chart.caption)).querySelector(
        'title',
      ).textContent,
      chart.caption,
    );
    language.value = 'en-GB';
  }
});

test('config translation leaves protocol fields and user-owned defaults untouched', () => {
  const { load, helper, language, host, zh } = fixture();
  host();
  language.value = 'en-US';
  const model = load('config/area-chart-config.ts').AreaChartModel;
  const snapshot = JSON.stringify(model);
  const data = load('config/index.ts').getChartConfig('AREA');
  assert.equal(JSON.stringify(data.chartModel), snapshot);
  assert.equal(data.chartModel, model);
  const user = { caption: zh.measure, data: { customCaption: zh.filter } };
  const original = JSON.stringify(user);
  const config = { caption: zh.measure, id: zh.measure, name: zh.filter };
  const translated = helper.localizeBiReportConfig(config);
  assert.equal(translated.id, config.id);
  assert.equal(translated.name, config.name);
  assert.equal(JSON.stringify(user), original);
  for (const filename of sourceFiles(src)) {
    visitSource(filename, node => {
      if (
        ts.isCallExpression(node) &&
        node.expression.getText() === 'localizeBiReportConfig'
      ) {
        assert.equal(
          node.arguments.some(argument =>
            argument.getText().includes('propertyData'),
          ),
          false,
          filename,
        );
      }
    });
  }
});

test('generated tooltip translation handles host failure and live aliases', () => {
  const { context, helper, host, language, zh, en } = fixture();
  const script = helper.biReportScriptText('undefinedValue');
  assert.equal(vm.runInContext(script, context), zh.undefinedValue);
  host(() => {
    throw Error('unavailable');
  });
  language.value = 'en-GB';
  assert.equal(vm.runInContext(script, context), en.undefinedValue);
  language.value = 'zh-cn';
  assert.equal(vm.runInContext(script, context), zh.undefinedValue);
});

test('interpolation does not reinterpret placeholders inside user captions', () => {
  const { helper, host, language } = fixture();
  host();
  language.value = 'en-US';
  assert.equal(
    helper.biReportT('required', { caption: 'Revenue {max}', max: 2 }),
    'Revenue {max} is required',
  );
  host(() => 'Revenue {max} is required');
  assert.equal(
    helper.biReportT('required', { caption: 'Revenue {max}', max: 2 }),
    'Revenue {max} is required',
  );
});

test('no direct JSX text or JSX display attributes remain fixed in Chinese', () => {
  const failures = [];
  for (const filename of sourceFiles(src).filter(file =>
    file.endsWith('.tsx'),
  )) {
    visitSource(filename, (node, source) => {
      if (ts.isJsxText(node) && cjk.test(node.text)) failures.push(filename);
      if (
        ts.isJsxAttribute(node) &&
        node.name.getText(source) !== 'id' &&
        node.initializer &&
        ts.isStringLiteral(node.initializer) &&
        cjk.test(node.initializer.text)
      )
        failures.push(filename);
    });
  }
  assert.deepEqual(failures, []);
});
