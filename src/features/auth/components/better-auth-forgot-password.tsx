'use client';

import { IconCheck, IconLoader2, IconMail } from '@tabler/icons-react';
import Link from 'next/link';
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

interface BetterAuthForgotPasswordProps {
  locale?: string;
}

export function BetterAuthForgotPassword({ locale }: BetterAuthForgotPasswordProps) {
  const { t, i18n } = useTranslation('auth');

  useEffect(() => {
    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('forgotPassword.emailPlaceholder'));
      return;
    }

    startTransition(async () => {
      const resetUrl = `${window.location.origin}${getLocalePath('/reset-password', locale)}`;
      const res = await authClient.requestPasswordReset({
        email,
        redirectTo: resetUrl
      });

      if (res.error) {
        toast.error(res.error.message || t('forgotPassword.sentDesc', { email }));
        return;
      }

      setIsSent(true);
      toast.success(t('forgotPassword.sentTitle'));
    });
  };

  if (isSent) {
    return (
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600'>
            <IconCheck className='h-6 w-6' />
          </div>
          <CardTitle className='text-2xl font-bold'>{t('forgotPassword.sentTitle')}</CardTitle>
          <CardDescription className='mt-2'>
            {t('forgotPassword.sentDesc', { email })}
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
          <Button
            className='w-full'
            variant='outline'
            render={
              <Link href={getLocalePath('/sign-in', locale)}>
                {t('forgotPassword.backToSignIn')}
              </Link>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md shadow-lg'>
      <CardHeader className='space-y-1 text-center'>
        <CardTitle className='text-2xl font-bold tracking-tight'>
          {t('forgotPassword.title')}
        </CardTitle>
        <CardDescription>{t('forgotPassword.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-1'>
            <Label htmlFor='forgot-email'>{t('forgotPassword.email')}</Label>
            <div className='relative'>
              <IconMail className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
              <Input
                id='forgot-email'
                type='email'
                placeholder={t('forgotPassword.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='pl-9'
                disabled={isPending}
                required
              />
            </div>
          </div>
          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isPending ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className='flex justify-center text-sm'>
        <Link
          href={getLocalePath('/sign-in', locale)}
          className='text-primary hover:underline font-medium'
        >
          ← {t('forgotPassword.backToSignIn')}
        </Link>
      </CardFooter>
    </Card>
  );
}
