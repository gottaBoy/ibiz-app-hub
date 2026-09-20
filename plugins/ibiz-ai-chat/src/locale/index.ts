import zhCN from './zh-CN';
import en from './en';

export const AI_CHAT_LOCALE_NAMESPACE = 'aiChat';

export const aiChatLocale = {
  'zh-CN': { [AI_CHAT_LOCALE_NAMESPACE]: zhCN },
  en: { [AI_CHAT_LOCALE_NAMESPACE]: en },
};

type Locale = keyof typeof aiChatLocale;
type TranslationParams = Record<string, unknown>;

interface HostI18n {
  getLang?: () => string;
  t?: (key: string, params?: TranslationParams) => unknown;
  mergeLocaleMessage?: (
    lang: string,
    messages: Record<string, Record<string, string>>,
  ) => void;
}

function getHostI18n(): HostI18n | undefined {
  try {
    return (globalThis as typeof globalThis & { ibiz?: { i18n?: HostI18n } })
      .ibiz?.i18n;
  } catch {
    return undefined;
  }
}

function getLanguage(i18n?: HostI18n): string {
  let lang: string | undefined;
  try {
    lang = i18n?.getLang?.();
  } catch {
    // The host may expose i18n before its language service is ready.
  }
  if (typeof lang !== 'string' || !lang.trim()) {
    try {
      lang = globalThis.navigator?.language;
    } catch {
      lang = undefined;
    }
  }
  return typeof lang === 'string' && lang.trim() ? lang.trim() : 'zh-CN';
}

function normalizeLocale(lang: string): Locale {
  const normalized = lang.trim().toLowerCase().replace(/_/g, '-');
  return normalized === 'en' || normalized?.startsWith('en-') ? 'en' : 'zh-CN';
}

// Remember each successful merge, including when another language fails to merge.
const registered = new WeakMap<HostI18n, Set<string>>();
const registering = new WeakSet<HostI18n>();

export function registerAiChatLocale(): void {
  const i18n = getHostI18n();
  if (!i18n) return;
  let ownsRegistration = false;
  try {
    if (typeof i18n.mergeLocaleMessage !== 'function' || registering.has(i18n))
      return;
    const languages = registered.get(i18n) ?? new Set<string>();
    registered.set(i18n, languages);
    registering.add(i18n);
    ownsRegistration = true;
    new Set([...Object.keys(aiChatLocale), getLanguage(i18n)]).forEach(lang => {
      if (languages.has(lang)) return;
      try {
        i18n.mergeLocaleMessage!(lang, {
          [AI_CHAT_LOCALE_NAMESPACE]: {
            ...aiChatLocale[normalizeLocale(lang)].aiChat,
          },
        });
        languages.add(lang);
      } catch {
        // Retry only the failed language on the next use.
      }
    });
  } catch {
    // Reading host services must not prevent standalone Preact rendering.
  } finally {
    if (ownsRegistration) registering.delete(i18n);
  }
}

export function t(
  key: keyof typeof zhCN,
  params: TranslationParams = {},
): string {
  registerAiChatLocale();
  const i18n = getHostI18n();
  const tag = `${AI_CHAT_LOCALE_NAMESPACE}.${key}`;
  const fallback = aiChatLocale[normalizeLocale(getLanguage(i18n))].aiChat[
    key
  ].replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    String(params[name] ?? placeholder),
  );
  try {
    const translated = i18n?.t?.(tag, params);
    if (
      typeof translated === 'string' &&
      translated.trim() &&
      translated !== tag &&
      translated !== key
    )
      return translated;
  } catch {
    // Use the selected local dictionary if host translation fails.
  }
  return fallback;
}
