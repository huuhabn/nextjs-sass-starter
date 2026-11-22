import { createServerI18n } from '@/i18n/server';

export default async function LocaleDashboardPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const { t } = await createServerI18n(locale);

  return (
    <div className='py-4'>
      <h1 className='text-2xl font-bold tracking-tight'>{t('dashboard', { ns: 'nav' })}</h1>
      <p className='text-muted-foreground mt-2 text-sm'>
        Locale: <code className='font-mono'>{locale}</code>
      </p>
    </div>
  );
}
