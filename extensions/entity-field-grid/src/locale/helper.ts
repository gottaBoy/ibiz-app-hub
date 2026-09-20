import { entityFieldGridEn } from './en';
import { entityFieldGridZhCN } from './zh-CN';

type LocaleMessages = {
  [key: string]: string | LocaleMessages;
};
type TranslationParams = Record<string, unknown> | undefined;
type HostI18n = {
  getLang?: () => string;
  t?: (...args: unknown[]) => unknown;
  mergeLocaleMessage?: (lang: string, messages: LocaleMessages) => void;
};
type Locale = 'zh-CN' | 'en';

export const entityFieldGridLocale = {
  'zh-CN': entityFieldGridZhCN,
  en: entityFieldGridEn,
} as const;

const registeredLanguages = new WeakMap<HostI18n, Set<string>>();
const registeringHosts = new WeakSet<HostI18n>();

function getHostI18n(): HostI18n | undefined {
  try {
    const host = (
      globalThis as typeof globalThis & {
        ibiz?: { i18n?: unknown };
      }
    ).ibiz?.i18n;
    return host && typeof host === 'object' ? (host as HostI18n) : undefined;
  } catch {
    return undefined;
  }
}

function getLanguage(i18n?: HostI18n): string {
  try {
    const language = i18n?.getLang?.();
    return typeof language === 'string' && language.trim()
      ? language.trim()
      : 'zh-CN';
  } catch {
    return 'zh-CN';
  }
}

export function normalizeEntityFieldGridLocale(language: string): Locale {
  const normalized = language.trim().replace(/_/g, '-').toLowerCase();
  return normalized === 'en' || normalized.startsWith('en-') ? 'en' : 'zh-CN';
}

function interpolate(message: string, params: TranslationParams): string {
  if (!params) return message;
  return message.replace(/\{(\w+)\}/g, (token, name: string) => {
    if (!Object.prototype.hasOwnProperty.call(params, name)) return token;
    const value = params[name];
    return value === undefined ? token : String(value);
  });
}

function lookup(messages: LocaleMessages, key: string): string | undefined {
  let value: string | LocaleMessages | undefined = messages;
  for (const part of key.split('.')) {
    if (!value || typeof value === 'string') return undefined;
    value = value[part];
  }
  return typeof value === 'string' ? value : undefined;
}

function callHostTranslation(
  i18n: HostI18n,
  tag: string,
  fallback: string,
  params: TranslationParams,
  withFallback = false,
): unknown {
  try {
    const translate = i18n.t;
    if (typeof translate !== 'function') return undefined;
    // ibiz.i18n exposes both t(tag, params) and t(tag, fallback, params).
    const translated = translate.call(i18n, tag, fallback, params || {});
    if (
      withFallback ||
      (typeof translated === 'string' &&
        translated.trim().length > 0 &&
        translated !== tag)
    ) {
      return translated;
    }
    return translate.call(i18n, tag, params || {});
  } catch {
    if (withFallback) return undefined;
    try {
      const translate = i18n.t;
      return translate?.call(i18n, tag, params || {});
    } catch {
      return undefined;
    }
  }
}

function isHostTranslation(
  value: unknown,
  tag: string,
  shortKey: string,
): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value !== tag &&
    value !== shortKey
  );
}

function interpolateKnown(
  message: string,
  template: string,
  params: TranslationParams,
): string {
  const known = new Set(
    [...template.matchAll(/\{(\w+)\}/g)].map(match => match[1]),
  );
  return message.replace(/\{(\w+)\}/g, (token, name: string) =>
    known.has(name) &&
    params &&
    Object.prototype.hasOwnProperty.call(params, name) &&
    params[name] !== undefined
      ? String(params[name])
      : token,
  );
}

function missingMessages(
  i18n: HostI18n,
  messages: LocaleMessages,
  language: string,
  prefix = '',
): LocaleMessages {
  const result: LocaleMessages = {};
  Object.entries(messages).forEach(([key, value]) => {
    const tag = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      const existing = callHostTranslation(
        i18n,
        tag,
        tag,
        {
          locale: language,
        },
        true,
      );
      const other =
        normalizeEntityFieldGridLocale(language) === 'en' ? 'zh-CN' : 'en';
      if (
        !isHostTranslation(existing, tag, key) ||
        existing === lookup(entityFieldGridLocale[other], tag)
      ) {
        result[key] = value;
      }
      return;
    }
    const children = missingMessages(i18n, value, language, tag);
    if (Object.keys(children).length > 0) result[key] = children;
  });
  return result;
}

export function registerEntityFieldGridLocale(): void {
  const i18n = getHostI18n();
  if (!i18n) return;
  if (registeringHosts.has(i18n)) return;

  try {
    const mergeLocaleMessage = i18n.mergeLocaleMessage;
    if (typeof mergeLocaleMessage !== 'function') return;
    const languages = registeredLanguages.get(i18n) || new Set<string>();
    registeredLanguages.set(i18n, languages);
    registeringHosts.add(i18n);
    const currentLanguage = getLanguage(i18n);
    const targetLanguages = new Set(['zh-CN', 'en', currentLanguage]);
    targetLanguages.forEach(language => {
      if (languages.has(language)) return;
      try {
        const locale = normalizeEntityFieldGridLocale(language);
        const messages = missingMessages(
          i18n,
          entityFieldGridLocale[locale],
          language,
        );
        if (Object.keys(messages).length > 0) {
          mergeLocaleMessage.call(i18n, language, messages);
        }
        languages.add(language);
      } catch {
        // Retry a failed language when the host becomes ready.
      }
    });
  } catch {
    // Host services can be exposed before their locale store is initialized.
  } finally {
    registeringHosts.delete(i18n);
  }
}

export function entityFieldGridT(
  key: string,
  params?: TranslationParams,
): string {
  const i18n = getHostI18n();
  const locale = normalizeEntityFieldGridLocale(getLanguage(i18n));
  const fallback = lookup(
    entityFieldGridLocale[locale],
    `entityFieldGrid.${key}`,
  );
  const fallbackMessage =
    typeof fallback === 'string' ? interpolate(fallback, params) : key;
  const tag = `entityFieldGrid.${key}`;

  registerEntityFieldGridLocale();
  const translated = i18n
    ? callHostTranslation(i18n, tag, fallbackMessage, params)
    : undefined;
  const otherLocale = locale === 'en' ? 'zh-CN' : 'en';
  const other = lookup(
    entityFieldGridLocale[otherLocale],
    `entityFieldGrid.${key}`,
  );
  return isHostTranslation(translated, tag, key) &&
    translated !== interpolate(other || '', params)
    ? interpolateKnown(translated, fallback || '', params)
    : fallbackMessage;
}

export const t = entityFieldGridT;
export const registerLocale = registerEntityFieldGridLocale;
