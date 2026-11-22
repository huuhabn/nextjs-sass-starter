# Hướng Dẫn Cấu Hình & Sử Dụng Xác Thực (Better Auth)

Hệ thống xác thực của dự án sử dụng **Better Auth** tích hợp sâu với **Drizzle ORM** (PostgreSQL) và hỗ trợ đầy đủ đa ngôn ngữ (i18n), cùng môi trường gửi email thử nghiệm cục bộ mặc định qua **Mailpit**.

---

## 1. Tổng quan các phương thức xác thực

Dự án cung cấp 5 phương thức xác thực chính:
1. **Email & Mật khẩu (Email/Password)**: Đăng ký, đăng nhập, xác thực email và quên mật khẩu.
2. **Magic Link (Đăng nhập không cần mật khẩu)**: Gửi liên kết một lần qua email để đăng nhập tức thì.
3. **Đăng nhập mạng xã hội (Social OAuth)**: Google & GitHub.
4. **Xác thực 2 bước (Two-Factor Authentication / 2FA)**:
   - TOTP (Google Authenticator, 1Password, Authy).
   - Mã OTP gửi qua email.
   - Mã khôi phục dự phòng (Backup codes).
5. **Passkey (WebAuthn / Sinh trắc học)**: Đăng nhập bằng vân tay (Touch ID), khuôn mặt (Face ID), Windows Hello hoặc khóa bảo mật phần cứng (YubiKey).

---

## 2. Cấu hình biến môi trường (`.env.local`)

Tạo hoặc cập nhật file `.env.local` ở thư mục gốc:

```env
# URL ứng dụng
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Khóa bí mật Better Auth (tối thiểu 32 ký tự ngẫu nhiên)
AUTH_SECRET="dev_secret_key_at_least_32_characters_long_for_security"

# Kết nối cơ sở dữ liệu PostgreSQL
DATABASE_URL="postgres://postgres:postgres@localhost:5432/lobe_hub"

# Cấu hình Email SMTP (Mặc định dùng Mailpit khi phát triển)
SMTP_HOST="127.0.0.1"
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASS=""
SMTP_SECURE=false
EMAIL_FROM="no-reply@lobehub.local"

# Cấu hình Social Logins (Tùy chọn)
AUTH_GOOGLE_ID="your-google-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-google-client-secret"

AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
```

---

## 3. Cài đặt và khởi chạy Mailpit (Email Development)

Dự án mặc định gửi toàn bộ email (xác thực tài khoản, magic link, OTP 2FA, reset password) tới **Mailpit** để kiểm tra tức thì mà không cần tài khoản SMTP thật.

### Cài đặt Mailpit:
- **macOS (Homebrew)**:
  ```bash
  brew install mailpit
  mailpit
  ```
- **Docker**:
  ```bash
  docker run -d \
    --name mailpit \
    -p 1025:1025 \
    -p 8025:8025 \
    axllent/mailpit
  ```

