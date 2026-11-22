import { directionForLocale, normalizeLocale, supportedLocales } from '@/i18n/locale';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return supportedLocales.map((locale) => ({ locale }));
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const normalized = normalizeLocale(locale);

  if (!supportedLocales.includes(normalized)) {
    notFound();
  }

  const dir = directionForLocale(normalized);

  return (
    <div dir={dir} className='contents'>
      {props.children}
    </div>
  );
}
