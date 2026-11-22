'use client';

import { useSignIn } from '@clerk/nextjs/legacy';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import Link from 'next/link';
import { useAppForm } from '@/lib/form';
import { z } from 'zod';
import { toast } from 'sonner';
import { getLocalePath } from '@/i18n/locale';

interface SignInLabels {
  title: string;
  subtitle: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  submit: string;
  submitting: string;
  noAccount: string;
  signUpLink: string;
  errorInvalidCredentials: string;
}

interface SignInViewProps {
  locale: string;
  labels: SignInLabels;
}

const signInSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(1, 'Required')
});

export function SignInView({ locale, labels }: SignInViewProps) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useAppForm({
    defaultValues: { email: '', password: '' },
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value }) => {
      if (!isLoaded || !signIn) return;

      startTransition(async () => {
        try {
          const result = await signIn.create({
            identifier: value.email,
            password: value.password
          });

          if (result.status === 'complete') {
            await setActive({ session: result.createdSessionId });
            router.push(getLocalePath('/dashboard', locale));
            router.refresh();
          }
        } catch (err: unknown) {
          const clerkError = err as { errors?: { message: string }[] };
          const message = clerkError?.errors?.[0]?.message ?? labels.errorInvalidCredentials;
          toast.error(message);
        }
      });
    }
  });

  return (
    <div className='w-full max-w-sm space-y-6 px-4'>
      {/* Header */}
      <div className='space-y-1 text-center'>
        <h1 className='text-2xl font-semibold tracking-tight'>{labels.title}</h1>
        <p className='text-muted-foreground text-sm'>{labels.subtitle}</p>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className='space-y-4'
      >
        <form.AppField
          name='email'
          children={(field) => (
            <field.TextField
              label={labels.email}
              type='email'
              placeholder={labels.emailPlaceholder}
              autoComplete='email'
              required
            />
          )}
        />

        <form.AppField
          name='password'
          children={(field) => (
            <field.TextField
              label={labels.password}
              type='password'
              placeholder={labels.passwordPlaceholder}
              autoComplete='current-password'
              required
            />
          )}
        />

        <form.AppForm>
          <form.SubmitButton
            className='w-full'
            disabled={isPending}
            loadingLabel={labels.submitting}
          >
            {labels.submit}
          </form.SubmitButton>
        </form.AppForm>
      </form>

      {/* Footer */}
      <p className='text-muted-foreground text-center text-sm'>
        {labels.noAccount}{' '}
        <Link
          href={getLocalePath('/signup', locale)}
          className='text-foreground font-medium underline underline-offset-4 hover:no-underline'
        >
          {labels.signUpLink}
        </Link>
      </p>
    </div>
  );
}
