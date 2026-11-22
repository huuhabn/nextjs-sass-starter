import { redirect } from 'next/navigation';
import { getLocalePath } from '@/i18n/locale';

type SignUpPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SignUpRedirectPage(props: SignUpPageProps) {
  const { locale } = await props.params;
  redirect(getLocalePath('/sign-up', locale));
}
