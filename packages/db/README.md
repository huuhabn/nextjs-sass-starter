# @sass/db — Database Layer

Package quản lý cơ sở dữ liệu cho monorepo `nextjs-sass-starter`, được xây dựng trên nền tảng **Drizzle ORM** với kiến trúc phân lớp sạch sẽ, hỗ trợ kết nối đa driver (**node-postgres** & **Neon serverless**), tích hợp bộ công cụ **Drizzle Kit** và kiểm thử in-memory siêu tốc bằng **PGlite**.

---

## 🚀 Tính năng chính

- **Drizzle ORM & TypeScript Strict**: Type-safe 100% từ schema, quan hệ (relations) đến các câu truy vấn.
- **2 Migrations Tối giản & Chuẩn hóa**:
  1. `0000_base_tables.sql`: Khối bảng cốt lõi (User, Settings, Sessions, Files, API Keys).
  2. `0001_saas_extensions.sql`: Khối bảng mở rộng SaaS (Multi-tenant Workspaces, RBAC, Notifications, Stripe B2C Subscriptions & Billing Quotas).
- **Hỗ trợ Đa Driver**:
  - `node`: `pg.Pool` tiêu chuẩn với connection timeout và xử lý lỗi ngắt kết nối an toàn.
  - `neon`: `@neondatabase/serverless` tối ưu cho môi trường edge / serverless qua WebSocket.
- **Tích hợp Migration Runner**: Tự động áp dụng các file SQL migrations lên cơ sở dữ liệu thực tế chỉ với một lệnh `bun run db:migrate`.
- **Drizzle Kit Tooling**: Hỗ trợ sinh migration tự động (`db:generate`), push schema (`db:push`) và giao diện trực quan (`db:studio`).
- **Tự động kiểm thử in-memory**: Chạy unit test nhanh chóng mà không cần cài đặt hoặc kết nối PostgreSQL thật nhờ `@electric-sql/pglite`.
- **Kiến trúc Domain Models**: Đóng gói logic nghiệp vụ theo thực thể (User, Workspace, RBAC, Notification, Session, File, API Key, Subscription, Invoice, UsageQuota) dễ tái sử dụng và mở rộng.
- **Độc lập hoàn toàn**: Không phụ thuộc vào các thư viện bên ngoài như `@trpc/server` hay `@lobechat/*`.

---

## 🛠️ Hướng dẫn Cài đặt & Chạy Migrate DB

### Bước 1: Chuẩn bị Cơ sở dữ liệu PostgreSQL

Bạn có thể sử dụng PostgreSQL cục bộ hoặc dịch vụ Cloud:

#### Cách A: Chạy PostgreSQL cục bộ bằng Docker (Khuyên dùng cho dev)
Chạy lệnh sau trong terminal để khởi tạo container PostgreSQL:

```bash
docker run --name pg-saas \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=saas_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

#### Cách B: Dùng dịch vụ Cloud (Neon / Supabase / Railway)
- Tạo project mới trên [Neon.tech](https://neon.tech) hoặc [Supabase](https://supabase.com).
- Lấy chuỗi kết nối `postgres://...` từ trang quản trị.

---

### Bước 2: Cấu hình Biến môi trường

Tạo hoặc mở file `.env.local` ở thư mục gốc của dự án và khai báo `DATABASE_URL`:

```env
# Kết nối PostgreSQL cục bộ:
DATABASE_URL="postgres://postgres:postgres@localhost:5432/saas_db"

# Hoặc kết nối Neon Cloud:
# DATABASE_URL="postgres://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Driver: 'node' (mặc định) hoặc 'neon' (tự động phát hiện nếu dùng neon.tech)
DATABASE_DRIVER="node"

# Cấu hình Pool timeout (Tùy chọn)
DATABASE_POOL_ACQUIRE_TIMEOUT=30000
DATABASE_STATEMENT_TIMEOUT=10000
```

---

### Bước 3: Chạy Migrate khởi tạo các bảng dữ liệu

Chạy lệnh sau từ **thư mục gốc** của dự án:

```bash
bun run db:migrate
```

*(Hoặc chạy trực tiếp từ thư mục `packages/db`: `bun run db:migrate`)*

**Kết quả thành công sẽ hiển thị:**
```
🔄 Running database migrations on: postgres://postgres:****@localhost:5432/saas_db
✅ Migrations applied successfully in 125ms!
```

