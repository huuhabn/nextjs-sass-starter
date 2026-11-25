'use client';

import {
  IconBrandGithub,
  IconBrandGoogle,
  IconCheck,
  IconLoader2,
  IconLock,
  IconMail,
  IconUser
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { getLocalePath } from '@/i18n/locale';
import { authClient } from '@/lib/auth-client';

interface BetterAuthSignUpProps {
  locale?: string;
}

export function BetterAuthSignUp({ locale }: BetterAuthSignUpProps) {
  const { t, i18n } = useTranslation('auth');

  useEffect(() => {
    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const dashboardUrl = getLocalePath('/', locale);

  const handleSignUp = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error(t('signUp.firstNamePlaceholder'));
      return;
    }

    if (password.length < 8) {
      toast.error(t('signUp.passwordPlaceholder'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('signUp.error.passwordMismatch'));
      return;
    }

    startTransition(async () => {
      const res = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: dashboardUrl
      });

      if (res.error) {
        toast.error(res.error.message || t('signUp.error.emailExists'));
        return;
      }

      setIsSuccess(true);
      toast.success(t('signUp.success'));
    });
  };

  const handleSocialSignIn = (provider: 'google' | 'github') => {
    startTransition(async () => {
      try {
        await authClient.signIn.social({
          provider,
          callbackURL: dashboardUrl
        });
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : t('signUp.error.general'));
      }
    });
  };

  if (isSuccess) {
    return (
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600'>
            <IconCheck className='h-6 w-6' />
          </div>
          <CardTitle className='text-2xl font-bold'>{t('signUp.verifyTitle')}</CardTitle>
          <CardDescription className='mt-2 text-sm'>
            {t('signUp.verifySubtitle', { email })}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4 text-center'>
          <p className='text-xs text-muted-foreground'>
            (Mailpit:{' '}
            <a
              href='http://localhost:8025'
              target='_blank'
              rel='noreferrer'
              className='font-bold text-primary underline'
            >
              http://localhost:8025
            </a>
            )
          </p>
          <Button onClick={() => router.push(dashboardUrl)} className='w-full'>
            {t('verifyEmail.goToDashboard')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md shadow-lg'>
      <CardHeader className='space-y-1 text-center'>
        <CardTitle className='text-2xl font-bold tracking-tight'>{t('signUp.title')}</CardTitle>
        <CardDescription>{t('signUp.subtitle')}</CardDescription>
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

        <div className='relative flex items-center justify-center text-xs uppercase'>
          <span className='w-full border-t border-border' />
          <span className='bg-card px-2 text-muted-foreground'>{t('signIn.orContinueWith')}</span>
          <span className='w-full border-t border-border' />
        </div>

        <form onSubmit={handleSignUp} className='space-y-3'>
          <div className='space-y-1'>
            <Label htmlFor='signup-name'>{t('signUp.name')}</Label>
            <div className='relative'>
              <IconUser className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
              <Input
                id='signup-name'
                type='text'
                placeholder={t('signUp.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='pl-9'
                disabled={isPending}
                required
              />
            </div>
          </div>

          <div className='space-y-1'>
            <Label htmlFor='signup-email'>{t('signUp.email')}</Label>
            <div className='relative'>
              <IconMail className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
              <Input
                id='signup-email'
                type='email'
                placeholder={t('signUp.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='pl-9'
                disabled={isPending}
                required
              />
            </div>
          </div>

          <div className='space-y-1'>
            <Label htmlFor='signup-password'>{t('signUp.password')}</Label>
            <div className='relative'>
              <IconLock className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
              <Input
                id='signup-password'
                type='password'
                placeholder={t('signUp.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='pl-9'
                disabled={isPending}
                required
              />
            </div>
          </div>

          <div className='space-y-1'>
            <Label htmlFor='signup-confirm-password'>{t('signUp.confirmPassword')}</Label>
            <div className='relative'>
              <IconLock className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
              <Input
                id='signup-confirm-password'
                type='password'
                placeholder={t('signUp.passwordPlaceholder')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='pl-9'
                disabled={isPending}
                required
              />
            </div>
          </div>

          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isPending ? t('signUp.submitting') : t('signUp.submit')}
          </Button>
        </form>
      </CardContent>

      <CardFooter className='flex justify-center text-sm text-muted-foreground'>
        {t('signUp.haveAccount')}{' '}
        <Link
          href={getLocalePath('/sign-in', locale)}
          className='ml-1 font-semibold text-primary hover:underline'
        >
          {t('signUp.signInLink')}
        </Link>
      </CardFooter>
    </Card>
  );
}
