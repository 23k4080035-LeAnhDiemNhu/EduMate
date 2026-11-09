# BÁO CÁO TRIỂN KHAI HỆ THỐNG ĐĂNG NHẬP EMAIL VÀ PHÂN QUYỀN 3 VAI TRÒ
## DỰ ÁN: EDUMATE HUẾ – NỀN TẢNG KẾT NỐI NGƯỜI HỌC VÀ NGƯỜI DẠY
*Slogan: "Tìm đúng người dạy – Học đúng điều cần."*

---

## 1. Kiến Trúc Xác Thực (Authentication Architecture)

Hệ thống xác thực EduMate Huế được thiết kế trên mô hình Hybrid (Môi trường Kép) nhằm phân định rạch ròi giữa Chế độ Kiểm thử Mô phỏng (Demo Sandbox) và Môi trường Thực tế (Live Production):

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT APPLICATION                                    |
+-----------------------------------------------------------------------------------------+
                                             │
               ┌─────────────────────────────┴─────────────────────────────┐
               ▼                                                           ▼
     [Chế độ DEMO / Sandbox]                                     [Chế độ LIVE PRODUCTION]
  (isSupabaseConfigured = false)                               (isSupabaseConfigured = true)
               │                                                           │
               ▼                                                           ▼
    - Sử dụng Local Engine                                      - Supabase Auth (Email & Password)
    - Demo Fast Logins:                                         - JWT Session + Refresh Token
      + Học viên: 23K4080035@hce.edu.vn                         - Session Persistence & URL Recovery
      + Người dạy: lehoangnam.k44@gmail.com                     - Google OAuth (Khi Provider Active)
      + Quản lý: Leanhdiemnhu240905@gmail.com                   - Khóa hoàn toàn Demo Role Switcher
    - Demo Switcher gắn nhãn rõ ràng                            - Phân quyền độc lập qua `user_roles`
    - Không thể truy cập dữ liệu Prod                           - Bảo vệ bởi Row Level Security (RLS)
