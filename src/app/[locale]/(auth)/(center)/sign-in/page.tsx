import type { Metadata } from 'next';
import { createServerI18n } from '@/i18n/server';
import { BetterAuthSignIn } from '@/features/auth/components/better-auth-signin';

type SignInPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: SignInPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = await createServerI18n(locale);

  return {
    title: t('signIn.title', { ns: 'auth' }),
    description: t('signIn.subtitle', { ns: 'auth' })
  };
}

export default async function SignInPage(props: SignInPageProps) {
  const { locale } = await props.params;

  return <BetterAuthSignIn locale={locale} />;
}