### Truy cập Web UI của Mailpit:
Mở trình duyệt tại: [http://localhost:8025](http://localhost:8025) để xem toàn bộ email được gửi ra theo thời gian thực.

---

## 4. Khởi tạo Cơ sở dữ liệu & Chạy Migration

Hệ thống lưu trữ thông tin xác thực trên các bảng PostgreSQL:
- `users`: Tài khoản người dùng, trạng thái kích hoạt 2FA.
- `auth_sessions`: Phiên đăng nhập người dùng, cookie session.
- `accounts`: Liên kết tài khoản OAuth (Google, GitHub, credentials).
- `verifications`: Token xác minh email, token đặt lại mật khẩu, state OAuth.
- `two_factor`: Khóa bí mật TOTP và mã dự phòng.
- `passkey`: Thông tin khóa công khai WebAuthn.

### Chạy migration:
```bash
bun run --cwd packages/db db:migrate
```

---

## 5. Hướng dẫn chi tiết từng phương thức xác thực

### 5.1. Email & Mật khẩu
* **Giao diện**: Nằm tại `/[locale]/sign-in` và `/[locale]/sign-up`.
* **Flow đăng ký**:
  1. Người dùng nhập họ tên, email, mật khẩu.
  2. Hệ thống tạo tài khoản và gửi email xác nhận với link verify.
  3. Mở Mailpit ([http://localhost:8025](http://localhost:8025)), nhấn vào liên kết xác nhận để kích hoạt email.
* **Flow quên mật khẩu**:
  1. Truy cập `/[locale]/forgot-password`, nhập email.
  2. Mở Mailpit nhận link đặt lại mật khẩu (`/[locale]/reset-password?token=...`).
  3. Nhập mật khẩu mới và xác nhận cập nhật.

---

### 5.2. Magic Link (Passwordless)
* **Giao diện**: Tab **Magic Link** trên trang đăng nhập `/[locale]/sign-in`.
* **Cách hoạt động**:
  1. Nhập địa chỉ email và nhấn **Gửi Magic Link**.
  2. Better Auth tạo token dùng 1 lần trong bảng `verifications` và gửi email chứa URL xác thực.
  3. Nhấp vào link trong email sẽ đăng nhập thẳng vào hệ thống mà không cần mật khẩu.

---

### 5.3. Đăng nhập mạng xã hội (Google & GitHub)

#### Cấu hình Google OAuth:
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Tạo dự án mới > **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth Client ID**.
3. Chọn Application type: **Web application**.
4. Cấu hình **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-domain.com/api/auth/callback/google` (Production)
5. Copy Client ID và Client Secret vào `AUTH_GOOGLE_ID` và `AUTH_GOOGLE_SECRET` trong `.env.local`.

#### Cấu hình GitHub OAuth:
1. Truy cập [GitHub Developer Settings](https://github.com/settings/developers).
2. Chọn **OAuth Apps** > **New OAuth App**.
3. Điền thông tin:
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID và Client Secret vào `AUTH_GITHUB_ID` và `AUTH_GITHUB_SECRET` trong `.env.local`.

---

### 5.4. Xác thực 2 bước (2FA / TOTP)
* **Kích hoạt trong tài khoản**:
  Gọi `authClient.twoFactor.enable()` từ trang quản lý hồ sơ để nhận mã QR hoặc Secret Key.
* **Đăng nhập với 2FA**:
  - Khi người dùng đăng nhập bằng mật khẩu, hệ thống nhận diện tài khoản có 2FA và chuyển sang màn hình nhập mã 6 số.
  - Người dùng có thể chuyển đổi giữa:
    - Mã từ ứng dụng Authenticator (Google Authenticator, Authy).
    - Mã khôi phục dự phòng (Backup Code).

---

### 5.5. Passkey (WebAuthn / Sinh trắc học)
* **Đăng ký Passkey**:
  Trên trang cài đặt tài khoản, gọi:
  ```ts
  await authClient.passkey.addPasskey({ name: 'MacBook Touch ID' });
  ```
  Trình duyệt sẽ hiển thị prompt yêu cầu quét vân tay hoặc khuôn mặt.
* **Đăng nhập bằng Passkey**:
  Trên trang `/[locale]/sign-in`, nhấn nút **Đăng nhập bằng Passkey**. Trình duyệt sẽ yêu cầu xác thực sinh trắc học và hoàn tất đăng nhập tức thì.

---

## 6. Cấu trúc mã nguồn Auth trong dự án

```
src/
├── app/
│   ├── [locale]/(auth)/(center)/
│   │   ├── sign-in/page.tsx        # Trang đăng nhập đa ngôn ngữ
│   │   ├── sign-up/page.tsx        # Trang đăng ký đa ngôn ngữ
│   │   ├── forgot-password/page.tsx# Trang quên mật khẩu
│   │   ├── reset-password/page.tsx # Trang đặt lại mật khẩu
│   │   └── verify-email/page.tsx   # Trang xác thực token email
│   └── api/auth/[...all]/route.ts  # Route Handler tiếp nhận mọi Better Auth requests
│
├── features/auth/components/
│   ├── better-auth-signin.tsx      # Component form đăng nhập (Social, Passkey, Magic Link, 2FA)
│   ├── better-auth-signup.tsx      # Component form đăng ký
│   ├── better-auth-forgot-password.tsx
│   ├── better-auth-reset-password.tsx
│   └── better-auth-verify-email.tsx
│
├── lib/
│   ├── auth.ts                     # Better Auth server configuration (Drizzle adapter, plugins)
│   ├── auth-client.ts              # Better Auth client instance (plugins for React)
│   └── email/                      # Dịch vụ gửi email (Nodemailer + templates)
│
└── i18n/locales/*/auth.json        # Bản dịch các chuỗi hiển thị auth (vi-VN, en-US, ar-TN)
```

---

## 7. Khắc phục sự cố thường gặp (Troubleshooting)

1. **`TypeError: Failed to fetch` khi đăng nhập Social**:
   - Kiểm tra PostgreSQL đã chạy và đã apply migration (`bun run --cwd packages/db db:migrate`).
   - Kiểm tra `AUTH_GOOGLE_ID` / `AUTH_GITHUB_ID` đã được điền hợp lệ.
2. **`NO_I18NEXT_INSTANCE` hoặc text hiển thị dạng key (`signIn.title`)**:
   - Đảm bảo các component được bọc bên trong `<Providers>` (nơi cung cấp `I18nextProvider`).
   - Kiểm tra file ngôn ngữ tại `src/i18n/locales/<locale>/auth.json`.
3. **Không nhận được email kích hoạt**:
   - Kiểm tra Mailpit có đang chạy ở cổng 1025 hay không.
   - Mở giao diện web Mailpit tại `http://localhost:8025`.
