import type { Metadata } from 'next';
import { createServerI18n } from '@/i18n/server';
import { BetterAuthResetPassword } from '@/features/auth/components/better-auth-reset-password';

type ResetPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ResetPasswordPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = await createServerI18n(locale);

  return {
    title: t('resetPassword.title', { ns: 'auth' }),
    description: t('resetPassword.subtitle', { ns: 'auth' })
  };
}

export default async function ResetPasswordPage(props: ResetPasswordPageProps) {
  const { locale } = await props.params;

  return <BetterAuthResetPassword locale={locale} />;
}
