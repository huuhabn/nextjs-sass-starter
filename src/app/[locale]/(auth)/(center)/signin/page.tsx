import { redirect } from 'next/navigation';
import { getLocalePath } from '@/i18n/locale';

type SignInPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SignInRedirectPage(props: SignInPageProps) {
  const { locale } = await props.params;
  redirect(getLocalePath('/sign-in', locale));
}
