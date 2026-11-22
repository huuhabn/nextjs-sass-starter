import { createInstance } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { cookies } from 'next/headers';
import { loadI18nResource } from './load-resource';
import {
  defaultLocale,
  LOCALE_COOKIE_NAME,
  normalizeLocale,
  supportedLocales,
  type Locale
} from './locale';

/** Đọc locale hiện tại từ cookie server-side */
export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

/** Tạo một i18n instance mới cho mỗi request (không dùng global singleton) */
export async function createServerI18n(locale?: string) {
  const resolvedLocale: Locale = locale ? normalizeLocale(locale) : await getServerLocale();

  const instance = createInstance();
  await instance.use(resourcesToBackend(loadI18nResource)).init({
    lng: resolvedLocale,
    fallbackLng: defaultLocale,
    supportedLngs: [...supportedLocales],
    load: 'currentOnly',
    defaultNS: 'platform',
    ns: ['common', 'auth', 'nav'],
    keySeparator: false,
    interpolation: { escapeValue: false },
    partialBundledLanguages: true,
    returnEmptyString: false
  });

  return {
    i18n: instance,
    locale: resolvedLocale,
    t: instance.getFixedT(resolvedLocale)
  };
}
