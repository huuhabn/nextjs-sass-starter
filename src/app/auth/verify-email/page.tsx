import { Metadata } from 'next';
import { Suspense } from 'react';

import { BetterAuthVerifyEmail } from '@/features/auth/components/better-auth-verify-email';

export const metadata: Metadata = {
  title: 'Authentication | Xác thực Email',
  description: 'Kích hoạt tài khoản email của bạn.'
};

export default function VerifyEmailPage() {
  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Suspense fallback={<div>Đang xác thực...</div>}>
        <BetterAuthVerifyEmail />
      </Suspense>
    </div>
  );
}
