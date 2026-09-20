import zhCN from './zh-CN';
import en from './en';

type Messages = { [key: string]: string | Messages };
type Params = Record<string, unknown>;
interface HostI18n {
  getLang?(): string;
  t?(key: string, fallback: string, params?: Params): string;
  mergeLocaleMessage?(lang: string, messages: Messages): void;
}

function host(): HostI18n | undefined {
  try {
    return (globalThis as typeof globalThis & { ibiz?: { i18n?: HostI18n } })
      .ibiz?.i18n;
  } catch {
    return undefined;
  }
}

const registered = new WeakMap<HostI18n, Set<string>>();
const registering = new WeakSet<HostI18n>();

export function registerBiReportLocale(): void {
  const i18n = host();
  if (!i18n || registering.has(i18n)) return;
  try {
    const mergeLocaleMessage = i18n.mergeLocaleMessage;
    if (typeof mergeLocaleMessage !== 'function') return;
    registering.add(i18n);
    let lang = 'zh-CN';
    try {
      lang = i18n.getLang?.() || lang;
    } catch {
      // Use the bundled default while the host locale service is starting.
    }
    const languages = new Set(['zh-CN', 'en', 'en-US', lang]);
    const done = registered.get(i18n) || new Set<string>();
    registered.set(i18n, done);
    languages.forEach(language => {
      if (!done.has(language)) {
        try {
          mergeLocaleMessage.call(i18n, language, {
            biReport: language
              .trim()
              .toLowerCase()
              .replace(/_/g, '-')
              .startsWith('en')
              ? { ...en }
              : { ...zhCN },
          });
          done.add(language);
        } catch {
          // Retry only this language when the host becomes ready.
        }
      }
    });
  } catch {
    // The host may exist before its underlying i18n instance is initialized.
  } finally {
    registering.delete(i18n);
  }
}

function flatten(messages: Messages, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  Object.entries(messages).forEach(([name, value]) => {
    const key = prefix ? `${prefix}.${name}` : name;
    if (typeof value === 'string') result[key] = value;
    else Object.assign(result, flatten(value, key));
  });
  return result;
}

const chinese = flatten(zhCN);
const english = flatten(en);
const defaultKeys = new Map(
  Object.entries(chinese).map(([key, value]) => [value, key]),
);
const localizedConfigs = new WeakSet<object>();

export function biReportT(key: string, params: Params = {}): string {
  registerBiReportLocale();
  const i18n = host();
  let lang = 'zh-CN';
  try {
    lang = i18n?.getLang?.() || lang;
  } catch {
    // Fall back to the bundled default resources during host startup.
  }
  const normalized = lang.trim().toLowerCase().replace(/_/g, '-');
  const fallback =
    (normalized.startsWith('en') ? english[key] : chinese[key]) || key;
  try {
    const translated = i18n?.t?.(`biReport.${key}`, fallback, params);
    const otherFallback = normalized.startsWith('en')
      ? chinese[key]
      : english[key];
    if (
      translated &&
      translated !== key &&
      translated !== `biReport.${key}` &&
      translated !== fallback &&
      translated !== otherFallback
    ) {
      return translated;
    }
  } catch {
    // A standalone import must not require an initialized host.
  }
  return fallback.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name)
      ? String(params[name] ?? '')
      : match,
  );
}

/** Only pass plugin-owned defaults here, never user captions or schema data. */
export function biReportDefaultText(text: string): string {
  const key = defaultKeys.get(text);
  return key ? biReportT(key) : text;
}

/** Retain live getters so a cached config does not freeze the startup language. */
export function localizeBiReportConfig<T>(value: T): T {
  if (value && typeof value === 'object' && localizedConfigs.has(value))
    return value;
  if (Array.isArray(value)) return value.map(localizeBiReportConfig) as T;
  if (!value || typeof value !== 'object') return value;
  const result: Record<string, unknown> = {};
  Object.entries(value).forEach(([name, item]) => {
    if (
      ['caption', 'label', 'subCaption'].includes(name) &&
      typeof item === 'string' &&
      defaultKeys.has(item)
    ) {
      Object.defineProperty(result, name, {
        enumerable: true,
        get: () => biReportDefaultText(item),
      });
    } else {
      result[name] = localizeBiReportConfig(item);
    }
  });
  localizedConfigs.add(result);
  return result as T;
}

/** Chart formatters run as generated scripts, outside this module's closure. */
export function biReportScriptText(key: string): string {
  const defaults = JSON.stringify({
    zh: chinese[key],
    en: english[key],
  });
  return `(function() {
    const defaults = ${defaults};
    const host = globalThis.ibiz && globalThis.ibiz.i18n;
    let lang = 'zh-CN';
    try { lang = host && host.getLang ? host.getLang() : lang; } catch (_) {}
    const normalized = String(lang).trim().toLowerCase().replace(/_/g, '-');
    const fallback = normalized.startsWith('en') ? defaults.en : defaults.zh;
    try {
      const text = host && host.t && host.t(${JSON.stringify(`biReport.${key}`)}, fallback);
      if (text && text !== ${JSON.stringify(`biReport.${key}`)} && text !== ${JSON.stringify(key)}) return text;
    } catch (_) {}
    return fallback;
  })()`;
}

/** Localize the accessible title without changing any SVG resource IDs. */
export function biReportChartIcon(svg: string, caption: string): string {
  if (typeof DOMParser === 'undefined') return svg;
  const document = new DOMParser().parseFromString(svg, 'text/html');
  const element = document.querySelector('svg');
  if (!element) return svg;
  element.querySelectorAll('title').forEach(title => {
    title.textContent = caption;
  });
  return element.outerHTML;
}

registerBiReportLocale();