Hệ thống sẽ chạy tuần tự **2 file migrations**:
1. `0000_base_tables.sql` (Tạo 6 bảng base: `users`, `user_settings`, `sessions`, `files`, `files_to_sessions`, `api_keys`)
2. `0001_saas_extensions.sql` (Tạo 13 bảng SaaS mở rộng: `workspaces`, `workspace_members`, `workspace_invitations`, `workspace_audit_logs`, `notifications`, `notification_deliveries`, `rbac_roles`, `rbac_permissions`, `rbac_role_permissions`, `rbac_user_roles`, `subscriptions`, `invoices`, `user_usage_quotas`)

---

### Bước 4: Mở Giao diện Quản lý Dữ liệu (Drizzle Studio)

Drizzle Studio cung cấp giao diện Web trực quan để xem và chỉnh sửa dữ liệu trong database:

```bash
bun run db:studio
```

Trình duyệt sẽ tự động mở trang quản trị tại: `https://local.drizzle.studio`

---

## 📦 Danh sách 19 Bảng dữ liệu đã Migrate

### 1. Khối Base Tables (`0000_base_tables.sql` — 6 bảng)

| STT | Bảng | Khóa chính | Mô tả |
| :--- | :--- | :--- | :--- |
| 1 | `users` | `id` (text) | Người dùng (tích hợp Clerk ID, email, avatar, onboarding) |
| 2 | `user_settings` | `id` (text -> `users.id`) | Cài đặt người dùng (JSONB preferences, notification, tools) |
| 3 | `sessions` | `id` (text) | Phiên làm việc / chat sessions |
| 4 | `files` | `id` (text) | Metadata tệp tải lên (gắn với `user_id`) |
| 5 | `files_to_sessions`| `(file_id, session_id)` | Bảng liên kết N-N giữa files và sessions |
| 6 | `api_keys` | `id` (serial) | Quản lý API Key người dùng (hash/key, touchLastUsed, expiresAt) |

### 2. Khối SaaS Extension Tables (`0001_saas_extensions.sql` — 13 bảng)

| STT | Bảng | Khóa chính | Mô tả |
| :--- | :--- | :--- | :--- |
| 7 | `workspaces` | `id` (text) | Không gian làm việc đa người dùng (Multi-tenant SaaS) |
| 8 | `workspace_members`| `(workspace_id, user_id)` | Thành viên workspace (owner, admin, member) |
| 9 | `workspace_invitations`| `id` (text) | Lời mời tham gia workspace (email, token, role, expiresAt) |
| 10 | `workspace_audit_logs` | `id` (text) | Nhật ký thao tác & kiểm toán bảo mật trong workspace |
| 11 | `notifications` | `id` (text) | Thông báo người dùng (có `dedupe_key` chống gửi trùng) |
| 12 | `notification_deliveries` | `id` (text) | Trạng thái gửi thông báo qua từng kênh (email, in-app, webhook) |
| 13 | `rbac_roles` | `id` (text) | Danh sách vai trò RBAC (`admin`, `member`, `custom...`) |
| 14 | `rbac_permissions` | `id` (text) | Danh mục quyền hạn chi tiết (`billing.manage`, `org.invite`...) |
| 15 | `rbac_role_permissions`| `(role_id, permission_id)` | Liên kết N-N giữa vai trò và quyền hạn |
| 16 | `rbac_user_roles` | `(user_id, role_id)` | Gán vai trò cho người dùng (có thời hạn hết hạn) |
| 17 | `subscriptions` | `id` (text) | Đăng ký gói Stripe B2C (status, plan_id, period_end, cancel) |
| 18 | `invoices` | `id` (text) | Lịch sử hóa đơn thanh toán (stripe_invoice_id, amount_paid, pdf) |
| 19 | `user_usage_quotas` | `id` (text) | Quota giới hạn mức sử dụng tính năng/AI token theo gói |

---

## 💻 Hướng dẫn Sử dụng Code trong Dự án

### 1. Import kết nối DB
Trong Server Components, Server Actions, hoặc Route Handlers:

```typescript
import { serverDB } from '@sass/db';
import { eq } from 'drizzle-orm';
import { users } from '@sass/db/schemas';

// Truy vấn trực tiếp qua Drizzle query API
const user = await serverDB.query.users.findFirst({
  where: eq(users.id, 'usr_123'),
  with: {
    settings: true,
    ownedWorkspaces: true,
    subscriptions: true,
  },
});
```

### 2. Sử dụng Domain Models
Các Model đóng gói sẵn các logic nghiệp vụ:

