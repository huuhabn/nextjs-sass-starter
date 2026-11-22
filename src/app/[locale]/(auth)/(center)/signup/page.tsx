import type { Metadata } from 'next';
import { createServerI18n } from '@/i18n/server';
import { SignUpView } from './sign-up-view';

type SignUpPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: SignUpPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = await createServerI18n(locale);

  return {
    title: t('signUp.title', { ns: 'auth' })
  };
}

export default async function SignUpPage(props: SignUpPageProps) {
  const { locale } = await props.params;
  const { t } = await createServerI18n(locale);

  return (
    <SignUpView
      locale={locale}
      labels={{
        title: t('signUp.title', { ns: 'auth' }),
        subtitle: t('signUp.subtitle', { ns: 'auth' }),
        firstName: t('signUp.firstName', { ns: 'auth' }),
        firstNamePlaceholder: t('signUp.firstNamePlaceholder', { ns: 'auth' }),
        lastName: t('signUp.lastName', { ns: 'auth' }),
        lastNamePlaceholder: t('signUp.lastNamePlaceholder', { ns: 'auth' }),
        email: t('signUp.email', { ns: 'auth' }),
        emailPlaceholder: t('signUp.emailPlaceholder', { ns: 'auth' }),
        password: t('signUp.password', { ns: 'auth' }),
        passwordPlaceholder: t('signUp.passwordPlaceholder', { ns: 'auth' }),
        submit: t('signUp.submit', { ns: 'auth' }),
        submitting: t('signUp.submitting', { ns: 'auth' }),
        haveAccount: t('signUp.haveAccount', { ns: 'auth' }),
        signInLink: t('signUp.signInLink', { ns: 'auth' }),
        verifyTitle: t('signUp.verifyTitle', { ns: 'auth' }),
        verifySubtitle: t('signUp.verifySubtitle', { ns: 'auth' }),
        verifyCode: t('signUp.verifyCode', { ns: 'auth' }),
        verifyCodePlaceholder: t('signUp.verifyCodePlaceholder', { ns: 'auth' }),
        verifySubmit: t('signUp.verifySubmit', { ns: 'auth' }),
        verifySubmitting: t('signUp.verifySubmitting', { ns: 'auth' }),
        errorEmailExists: t('signUp.error.emailExists', { ns: 'auth' })
      }}
    />
  );
}
