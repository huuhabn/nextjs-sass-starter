import { normalizeLocale } from './locale';

type ResourceLoader = (namespace: string) => Promise<{ default: Record<string, unknown> }>;

const loaders: Record<string, ResourceLoader> = {
  'en-US': (ns: string) => import(`./locales/en-US/${ns}.json`),
  'vi-VN': (ns: string) => import(`./locales/vi-VN/${ns}.json`),
  'ar-TN': (ns: string) => import(`./locales/ar-TN/${ns}.json`)
};

export async function loadI18nResource(language: string, namespace: string) {
  const locale = normalizeLocale(language);
  const load = loaders[locale] || loaders['en-US'];
  try {
    const mod = await load(namespace);
    return mod.default;
  } catch {
    return {};
  }
}
