import { useStore } from '../store/useStore';
import type { Language } from '../types';
import en from './locales/en';
import vi from './locales/vi';
import ja from './locales/ja';
import ko from './locales/ko';
import th from './locales/th';
import es from './locales/es';
import de from './locales/de';
import fr from './locales/fr';

/** Every valid translation key, derived from the English source of truth. */
export type TKey = keyof typeof en;

/** A locale dictionary. Non-en locales may omit keys — they fall back to en. */
type Dict = Partial<Record<TKey, string>>;

const LOCALES: Record<Language, Dict> = { en, vi, ja, ko, th, es, de, fr };

/** Replace `{name}` placeholders with values from `params`. */
function interpolate(s: string, params?: Record<string, string | number>): string {
  if (!params) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) =>
    params[k] != null ? String(params[k]) : `{${k}}`,
  );
}

/**
 * Resolve a key for a given language.
 * Lookup order: active locale → English → the raw key (never crashes).
 */
export function translate(
  lang: Language,
  key: TKey,
  params?: Record<string, string | number>,
): string {
  const raw = LOCALES[lang]?.[key] ?? en[key] ?? key;
  return interpolate(raw, params);
}

/**
 * Hook returning a `t` bound to the current language. Subscribes to the store's
 * `language`, so any component using it re-renders live when the user switches.
 */
export function useT() {
  const lang = useStore((s) => s.language);
  return (key: TKey, params?: Record<string, string | number>) =>
    translate(lang, key, params);
}
