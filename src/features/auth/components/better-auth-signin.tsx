'use client';

import {
  IconBrandGithub,
  IconBrandGoogle,
  IconFingerprint,
  IconLoader2,
  IconLock,
  IconMail,
  IconShieldCheck
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLocalePath } from '@/i18n/locale';
import { authClient } from '@/lib/auth-client';

interface BetterAuthSignInProps {
  locale?: string;
}

export function BetterAuthSignIn({ locale }: BetterAuthSignInProps) {
  const { t, i18n } = useTranslation('auth');

  useEffect(() => {
    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get('callbackUrl') || '/';
  const callbackUrl =
    rawCallbackUrl.startsWith('/') && !rawCallbackUrl.startsWith(`/${locale}`)
      ? getLocalePath(rawCallbackUrl, locale)
      : rawCallbackUrl;

  const [isPending, startTransition] = useTransition();

  // Mode: 'credentials' | '2fa'
  const [is2FA, setIs2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicEmail, setMagicEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);

  const handleCredentialsSignIn = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('signIn.error.invalidCredentials'));
      return;
    }

    startTransition(async () => {
      const res = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackUrl
      });

      if (res.error) {
        toast.error(res.error.message || t('signIn.error.invalidCredentials'));
        return;
      }

      // If user requires 2FA
      if ((res.data as any)?.twoFactorRedirect) {
        setIs2FA(true);
        toast.info(t('signIn.twoFactor.title'));
        return;
      }

      toast.success(t('signIn.submit'));
      router.push(callbackUrl);
      router.refresh();
    });
  };

  const handle2FAVerify = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!totpCode) {
      toast.error(t('signIn.twoFactor.codeLabel'));
      return;
    }

    startTransition(async () => {
      let res;
      if (useBackupCode) {
        res = await authClient.twoFactor.verifyBackupCode({
          code: totpCode
        });
      } else {
        res = await authClient.twoFactor.verifyTotp({
          code: totpCode
        });
      }

      if (res.error) {
        toast.error(res.error.message || t('signIn.error.invalidCredentials'));
        return;
      }

      toast.success(t('signIn.twoFactor.submit'));
      router.push(callbackUrl);
      router.refresh();
    });
  };

  const handleMagicLink = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!magicEmail) {
      toast.error(t('signIn.emailPlaceholder'));
      return;
    }

    startTransition(async () => {
      const res = await authClient.signIn.magicLink({
        email: magicEmail,
        callbackURL: callbackUrl
      });

      if (res.error) {
        toast.error(res.error.message || t('signIn.error.general'));
        return;
      }

      setMagicSent(true);
      toast.success(t('signIn.magicLink.sentTitle'));
    });
  };

  const handlePasskeySignIn = async () => {
    startTransition(async () => {
      const res = await authClient.signIn.passkey();
      if (res?.error) {
        toast.error(res.error.message || t('signIn.error.general'));
        return;
      }

      toast.success(t('signIn.submit'));
      router.push(callbackUrl);
      router.refresh();
    });
  };

  const handleSocialSignIn = (provider: 'google' | 'github') => {
    startTransition(async () => {
      try {
        await authClient.signIn.social({
          provider,
          callbackURL: callbackUrl
        });
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : t('signIn.error.general'));
      }
    });
  };

  if (is2FA) {
    return (
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <IconShieldCheck className='h-6 w-6' />
          </div>
          <CardTitle className='text-xl'>{t('signIn.twoFactor.title')}</CardTitle>
          <CardDescription>
            {useBackupCode ? t('signIn.twoFactor.backupSubtitle') : t('signIn.twoFactor.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handle2FAVerify} className='space-y-4'>
            <Input
              type='text'
              placeholder={useBackupCode ? 'XXXXXXXX' : '000000'}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value)}
              className='text-center text-xl font-mono tracking-widest'
              disabled={isPending}
              autoFocus
            />
            <Button type='submit' className='w-full' disabled={isPending}>
              {isPending && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
              {t('signIn.twoFactor.submit')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex flex-col space-y-2 text-center text-sm text-muted-foreground'>
          <button
            type='button'
            onClick={() => setUseBackupCode(!useBackupCode)}
            className='hover:text-foreground underline cursor-pointer'
          >
            {useBackupCode ? t('signIn.twoFactor.useTotp') : t('signIn.twoFactor.useBackupCode')}
          </button>
          <button
            type='button'
            onClick={() => setIs2FA(false)}
            className='hover:text-foreground text-xs cursor-pointer'
          >
            ← {t('forgotPassword.backToSignIn')}
          </button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md shadow-lg'>
      <CardHeader className='space-y-1 text-center'>
        <CardTitle className='text-2xl font-bold tracking-tight'>{t('signIn.title')}</CardTitle>
        <CardDescription>{t('signIn.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-2 gap-3'>
          <Button
            variant='outline'
            onClick={() => handleSocialSignIn('google')}
            disabled={isPending}
            className='w-full'
          >
            <IconBrandGoogle className='mr-2 h-4 w-4' />
            Google
          </Button>
          <Button
            variant='outline'
            onClick={() => handleSocialSignIn('github')}
            disabled={isPending}
            className='w-full'
          >
            <IconBrandGithub className='mr-2 h-4 w-4' />
            GitHub
          </Button>
        </div>

        <Button
          variant='secondary'
          onClick={handlePasskeySignIn}
          disabled={isPending}
          className='w-full'
        >
          <IconFingerprint className='mr-2 h-4 w-4' />
          {t('signIn.passkey.button')}
        </Button>

        <div className='relative flex items-center justify-center text-xs uppercase'>
          <span className='w-full border-t border-border' />
          <span className='bg-card px-2 text-muted-foreground'>{t('signIn.orContinueWith')}</span>
          <span className='w-full border-t border-border' />
        </div>

        <Tabs defaultValue='password' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='password'>{t('signIn.tabs.password')}</TabsTrigger>
            <TabsTrigger value='magic'>{t('signIn.tabs.magicLink')}</TabsTrigger>
          </TabsList>

          <TabsContent value='password' className='space-y-3 pt-2'>
            <form onSubmit={handleCredentialsSignIn} className='space-y-3'>
              <div className='space-y-1'>
                <Label htmlFor='signin-email'>{t('signIn.email')}</Label>
                <div className='relative'>
                  <IconMail className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
                  <Input
                    id='signin-email'
                    type='email'
                    placeholder={t('signIn.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='pl-9'
                    disabled={isPending}
                    required
                  />
                </div>
              </div>

              <div className='space-y-1'>
                <div className='flex items-center justify-between'>
                  <Label htmlFor='signin-password'>{t('signIn.password')}</Label>
                  <Link
                    href={getLocalePath('/forgot-password', locale)}
                    className='text-xs text-primary hover:underline'
                  >
                    {t('signIn.forgotPassword')}
                  </Link>
                </div>
                <div className='relative'>
                  <IconLock className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
                  <Input
                    id='signin-password'
                    type='password'
                    placeholder={t('signIn.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className='pl-9'
                    disabled={isPending}
                    required
                  />
                </div>
              </div>

              <Button type='submit' className='w-full' disabled={isPending}>
                {isPending && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isPending ? t('signIn.submitting') : t('signIn.submit')}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value='magic' className='space-y-3 pt-2'>
            {magicSent ? (
              <div className='rounded-md bg-primary/10 p-4 text-center text-sm text-primary'>
                <p className='font-semibold'>{t('signIn.magicLink.sentTitle')}</p>
                <p className='mt-1 text-xs text-muted-foreground'>
                  {t('signIn.magicLink.sentDesc', { email: magicEmail })}
                </p>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => setMagicSent(false)}
                  className='mt-3 text-xs'
                >
                  {t('signIn.magicLink.resend')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className='space-y-3'>
                <div className='space-y-1'>
                  <Label htmlFor='magic-email'>{t('signIn.email')}</Label>
                  <div className='relative'>
                    <IconMail className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
                    <Input
                      id='magic-email'
                      type='email'
                      placeholder={t('signIn.emailPlaceholder')}
                      value={magicEmail}
                      onChange={(e) => setMagicEmail(e.target.value)}
                      className='pl-9'
                      disabled={isPending}
                      required
                    />
                  </div>
                </div>
                <Button type='submit' className='w-full' disabled={isPending}>
                  {isPending && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
                  {isPending ? t('signIn.submitting') : t('signIn.magicLink.submit')}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className='flex justify-center text-sm text-muted-foreground'>
        {t('signIn.noAccount')}{' '}
        <Link
          href={getLocalePath('/sign-up', locale)}
          className='ml-1 font-semibold text-primary hover:underline'
        >
          {t('signIn.signUpLink')}
        </Link>
      </CardFooter>
    </Card>
  );
}
