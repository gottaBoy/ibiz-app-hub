import en from './en';
import zhCN from './zh-CN';

type Locale = 'zh-CN' | 'en';
type Messages = Record<string, unknown>;
type Params = Record<string, unknown>;
type TranslationKey = keyof typeof zhCN.replaceDefaultDemo;

interface HostI18n {
  getLang?: () => unknown;
  t?: (...args: unknown[]) => unknown;
  mergeLocaleMessage?: (lang: string, data: Messages) => void;
}

export const replaceDefaultDemoLocale = {
  'zh-CN': zhCN,
  en,
} as const;

const registeredLanguages = new WeakMap<HostI18n, Set<string>>();
const registeringHosts = new WeakSet<HostI18n>();

function getHostI18n(): HostI18n | undefined {
  try {
    const host = (globalThis as { ibiz?: { i18n?: unknown } }).ibiz?.i18n;
    return host && typeof host === 'object' ? (host as HostI18n) : undefined;
  } catch {
    return undefined;
  }
}

function getLanguage(i18n?: HostI18n): string {
  try {
    const language = i18n?.getLang?.();
    if (typeof language === 'string' && language.trim()) return language.trim();
  } catch {
    // The host may expose i18n before its language service is ready.
  }
  try {
    const language = globalThis.navigator?.language;
    if (typeof language === 'string' && language.trim()) return language.trim();
  } catch {
    // Browser globals are optional for standalone plugin use.
  }
  return 'zh-CN';
}

export function normalizeReplaceDefaultDemoLocale(
  language: unknown,
): Locale {
  const normalized =
    typeof language === 'string'
      ? language.trim().replace(/_/g, '-').toLowerCase()
      : '';
  return /^en(?:-|$)/u.test(normalized) ? 'en' : 'zh-CN';
}

function interpolate(message: string, params: Params): string {
  return message.replace(/\{(\w+)\}/g, (token, name: string) => {
    const value = params[name];
    return value === undefined || value === null ? token : String(value);
  });
}

function isUsableTranslation(value: unknown, tag: string): value is string {
  if (typeof value !== 'string' || !value.trim()) return false;
  return value !== tag && value !== tag.split('.').at(-1);
}

function missingMessages(
  i18n: HostI18n,
  data: Messages,
  language: string,
  prefix = '',
): Messages {
  const result: Messages = {};
  Object.entries(data).forEach(([name, value]) => {
    const tag = prefix ? `${prefix}.${name}` : name;
    if (typeof value === 'string') {
      let existing: unknown;
      try {
        existing = i18n.t?.(tag, tag, { locale: language });
      } catch {
        existing = undefined;
      }
      const other = normalizeReplaceDefaultDemoLocale(language) === 'en' ? zhCN : en;
      if (!isUsableTranslation(existing, tag) ||
        existing === other.replaceDefaultDemo[name as TranslationKey]) result[name] = value;
      return;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const children = missingMessages(i18n, value as Messages, language, tag);
      if (Object.keys(children).length) result[name] = children;
    }
  });
  return result;
}

export function registerReplaceDefaultDemoLocale(): boolean {
  const i18n = getHostI18n();
  if (!i18n || registeringHosts.has(i18n)) return false;

  try {
    const mergeLocaleMessage = i18n.mergeLocaleMessage;
    if (typeof mergeLocaleMessage !== 'function') return false;
    registeringHosts.add(i18n);
    const registered = registeredLanguages.get(i18n) ?? new Set<string>();
    registeredLanguages.set(i18n, registered);
    const currentLanguage = getLanguage(i18n);
    const languages = [...new Set(['zh-CN', 'en', currentLanguage])];
    let registeredAny = false;
    languages.forEach(language => {
      if (registered.has(language)) return;
      try {
        const data =
          replaceDefaultDemoLocale[
            normalizeReplaceDefaultDemoLocale(language)
          ];
        const missing = missingMessages(i18n, data, language);
        if (Object.keys(missing).length) {
          mergeLocaleMessage.call(i18n, language, missing);
        }
        registered.add(language);
        registeredAny = true;
      } catch {
        // Retry only this language when the host becomes ready.
      }
    });
    return registeredAny;
  } catch {
    return false;
  } finally {
    registeringHosts.delete(i18n);
  }
}

function hostTranslate(
  i18n: HostI18n,
  tag: string,
  fallback: string,
  params: Params,
): string | undefined {
  if (typeof i18n.t !== 'function') return undefined;
  const attempts =
    i18n.t.length === 2
      ? [
          () => i18n.t!(tag, params),
          () => i18n.t!(tag, fallback),
        ]
      : [
          () => i18n.t!(tag, fallback, params),
          () => i18n.t!(tag, params),
          () => i18n.t!(tag, fallback),
        ];
  let candidate: string | undefined;
  for (const attempt of attempts) {
    try {
      const value = attempt();
      if (!isUsableTranslation(value, tag)) continue;
      candidate = value;
      if (value !== fallback) return value;
    } catch {
      // Try the next supported host signature.
    }
  }
  return candidate;
}

export function replaceDefaultDemoT(
  key: TranslationKey,
  params: Params = {},
): string {
  registerReplaceDefaultDemoLocale();
  const i18n = getHostI18n();
  const language = getLanguage(i18n);
  const messages =
    replaceDefaultDemoLocale[normalizeReplaceDefaultDemoLocale(language)];
  const fallback = interpolate(messages.replaceDefaultDemo[key], params);
  const tag = `replaceDefaultDemo.${String(key)}`;
  try {
    const translated = i18n && hostTranslate(i18n, tag, fallback, params);
    if (translated) return translated;
  } catch {
    // Use the bundled dictionary when host translation is unavailable.
  }
  return fallback;
}

export const t = replaceDefaultDemoT;
