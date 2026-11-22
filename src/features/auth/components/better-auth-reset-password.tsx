'use client';

import { IconCheck, IconLoader2, IconLock } from '@tabler/icons-react';
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
import { getLocalePath } from '@/i18n/locale';
import { authClient } from '@/lib/auth-client';

interface BetterAuthResetPasswordProps {
  locale?: string;
}

export function BetterAuthResetPassword({ locale }: BetterAuthResetPasswordProps) {
  const { t, i18n } = useTranslation('auth');

  useEffect(() => {
    if (locale && i18n.language !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale, i18n]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error(t('resetPassword.error.invalidToken'));
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
      const res = await authClient.resetPassword({
        newPassword: password,
        token
      });

      if (res.error) {
        toast.error(res.error.message || t('resetPassword.error.invalidToken'));
        return;
      }

      setIsSuccess(true);
      toast.success(t('resetPassword.successTitle'));
    });
  };

  if (isSuccess) {
    return (
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600'>
            <IconCheck className='h-6 w-6' />
          </div>
          <CardTitle className='text-2xl font-bold'>{t('resetPassword.successTitle')}</CardTitle>
          <CardDescription className='mt-2'>{t('resetPassword.successDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push(getLocalePath('/sign-in', locale))} className='w-full'>
            {t('resetPassword.backToSignIn')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md shadow-lg'>
      <CardHeader className='space-y-1 text-center'>
        <CardTitle className='text-2xl font-bold tracking-tight'>
          {t('resetPassword.title')}
        </CardTitle>
        <CardDescription>{t('resetPassword.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-1'>
            <Label htmlFor='reset-new-password'>{t('resetPassword.newPassword')}</Label>
            <div className='relative'>
              <IconLock className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
              <Input
                id='reset-new-password'
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='pl-9'
                disabled={isPending}
                required
              />
            </div>
          </div>

          <div className='space-y-1'>
            <Label htmlFor='reset-confirm-password'>{t('resetPassword.confirmPassword')}</Label>
            <div className='relative'>
              <IconLock className='text-muted-foreground absolute top-2.5 left-3 h-4 w-4' />
              <Input
                id='reset-confirm-password'
                type='password'
                placeholder='••••••••'
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
            {isPending ? t('resetPassword.submitting') : t('resetPassword.submit')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className='flex justify-center text-sm'>
        <Link
          href={getLocalePath('/sign-in', locale)}
          className='text-primary hover:underline font-medium'
        >
          ← {t('resetPassword.backToSignIn')}
        </Link>
      </CardFooter>
    </Card>
  );
}
