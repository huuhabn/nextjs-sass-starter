import { ClerkProvider } from '@clerk/nextjs';
import { arSA } from '@clerk/localizations';
import { getLocalePath, normalizeLocale } from '@/i18n/locale';

/** Map locale → Clerk localization object (undefined = Clerk default English) */
const CLERK_LOCALIZATIONS: Record<string, typeof arSA | undefined> = {
  'ar-TN': arSA
};

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const normalized = normalizeLocale(locale);

  return (
    <ClerkProvider
      appearance={{ cssLayerName: 'clerk' }}
      localization={CLERK_LOCALIZATIONS[normalized]}
      signInUrl={getLocalePath('/signin', normalized)}
      signUpUrl={getLocalePath('/signup', normalized)}
      signInFallbackRedirectUrl={getLocalePath('/dashboard', normalized)}
      signUpFallbackRedirectUrl={getLocalePath('/dashboard', normalized)}
      afterSignOutUrl={getLocalePath('/', normalized)}
    >
      {props.children}
    </ClerkProvider>
  );
}
