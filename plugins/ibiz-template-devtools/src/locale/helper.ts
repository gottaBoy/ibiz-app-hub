import { en } from './en';
import { zhCn } from './zh-CN';

type TranslationParams = IData | undefined;
type TranslationKey = keyof typeof zhCn.devtool;

const resources = { en, 'zh-CN': zhCn };
type HostI18n = {
  getLang?: () => unknown;
  t?: (key: string, options?: TranslationParams) => unknown;
  mergeLocaleMessage?: (lang: string, messages: unknown) => void;
};
const registered = new WeakMap<HostI18n, Set<string>>();
const registering = new WeakSet<HostI18n>();

function host(): HostI18n | undefined {
  try {
    const value = (globalThis as { ibiz?: { i18n?: unknown } }).ibiz?.i18n;
    return value && typeof value === 'object' ? (value as HostI18n) : undefined;
  } catch {
    return undefined;
  }
}

function language(i18n?: HostI18n): string {
  try {
    const value = i18n?.getLang?.();
    if (typeof value === 'string' && value.trim()) return value.trim();
  } catch {
    // Use bundled defaults while the host is initializing.
  }
  return 'zh-CN';
}

function isEnglish(lang: string): boolean {
  return /^en(?:-|$)/i.test(lang.trim().replace(/_/g, '-'));
}

export function registerDevtoolLocale(): void {
  const i18n = host();
  if (!i18n || registering.has(i18n)) return;
  try {
    const merge = i18n.mergeLocaleMessage;
    if (typeof merge !== 'function') return;
    registering.add(i18n);
    const done = registered.get(i18n) ?? new Set<string>();
    registered.set(i18n, done);
    new Set([...Object.keys(resources), language(i18n)]).forEach(lang => {
      if (done.has(lang)) return;
      try {
        const messages = isEnglish(lang) ? en : zhCn;
        merge.call(i18n, lang, { devtool: { ...messages.devtool } });
        done.add(lang);
      } catch {
        // Retry this language on the next use.
      }
    });
  } catch {
    // Even reading host services may throw before initialization.
  } finally {
    registering.delete(i18n);
  }
}

export function devtoolT(
  key: TranslationKey,
  options?: TranslationParams,
): string {
  registerDevtoolLocale();
  const tag = `devtool.${key}`;
  const i18n = host();
  const messages: typeof zhCn.devtool = isEnglish(language(i18n))
    ? en.devtool
    : zhCn.devtool;
  const fallback = messages[key].replace(
    /\{(\w+)\}/g,
    (token, name: string) => {
      const value = options?.[name];
      return value === undefined || value === null ? token : String(value);
    },
  );
  try {
    if (typeof i18n?.t === 'function') {
      const translated = i18n.t(tag, options);
      if (
        typeof translated === 'string' &&
        translated.trim() &&
        translated !== tag &&
        translated !== key
      ) {
        return translated;
      }
    }
  } catch (_error) {
    // Translation failures must not prevent the devtool UI from rendering.
  }
  return fallback;
}
