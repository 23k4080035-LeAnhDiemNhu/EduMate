# HƯỚNG DẪN & CHECKLIST TRIỂN KHAI SUPABASE CLOUD
## DỰ ÁN: EDUMATE HUẾ – "TÌM ĐÚNG NGƯỜI DẠY – HỌC ĐÚNG ĐIỀU CẦN"

> **Tài liệu tham chiếu:** `EDUMATE_PRE_MIGRATION_AUDIT.md`, `EDUMATE_POSTGRESQL_INTEGRATION_TEST_REPORT.md`  
> **Phiên bản:** 1.0 (Production Release Candidate)  
> **Mục tiêu:** Cung cấp quy trình từng bước, điều kiện tiên quyết, câu lệnh xác minh và kịch bản ứng phó sự cố khi triển khai 3 migration lên Supabase Cloud Production.

---

## 1. NGUYÊN TẮC BẢO MẬT & GIỚI HẠN AN TOÀN BẮT BUỘC

1. **Tuyệt đối không chạy migration tự động hoặc script ngầm lên Cloud:** Thao tác migration lên Supabase Cloud **phải do Chủ dự án / Quản trị viên thực hiện trực tiếp** thông qua giao diện **Supabase Dashboard SQL Editor**.
2. **Không để lộ khóa bảo mật:** File `.env.local` chứa `VITE_SUPABASE_URL` và Publishable Key được cấu hình độc lập trên máy tính của bạn và **đã được Git bỏ qua (`.gitignore`)**. Tuyệt đối không bao giờ đưa Service Role Key vào frontend hoặc commit lên Git repository.
3. **Thứ tự thực thi tuyến tính nghiêm ngặt:** Bắt buộc phải chạy tuần tự:
   - Migration 1 (`20261013000000_core_auth_and_requests.sql`)
   - Migration 2 (`20261108000000_vietqr_payments_and_refunds.sql`)
   - Migration 3 (`20261109000000_add_tutor_role_and_auth_security.sql`)
4. **Không thử nghiệm thanh toán tiền thật:** Quá trình kiểm thử sau migration chỉ sử dụng tài khoản kiểm thử và số tiền tượng trưng trong môi trường demo/staging, không thực hiện giao dịch chuyển khoản VietinBank thật.

---

## 2. ĐIỀU KIỆN TIÊN QUYẾT TRƯỚC KHI CHẠY (PRE-REQUISITES)

