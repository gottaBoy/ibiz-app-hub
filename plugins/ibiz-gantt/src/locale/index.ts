import { inject, isRef, provide, ref, type InjectionKey, type Ref } from 'vue';
import en from './en';
import zhCN from './zh-CN';

export type GanttLocale = 'zh-CN' | 'en' | (string & {});
export type GanttLocaleKey = keyof typeof en;

export const ganttLocaleKey: InjectionKey<Readonly<Ref<GanttLocale>>> =
  Symbol('gantt-locale');

export function normalizeGanttLocale(locale: GanttLocale = 'en') {
  const normalized = typeof locale === 'string'
    ? locale.trim().replace(/_/g, '-').toLowerCase()
    : '';
  if (normalized === 'zh' || normalized === 'zh-cn') return 'zh-CN';
  if (normalized === 'en' || normalized.startsWith('en-')) return 'en';
  return normalized || 'en';
}

function hostI18n() {
  const value = (globalThis as { ibiz?: { i18n?: unknown } }).ibiz?.i18n;
  return value && typeof value === 'object'
    ? (value as {
        getLang?: () => string;
        t?: (key: string, defaultMessage?: string) => unknown;
        mergeLocaleMessage?: (locale: string, data: Record<string, unknown>) => void;
      })
    : undefined;
}

const registered = new WeakMap<object, Set<string>>();
const registering = new WeakSet<object>();

export function registerGanttLocale() {
  let current: object | undefined;
  try {
    const i18n = hostI18n();
    if (typeof i18n?.mergeLocaleMessage !== 'function') return false;
    if (registering.has(i18n)) return false;
    registering.add(i18n);
    current = i18n;
    const done = registered.get(i18n) ?? new Set<string>();
    registered.set(i18n, done);
    let language;
    try { language = i18n.getLang?.(); } catch { /* Host startup. */ }
    // Keep the local fallbacks independent of host resource mutation.
    const languages = new Set(['en', 'zh-CN']);
    if (typeof language === 'string' && language.trim()) languages.add(language.trim());
    let complete = true;
    languages.forEach(lang => {
      if (done.has(lang)) return;
      try {
        const messages = normalizeGanttLocale(lang) === 'zh-CN' ? zhCN : en;
        i18n.mergeLocaleMessage!(lang, { gantt: { ...messages } });
        done.add(lang);
      } catch {
        complete = false;
      }
    });
    return complete;
  } catch {
    return false;
  } finally {
    if (current) registering.delete(current);
  }
}

export function provideGanttLocale(
  locale?: GanttLocale | Readonly<Ref<GanttLocale>>,
) {
  const current = isRef(locale) ? locale : ref<GanttLocale>(locale || 'en');
  provide(ganttLocaleKey, current);
  return current;
}

export function translateGantt(key: GanttLocaleKey, locale: GanttLocale = 'en') {
  const normalized = normalizeGanttLocale(locale);
  const fallback = (normalized === 'zh-CN' ? zhCN : en)[key] ?? '';
  const tag = `gantt.${key}`;
  try {
    const host = hostI18n();
    const hostLanguage = typeof host?.getLang === 'function' ? host.getLang() : undefined;
    // Host t() uses global language; never let it override another instance.
    if (
      typeof hostLanguage === 'string' &&
      hostLanguage.trim() &&
      typeof host?.t === 'function' &&
      normalizeGanttLocale(hostLanguage) === normalized
    ) {
      const translated = host.t(tag, fallback);
      if (
        typeof translated === 'string' &&
        translated.trim() &&
        translated.trim() !== tag &&
        translated.trim() !== key
      ) {
        return translated;
      }
    }
  } catch {
    // A missing or uninitialized host must not prevent standalone rendering.
  }
  return fallback;
}

export function useGanttLocale() {
  const locale = inject(ganttLocaleKey, ref<GanttLocale>('en'));
  const t = (key: GanttLocaleKey) => translateGantt(key, locale.value);
  return { locale, t };
}

export { en, zhCN };
