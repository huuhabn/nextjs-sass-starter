import type { MetadataRoute } from 'next';
import { supportedLocales } from '@/i18n/locale';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const routes = ['', '/dashboard'];

  return routes.flatMap((route) =>
    supportedLocales.map((locale) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          supportedLocales.map((loc) => [loc, `${baseUrl}/${loc}${route}`])
        )
      }
    }))
  );
}