```

### Các nguyên tắc an ninh cốt lõi đã áp dụng:
1. **Không lưu mật khẩu trong mã nguồn hay Git:** Mật khẩu người dùng được mã hóa bcrypt và quản lý hoàn toàn bởi dịch vụ Supabase Auth (`auth.users`).
2. **Khử nhiễm lỗi xác thực (Error Sanitization):** Mọi thông báo lỗi từ database hoặc Supabase Auth đều được lọc qua hàm `sanitizeAuthError()` trước khi hiển thị cho người dùng, ngăn chặn tuyệt đối việc lộ cấu trúc bảng, tên hàm hay thông tin nhạy cảm.
3. **Phân quyền độc lập (Independent Roles Table):** Vai trò của người dùng được lưu trữ trong bảng riêng biệt `public.user_roles` với RLS bảo vệ, ngăn chặn triệt để lỗ hổng tự leo thang đặc quyền khi người dùng cập nhật hồ sơ cá nhân (`profiles`).
4. **Chặn tự cấp quyền Quản lý qua form công khai:** Biểu mẫu đăng ký tài khoản chỉ cho phép đăng ký với 2 vai trò: **Người học (`student`)** hoặc **Người dạy (`tutor`)**. Quyền **Quản lý (`manager`)** chỉ được cấp bởi Ban Quản trị thông qua hàm bảo mật `provision_manager_by_email` ở cấp database.
5. **Khóa Role Switcher trên môi trường Production:** Nút bấm đổi vai trò chỉ là công cụ hỗ trợ trải nghiệm trong môi trường demo. Khi kích hoạt Supabase Live, Role Switcher tự động bị vô hiệu hóa và thay thế bằng huy hiệu vai trò thực tế `[Supabase RLS]`.

---

## 2. Bảng Ma Trận Phân Quyền (3-Role Authorization Matrix)

| Chức năng & Dữ liệu | Người học (`student`) | Người dạy (`tutor`) | Người quản lý (`manager`) | Cơ chế kiểm soát |
| :--- | :---: | :---: | :---: | :--- |
| **Xem danh sách người dạy & môn học** | Cho phép | Cho phép | Cho phép | Public / Client Routing |
| **Gửi yêu cầu học theo 3 gói học** | Cho phép | Không | Không | Form Validation & RLS |
| **Xem yêu cầu học cá nhân** | Chỉ xem của mình | Chỉ xem gửi đến mình | Xem toàn bộ | RLS `student_id` / `tutor_id` |
| **Thanh toán VietQR cho yêu cầu học** | Cho phép (của mình) | Bị chặn (403) | Cho phép kiểm tra | `PaymentPage` Guard & RLS |
| **Xem thông tin tài khoản ngân hàng học viên**| Chỉ xem của mình | **TUYỆT ĐỐI BỊ CHẶN** | Cho phép (để hoàn tiền) | Data Service & RLS Filter |
| **Duyệt xác nhận tiền chuyển khoản VietQR** | Bị chặn (403) | Bị chặn (403) | **TOÀN QUYỀN** | Backend Role Check & Audit |
| **Phê duyệt & Chuyển tiền hoàn 100%** | Bị chặn (403) | Bị chặn (403) | **TOÀN QUYỀN** | Backend Role Check & Audit |
| **Truy cập Trang Quản trị (`/admin`)** | Bị chặn (403) | Bị chặn (403) | **TOÀN QUYỀN** | `Forbidden403` Route Guard |
| **Duyệt hồ sơ người dạy khóa trước** | Bị chặn (403) | Bị chặn (403) | Cho phép | `verifyTutor` & Audit Logs |
| **Xem báo cáo tài chính & Điểm hòa vốn** | Bị chặn (403) | Bị chặn (403) | Cho phép | Financial Metrics Engine |

---

## 3. Các Tệp Mã Nguồn Đã Chỉnh Sửa & Bổ Sung

1. [`supabase/migrations/20261109000000_add_tutor_role_and_auth_security.sql`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/supabase/migrations/20261109000000_add_tutor_role_and_auth_security.sql):
   - Mở rộng enum `user_role` bổ sung an toàn giá trị `'tutor'`.
   - Cập nhật trigger `handle_new_user()` chỉ cho phép tạo `student` hoặc `tutor`, chặn tự gán `manager`.
   - Thêm các hàm kiểm tra vai trò: `is_manager()`, `is_tutor()`, `get_auth_role()`.
   - Bổ sung hàm cấp quyền quản trị: `provision_manager_by_email()`.
   - Thiết lập các chính sách RLS bảo vệ bảng `profiles` và `user_roles`.
2. [`src/components/common/Forbidden403.tsx`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/src/components/common/Forbidden403.tsx):
   - Thành phần giao diện chuẩn hóa cảnh báo **"403 – Không có quyền truy cập (Access Denied)"**.
   - Hiển thị chi tiết vai trò yêu cầu, vai trò hiện tại và nút điều hướng an toàn.
3. [`src/lib/supabase.ts`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/src/lib/supabase.ts):
   - Hàm `sanitizeAuthError()` khử nhiễm mã lỗi Supabase thành thông điệp tiếng Việt thân thiện, bảo mật.
   - Hàm `supabaseSignUp()` hỗ trợ đăng ký phân định `student` / `tutor`.
   - Hàm `supabaseResetPassword()` gửi email liên kết khôi phục mật khẩu.
   - Hàm `supabaseUpdatePassword()` đặt lại mật khẩu mới.
   - Hàm `supabaseSignInWithGoogle()` hỗ trợ đăng nhập Google OAuth khi được cấu hình.
   - Hàm `supabaseFetchProfile()` đọc và đồng bộ chuẩn xác vai trò 3 cấp.
4. [`src/services/dataService.ts`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/src/services/dataService.ts):
   - Cập nhật danh sách tài khoản chỉ định:
     - Người học: `23K4080035@hce.edu.vn` (Sinh viên Lê Anh Diễm Như)
     - Người quản lý: `Leanhdiemnhu240905@gmail.com`
     - Người dạy: Gmail thật của từng người dạy (`lehoangnam.k44@gmail.com`, `tranbichngoc.k45@gmail.com`).
   - Củng cố `registerProfile()`: Chặn đứng ngoại lệ tự đăng ký vai trò `manager` hoặc `admin`.
5. [`src/components/layout/Header.tsx`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/src/components/layout/Header.tsx):
   - Vô hiệu hóa Role Switcher khi ở chế độ Production Live (`isSupabaseConfigured = true`), thay bằng huy hiệu vai trò thực tế `[Supabase RLS]`.
   - Gắn nhãn `Demo Switcher` rõ ràng khi ở chế độ thử nghiệm nội bộ.
6. [`src/pages/AuthPage.tsx`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/src/pages/AuthPage.tsx):
   - Hỗ trợ 4 chế độ: `login`, `register`, `forgot_password`, `reset_password`.
   - Khử nhiễm hoàn toàn thông báo lỗi bảo mật.
   - Tích hợp nút Google OAuth.
   - Cập nhật 3 tài khoản chỉ định phục vụ kiểm thử tiện lợi trong chế độ Sandbox.
7. [`src/App.tsx`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/src/App.tsx):
   - Tích hợp kiểm tra quyền truy cập bảo vệ trang Quản trị (`/admin`) và trang Thanh toán (`/payment`) bằng `Forbidden403`.
   - Chặn đứng hàm `handleSwitchRole` nếu ứng dụng đang kết nối Supabase Live.
   - Bắt sự kiện hash URL `#reset-password` để chuyển hướng khôi phục mật khẩu.