| STT | Yêu cầu | Cách kiểm tra | Tiêu chuẩn đạt |
| :---: | :--- | :--- | :---: |
| 1 | Dự án Supabase Cloud đang hoạt động | Đăng nhập [Supabase Dashboard](https://supabase.com/dashboard) | Project status: `Active` (màu xanh lá) |
| 2 | Quyền truy cập SQL Editor | Truy cập tab **SQL Editor** trên thanh menu trái | Có quyền tạo và chạy script với quyền `postgres` |
| 3 | Kiểm tra Schema Cache hiện tại | Chạy câu lệnh kiểm tra: `SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';` | Xác định xem database đang trống hoàn toàn hay đã có bảng cũ |
| 4 | Mã nguồn migration đã được kiểm định | Đã qua kiểm thử tích hợp trên PostgreSQL 18 thực tế | 21/21 integration tests PASS, 65/65 unit tests PASS |

---

## 3. QUY TRÌNH THỰC THI 3 MIGRATION TRÊN SUPABASE DASHBOARD

### BƯỚC 1: Thực thi Migration 1 — Core Auth & Requests
- **Tệp nguồn:** [`supabase/migrations/20261013000000_core_auth_and_requests.sql`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/supabase/migrations/20261013000000_core_auth_and_requests.sql)
- **Nội dung tạo lập:**
  - ENUM `user_role` (`'student'`, `'tutor'`, `'manager'`, `'admin'`)
  - ENUM `request_status` (`'draft'`, `'submitted'`, `'in_review'`, `'approved'`, `'rejected'`, `'cancelled'`)
  - Bảng: `public.profiles`, `public.user_roles`, `public.service_forms`, `public.service_requests`
  - Helper functions: `public.is_manager()`, `public.is_tutor()`, `public.handle_updated_at()`
  - Triggers bảo vệ: `protect_profile_immutable_fields`, `handle_user_email_sync`, `protect_service_request_immutable_fields`, `protect_user_roles_escalation`, `handle_new_user`
  - Seed data: 3 mẫu biểu mẫu học vụ ban đầu
  - Kích hoạt RLS & Phân quyền Grants cơ sở
- **Thao tác:**
  1. Mở file `supabase/migrations/20261013000000_core_auth_and_requests.sql`, sao chép toàn bộ nội dung.
  2. Dán vào SQL Editor trên Supabase Dashboard, đặt tên query là `01_core_auth_and_requests`.
  3. Nhấn **Run** (Ctrl + Enter).
  4. Xác nhận kết quả trả về: `Success. No rows returned`.

---

### BƯỚC 2: Thực thi Migration 2 — VietQR Payments, Reconciliation & Refunds
- **Tệp nguồn:** [`supabase/migrations/20261108000000_vietqr_payments_and_refunds.sql`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/supabase/migrations/20261108000000_vietqr_payments_and_refunds.sql)
- **Nội dung tạo lập:**
  - ENUM `payment_intent_status`, `payment_verification_status`, `refund_status`
  - Bảng: `public.payment_intents`, `public.payment_verifications`, `public.refund_requests` (đã có cột `requested_at`)
  - Triggers bảo vệ: `protect_payment_intent_immutable_fields`, `protect_refund_request_immutable_fields` (hỗ trợ `is_trusted_admin`)
  - View cô lập quyền riêng tư: `public.v_tutor_refund_status` (ẩn 100% tài khoản ngân hàng của học viên trước Người dạy)
  - Kích hoạt RLS & Phân quyền Grants cho bảng thanh toán
- **Thao tác:**
  1. Mở file `supabase/migrations/20261108000000_vietqr_payments_and_refunds.sql`, sao chép toàn bộ nội dung.
  2. Dán vào SQL Editor, đặt tên query là `02_vietqr_payments_and_refunds`.
  3. Nhấn **Run**.
  4. Xác nhận kết quả trả về: `Success. No rows returned`.

---

### BƯỚC 3: Thực thi Migration 3 — Add Tutor Role, Helper Functions & RLS Củng cố
- **Tệp nguồn:** [`supabase/migrations/20261109000000_add_tutor_role_and_auth_security.sql`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/supabase/migrations/20261109000000_add_tutor_role_and_auth_security.sql)
- **Nội dung tạo lập:**
  - Củng cố ENUM `user_role` (hỗ trợ tương thích ngược)
  - Helper functions: `public.is_user_tutor(UUID)` (loại trừ đệ quy RLS), `public.get_auth_role()`
  - Trigger `public.handle_new_user()` phiên bản hoàn chỉnh hỗ trợ Google OAuth & email an toàn
  - Thủ tục quản trị đặc quyền: `public.provision_manager_by_email(target_email, assigned_by)` (xác thực qua `session_user` và `auth.role()`, thu hồi EXECUTE từ PUBLIC)
  - Dọn sạch các policy cũ và tái lập chính sách RLS phân hạt cho cả 3 vai trò (Student - Tutor - Manager)
- **Thao tác:**
  1. Mở file `supabase/migrations/20261109000000_add_tutor_role_and_auth_security.sql`, sao chép toàn bộ nội dung.
  2. Dán vào SQL Editor, đặt tên query là `03_add_tutor_role_and_auth_security`.
  3. Nhấn **Run**.
  4. Xác nhận kết quả trả về: `Success. No rows returned`.

---

### BƯỚC 4: Cấp quyền Quản lý (Manager) cho tài khoản dự án
- Tài khoản quản lý được chỉ định: `Leanhdiemnhu240905@gmail.com`
- **Thao tác:**
  1. Mở trang quản lý người dùng: **Authentication** -> **Users** trên Supabase Dashboard.
  2. Kiểm tra xem tài khoản `Leanhdiemnhu240905@gmail.com` đã đăng ký hoặc được mời qua email hay chưa. Nếu chưa có, nhấn **Add User** -> **Create User** (nhập email và mật khẩu khởi tạo an toàn).
  3. Quay lại **SQL Editor**, thực thi duy nhất câu lệnh SQL sau:
     ```sql
     SELECT public.provision_manager_by_email('Leanhdiemnhu240905@gmail.com');
     ```
  4. Kết quả trả về `true`. Tài khoản `Leanhdiemnhu240905@gmail.com` đã chính thức nhận vai trò `manager` kèm quyền quản trị hệ thống.

---

## 4. BỘ CÂU HỎI VÀ LỆNH SQL KIỂM TRA XÁC MINH SAU MIGRATION (POST-MIGRATION VERIFICATION)

Sau khi hoàn tất cả 4 bước trên, chạy lần lượt các câu lệnh kiểm tra sau trong SQL Editor:

### Kiểm tra 1: Xác minh toàn bộ 7 bảng và 1 view nghiệp vụ
```sql
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```
*Kỳ vọng:* Xuất hiện đủ:
- Tables (7): `payment_intents`, `payment_verifications`, `profiles`, `refund_requests`, `service_forms`, `service_requests`, `user_roles`.
- Views (1): `v_tutor_refund_status`.

---

### Kiểm tra 2: Xác minh toàn bộ các bảng đã BẬT Row Level Security (RLS)
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```
*Kỳ vọng:* Tất cả các bảng trên đều có giá trị `rowsecurity = true`.

---

### Kiểm tra 3: Xác minh các hàm Helper và Trigger Functions
```sql
SELECT routine_name, routine_type, security_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;
```
*Kỳ vọng:* Có đủ các hàm:
- `get_auth_role` (SECURITY DEFINER)
- `handle_new_user` (SECURITY DEFINER)
- `handle_updated_at` (SECURITY INVOKER)
- `handle_user_email_sync` (SECURITY DEFINER)
- `is_manager` (SECURITY DEFINER)
- `is_tutor` (SECURITY DEFINER)
- `is_user_tutor` (SECURITY DEFINER)
- `protect_payment_intent_immutable_fields` (SECURITY INVOKER)
- `protect_profile_immutable_fields` (SECURITY DEFINER)
- `protect_refund_request_immutable_fields` (SECURITY INVOKER)
- `protect_service_request_immutable_fields` (SECURITY INVOKER)
- `protect_user_roles_escalation` (SECURITY INVOKER)
- `provision_manager_by_email` (SECURITY DEFINER)

---

### Kiểm tra 4: Xác minh quyền EXECUTE của hàm cấp quyền Manager
```sql
SELECT grantee, privilege_type 
FROM information_schema.routine_privileges 
WHERE routine_name = 'provision_manager_by_email';
```
*Kỳ vọng:* Chỉ có `postgres` và `service_role`. Tuyệt đối **KHÔNG CÓ** `PUBLIC`, `anon`, hay `authenticated`.

---

### Kiểm tra 5: Xác minh vai trò Manager của tài khoản dự án
```sql
SELECT p.id, p.email, p.full_name, ur.role, ur.created_at, ur.updated_at
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.id
WHERE p.email = 'Leanhdiemnhu240905@gmail.com';
```
*Kỳ vọng:* Trả về đúng 1 dòng với `role = 'manager'`.

---

## 5. RỦI RO & PHƯƠNG ÁN XỬ LÝ SỰ CỐ (TROUBLESHOOTING & ROLLBACK)

| Sự cố tiềm ẩn | Nguyên nhân | Cách xử lý an toàn |
| :--- | :--- | :--- |
| `ERROR: relation "profiles" already exists` | Database đã có bảng từ trước do chạy dở dang | Lệnh `CREATE TABLE IF NOT EXISTS` sẽ tự động bỏ qua nếu bảng đã tồn tại. Nếu cần tạo lại từ đầu trên DB thử nghiệm, chạy lệnh xóa theo thứ tự: `DROP TABLE IF EXISTS refund_requests, payment_verifications, payment_intents, service_requests, service_forms, user_roles, profiles CASCADE;` |
| `ERROR: function handle_updated_at does not exist` | Chạy Migration 2 trước Migration 1 | Chạy lại Migration 1 trước để khởi tạo đầy đủ các hàm cốt lõi. |
| Người dùng đăng ký bị lỗi không tạo được profile | Trigger `on_auth_user_created` bị lỗi quyền schema | Đảm bảo lệnh `GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;` trong Migration 1 đã được thực thi. |
| Học viên không xem được hồ sơ Gia sư | RLS trên `user_roles` chặn subquery | Kiểm tra hàm `is_user_tutor(UUID)` và policy `user_roles_read_policy` trong Migration 3 đã được áp dụng. |

---

## 6. SỰ KHÁC BIỆT KHI TRIỂN KHAI TRÊN DATABASE MỚI VS DATABASE ĐÃ CÓ DỮ LIỆU

### Kịch bản A: Database Supabase Cloud MỚI TINH (Hiện tại)
- Chạy lần lượt Migration 1 -> Migration 2 -> Migration 3 theo đúng các bước ở Mục 3.
- Tất cả các bảng, ENUMs, triggers và constraints được khởi tạo sạch sẽ, không có nguy cơ xung đột khóa ngoại.

### Kịch bản B: Database ĐÃ CÓ NGƯỜI DÙNG / DỮ LIỆU SẴN
- **Không chạy `DROP TABLE CASCADE`** vì sẽ làm mất dữ liệu học viên và yêu cầu học đã có.
- Trước khi chạy, sao lưu dữ liệu hiện tại bằng tính năng **Database** -> **Backups** trên Supabase Dashboard.
- Các lệnh trong 3 migration đã được thiết kế sẵn cơ chế tương thích:
  - `CREATE TABLE IF NOT EXISTS`
  - `CREATE INDEX IF NOT EXISTS`
  - `DO $$ BEGIN CREATE TYPE ... EXCEPTION WHEN duplicate_object THEN null; END $$;`
  - `DROP POLICY IF EXISTS ... CREATE POLICY ...`
  - `ON CONFLICT (id) DO UPDATE ...`
  Giúp việc áp dụng migration lên cơ sở dữ liệu hiện có diễn ra an toàn và không làm gián đoạn hệ thống.

