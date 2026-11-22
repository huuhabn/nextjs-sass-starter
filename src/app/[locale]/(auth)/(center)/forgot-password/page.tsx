import type { Metadata } from 'next';
import { createServerI18n } from '@/i18n/server';
import { BetterAuthForgotPassword } from '@/features/auth/components/better-auth-forgot-password';

type ForgotPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ForgotPasswordPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = await createServerI18n(locale);

  return {
    title: t('forgotPassword.title', { ns: 'auth' }),
    description: t('forgotPassword.subtitle', { ns: 'auth' })
  };
}

export default async function ForgotPasswordPage(props: ForgotPasswordPageProps) {
  const { locale } = await props.params;

  return <BetterAuthForgotPassword locale={locale} />;
}
