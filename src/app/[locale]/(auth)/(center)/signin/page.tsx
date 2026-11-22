import type { Metadata } from 'next';
import { createServerI18n } from '@/i18n/server';
import { SignInView } from './sign-in-view';

type SignInPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: SignInPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = await createServerI18n(locale);

  return {
    title: t('signIn.title', { ns: 'auth' })
  };
}

export default async function SignInPage(props: SignInPageProps) {
  const { locale } = await props.params;
  const { t } = await createServerI18n(locale);

  return (
    <SignInView
      locale={locale}
      labels={{
        title: t('signIn.title', { ns: 'auth' }),
        subtitle: t('signIn.subtitle', { ns: 'auth' }),
        email: t('signIn.email', { ns: 'auth' }),
        emailPlaceholder: t('signIn.emailPlaceholder', { ns: 'auth' }),
        password: t('signIn.password', { ns: 'auth' }),
        passwordPlaceholder: t('signIn.passwordPlaceholder', { ns: 'auth' }),
        submit: t('signIn.submit', { ns: 'auth' }),
        submitting: t('signIn.submitting', { ns: 'auth' }),
        noAccount: t('signIn.noAccount', { ns: 'auth' }),
        signUpLink: t('signIn.signUpLink', { ns: 'auth' }),
        errorInvalidCredentials: t('signIn.error.invalidCredentials', { ns: 'auth' })
      }}
    />
  );
}