8. [`src/pages/PaymentPage.tsx`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/src/pages/PaymentPage.tsx):
   - Bổ sung bộ lọc an ninh: Nếu người xem không phải là chủ sở hữu đơn học (và không phải Quản lý), hiển thị màn hình 403 Forbidden.
9. [`scripts/provision_accounts.mjs`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/scripts/provision_accounts.mjs):
   - Công cụ CLI tự động hóa an toàn để khởi tạo 3 tài khoản chỉ định qua Supabase Auth Service Role.
10. [`tests/test_auth_and_roles.mjs`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/tests/test_auth_and_roles.mjs):
    - Bộ kiểm thử tự động toàn diện bao quát 15 ca nghiệp vụ bảo mật.
11. [`package.json`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/package.json):
    - Tích hợp `test_auth_and_roles.mjs` vào quy trình `npm test`.

---

## 4. Kết Quả Kiểm Thử Toàn Diện (100% PASS)

Toàn bộ **103 bài kiểm thử tự động** trên cả 6 bộ kiểm thử đã vượt qua xuất sắc:

```text
=================================================================
 TỔNG HỢP KIỂM THỬ DỰ ÁN EDUMATE HUẾ (103/103 TESTS PASS)
=================================================================
1. test_business_logic.mjs:       26/26 PASS (100%) - Dữ liệu & Nghiệp vụ cốt lõi
2. test_rls_security.mjs:         12/12 PASS (100%) - Bảo mật phân quyền RLS
3. test_tutor_platform.mjs:       12/12 PASS (100%) - Hồ sơ gia sư & Đánh giá
4. test_edumate_packages.mjs:     14/14 PASS (100%) - 3 Gói học & Điểm hòa vốn 49 gói
5. test_vietqr_and_refunds.mjs:   24/24 PASS (100%) - VietQR VietinBank & Hoàn tiền 100%
6. test_auth_and_roles.mjs:       15/15 PASS (100%) - Đăng nhập Email & 3 Vai trò
-----------------------------------------------------------------
Tổng cộng:                       103/103 TESTS ĐẠT CHUẨN XUẤT SẮC
Linter (oxlint):                 0 warnings, 0 errors (34 files)
TypeScript & Build:              Exit code 0 (Bundle Production hoàn tất)
=================================================================
```

