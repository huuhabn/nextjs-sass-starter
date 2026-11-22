'use client';

import { useSignUp } from '@clerk/nextjs/legacy';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useAppForm } from '@/lib/form';
import { z } from 'zod';
import { toast } from 'sonner';
import { getLocalePath } from '@/i18n/locale';

interface SignUpLabels {
  title: string;
  subtitle: string;
  firstName: string;
  firstNamePlaceholder: string;
  lastName: string;
  lastNamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  submit: string;
  submitting: string;
  haveAccount: string;
  signInLink: string;
  verifyTitle: string;
  verifySubtitle: string;
  verifyCode: string;
  verifyCodePlaceholder: string;
  verifySubmit: string;
  verifySubmitting: string;
  errorEmailExists: string;
}

interface SignUpViewProps {
  locale: string;
  labels: SignUpLabels;
}

const signUpSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().min(1, 'Required').email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters')
});

const verifySchema = z.object({
  code: z.string().length(6, 'Must be 6 digits')
});

export function SignUpView({ locale, labels }: SignUpViewProps) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingVerification, setPendingVerification] = useState(false);
  const [signedUpEmail, setSignedUpEmail] = useState('');

  /* ── Registration form ───────────────────────────────────────── */
  const signUpForm = useAppForm({
    defaultValues: { firstName: '', lastName: '', email: '', password: '' },
    validators: { onSubmit: signUpSchema },
    onSubmit: async ({ value }) => {
      if (!isLoaded || !signUp) return;

      startTransition(async () => {
        try {
          await signUp.create({
            firstName: value.firstName,
            lastName: value.lastName,
            emailAddress: value.email,
            password: value.password
          });

          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          setSignedUpEmail(value.email);
          setPendingVerification(true);
        } catch (err: unknown) {
          const clerkError = err as { errors?: { message: string }[] };
          const message = clerkError?.errors?.[0]?.message ?? labels.errorEmailExists;
          toast.error(message);
        }
      });
    }
  });

  /* ── Verification form ───────────────────────────────────────── */
  const verifyForm = useAppForm({
    defaultValues: { code: '' },
    validators: { onSubmit: verifySchema },
    onSubmit: async ({ value }) => {
      if (!isLoaded || !signUp) return;

      startTransition(async () => {
        try {
          const result = await signUp.attemptEmailAddressVerification({ code: value.code });

          if (result.status === 'complete') {
            await setActive({ session: result.createdSessionId });
            router.push(getLocalePath('/dashboard', locale));
            router.refresh();
          }
        } catch (err: unknown) {
          const clerkError = err as { errors?: { message: string }[] };
          const message = clerkError?.errors?.[0]?.message ?? 'Invalid code';
          toast.error(message);
        }
      });
    }
  });

  /* ── Verify email step ───────────────────────────────────────── */
  if (pendingVerification) {
    return (
      <div className='w-full max-w-sm space-y-6 px-4'>
        <div className='space-y-1 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>{labels.verifyTitle}</h1>
          <p className='text-muted-foreground text-sm'>
            {labels.verifySubtitle.replace('{{email}}', signedUpEmail)}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            verifyForm.handleSubmit();
          }}
          className='space-y-4'
        >
          <verifyForm.AppField
            name='code'
            children={(field) => (
              <field.TextField
                label={labels.verifyCode}
                placeholder={labels.verifyCodePlaceholder}
                autoComplete='one-time-code'
                inputMode='numeric'
                maxLength={6}
                required
              />
            )}
          />

          <verifyForm.AppForm>
            <verifyForm.SubmitButton
              className='w-full'
              disabled={isPending}
              loadingLabel={labels.verifySubmitting}
            >
              {labels.verifySubmit}
            </verifyForm.SubmitButton>
          </verifyForm.AppForm>
        </form>
      </div>
    );
  }

  /* ── Registration step ───────────────────────────────────────── */
  return (
    <div className='w-full max-w-sm space-y-6 px-4'>
      <div className='space-y-1 text-center'>
        <h1 className='text-2xl font-semibold tracking-tight'>{labels.title}</h1>
        <p className='text-muted-foreground text-sm'>{labels.subtitle}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          signUpForm.handleSubmit();
        }}
        className='space-y-4'
      >
        <div className='grid grid-cols-2 gap-3'>
          <signUpForm.AppField
            name='firstName'
            children={(field) => (
              <field.TextField
                label={labels.firstName}
                placeholder={labels.firstNamePlaceholder}
                autoComplete='given-name'
                required
              />
            )}
          />
          <signUpForm.AppField
            name='lastName'
            children={(field) => (
              <field.TextField
                label={labels.lastName}
                placeholder={labels.lastNamePlaceholder}
                autoComplete='family-name'
                required
              />
            )}
          />
        </div>

        <signUpForm.AppField
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

        <signUpForm.AppField
          name='password'
          children={(field) => (
            <field.TextField
              label={labels.password}
              type='password'
              placeholder={labels.passwordPlaceholder}
              autoComplete='new-password'
              required
            />
          )}
        />

        <signUpForm.AppForm>
          <signUpForm.SubmitButton
            className='w-full'
            disabled={isPending}
            loadingLabel={labels.submitting}
          >
            {labels.submit}
          </signUpForm.SubmitButton>
        </signUpForm.AppForm>
      </form>

      <p className='text-muted-foreground text-center text-sm'>
        {labels.haveAccount}{' '}
        <Link
          href={getLocalePath('/signin', locale)}
          className='text-foreground font-medium underline underline-offset-4 hover:no-underline'
        >
          {labels.signInLink}
        </Link>
      </p>
    </div>
  );
}
