import { LanguageSwitcher } from '@/components/language-switcher';

export default async function CenteredLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  return (
    <div className='relative flex min-h-screen items-center justify-center bg-background'>
      <div className='absolute top-4 end-4 z-10'>
        <LanguageSwitcher currentLocale={locale} />
      </div>
      {props.children}
    </div>
  );
}