### Chi tiết 15 ca kiểm thử xác thực và phân quyền mới:
- `[PASS] Ca 1a`: Đăng nhập Người học (`23K4080035@hce.edu.vn`) thành công.
- `[PASS] Ca 1b`: Đăng nhập Người dạy bằng Gmail thật (`lehoangnam.k44@gmail.com`) thành công.
- `[PASS] Ca 1c`: Đăng nhập Quản lý (`Leanhdiemnhu240905@gmail.com`) thành công.
- `[PASS] Ca 2`: Đăng nhập sai mật khẩu bị từ chối chuẩn xác (thông báo an toàn, không lộ chi tiết).
- `[PASS] Ca 3`: Đăng nhập với email không tồn tại bị từ chối.
- `[PASS] Ca 4`: Đăng xuất thành công, phiên đăng nhập bị hủy bỏ hoàn toàn.
- `[PASS] Ca 5`: Khôi phục phiên đăng nhập hợp lệ từ token phiên thành công.
- `[PASS] Ca 6`: Người học truy cập trang Quản trị bị chặn ngay lập tức (403 Forbidden).
- `[PASS] Ca 7`: Người dạy cố tình gọi hàm duyệt thanh toán VietQR bị chặn (UNAUTHORIZED).
- `[PASS] Ca 8`: Người quản lý (Manager) truy cập trang quản trị và điều phối dịch vụ thành công.
- `[PASS] Ca 9`: Cách ly dữ liệu: Người học chỉ xem được yêu cầu của mình, không thấy của người khác.
- `[PASS] Ca 10`: Phòng chống leo thang quyền: Cố ý sửa role phía client bị vô hiệu hóa 100%.
- `[PASS] Ca 11`: Role Switcher bị khóa hoàn toàn trong môi trường Production.
- `[PASS] Ca 12`: Chặn tự đăng ký Manager/Admin; cho phép đăng ký Người học và Người dạy hợp lệ.
- `[PASS] Ca 13`: Bảo vệ quyền riêng tư: Thông tin ngân hàng của học viên được ẩn 100% trước Người dạy.
- `[PASS] Ca 14`: Luồng thanh toán VietQR tương thích liền mạch với định danh tài khoản 23K4080035.
- `[PASS] Ca 15`: Mô phỏng chính sách Row Level Security (RLS) kiểm soát quyền đọc/ghi đạt chuẩn 100%.

---

## 5. Hướng Dẫn Khởi Tạo Ba Nhóm Tài Khoản Trên Supabase Thật

> [!IMPORTANT]
> Chủ dự án thực hiện các bước dưới đây trên máy tính cá nhân hoặc Supabase Dashboard. Tuyệt đối không chia sẻ mật khẩu hay `service_role key` qua mạng công cộng hoặc đưa vào mã nguồn.

### Cách 1: Sử dụng công cụ tự động hóa an toàn `provision_accounts.mjs`

Mở PowerShell tại thư mục dự án và thực hiện:

```powershell
# 1. Thiết lập tạm thời biến môi trường (chỉ lưu trong phiên terminal này)
$env:SUPABASE_URL = "https://<your-project-id>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "<your-service-role-key-from-supabase-dashboard>"

# 2. Khởi tạo tài khoản Người học (23K4080035@hce.edu.vn) và Quản lý (Leanhdiemnhu240905@gmail.com)
node scripts/provision_accounts.mjs --password="<NhapMatKhauAnToanCuaBan>"

# 3. Khởi tạo thêm tài khoản Người dạy bằng Gmail thật:
node scripts/provision_accounts.mjs --password="<MatKhauNguoiDay>" --tutor-email="<gmail_cua_gia_su>@gmail.com" --tutor-name="Anh Lê Hoàng Nam (K44)"
```

### Cách 2: Thao tác trực tiếp qua Supabase Dashboard & SQL Editor

Nếu không muốn chạy script CLI, bạn có thể thực hiện theo quy trình 2 bước:

#### Bước 2.1: Chạy Migration bổ sung hỗ trợ `tutor` và trigger an ninh
Vào **Supabase Dashboard** -> **SQL Editor** -> Dán nội dung file [`supabase/migrations/20261109000000_add_tutor_role_and_auth_security.sql`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/supabase/migrations/20261109000000_add_tutor_role_and_auth_security.sql) -> Bấm **Run**.

#### Bước 2.2: Tạo tài khoản tại mục Authentication
1. Vào **Authentication** -> **Users** -> Chọn **Add user** -> **Create user**.
2. **Tài khoản Người học:**
   - Email: `23K4080035@hce.edu.vn`
   - Password: Nhập mật khẩu mong muốn
   - Auto Confirm User: **BẬT (Checked)**
3. **Tài khoản Người dạy:**
   - Email: Nhập Gmail thật của người dạy (ví dụ: `giaosu.edumate@gmail.com`)
   - Password: Nhập mật khẩu
   - Auto Confirm User: **BẬT (Checked)**
