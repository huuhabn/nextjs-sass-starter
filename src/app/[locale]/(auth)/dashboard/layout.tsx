import { auth } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LanguageSwitcher } from '@/components/language-switcher';
import { createServerI18n } from '@/i18n/server';

import { getLocalePath } from '@/i18n/locale';

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: DashboardLayoutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = await createServerI18n(locale);

  return {
    title: t('dashboard', { ns: 'nav' }),
    description: 'Dashboard'
  };
}

export default async function LocaleDashboardLayout(props: DashboardLayoutProps) {
  const { locale } = await props.params;

  const { userId } = await auth();
  if (!userId) redirect(getLocalePath('/signin', locale));

  const { t } = await createServerI18n(locale);

  return (
    <div className='min-h-screen bg-background'>
      <header className='flex h-14 shrink-0 items-center justify-between border-b px-4'>
        <span className='font-semibold text-sm'>{t('dashboard', { ns: 'nav' })}</span>
        <div className='flex items-center gap-2'>
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </header>
      <main className='p-6'>{props.children}</main>
    </div>
  );
}
