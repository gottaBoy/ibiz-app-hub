import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer as createHttpServer } from 'node:http';
import { createServer } from 'vite';
import vue from '@vitejs/plugin-vue';
import { computed, createRenderer, createSSRApp, defineComponent, h, nextTick, ref } from 'vue';
import { renderToString } from 'vue/server-renderer';

const root = fileURLToPath(new URL('../', import.meta.url));
let server;
let localeApi;
let RootWrap;
let Column;
let Slider;
let useData;
let rootProps;
const originalHost = Object.getOwnPropertyDescriptor(globalThis, 'ibiz');
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');

before(async () => {
  server = await createServer({
    configFile: false,
    root,
    plugins: [vue()],
    resolve: { alias: { '@': `${root}src` } },
    optimizeDeps: { disabled: true },
    server: {
      middlewareMode: true,
      hmr: { server: createHttpServer() },
      watch: null,
    },
  });
  localeApi = await server.ssrLoadModule('/src/locale/index.ts');
  ({ default: RootWrap } = await server.ssrLoadModule('/src/components/root/RootWrap.vue'));
  ({ default: Column } = await server.ssrLoadModule('/src/components/column/index.vue'));
  ({ default: Slider } = await server.ssrLoadModule('/src/components/slider/index.vue'));
  ({ default: useData } = await server.ssrLoadModule('/src/composables/useData.ts'));
  ({ default: rootProps } = await server.ssrLoadModule('/src/components/root/rootProps.ts'));
  // Existing Gantt setup reads browser width and installs a fullscreen listener.
  // Load Vue/VueUse in SSR mode first; these shims do not simulate mounting.
  globalThis.window = { innerWidth: 1024 };
  globalThis.document = { addEventListener() {}, removeEventListener() {} };
});

after(async () => {
  for (const [name, descriptor] of [
    ['ibiz', originalHost],
    ['window', originalWindow],
    ['document', originalDocument],
  ]) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete globalThis[name];
  }
  await server?.close();
});

function setHost(i18n) {
  Object.defineProperty(globalThis, 'ibiz', {
    configurable: true,
    writable: true,
    value: i18n === undefined ? undefined : { i18n },
  });
}

// Render real columns/sliders explicitly: viewport rows are filled by client
// watchers, so the normal virtual table has no rows during SSR.
const Fields = defineComponent({
  setup() {
    const { $data, getProp } = useData();
    const row = $data.flatData[0];
    return () => h('section', { class: 'field-probe' }, [
      h('output', { class: 'missing' }, getProp(row, 'missing')),
      h('output', { class: 'null' }, getProp(row, 'nullValue')),
      h('output', { class: 'undefined' }, getProp(row, 'undefinedValue')),
      h('output', { class: 'nested' }, getProp(row, 'nested.missing.value')),
      h('output', { class: 'custom' }, getProp(row, 'missing', 'CUSTOM')),
      h('output', { class: 'blank' }, getProp(row, 'missing', '')),
      h('output', { class: 'zero' }, String(getProp(row, 'zero'))),
      h(Column, { data: row, __index: 0, prop: 'missing' }),
      h(Column, { data: row, __index: 0, prop: 'missing', emptyData: 'COLUMN' }),
      h(Slider, { data: row, prop: 'missing' }),
      h(Slider, { data: row, prop: 'missing', emptyData: 'SLIDER' }),
    ]);
  },
});

async function renderGantts(locales) {
  const sameSetup = [];
  const app = createSSRApp({
    render: () => h('main', locales.map(locale => h('article', {}, [
      h(RootWrap, {
        ...(locale === undefined ? {} : { locale }),
        data: [{
          id: 1,
          startDate: '2026-09-14',
          endDate: '2026-09-15',
          nullValue: null,
          undefinedValue: undefined,
          nested: null,
          zero: 0,
        }],
      }, {
        default: () => {
          // setSlots invokes this in Root setup: it must see RootWrap's locale.
          sameSetup.push(useData().getProp({ data: {} }, 'missing'));
          return [h(Column, { prop: 'missing', label: 'Task' })];
        },
        empty: () => h(Fields),
      }),
    ]))),
  });
  // Keep the actual Gantt toolbar SFC; only replace external UI widgets.
  for (const name of ['el-dropdown', 'el-dropdown-menu', 'el-dropdown-item']) {
    app.component(name, {
      setup: (_, { slots }) => () => h('div', [slots.default?.(), slots.dropdown?.()]),
    });
  }
  app.component('ion-icon', () => h('i'));
  const html = await renderToString(app);
  assert.ok(!html.includes('gantt.'));
  assert.ok(!html.includes('[object Object]'));
  return { articles: html.match(/<article>[\s\S]*?<\/article>/g), sameSetup };
}

test('SSR: two real Gantt instances keep explicit languages under a Chinese host', async () => {
  setHost({ getLang: () => 'zh-CN', t: key => key });
  const { articles, sameSetup } = await renderGantts(['zh-cn', 'en-US']);
  assert.deepEqual(sameSetup, ['无数据', 'No data']);
  for (const [index, word, today, units, title] of [
    [0, '无数据', '今天', ['月', '周', '天', '时'], '全屏模式'],
    [1, 'No data', 'Today', ['Month', 'Week', 'Day', 'Hour'], 'Fullscreen'],
  ]) {
    const html = articles[index];
    assert.ok(html.includes(today));
    assert.ok(html.includes(`title="${title}"`));
    for (const unit of units) assert.ok(html.includes(`>${unit}<`));
    for (const field of ['missing', 'null', 'undefined', 'nested']) {
      assert.ok(html.includes(`class="${field}">${word}</output>`));
    }
    assert.ok(html.includes('class="custom">CUSTOM</output>'));
    assert.ok(html.includes('class="blank"></output>'));
    assert.ok(html.includes('class="zero">0</output>'));
    assert.match(html, /class="cell"[^>]*>.*?(No data|无数据)/s);
    assert.match(html, /class="slider-text"[^>]*>(No data|无数据)<\/div>/);
    assert.ok(html.includes('>COLUMN<'));
    assert.ok(html.includes('>SLIDER<'));
  }
  setHost({ getLang: () => 'zh-cn', t: () => 'HOST_CHINESE' });
  const mixed = await renderGantts(['zh-CN', 'en-GB']);
  assert.ok(mixed.articles[0].includes('HOST_CHINESE'));
  assert.ok(!mixed.articles[1].includes('HOST_CHINESE'));
  assert.ok(mixed.articles[1].includes('Today'));
});

