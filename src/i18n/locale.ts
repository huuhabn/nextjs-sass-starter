import { languages } from './languages';

export type Locale = (typeof languages)[number]['value'];

export const defaultLocale = 'en-US' satisfies Locale;

export const supportedLocales = languages
  .filter((language) => language.supported)
  .map((language) => language.value);

export const LOCALE_COOKIE_NAME = 'locale';
export const DIRECTION_COOKIE_NAME = 'dir';

const rtlLocales = new Set<string>(['ar-TN', 'fa-IR']);

export function directionForLocale(language: string | undefined): 'ltr' | 'rtl' {
  return rtlLocales.has(normalizeLocale(language)) ? 'rtl' : 'ltr';
}

const legacyLocales: Record<string, Locale> = {
  en_US: 'en-US',
  ar_TN: 'ar-TN',
  vi_VN: 'vi-VN'
};

export function normalizeLocale(language: string | undefined): Locale {
  if (!language) return defaultLocale;
  const canonical = legacyLocales[language] ?? language;
  return supportedLocales.find((locale) => locale === canonical) ?? defaultLocale;
}

/**
 * Trả về đường dẫn đã được bản địa hóa:
 * - defaultLocale (en-US): không có tiền tố (ví dụ: '/signin', '/dashboard')
 * - non-default (vi-VN, ar-TN): có tiền tố (ví dụ: '/vi-VN/signin')
 */
export function getLocalePath(path: string, locale: string | undefined): string {
  const normalized = normalizeLocale(locale);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (normalized === defaultLocale) return cleanPath;
  if (cleanPath === '/') return `/${normalized}`;
  return `/${normalized}${cleanPath}`;
}

/**
 * Chuyển đổi pathname hiện tại sang locale đích (bảo đảm đúng prefix URL):
 * - switchLocalePath('/dashboard/product', 'vi-VN') -> '/vi-VN/dashboard/product'
 * - switchLocalePath('/vi-VN/dashboard/product', 'en-US') -> '/dashboard/product'
 * - switchLocalePath('/', 'vi-VN') -> '/vi-VN'
 * - switchLocalePath('/vi-VN', 'en-US') -> '/'
 */
export function switchLocalePath(currentPath: string, targetLocale: string | undefined): string {
  const next = normalizeLocale(targetLocale);
  const pathParts = currentPath.split('/').filter(Boolean);
  const localePattern = /^[a-z]{2}-[A-Z]{2}$/;
  const hasLocalePrefix = pathParts.length > 0 && localePattern.test(pathParts[0]);

  if (hasLocalePrefix) {
    pathParts.shift();
  }

  const unlocalizedPath = '/' + pathParts.join('/');
  return getLocalePath(unlocalizedPath === '' ? '/' : unlocalizedPath, next);
}