4. **Tài khoản Quản lý:**
   - Email: `Leanhdiemnhu240905@gmail.com`
   - Password: Nhập mật khẩu an toàn
   - Auto Confirm User: **BẬT (Checked)**

#### Bước 2.3: Gán vai trò chính thức trong bảng `user_roles`
Vào **SQL Editor**, chạy đoạn script SQL sau:

```sql
-- Gán quyền Người học
UPDATE public.user_roles 
SET role = 'student' 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = '23K4080035@hce.edu.vn');

-- Gán quyền Người dạy (theo Gmail thật của từng người dạy)
UPDATE public.user_roles 
SET role = 'tutor' 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = '<gmail_cua_gia_su>@gmail.com');

-- Gán quyền Quản lý duy nhất
SELECT public.provision_manager_by_email('Leanhdiemnhu240905@gmail.com');
```

---

## 6. Quy Trình Cấp & Thu Hồi Quyền Quản Lý (Manager)

- **Cấp quyền Quản lý:**
  Chỉ tài khoản superuser hoặc chạy SQL trực tiếp từ Backend mới có thể nâng quyền bằng lệnh:
  ```sql
  SELECT public.provision_manager_by_email('email_can_cap_quyen@gmail.com');
  ```
- **Thu hồi quyền Quản lý (Hạ cấp về Student):**
  ```sql
  UPDATE public.user_roles 
  SET role = 'student', updated_at = now() 
  WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'email_can_thu_hoi@gmail.com');
  ```

---

## 7. Cấu Hình Supabase Còn Thiếu (Nếu Chưa Kích Hoạt)

1. **Biến môi trường Frontend (.env):**
   Đảm bảo file `.env` trên máy hoặc biến môi trường trên Vercel có đủ:
   ```env
   VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
   ```
2. **Cấu hình Email Provider (SMTP):**
   - Vào **Authentication** -> **Email Templates** -> Tùy chỉnh mẫu thư xác thực và thư đặt lại mật khẩu với thương hiệu **EduMate Huế**.
   - Nếu muốn gửi email khối lượng lớn ổn định, cấu hình Custom SMTP (Resend, SendGrid hoặc Gmail SMTP).
3. **Google OAuth Provider (Tùy chọn):**
   - Vào **Authentication** -> **Providers** -> Bật **Google**.
   - Nhập `Client ID` và `Client Secret` từ Google Cloud Console.

---

## 8. Checklist Kiểm Thử Thực Tế Cho Người Dùng

### Kịch bản 1: Kiểm tra Đăng nhập & Phân quyền Người học
- [ ] Vào trang web -> Bấm nút **Đăng nhập**.
- [ ] Nhập Email `23K4080035@hce.edu.vn` và mật khẩu -> Bấm **Đăng nhập vào hệ thống**.
- [ ] Xác nhận: Đăng nhập thành công, thanh Header hiển thị tên và mã SV `23K4080035`.
- [ ] Thử truy cập mục Quản trị: Xác nhận màn hình hiển thị trang **"403 – Không có quyền truy cập"**.
- [ ] Gửi yêu cầu học và vào trang thanh toán VietQR: Mã VietQR VietinBank hiển thị bình thường.

### Kịch bản 2: Kiểm tra Đăng nhập Người dạy
- [ ] Đăng xuất và đăng nhập bằng Gmail người dạy.
- [ ] Xác nhận: Header hiển thị vai trò **Người dạy**, truy cập được mục **Yêu cầu & Lịch dạy**.
- [ ] Xem danh sách hoàn tiền: Xác nhận thông tin tài khoản ngân hàng của học viên hoàn toàn bị ẩn.
- [ ] Thử truy cập mục Quản trị hoặc Thanh toán: Xác nhận bị chặn bởi màn hình **403 Forbidden**.

### Kịch bản 3: Kiểm tra Đăng nhập Quản lý & Đối soát
- [ ] Đăng xuất và đăng nhập bằng Email `Leanhdiemnhu240905@gmail.com`.
- [ ] Xác nhận: Được tự động chuyển vào trang **Khu Vực Quản Trị Hệ Thống EduMate Huế**.
- [ ] Toàn quyền truy cập bảng tài chính, đối soát VietQR và duyệt lệnh hoàn tiền.

