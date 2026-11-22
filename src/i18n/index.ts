export { default, getSavedLocale, i18nReady, setLocale } from './client';
export { languages } from './languages';
export {
  defaultLocale,
  DIRECTION_COOKIE_NAME,
  directionForLocale,
  LOCALE_COOKIE_NAME,
  normalizeLocale,
  supportedLocales
} from './locale';
export type { Locale } from './locale';

// Server-side utilities (Next.js Server Components / Server Actions only)
export { createServerI18n, getServerLocale } from './server';
export { setLocaleAction } from './actions';
