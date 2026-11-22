import { Metadata } from 'next';

import { BetterAuthForgotPassword } from '@/features/auth/components/better-auth-forgot-password';

export const metadata: Metadata = {
  title: 'Authentication | Quên mật khẩu',
  description: 'Khôi phục mật khẩu tài khoản của bạn.'
};

export default function ForgotPasswordPage() {
  return (
    <div className='flex min-h-screen items-center justify-center p-4'>
      <BetterAuthForgotPassword />
    </div>
  );
}
