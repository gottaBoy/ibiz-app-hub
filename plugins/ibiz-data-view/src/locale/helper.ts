import { dataViewEn } from './en';
import { dataViewZhCN } from './zh-CN';

type LocaleResources = Record<string, unknown>;
type I18nLike = {
  getLang?: () => string;
  t?: (
    tag: string,
    defaultMessage?: string,
    options?: Record<string, unknown>,
  ) => string;
  mergeLocaleMessage?: (lang: string, data: LocaleResources) => void;
};

const resources = {
  'zh-CN': dataViewZhCN,
  en: dataViewEn,
};

const registeredLanguages = new WeakMap<I18nLike, Set<string>>();

const getI18n = (): I18nLike | undefined => {
  try {
    return (globalThis as { ibiz?: { i18n?: I18nLike } }).ibiz?.i18n;
  } catch {
    return undefined;
  }
};

const getLanguage = (i18n?: I18nLike): string => {
  try {
    const lang = i18n?.getLang?.();
    return typeof lang === 'string' && lang.trim() ? lang.trim() : 'zh-CN';
  } catch {
    return 'zh-CN';
  }
};

const normalizeLanguage = (lang: string): keyof typeof resources =>
  /^zh(?:-|$)/i.test(lang.trim().replace(/_/g, '-')) ? 'zh-CN' : 'en';

const interpolate = (
  message: string,
  params?: Record<string, unknown>,
): string => {
  if (!params) return message;
  return message.replace(/\{(\w+)\}/g, (_, key: string) =>
    !Object.prototype.hasOwnProperty.call(params, key) ||
    params[key] === undefined
      ? `{${key}}`
      : String(params[key]),
  );
};

const interpolateKnown = (
  message: string,
  template: string,
  params?: Record<string, unknown>,
): string => {
  const known = new Set(
    [...template.matchAll(/\{(\w+)\}/g)].map(match => match[1]),
  );
  return message.replace(/\{(\w+)\}/g, (token, key: string) =>
    known.has(key) &&
    params &&
    Object.prototype.hasOwnProperty.call(params, key) &&
    params[key] !== undefined
      ? String(params[key])
      : token,
  );
};

const isTranslation = (value: unknown, tag: string): value is string =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value !== tag &&
  value !== tag.replace(/^dataView\./, '');

// Only supply missing entries; host translations can predate plugin installation.
const missingMessages = (
  i18n: I18nLike,
  data: LocaleResources,
  lang: string,
  prefix = '',
): LocaleResources => {
  const result: LocaleResources = {};
  Object.entries(data).forEach(([key, value]) => {
    const tag = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      const existing = i18n.t?.(tag, tag, { locale: lang });
      const other =
        resources[normalizeLanguage(lang) === 'en' ? 'zh-CN' : 'en'];
      const otherValue = tag
        .split('.')
        .reduce<unknown>(
          (item, part) =>
            item && typeof item === 'object'
              ? (item as LocaleResources)[part]
              : undefined,
          other,
        );
      if (!isTranslation(existing, tag) || existing === otherValue)
        result[key] = value;
    } else if (value && typeof value === 'object') {
      const children = missingMessages(
        i18n,
        value as LocaleResources,
        lang,
        tag,
      );
      if (Object.keys(children).length) result[key] = children;
    }
  });
  return result;
};

export const registerDataViewLocale = (): void => {
  const i18n = getI18n();
  try {
    if (!i18n || typeof i18n.mergeLocaleMessage !== 'function') return;
    const registered = registeredLanguages.get(i18n) || new Set<string>();
    registeredLanguages.set(i18n, registered);
    const languages = new Set([...Object.keys(resources), getLanguage(i18n)]);
    languages.forEach(lang => {
      if (registered.has(lang)) return;
      // Guard reentrant host callbacks, but allow retries after initialization.
      registered.add(lang);
      try {
        const data = missingMessages(
          i18n,
          resources[normalizeLanguage(lang)],
          lang,
        );
        if (Object.keys(data).length) i18n.mergeLocaleMessage!(lang, data);
      } catch {
        registered.delete(lang);
      }
    });
  } catch {
    // Host properties can be getters backed by an uninitialized locale store.
  }
};

export const dataViewT = (
  key: string,
  params?: Record<string, unknown>,
): string => {
  const i18n = getI18n();
  const fallbackResource = resources[normalizeLanguage(getLanguage(i18n))];
  const fallback = key.split('.').reduce<unknown>((value, part) => {
    if (
      value &&
      typeof value === 'object' &&
      Object.prototype.hasOwnProperty.call(value, part)
    ) {
      return (value as Record<string, unknown>)[part];
    }
    return undefined;
  }, fallbackResource.dataView);
  const fallbackMessage =
    typeof fallback === 'string' ? interpolate(fallback, params) : key;

  registerDataViewLocale();
  const tag = `dataView.${key}`;
  try {
    const translated = i18n?.t?.(tag, fallbackMessage, params);
    return isTranslation(translated, tag)
      ? interpolateKnown(
          translated,
          typeof fallback === 'string' ? fallback : '',
          params,
        )
      : fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};
