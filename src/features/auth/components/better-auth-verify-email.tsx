'use client';

import { IconAlertTriangle, IconCheck, IconLoader2 } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { getLocalePath } from '@/i18n/locale';
import { authClient } from '@/lib/auth-client';

interface BetterAuthVerifyEmailProps {
  locale?: string;
}

export function BetterAuthVerifyEmail({ locale }: BetterAuthVerifyEmailProps) {
  const { t, i18n } = useTranslation('auth');

  useEffect(() => {
    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(() =>
    !token ? 'error' : 'verifying'
  );
  const [errorMessage, setErrorMessage] = useState(() =>
    !token ? t('verifyEmail.errorDesc') : ''
  );
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!token) return;

    startTransition(async () => {
      try {
        const res = await authClient.verifyEmail({
          query: { token }
        });

        if (res.error) {
          setStatus('error');
          setErrorMessage(res.error.message || t('verifyEmail.errorDesc'));
          return;
        }

        setStatus('success');
      } catch (err: unknown) {
        setStatus('error');
        const message = err instanceof Error ? err.message : t('verifyEmail.errorDesc');
        setErrorMessage(message);
      }
    });
  }, [token, t]);

  return (
    <Card className='w-full max-w-md shadow-lg'>
      <CardHeader className='text-center'>
        {status === 'verifying' && (
          <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <IconLoader2 className='h-6 w-6 animate-spin' />
          </div>
        )}
        {status === 'success' && (
          <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600'>
            <IconCheck className='h-6 w-6' />
          </div>
        )}
        {status === 'error' && (
          <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive'>
            <IconAlertTriangle className='h-6 w-6' />
          </div>
        )}
        <CardTitle className='text-xl'>
          {status === 'verifying' && t('verifyEmail.verifyingTitle')}
          {status === 'success' && t('verifyEmail.successTitle')}
          {status === 'error' && t('verifyEmail.errorTitle')}
        </CardTitle>
        <CardDescription>
          {status === 'verifying' && t('verifyEmail.verifyingDesc')}
          {status === 'success' && t('verifyEmail.successDesc')}
          {status === 'error' && (errorMessage || t('verifyEmail.errorDesc'))}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'success' && (
          <div className='rounded-lg bg-emerald-500/10 p-3 text-center text-sm text-emerald-700 dark:text-emerald-300'>
            {t('verifyEmail.successDesc')}
          </div>
        )}
      </CardContent>
      <CardFooter className='flex flex-col gap-2'>
        {status === 'success' && (
          <Button
            className='w-full'
            onClick={() => router.push(getLocalePath('/dashboard/overview', locale))}
          >
            {t('verifyEmail.goToDashboard')}
          </Button>
        )}
        {status === 'error' && (
          <Button
            className='w-full'
            variant='outline'
            render={
              <Link href={getLocalePath('/sign-in', locale)}>{t('verifyEmail.backToSignIn')}</Link>
            }
          />
        )}
      </CardFooter>
    </Card>
  );
}
