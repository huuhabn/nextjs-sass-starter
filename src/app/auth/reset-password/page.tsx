import { Metadata } from 'next';
import { Suspense } from 'react';

import { BetterAuthResetPassword } from '@/features/auth/components/better-auth-reset-password';

export const metadata: Metadata = {
  title: 'Authentication | Đặt lại mật khẩu',
  description: 'Nhập mật khẩu mới cho tài khoản của bạn.'
};

export default function ResetPasswordPage() {
  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <Suspense fallback={<div>Đang tải...</div>}>
        <BetterAuthResetPassword />
      </Suspense>
    </div>
  );
}
