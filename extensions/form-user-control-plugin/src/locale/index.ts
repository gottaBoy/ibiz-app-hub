import { en } from './en';
import { zhCN } from './zh-CN';

type Messages = Record<string, unknown>;
type Params = Record<string, unknown>;
type HostI18n = {
  getLang?: () => string;
  t?: (key: string, params?: Params) => unknown;
  mergeLocaleMessage?: (lang: string, messages: Messages) => void;
};

const namespace = 'formUserControlPlugin';
const resources = { 'zh-CN': zhCN, en };
const registered = new WeakMap<HostI18n, Set<string>>();
const registering = new WeakSet<HostI18n>();

function getHost(): HostI18n | undefined {
  try {
    return (globalThis as typeof globalThis & { ibiz?: { i18n?: HostI18n } })
      .ibiz?.i18n;
  } catch {
    return undefined;
  }
}

function getLanguage(i18n?: HostI18n): string {
  try {
    const language = i18n?.getLang?.();
    if (typeof language === 'string' && language.trim()) return language.trim();
  } catch {
    // The host can expose i18n before its language service is ready.
  }
  return 'zh-CN';
}

function normalizeLanguage(language: string): 'zh-CN' | 'en' {
  return /^zh(?:-|$)/i.test(language.trim().replace(/_/g, '-')) ? 'zh-CN' : 'en';
}

function interpolate(message: string, params: Params): string {
  return message.replace(/\{(\w+)\}/g, (token, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) &&
    params[key] !== undefined
      ? String(params[key])
      : token,
  );
}

function cloneMessages(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cloneMessages);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, cloneMessages(child)]),
    );
  }
  return value;
}

function getFallback(key: string, language: string): unknown {
  const path = key.startsWith(`${namespace}.`)
    ? key.slice(namespace.length + 1)
    : key;
  return path.split('.').reduce<unknown>((value, part) => {
    if (value && typeof value === 'object' && part in value) {
      return (value as Record<string, unknown>)[part];
    }
    return undefined;
  }, resources[normalizeLanguage(language)][namespace]);
}

function isUsableTranslation(
  value: unknown,
  tag: string,
  key: string,
): value is string {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value !== tag &&
    value !== key
  );
}

export function registerFormUserControlLocale(): void {
  const i18n = getHost();
  if (!i18n) return;
  let ownsRegistration = false;
  try {
    if (typeof i18n.mergeLocaleMessage !== 'function' || registering.has(i18n))
      return;
    const languages = registered.get(i18n) || new Set<string>();
    registered.set(i18n, languages);
    registering.add(i18n);
    ownsRegistration = true;
    new Set([...Object.keys(resources), getLanguage(i18n)]).forEach(language => {
      const messages = resources[normalizeLanguage(language)];
      if (languages.has(language)) return;
      try {
        i18n.mergeLocaleMessage!(language, cloneMessages(messages) as Messages);
        languages.add(language);
      } catch {
        // Retry failed languages after the host finishes initialization.
      }
    });
  } catch {
    // Standalone plugin loading must not depend on an initialized host.
  } finally {
    if (ownsRegistration) registering.delete(i18n);
  }
}

export function formUserControlT(key: string, params: Params = {}): string {
  registerFormUserControlLocale();
  const i18n = getHost();
  const tag = key.startsWith(`${namespace}.`) ? key : `${namespace}.${key}`;
  const local = getFallback(key, getLanguage(i18n));
  const fallback = typeof local === 'string' ? interpolate(local, params) : key;
  try {
    const translated = i18n?.t?.(tag, params);
    if (isUsableTranslation(translated, tag, key)) {
      return translated;
    }
  } catch {
    // Use the bundled language when the host translator is unavailable.
  }
  return fallback;
}

export const t = formUserControlT;
export const formUserControlLocale = resources;
export { en, zhCN };
