import type { Metadata } from 'next';
import { createServerI18n } from '@/i18n/server';
import { BetterAuthSignUp } from '@/features/auth/components/better-auth-signup';

type SignUpPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: SignUpPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = await createServerI18n(locale);

  return {
    title: t('signUp.title', { ns: 'auth' }),
    description: t('signUp.subtitle', { ns: 'auth' })
  };
}

export default async function SignUpPage(props: SignUpPageProps) {
  const { locale } = await props.params;

  return <BetterAuthSignUp locale={locale} />;
}