test('SSR: aliases, omitted locale, and both instance orders', async () => {
  setHost(undefined);
  for (const aliases of [['zh-CN', 'en-GB'], ['en-US', 'zh-cn'], ['en-GB', 'zh-CN']]) {
    const { sameSetup } = await renderGantts(aliases);
    assert.deepEqual(sameSetup, aliases.map(value => value.startsWith('zh') ? '无数据' : 'No data'));
  }
  const { sameSetup } = await renderGantts([undefined]);
  assert.deepEqual(sameSetup, [localeApi.translateGantt('emptyData', rootProps.locale.default)]);
  const originalDefault = rootProps.locale.default;
  try {
    rootProps.locale.default = 'zh-cn';
    const withChineseDefault = await renderGantts([undefined, 'en-GB']);
    assert.deepEqual(withChineseDefault.sameSetup, ['无数据', 'No data']);
  } finally {
    rootProps.locale.default = originalDefault;
  }
});

test('Vue: injected locale stays reactive and is not shared between providers', async () => {
  setHost(undefined);
  const current = ref('zh-cn');
  const captured = [];
  const Consumer = defineComponent({
    setup() {
      const { t } = localeApi.useGanttLocale();
      captured.push(computed(() => t('today')));
      return () => h('span', t('today'));
    },
  });
  const Provider = defineComponent({
    props: ['language'],
    setup(props) {
      localeApi.provideGanttLocale(computed(() => props.language.value));
      return () => h(Consumer);
    },
  });
  const renderer = createRenderer({
    createElement: () => ({ children: [] }),
    createText: text => ({ text }),
    createComment: text => ({ text }),
    setText: (node, text) => { node.text = text; },
    setElementText: (node, text) => { node.text = text; },
    insert: (node, parent) => { parent.children.push(node); node.parent = parent; },
    remove: node => { node.parent.children.splice(node.parent.children.indexOf(node), 1); },
    parentNode: node => node.parent,
    nextSibling: () => null,
    patchProp() {},
  });
  const app = renderer.createApp({
    render: () => h('div', [
      h(Provider, { language: current }),
      h(Provider, { language: ref('zh-CN') }),
    ]),
  });
  const container = { children: [] };
  app.mount(container);
  try {
    assert.deepEqual(captured.map(value => value.value), ['今天', '今天']);
    current.value = 'en-GB';
    await nextTick();
    assert.deepEqual(captured.map(value => value.value), ['Today', '今天']);
    assert.deepEqual(container.children[0].children.map(node => node.text), ['Today', '今天']);
  } finally {
    app.unmount();
  }
});

test('host translation and registration are optional and exception-safe', () => {
  const { translateGantt, registerGanttLocale, en, zhCN } = localeApi;
  for (const host of [
    undefined,
    {},
    { t: () => 'WRONG_LANGUAGE' },
    { getLang: () => undefined, t: () => 'WRONG_LANGUAGE' },
    { getLang: () => '', t: () => 'WRONG_LANGUAGE' },
    { getLang: () => 'zh-CN', t: () => { throw Error('not ready'); } },
    { getLang: () => { throw Error('not ready'); }, t: () => 'wrong' },
    { getLang: () => 'zh-CN', t: 'not a function' },
  ]) {
    setHost(host);
    assert.equal(translateGantt('today', 'zh-cn'), zhCN.today);
    assert.equal(translateGantt('today', 'en-US'), en.today);
    assert.equal(registerGanttLocale(), false);
  }
  for (const result of ['gantt.today', 'today', '', '   ', null, undefined, 42, {}]) {
    setHost({ getLang: () => 'zh-cn', t: () => result });
    assert.equal(translateGantt('today', 'zh-CN'), zhCN.today);
  }
  setHost({ getLang: () => 'en-US', t: () => 'HOST_ENGLISH' });
  assert.equal(translateGantt('today', 'en-GB'), 'HOST_ENGLISH');
  assert.equal(translateGantt('today', 'zh-CN'), zhCN.today);
  setHost({ mergeLocaleMessage() { throw Error('not ready'); } });
  assert.equal(registerGanttLocale(), false);
  Object.defineProperty(globalThis, 'ibiz', {
    configurable: true,
    get() { throw Error('host not initialized'); },
  });
  assert.equal(registerGanttLocale(), false);
  assert.equal(translateGantt('today', 'zh-cn'), zhCN.today);
  const registrations = [];
  setHost({
    mergeLocaleMessage(language, resources) {
      registrations.push([language, { ...resources.gantt }]);
      resources.gantt.today = 'MUTATED';
    },
  });
  assert.equal(registerGanttLocale(), true);
  assert.deepEqual(registrations, [['en', en], ['zh-CN', zhCN]]);
  assert.equal(translateGantt('today', 'zh-CN'), zhCN.today);
  assert.equal(translateGantt('today', 'en-US'), en.today);
});