#### Quản lý Người dùng & Preferences
```typescript
import { serverDB, UserModel } from '@sass/db';

const userModel = new UserModel(serverDB, 'usr_123');

// Lấy thông tin & cập nhật preference
const user = await userModel.findById();
await userModel.updatePreference('usr_123', {
  useCmdEnterToSend: true,
});
```

#### Quản lý Subscriptions & Invoices (Stripe Billing)
```typescript
import { serverDB, SubscriptionModel, InvoiceModel } from '@sass/db';

const subModel = new SubscriptionModel(serverDB, 'usr_123');

// Tạo hoặc cập nhật gói thuê bao Stripe
const sub = await subModel.create({
  stripeCustomerId: 'cus_xyz',
  stripeSubscriptionId: 'sub_xyz',
  stripePriceId: 'price_pro_monthly',
  planId: 'pro',
  status: 'active',
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
});

// Tra cứu hóa đơn của user
const invoiceModel = new InvoiceModel(serverDB, 'usr_123');
const invoices = await invoiceModel.listByUserId();
```

#### Kiểm soát Quota & Giới hạn sử dụng (Usage Quotas)
```typescript
import { serverDB, UsageQuotaModel } from '@sass/db';

const quotaModel = new UsageQuotaModel(serverDB, 'usr_123');

// Cấp quota 100,000 AI tokens
await quotaModel.setQuota({
  featureKey: 'ai_tokens',
  limitAmount: 100000,
});

// Kiểm tra trước khi gọi AI service
const canUse = await quotaModel.checkLimit('ai_tokens', 1500);
if (!canUse) {
  throw new Error('Quota exceeded! Vui lòng nâng cấp gói.');
}

// Trừ quota sau khi AI stream hoàn tất
await quotaModel.consume('ai_tokens', 1500);
```

#### Quản lý Workspace & Phân quyền
```typescript
import { serverDB, WorkspaceModel, WorkspaceMemberModel } from '@sass/db';

const wsModel = new WorkspaceModel(serverDB, 'usr_123');

// Tạo workspace mới (tự động gán người tạo làm owner)
const ws = await wsModel.create({
  name: 'Acme Corp',
  slug: 'acme-corp',
});

// Thêm thành viên
const memberModel = new WorkspaceMemberModel(serverDB, ws.id);
await memberModel.addMember('usr_456', 'admin');
```

#### Quản lý RBAC (Roles & Permissions)
```typescript
import { serverDB, RbacModel } from '@sass/db';

const rbacModel = new RbacModel(serverDB);

// Kiểm tra quyền hạn của người dùng
const canManage = await rbacModel.hasPermission('usr_123', 'billing.manage');
if (!canManage) {
  throw new Error('Forbidden');
}
```

#### Gửi thông báo (Idempotent với dedupeKey)
```typescript
import { serverDB, NotificationModel } from '@sass/db';

const notificationModel = new NotificationModel(serverDB, 'usr_123');

// Không bị trùng lặp nếu dedupeKey đã tồn tại
await notificationModel.create({
  category: 'workspace',
  type: 'member_joined',
  title: 'Thành viên mới',
  content: 'Alice đã tham gia workspace của bạn',
  dedupeKey: 'member_joined_usr_456_ws_789',
});
```

---

## 🧩 Quy trình Thêm bảng hoặc Chỉnh sửa Schema Mới

Khi bạn muốn thêm bảng mới hoặc sửa đổi cột:

1. **Chỉnh sửa / Tạo schema**: Thêm bảng mới trong `packages/db/src/schemas/<feature>.ts` và export tại `src/schemas/index.ts`.
2. **Khai báo quan hệ**: Bổ sung relation trong `packages/db/src/schemas/relations.ts`.
3. **Sinh migration SQL tự động bằng Drizzle Kit**:
   ```bash
   bun run db:generate
   ```
   Lệnh trên sẽ so sánh schema TypeScript với thư mục `migrations/` và tự động sinh file migration mới cùng journal.
4. **Chạy migrate lên DB**:
   ```bash
   bun run db:migrate
   ```
5. **(Tùy chọn) Thêm Domain Model**: Tạo `src/models/<feature>.ts` và export ở `src/models/index.ts`.

---

## 🧪 Kiểm thử tự động (Unit Tests)

Package sử dụng `@electric-sql/pglite` để chạy in-memory PostgreSQL hoàn chỉnh trong bộ nhớ:

```bash
# Kiểm tra TypeScript (0 errors)
bun run typecheck

# Chạy toàn bộ 17 unit tests cho migrations & models
cd packages/db && bun run test
```
