import type { Metadata } from 'next';
import { createServerI18n } from '@/i18n/server';
import { BetterAuthVerifyEmail } from '@/features/auth/components/better-auth-verify-email';

type VerifyEmailPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: VerifyEmailPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = await createServerI18n(locale);

  return {
    title: t('verifyEmail.verifyingTitle', { ns: 'auth' }),
    description: t('verifyEmail.verifyingDesc', { ns: 'auth' })
  };
}

export default async function VerifyEmailPage(props: VerifyEmailPageProps) {
  const { locale } = await props.params;

  return <BetterAuthVerifyEmail locale={locale} />;
}
