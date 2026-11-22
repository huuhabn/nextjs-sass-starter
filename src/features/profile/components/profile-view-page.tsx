'use client';

import {
  IconBrandGithub,
  IconBrandGoogle,
  IconCheck,
  IconDeviceDesktop,
  IconFingerprint,
  IconKey,
  IconLoader2,
  IconLock,
  IconMail,
  IconPlus,
  IconShieldCheck,
  IconTrash,
  IconUser
} from '@tabler/icons-react';
import QRCode from 'qrcode';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authClient, useSession } from '@/lib/auth-client';

export default function ProfileViewPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const [isPending, startTransition] = useTransition();

  // Profile Edit
  const [name, setName] = useState('');

  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // 2FA Dialog & States
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFAPassword, setTwoFAPassword] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyTOTPCode, setVerifyTOTPCode] = useState('');
  const [twoFAStep, setTwoFAStep] = useState<'password' | 'scan' | 'done'>('password');

  // Passkeys
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [newPasskeyName, setNewPasskeyName] = useState('');
  const [showPasskeyDialog, setShowPasskeyDialog] = useState(false);

  // Accounts
  const [accounts, setAccounts] = useState<any[]>([]);

  // Load Passkeys and Accounts
  const loadSecurityData = async () => {
    try {
      const passkeyList = await authClient.passkey.listUserPasskeys();
      if (passkeyList?.data) {
        setPasskeys(passkeyList.data);
      }

      const accountList = await authClient.listAccounts();
      if (accountList?.data) {
        setAccounts(accountList.data);
      }
    } catch {
      // Ignore if not loaded
    }
  };

  useEffect(() => {
    let ignore = false;
    if (session?.user) {
      if (session.user.name && !name) {
        // oxlint-disable-next-line react/set-state-in-effect
        setName(session.user.name);
      }
      authClient.passkey
        .listUserPasskeys()
        .then((passkeyList) => {
          if (!ignore && passkeyList?.data) {
            setPasskeys(passkeyList.data);
          }
        })
        .catch(() => {});

      authClient
        .listAccounts()
        .then((accountList) => {
          if (!ignore && accountList?.data) {
            setAccounts(accountList.data);
          }
        })
        .catch(() => {});
    }
    return () => {
      ignore = true;
    };
  }, [session?.user]);

  const handleUpdateProfile = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Họ tên không được để trống');
      return;
    }

    startTransition(async () => {
      const res = await authClient.updateUser({
        name
      });

      if (res.error) {
        toast.error(res.error.message || 'Cập nhật thất bại');
        return;
      }

      toast.success('Cập nhật thông tin thành công!');
    });
  };

  const handleChangePassword = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Vui lòng điền đầy đủ mật khẩu hiện tại và mật khẩu mới');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('Xác nhận mật khẩu mới không trùng khớp');
      return;
    }

    startTransition(async () => {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true
      });

      if (res.error) {
        toast.error(res.error.message || 'Đổi mật khẩu thất bại');
        return;
      }

      toast.success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    });
  };

  const handleStartEnable2FA = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!twoFAPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    startTransition(async () => {
      const res = await authClient.twoFactor.enable({
        password: twoFAPassword
      });

      if (res.error) {
        toast.error(res.error.message || 'Mật khẩu không chính xác');
        return;
      }

      if (res.data && 'totpURI' in res.data && res.data.totpURI) {
        const qr = await QRCode.toDataURL(res.data.totpURI);
        setQrCodeUrl(qr);
        setBackupCodes(('backupCodes' in res.data && res.data.backupCodes) || []);
        setTwoFAStep('scan');
      }
    });
  };

  const handleConfirm2FA = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!verifyTOTPCode) {
      toast.error('Vui lòng nhập mã từ ứng dụng Authenticator');
      return;
    }

    startTransition(async () => {
      const res = await authClient.twoFactor.verifyTotp({
        code: verifyTOTPCode
      });

      if (res.error) {
        toast.error(res.error.message || 'Mã xác thực không hợp lệ');
        return;
      }

      toast.success('Đã kích hoạt bảo mật 2 lớp thành công!');
      setTwoFAStep('done');
    });
  };

  const handleDisable2FA = async () => {
    const pwd = prompt('Nhập mật khẩu của bạn để xác nhận tắt 2FA:');
    if (!pwd) return;

    startTransition(async () => {
      const res = await authClient.twoFactor.disable({
        password: pwd
      });

      if (res.error) {
        toast.error(res.error.message || 'Tắt 2FA thất bại');
        return;
      }

      toast.success('Đã tắt bảo mật 2 lớp thành công');
    });
  };

  const handleAddPasskey = async () => {
    startTransition(async () => {
      const res = await authClient.passkey.addPasskey({
        name: newPasskeyName || 'Passkey Device'
      });

      if (res?.error) {
        toast.error(res.error.message || 'Không thể tạo Passkey');
        return;
      }

      toast.success('Đã thêm Passkey thành công!');
      setShowPasskeyDialog(false);
      setNewPasskeyName('');
      loadSecurityData();
    });
  };

  const handleDeletePasskey = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa Passkey này?')) return;

    startTransition(async () => {
      const res = await authClient.passkey.deletePasskey({
        id
      });

      if (res?.error) {
        toast.error(res.error.message || 'Xóa Passkey thất bại');
        return;
      }

      toast.success('Đã xóa Passkey');
      loadSecurityData();
    });
  };

  const handleLinkSocial = async (provider: 'google' | 'github') => {
    startTransition(async () => {
      await authClient.linkSocial({
        provider,
        callbackURL: window.location.href
      });
    });
  };

  const handleUnlinkSocial = async (providerId: string) => {
    if (!confirm(`Bạn có chắc muốn hủy liên kết với ${providerId}?`)) return;

    startTransition(async () => {
      const res = await authClient.unlinkAccount({
        accountId: providerId
      });

      if (res?.error) {
        toast.error(res.error.message || 'Hủy liên kết thất bại');
        return;
      }

      toast.success(`Đã hủy liên kết ${providerId}`);
      loadSecurityData();
    });
  };

  const isGoogleLinked = accounts.some((a) => a.providerId === 'google');
  const isGithubLinked = accounts.some((a) => a.providerId === 'github');

  if (sessionLoading) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <IconLoader2 className='text-muted-foreground h-8 w-8 animate-spin' />
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Tài khoản & Bảo mật</h1>
        <p className='text-muted-foreground text-sm'>
          Quản lý thông tin hồ sơ, phương thức đăng nhập và bảo mật tài khoản
        </p>
      </div>

      <Tabs defaultValue='general' className='space-y-4'>
        <TabsList className='grid w-full max-w-md grid-cols-3'>
          <TabsTrigger value='general'>Hồ sơ</TabsTrigger>
          <TabsTrigger value='security'>Bảo mật & 2FA</TabsTrigger>
          <TabsTrigger value='sso'>Liên kết SSO</TabsTrigger>
        </TabsList>

        {/* Tab 1: General Profile */}
        <TabsContent value='general' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Cập nhật tên và thông tin liên hệ của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className='space-y-4 max-w-lg'>
                <div className='flex items-center space-x-4'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold'>
                    {user?.name?.[0]?.toUpperCase() || <IconUser className='h-8 w-8' />}
                  </div>
                  <div>
                    <p className='font-medium'>{user?.name}</p>
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <span>{user?.email}</span>
                      {user?.emailVerified ? (
                        <Badge
                          variant='outline'
                          className='bg-emerald-50 text-emerald-700 border-emerald-200 text-xs'
                        >
                          Đã xác thực
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='bg-amber-50 text-amber-700 border-amber-200 text-xs'
                        >
                          Chưa xác thực
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className='space-y-1'>
                  <Label htmlFor='profile-name'>Họ và tên</Label>
                  <Input
                    id='profile-name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder='Tên của bạn'
                    disabled={isPending}
                  />
                </div>

                <div className='space-y-1'>
                  <Label htmlFor='profile-email'>Địa chỉ Email</Label>
                  <Input
                    id='profile-email'
                    value={user?.email || ''}
                    disabled
                    className='bg-muted cursor-not-allowed'
                  />
                  <p className='text-xs text-muted-foreground'>
                    Địa chỉ email được sử dụng để đăng nhập và nhận thông báo.
                  </p>
                </div>

                <Button type='submit' disabled={isPending}>
                  {isPending && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
                  Lưu thay đổi
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Security, Passwords & 2FA */}
        <TabsContent value='security' className='space-y-4'>
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>Cập nhật mật khẩu để bảo vệ tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className='space-y-3 max-w-lg'>
                <div className='space-y-1'>
                  <Label htmlFor='current-password'>Mật khẩu hiện tại</Label>
                  <Input
                    id='current-password'
                    type='password'
                    placeholder='••••••••'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div className='space-y-1'>
                  <Label htmlFor='new-password'>Mật khẩu mới (ít nhất 8 ký tự)</Label>
                  <Input
                    id='new-password'
                    type='password'
                    placeholder='••••••••'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div className='space-y-1'>
                  <Label htmlFor='confirm-new-password'>Xác nhận mật khẩu mới</Label>
                  <Input
                    id='confirm-new-password'
                    type='password'
                    placeholder='••••••••'
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <Button type='submit' disabled={isPending}>
                  {isPending && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />}
                  Cập nhật mật khẩu
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <IconShieldCheck className='h-5 w-5 text-primary' />
                    Xác thực 2 bước (2FA)
                  </CardTitle>
                  <CardDescription>
                    Tăng cường bảo mật với mã xác nhận từ Google Authenticator hoặc Authy
                  </CardDescription>
                </div>
                {user?.twoFactorEnabled ? (
                  <Badge
                    variant='outline'
                    className='bg-emerald-50 text-emerald-700 border-emerald-200'
                  >
                    Đang bật
                  </Badge>
                ) : (
                  <Badge variant='outline' className='bg-muted text-muted-foreground'>
                    Đang tắt
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {user?.twoFactorEnabled ? (
                <div className='space-y-3'>
                  <p className='text-sm text-muted-foreground'>
                    Tài khoản của bạn đã được bảo vệ bởi xác thực hai bước. Bạn sẽ cần nhập mã xác
                    minh khi đăng nhập từ thiết bị mới.
                  </p>
                  <Button
                    variant='destructive'
                    size='sm'
                    onClick={handleDisable2FA}
                    disabled={isPending}
                  >
                    Tắt xác thực 2 bước
                  </Button>
                </div>
              ) : (
                <div className='space-y-3'>
                  <p className='text-sm text-muted-foreground'>
                    Bảo vệ tài khoản của bạn khỏi việc truy cập trái phép bằng cách yêu cầu mã xác
                    thực khi đăng nhập.
                  </p>
                  <Button
                    onClick={() => {
                      setTwoFAStep('password');
                      setTwoFAPassword('');
                      setShow2FADialog(true);
                    }}
                    disabled={isPending}
                  >
                    Bật xác thực 2 bước
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Passkeys (WebAuthn) */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='flex items-center gap-2'>
                    <IconFingerprint className='h-5 w-5 text-primary' />
                    Khóa bảo mật Passkeys
                  </CardTitle>
                  <CardDescription>
                    Đăng nhập siêu tốc bằng TouchID, FaceID hoặc khóa phần cứng YubiKey
                  </CardDescription>
                </div>
                <Button size='sm' onClick={() => setShowPasskeyDialog(true)}>
                  <IconPlus className='mr-1 h-4 w-4' /> Thêm Passkey
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {passkeys.length === 0 ? (
                <p className='text-sm text-muted-foreground'>
                  Bạn chưa có Passkey nào. Nhấn &quot;Thêm Passkey&quot; để đăng ký thiết bị hiện
                  tại.
                </p>
              ) : (
                <div className='divide-y rounded-md border'>
                  {passkeys.map((pk) => (
                    <div key={pk.id} className='flex items-center justify-between p-3'>
                      <div className='flex items-center gap-3'>
                        <IconDeviceDesktop className='text-muted-foreground h-5 w-5' />
                        <div>
                          <p className='text-sm font-medium'>{pk.name || 'Khóa bảo mật'}</p>
                          <p className='text-xs text-muted-foreground'>
                            Tạo ngày {new Date(pk.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => handleDeletePasskey(pk.id)}
                        disabled={isPending}
                      >
                        <IconTrash className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: SSO Social Accounts */}
        <TabsContent value='sso' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Tài khoản liên kết (SSO)</CardTitle>
              <CardDescription>
                Quản lý các tài khoản bên ngoài đã liên kết với tài khoản của bạn để đăng nhập nhanh
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 max-w-lg'>
              {/* Google */}
              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                    <IconBrandGoogle className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='text-sm font-medium'>Google</p>
                    <p className='text-xs text-muted-foreground'>
                      {isGoogleLinked ? 'Đã liên kết' : 'Chưa liên kết'}
                    </p>
                  </div>
                </div>
                {isGoogleLinked ? (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleUnlinkSocial('google')}
                    disabled={isPending}
                  >
                    Hủy liên kết
                  </Button>
                ) : (
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={() => handleLinkSocial('google')}
                    disabled={isPending}
                  >
                    Liên kết Google
                  </Button>
                )}
              </div>

              {/* GitHub */}
              <div className='flex items-center justify-between rounded-lg border p-4'>
                <div className='flex items-center gap-3'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                    <IconBrandGithub className='h-5 w-5' />
                  </div>
                  <div>
                    <p className='text-sm font-medium'>GitHub</p>
                    <p className='text-xs text-muted-foreground'>
                      {isGithubLinked ? 'Đã liên kết' : 'Chưa liên kết'}
                    </p>
                  </div>
                </div>
                {isGithubLinked ? (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleUnlinkSocial('github')}
                    disabled={isPending}
                  >
                    Hủy liên kết
                  </Button>
                ) : (
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={() => handleLinkSocial('github')}
                    disabled={isPending}
                  >
                    Liên kết GitHub
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Kích hoạt Xác thực 2 bước (2FA)</DialogTitle>
            <DialogDescription>
              {twoFAStep === 'password' && 'Vui lòng xác nhận mật khẩu để bắt đầu cấu hình 2FA.'}
              {twoFAStep === 'scan' &&
                'Quét mã QR bằng ứng dụng Authenticator (Google Authenticator, Authy).'}
              {twoFAStep === 'done' &&
                'Bảo mật 2 lớp đã được bật! Hãy lưu lại các mã dự phòng bên dưới.'}
            </DialogDescription>
          </DialogHeader>

          {twoFAStep === 'password' && (
            <form onSubmit={handleStartEnable2FA} className='space-y-4'>
              <Input
                type='password'
                placeholder='Nhập mật khẩu hiện tại'
                value={twoFAPassword}
                onChange={(e) => setTwoFAPassword(e.target.value)}
                disabled={isPending}
                required
              />
              <DialogFooter>
                <Button type='submit' disabled={isPending}>
                  {isPending && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />} Tiếp tục
                </Button>
              </DialogFooter>
            </form>
          )}

          {twoFAStep === 'scan' && (
            <form onSubmit={handleConfirm2FA} className='space-y-4 text-center'>
              {qrCodeUrl && (
                <div className='flex justify-center p-2'>
                  <Image
                    src={qrCodeUrl}
                    alt='2FA QR Code'
                    width={192}
                    height={192}
                    unoptimized
                    className='h-48 w-48 rounded border'
                  />
                </div>
              )}
              <p className='text-xs text-muted-foreground'>
                Sau khi quét, nhập mã gồm 6 số hiển thị trên ứng dụng của bạn:
              </p>
              <Input
                type='text'
                placeholder='000000'
                value={verifyTOTPCode}
                onChange={(e) => setVerifyTOTPCode(e.target.value)}
                className='text-center text-xl font-mono tracking-widest'
                disabled={isPending}
                required
              />
              <DialogFooter>
                <Button type='submit' className='w-full' disabled={isPending}>
                  {isPending && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />} Xác nhận &
                  Bật 2FA
                </Button>
              </DialogFooter>
            </form>
          )}

          {twoFAStep === 'done' && (
            <div className='space-y-4'>
              <div className='rounded bg-muted p-3 text-xs font-mono'>
                <p className='font-bold text-foreground mb-2'>Mã dự phòng (Backup Codes):</p>
                <div className='grid grid-cols-2 gap-1'>
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className='text-muted-foreground'>
                      {code}
                    </div>
                  ))}
                </div>
              </div>
              <p className='text-xs text-amber-600 font-medium'>
                Lưu ý: Lưu trữ các mã này ở nơi an toàn. Bạn có thể sử dụng chúng để đăng nhập nếu
                mất quyền truy cập vào điện thoại.
              </p>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setShow2FADialog(false);
                    window.location.reload();
                  }}
                  className='w-full'
                >
                  Hoàn tất
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Passkey Dialog */}
      <Dialog open={showPasskeyDialog} onOpenChange={setShowPasskeyDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Thêm Passkey mới</DialogTitle>
            <DialogDescription>
              Đặt tên nhận diện cho thiết bị bảo mật này (ví dụ: &quot;MacBook Pro TouchID&quot;,
              &quot;iPhone 15&quot;).
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <Input
              placeholder='Tên thiết bị (ví dụ: Laptop cá nhân)'
              value={newPasskeyName}
              onChange={(e) => setNewPasskeyName(e.target.value)}
              disabled={isPending}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleAddPasskey} disabled={isPending}>
              {isPending && <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />} Đăng ký thiết bị
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
