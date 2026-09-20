import assert from 'node:assert/strict';
import test from 'node:test';
import { hostRequire, loadLocaleModule } from '../test-support/plugin-locale-runtime.mjs';

const { Window } = hostRequire('happy-dom');

function environment(t, language) {
  const globals = ['document', 'localStorage', 'navigator', 'window', 'ibiz'];
  const descriptors = new Map(globals.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const browser = new Window();
  const storage = new Map([['language', language]]);
  let reloads = 0;
  browser.location.reload = () => { reloads += 1; };
  const values = {
    document: browser.document,
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    navigator: { language },
    window: browser,
  };
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(globalThis, key, { value, writable: true, configurable: true });
  }
  t.after(() => {
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  return { storage, get reloads() { return reloads; } };
}

for (const platform of ['ibiz-next-vue3', 'ibiz-next-mob-vue3']) {
  for (const language of ['zh-CN', 'zh-cn', 'en', 'en-US', 'en-GB']) {
    test(`${platform}: ${language} loads the correct base language and preserves early plugin messages`, async t => {
      environment(t, language);
      const { iBizI18n } = await loadLocaleModule(`components/${platform}/src/locale/index.ts`);
      iBizI18n.mergeLocaleMessage(language, {
        pluginTest: { ready: 'Ready {count}' },
        app: { save: 'Custom Save' },
      });
      await iBizI18n.init();
      assert.equal(iBizI18n.t('app.cancel'), language.startsWith('en') ? 'Cancel' : '取消');
      assert.equal(iBizI18n.t('app.save'), 'Custom Save');
      assert.equal(iBizI18n.t('pluginTest.ready', { count: 0 }), 'Ready 0');
      assert.equal(iBizI18n.t('pluginTest.ready', 'Fallback {count}', { count: 0 }), 'Ready 0');
      iBizI18n.mergeLocaleMessage('fr', { pluginTest: { ready: 'Pret {count}' } });
      assert.equal(iBizI18n.t('pluginTest.ready', 'Fallback {count}', { count: 0, locale: 'fr' }), 'Pret 0');
      await iBizI18n.init();
      assert.equal(iBizI18n.t('pluginTest.ready', { count: 2 }), 'Ready 2');
    });
  }

  test(`${platform}: an explicitly configured regional language takes precedence`, async t => {
    environment(t, 'en-GB');
    const { iBizI18n } = await loadLocaleModule(`components/${platform}/src/locale/index.ts`);
    iBizI18n.setLangConfigs({
      'en-GB': async () => ({ default: { regional: 'Custom British English' } }),
    });
    await iBizI18n.init();
    assert.equal(iBizI18n.t('regional'), 'Custom British English');
  });

  test(`${platform}: canceling a language switch does not persist or reload`, async t => {
    const env = environment(t, 'en');
    const { iBizI18n } = await loadLocaleModule(`components/${platform}/src/locale/index.ts`);
    await iBizI18n.init();
    let confirmed = false;
    let prompt;
    globalThis.ibiz = {
      i18n: iBizI18n,
      confirm: { warning: async value => { prompt = value; return confirmed; } },
    };
    iBizI18n.setLang('zh-CN');
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(env.storage.get('language'), 'en');
    assert.equal(env.reloads, 0);
    assert.doesNotMatch(prompt.desc, /[\u3400-\u9fff]/u);
    assert.notEqual(prompt.desc, 'locale.switchLanguagePrompt');
    confirmed = true;
    iBizI18n.setLang('zh-CN');
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(env.storage.get('language'), 'zh-CN');
    assert.equal(env.reloads, 1);
  });
}
