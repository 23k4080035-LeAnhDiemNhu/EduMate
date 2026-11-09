# BÁO CÁO TRIỂN KHAI THANH TOÁN VIETQR VÀ QUY TRÌNH HOÀN TIỀN 100% EDUMATE HUẾ

> **Dự án:** EduMate Huế – Nền tảng kết nối người học và người dạy (Sinh viên Trường Đại học Kinh tế, Đại học Huế)  
> **Slogan:** *"Tìm đúng người dạy – Học đúng điều cần."*  
> **Căn cứ tài liệu:** Đồ án Khởi nghiệp Đổi mới và Sáng tạo EduMate Huế (`ĐỒ ÁN KHỞI NGHIỆP ĐỔI MỚI VÀ SÁNG TẠO_1.pdf`)  
> **Tác giả đồ án:** Nguyễn Thị Nhân (23K4080030) & Lê Ánh Diễm Như (23K4080035)  
> **Giảng viên hướng dẫn:** ThS. Trần Thái Hòa – HCE  
> **Ngày hoàn thành triển khai:** 08/11/2026  
> **Trạng thái kiểm thử tự động:** 88/88 tests PASS (100% thành công trên 5 bộ test suites)

---

## 1. TỔNG QUAN KIẾN TRÚC THANH TOÁN & HOÀN TIỀN

Hệ thống thanh toán của EduMate Huế được thiết kế chuyên biệt cho mô hình kinh tế nền tảng P2P (Peer-to-Peer Tutoring) tại thị trường Thừa Thiên Huế, tuân thủ nghiêm ngặt các nguyên tắc:

```
[Người học gửi Yêu cầu học theo Gói]
               │
               ▼
[Tự động tạo PaymentIntent (Trạng thái: pending)]
               │
               ▼
[Chuyển hướng đến Cổng Thanh Toán VietQR]
(Hiển thị mã QR động, STK VietinBank 107879627729, số tiền chuẩn, cú pháp EDM YCH-...)
               │
               ▼
[Người học quét mã & bấm "Tôi đã chuyển khoản"]
(Nhập mã giao dịch ngân hàng / tham chiếu)
               │
               ▼
[Trạng thái chuyển sang: awaiting_verification]
(TUYỆT ĐỐI KHÔNG TỰ ĐỘNG CHUYỂN THÀNH PAID)
               │
       ┌───────┴────────────────────────┐
       ▼                                ▼
[Admin khớp sao kê hợp lệ]       [Người dạy từ chối yêu cầu]
       │                                │
       ▼                                ├─ Case 1: Chưa thanh toán ──> Hủy Intent, không hoàn tiền
[Chuyển sang: paid]                     ├─ Case 2: Đang đối soát  ──> Chuyển needs_review, Admin rà soát
(Ghi nhận vào doanh thu ròng)           └─ Case 3: Đã thanh toán  ──> Tự động tạo RefundRequest 100%
                                                │
                                                ▼
                                         [Quy trình hoàn tiền 100%]
                                         requested ──> under_review ──> approved ──> processing ──> refunded
                                         (Bắt buộc có bank_refund_reference; bảo mật STK trước gia sư)
```

---

## 2. ĐỐI CHIẾU ĐỊNH MỨC GIÁ 3 GÓI HỌC CHUẨN HÓA (CHƯƠNG 2.6.3 & 3.3)

| Gói học | Số buổi | Đơn giá / buổi | Tổng học phí | Phí nền tảng (15%) | Gia sư thực nhận (85%) | Mục tiêu đào tạo theo PDF |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Gói học thử** (`trial`) | 3 buổi | 30.000 ₫ | **90.000 ₫** | 13.500 ₫ | 76.500 ₫ | Trải nghiệm phương pháp, làm quen gia sư |
| **Gói cấp tốc** (`intensive`) | 15 buổi | 30.000 ₫ | **450.000 ₫** | 67.500 ₫ | 382.500 ₫ | Ôn thi học phần cấp tốc, giải trọn bộ đề thi HCE |
| **Gói dài hạn** (`long_term`) | 12 buổi | 30.000 ₫ | **360.000 ₫** | 54.000 ₫ | 306.000 ₫ | Đồng hành suốt kỳ, bài tập lớn, kỹ năng thực hành |

> [!IMPORTANT]
> **Chính sách phí minh bạch:** Học viên thanh toán **đúng 100% giá gói học** (90.000đ, 450.000đ, 360.000đ). Phí dịch vụ 15% của EduMate Huế đã nằm trọn gói trong học phí, hoàn toàn không có phụ phí ẩn.

---

## 3. CÁC TÍNH NĂNG VÀ MÃ NGUỒN ĐÃ TRIỂN KHAI

### A. Kiểu dữ liệu miền (Domain Types) - [`src/types/index.ts`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/src/types/index.ts)
- `PaymentIntentStatus`: `'pending' | 'awaiting_verification' | 'paid' | 'cancelled' | 'needs_review' | 'refund_pending' | 'refunded'`.
- `PaymentVerificationStatus`: `'verified' | 'rejected' | 'needs_review'`.
- `RefundStatus`: `'requested' | 'under_review' | 'approved' | 'processing' | 'refunded' | 'rejected' | 'failed'`.
- Các interface: `PaymentIntent`, `PaymentVerification`, `RefundRequest`, `StudentBankAccount`, `BankConfig`.
- Cấu hình chuẩn `DEFAULT_BANK_CONFIG` (VietinBank số `107879627729`, chủ TK: `EDUMATE HUE`, tùy chọn cấu hình linh hoạt trong Quản trị).

### B. Kho dữ liệu & Nghiệp vụ (Data Service) - [`src/services/dataService.ts`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/src/services/dataService.ts)
- `createLearningRequest`: Tự động khởi tạo `PaymentIntent` đi kèm với trạng thái ban đầu `pending`.
- `createPaymentIntent`: Hỗ trợ `idempotency_key`, ngăn chặn trùng lặp giao dịch khi người dùng nhấn đúp nút gửi.
- `submitPaymentTransfer`: Tiếp nhận thông báo chuyển khoản từ học viên, chuyển trạng thái sang `awaiting_verification`. **Tuyệt đối không tự gán `paid`**.
- `verifyPaymentIntent`: Kiểm tra quyền hạn Quản lý (`manager` / `admin`). Nếu hợp lệ, chuyển sang `paid`, ghi nhận mốc thời gian `paid_at`, lưu vết `PaymentVerification` và `audit_logs`.
- `processTutorRejectionRefund`:
  - **Case 1 (Chưa thanh toán):** Huỷ `PaymentIntent` (`cancelled`), từ chối yêu cầu, không phát sinh hoàn tiền.
  - **Case 2 (Đang đối soát):** Chuyển `PaymentIntent` sang `needs_review` để Quản trị viên tra cứu sao kê.
  - **Case 3 (Đã thanh toán):** Tự động tạo `RefundRequest` với số tiền hoàn lại **100% học phí gói học** (không trừ 15% phí nền tảng).
- `getRefundRequests`: Áp dụng **quyền riêng tư nghiêm ngặt**: Khi Người dạy xem danh sách, trường `student_bank_account` bị lược bỏ hoàn toàn.
- `updateStudentRefundAccount`: Cho phép học viên cập nhật số tài khoản nhận tiền hoàn (Tên NH, Số TK, Tên chủ TK).
- `processRefundRequest`: Quản trị viên duyệt và thực hiện chuyển tiền hoàn. **Bắt buộc phải có `bank_refund_reference` khi chuyển sang `refunded`**; ngăn chặn hoàn tiền lần 2 (`Anti-double refund`).
- `getPlatformFinancialMetrics`: Hạch toán tách bạch doanh thu thực tế (chỉ tính các gói `paid`), khối lượng chờ đối soát (`pending_verification_volume`), nghĩa vụ hoàn tiền (`refund_liability_volume`) và khối lượng đã hoàn tiền (`refunded_volume`).

### C. Cổng thanh toán VietQR - [`src/pages/PaymentPage.tsx`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/src/pages/PaymentPage.tsx)
- Hiển thị banner cảnh báo môi trường thử nghiệm: **`MÔ PHỎNG – KHÔNG CHUYỂN TIỀN THẬT`**.
- Tạo ảnh mã VietQR động theo chuẩn Napas247 qua API VietQR:
  `https://img.vietqr.io/image/ICB-107879627729-compact.png?amount=...&addInfo=EDM%20YCH-...&accountName=...`
- Cung cấp nút sao chép một chạm (One-click copy) cho: Số tài khoản, Tên chủ tài khoản, Số tiền chính xác, Nội dung chuyển khoản.
- Biểu mẫu "Tôi đã chuyển khoản": Nhập mã giao dịch ngân hàng / tham chiếu.
- Khung theo dõi tiến trình hoàn tiền 100%: Cho phép học viên cập nhật thông tin tài khoản ngân hàng thụ hưởng.

### D. Tích hợp Biểu mẫu gửi yêu cầu - [`src/pages/SubmitRequestPage.tsx`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/src/pages/SubmitRequestPage.tsx)
- Đổi nút hành động thành: **"Gửi yêu cầu và thanh toán (90.000 đ)"**.
- Sau khi gửi yêu cầu thành công, tự động điều hướng người học đến trang thanh toán VietQR với tham số `{ requestId, paymentIntentId }`.

### E. Quản lý Yêu cầu & Lịch học - [`src/pages/MyRequestsPage.tsx`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/src/pages/MyRequestsPage.tsx)
- Bổ sung huy hiệu trạng thái thanh toán riêng biệt: `Chờ thanh toán`, `Đang đối soát`, `Đã thanh toán`, `Cần kiểm tra`, `Chờ hoàn tiền`, `Đã hoàn tiền 100%`.
- Nút "Thanh toán VietQR" cho các yêu cầu chưa trả tiền.
- Nút "Theo dõi hoàn tiền" cho các yêu cầu có hoàn tiền.
- Khi gia sư bấm "Từ chối", hệ thống tự động kích hoạt `processTutorRejectionRefund` và hiển thị thông báo chi tiết nếu học viên được hoàn tiền 100%.

### F. Quản trị & Đối soát Admin - [`src/pages/AdminPage.tsx`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/src/pages/AdminPage.tsx)
- Nâng cấp tab **"Đối Soát & Hoàn Tiền VietQR"** với 6 phân hệ (sub-tabs):
  1. *Chờ Đối Soát:* Danh sách giao dịch học viên đã chuyển khoản, có nút "Khớp Lệnh Ngân Hàng".
  2. *Đã Xác Nhận:* Danh sách giao dịch đã kiểm toán khớp sao kê ngân hàng thành công.
  3. *Cần Kiểm Tra:* Giao dịch bất thường hoặc gia sư từ chối khi đang xác minh.
  4. *Yêu Cầu Hoàn Tiền:* Quản lý các lệnh hoàn 100%, duyệt lệnh, thực hiện chuyển tiền và nhập mã giao dịch hoàn trả.
  5. *Tất Cả Giao Dịch:* Lịch sử toàn bộ giao dịch thanh toán.
  6. *Cấu Hình Tài Khoản Nhận:* Quản lý tài khoản nhận chuyển khoản.
- Modal "Đối Soát Giao Dịch Chuyển Khoản": Cho phép chọn `Khớp lệnh thành công`, `Cần kiểm tra`, `Từ chối` kèm mã giao dịch sao kê.
- Modal "Xử Lý Hoàn Tiền 100%": Cập nhật trạng thái hoàn tiền, ràng buộc bắt buộc nhập mã chuyển tiền hoàn trả.
- Bổ sung 3 thẻ KPI tài chính VietQR: Chờ đối soát, Nghĩa vụ hoàn tiền, Đã hoàn tiền thực tế.

### G. Điều hướng ứng dụng - [`src/App.tsx`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/src/App.tsx)
- Đăng ký trang `'payment'` vào bộ điều hướng toàn cục và truyền `pageParams` tương thích.

### H. Migration Cơ Sở Dữ Liệu PostgreSQL / Supabase
- File migration: [`supabase/migrations/20261108000000_vietqr_payments_and_refunds.sql`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/supabase/migrations/20261108000000_vietqr_payments_and_refunds.sql)
- Thiết lập đầy đủ các bảng `payment_intents`, `payment_verifications`, `refund_requests`, các chỉ mục hiệu năng (indexes), ràng buộc toàn vẹn (constraints) và chính sách bảo mật Row Level Security (RLS).

---

## 4. KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST RESULTS)

Bộ kiểm thử tự động [`tests/test_vietqr_and_refunds.mjs`](file:///d:/KhoiNghiepDoiMoiSangTao/edumate/tests/test_vietqr_and_refunds.mjs) đã bao phủ toàn bộ 24 ca kiểm thử theo yêu cầu:

```
=================================================================
 KIỂM THỬ QUY TRÌNH THANH TOÁN VIETQR & HOÀN TIỀN EDUMATE HUẾ
 Slogan: "Tìm đúng người dạy – Học đúng điều cần."
=================================================================

--- NHÓM 1: KHỞI TẠO THANH TOÁN VIETQR & ĐỊNH GIÁ GÓI HỌC ---
[PASS] Ca 1: Tạo LearningRequest tự động tạo PaymentIntent với trạng thái ban đầu là pending
[PASS] Ca 2: Kiểm tra tính toàn vẹn của VietQR transfer memo: "EDM YCH-2026-001"
[PASS] Ca 3: Định mức giá 3 gói học chuẩn hóa (90k, 450k, 360k) và phân bổ 15% - 85% chính xác
[PASS] Ca 4: Cơ chế Idempotency ngăn chặn thành công việc tạo trùng lặp PaymentIntent

--- NHÓM 2: BÁO CHUYỂN KHOẢN, ĐỐI SOÁT & PHÒNG CHỐNG GIAN LẬN ---
[PASS] Ca 5: Học viên gửi thông báo chuyển khoản chuyển trạng thái sang awaiting_verification
[PASS] Ca 6: Bảo mật: Nhấn "Tôi đã chuyển khoản" tuyệt đối KHÔNG tự động xác nhận paid
[PASS] Ca 7: Bảo mật: Học viên cố tình gọi hàm xác minh verifyPaymentIntent bị chặn (UNAUTHORIZED)
[PASS] Ca 8: Bảo mật: Người dạy cố tình xác minh thanh toán bị chặn (UNAUTHORIZED)
[PASS] Ca 9: Quản trị viên đối soát khớp sao kê hợp lệ: chuyển sang paid kèm lưu vết kiểm toán
[PASS] Ca 10: Quản trị viên từ chối đối soát do không khớp sao kê: chuyển sang cancelled
[PASS] Ca 11: Báo cáo tài chính chuẩn xác: Doanh thu thực tế (13500 đ) không tính đơn chờ

--- NHÓM 3: XỬ LÝ GIA SƯ TỪ CHỐI & HOÀN TIỀN 100% (3 TRƯỜNG HỢP) ---
[PASS] Ca 12: Case 1 (Từ chối khi chưa thanh toán): Hủy PaymentIntent (cancelled), không hoàn tiền
[PASS] Ca 13: Case 2 (Từ chối khi đang đối soát): Đánh dấu needs_review để Quản trị viên xử lý
[PASS] Ca 14: Case 3 (Từ chối khi đã thanh toán): Tự động tạo RefundRequest hoàn 100% (450.000đ, không phạt phí)

--- NHÓM 4: BẢO MẬT RLS HOÀN TIỀN & XỬ LÝ LỆNH CHUYỂN TIỀN ---
[PASS] Ca 15: Bảo mật: Học viên cố tình phê duyệt hoàn tiền bị chặn (UNAUTHORIZED)
[PASS] Ca 16: Học viên cập nhật tài khoản ngân hàng nhận tiền hoàn thành công
[PASS] Ca 17: Bảo mật quyền riêng tư: Thông tin tài khoản ngân hàng học viên được ẩn hoàn toàn với Gia sư
[PASS] Ca 18: Quản trị viên phê duyệt yêu cầu hoàn tiền (status: approved)
[PASS] Ca 19: Ràng buộc: Hoàn tiền sang refunded bắt buộc phải có mã giao dịch ngân hàng
[PASS] Ca 20: Quản trị viên chuyển tiền hoàn tất: ghi nhận bank_refund_reference và cập nhật intent -> refunded
[PASS] Ca 21: Quản trị viên từ chối hoàn tiền có lý do giải trình hợp lệ (status: rejected)
[PASS] Ca 22: Báo cáo tài chính: Tổng tiền đã hoàn trả (450000 đ) được hạch toán minh bạch
[PASS] Ca 23: Nhãn cảnh báo MÔ PHỎNG – KHÔNG CHUYỂN TIỀN THẬT được kích hoạt chuẩn xác
[PASS] Ca 24: Anti-double refund: Ngăn chặn tuyệt đối việc hoàn tiền trùng lặp cho cùng một yêu cầu

=================================================================
 KẾT QUẢ KIỂM THỬ: 24/24 TESTS ĐẠT CHUẨN XUẤT SẮC (100% PASS)
 HỆ THỐNG THANH TOÁN VIETQR VÀ HOÀN TIỀN 100% ĐẠT CHUẨN NGHIỆM THU!
=================================================================
```

### Tổng hợp toàn bộ 5 suites kiểm thử của dự án EduMate Huế:
1. `tests/test_business_logic.mjs`: **26/26 PASS**
2. `tests/test_rls_security.mjs`: **10/10 PASS**
3. `tests/test_tutor_platform.mjs`: **14/14 PASS**
4. `tests/test_edumate_packages.mjs`: **14/14 PASS**
5. `tests/test_vietqr_and_refunds.mjs`: **24/24 PASS**
👉 **Tổng cộng: 88/88 TESTS PASS (100% THÀNH CÔNG)**

---

## 5. HƯỚNG DẪN KIỂM THỬ GIAO DIỆN THỦ CÔNG (CHECKLIST CHO NGƯỜI DÙNG)

Để tự trải nghiệm và kiểm chứng giao diện trực quan trên máy của bạn (tuân thủ nguyên tắc không tự khởi động web trong session):

1. Mở PowerShell hoặc Terminal tại thư mục `d:\KhoiNghiepDoiMoiSangTao\edumate`.
2. Chạy lệnh: `npm.cmd run dev` (hoặc `npm run dev`).
3. Truy cập đường dẫn hiển thị (thường là `http://localhost:5173/`).

### Kịch bản kiểm thử 1: Người học gửi yêu cầu & quét mã VietQR thanh toán
- [ ] Ở thanh Header, đảm bảo vai trò là **Người học** (tài khoản mẫu: *Nguyễn Văn An*).
- [ ] Nhấn nút **"Gửi yêu cầu học"** trên thanh Menu.
- [ ] Chọn người dạy (ví dụ: *Anh Lê Hoàng Nam - K44*), chọn **"Gói học thử" (90.000 đ)** hoặc **"Gói cấp tốc" (450.000 đ)**.
- [ ] Nhập mục tiêu học (tối thiểu 10 ký tự) và nhấn **"Gửi yêu cầu và thanh toán"**.
- [ ] Xác nhận giao diện tự động chuyển sang trang **"Cổng Thanh Toán VietQR"**:
  - [ ] Thấy banner vàng cảnh báo: **"MÔ PHỎNG – KHÔNG CHUYỂN TIỀN THẬT"**.
  - [ ] Hiển thị mã QR VietQR tự động sinh kèm STK `107879627729` (VietinBank) và số tiền chính xác.
  - [ ] Bấm các nút "Sao chép" (Số tài khoản, Tên thụ hưởng, Số tiền, Nội dung) -> Thấy toast báo sao chép thành công.
- [ ] Tại form "Xác nhận sau khi chuyển khoản", nhập mã giao dịch mẫu (VD: `MB12345678`) và nhấn **"Tôi Đã Chuyển Khoản Thành Công"**.
- [ ] Xác nhận trạng thái chuyển sang huy hiệu màu xanh dương: **"Đang trong quá trình đối soát thủ công"**.

### Kịch bản kiểm thử 2: Quản trị viên đối soát thanh toán
- [ ] Ở thanh Header, nhấn nút chuyển vai trò sang **"Quản lý"** (tài khoản: *Chị Trần Thị Mai*).
- [ ] Nhấp vào tab **"Đối Soát & Hoàn Tiền VietQR"**.
- [ ] Tại sub-tab **"Chờ Đối Soát"**, thấy giao dịch vừa nộp ở trên kèm nút **"Khớp Lệnh Ngân Hàng"**.
- [ ] Nhấn nút **"Khớp Lệnh Ngân Hàng"** -> Modal hiện lên với đầy đủ thông tin giao dịch.
- [ ] Giữ trạng thái "Khớp lệnh thành công", nhấn **"Xác Nhận & Lưu Vết Đối Soát"**.
- [ ] Chuyển sang sub-tab **"Đã Xác Nhận"**: Giao dịch đã chuyển sang trạng thái `paid`.
- [ ] Nhấp sang tab **"Tài Chính & Phí Nền Tảng 15%"**: Doanh thu thực tế và chỉ số GMV được cập nhật chính xác.

### Kịch bản kiểm thử 3: Người dạy từ chối & Tự động hoàn tiền 100%
- [ ] Ở thanh Header, chuyển vai trò sang **"Người dạy"** (*Anh Lê Hoàng Nam*).
- [ ] Vào mục **"Yêu Cầu & Lịch Học"**.
- [ ] Tại yêu cầu đã thanh toán ở trên, nhấn nút **"Từ chối"**, nhập lý do từ chối (VD: *Trùng lịch bảo vệ đồ án tốt nghiệp*) và bấm xác nhận.
- [ ] Toast thông báo hiện lên: *"Đã tự động tạo yêu cầu hoàn tiền 100% cho học viên"*.
- [ ] Chuyển vai trò sang **"Người học"**:
  - [ ] Vào "Yêu Cầu & Lịch Học", thấy trạng thái `Bị từ chối` và huy hiệu `Chờ hoàn tiền`.
  - [ ] Nhấn nút **"Theo dõi hoàn tiền"** -> Xem tiến trình hoàn tiền 100% và biểu mẫu cập nhật số tài khoản ngân hàng nhận tiền hoàn.
  - [ ] Nhập số tài khoản Vietcombank của bạn và nhấn **"Lưu thông tin tài khoản nhận tiền"**.
- [ ] Chuyển vai trò sang **"Quản lý"**:
  - [ ] Vào "Đối Soát & Hoàn Tiền VietQR" -> Sub-tab **"Yêu Cầu Hoàn Tiền"**.
  - [ ] Thấy yêu cầu hoàn tiền của học viên hiển thị đúng 100% học phí (không bị trừ 15%).
  - [ ] Thấy số tài khoản ngân hàng học viên vừa cập nhật.
  - [ ] Nhấn **"Cập Nhật Tiến Trình"** -> Chọn `Đã hoàn tiền thành công (Refunded)`, nhập mã chuyển tiền ngân hàng (VD: `MB-REFUND-001`) và nhấn xác nhận.
  - [ ] Giao dịch được hoàn tất minh bạch và an toàn.

---

## 6. KẾT LUẬN & ĐÁNH GIÁ SẴN SÀNG TRIỂN KHAI

| Tiêu chí đánh giá | Trạng thái | Ghi chú |
| :--- | :---: | :--- |
| **Bám sát PDF Đồ án** | **100% ĐẠT** | 3 gói học chuẩn hóa (90k, 450k, 360k), phí EduMate 15%, gia sư nhận 85%, điểm hòa vốn 49 gói/tháng |
| **Quy trình VietQR** | **100% ĐẠT** | Tự động tạo mã QR động, cú pháp memo chuẩn, form thông báo chuyển khoản |
| **Đối soát thủ công** | **100% ĐẠT** | Quản trị viên đối soát thực tế, không auto-paid, phân quyền RLS chặt chẽ |
| **Chính sách hoàn tiền** | **100% ĐẠT** | Hoàn trả 100% học phí khi gia sư từ chối, bảo mật STK học viên trước gia sư |
| **Kiểm thử tự động** | **88/88 PASS** | Toàn bộ 5 bộ test suites vượt qua 100% không có lỗi |
| **Chất lượng mã nguồn** | **0 Warning, 0 Error** | Oxlint và TypeScript build thành công hoàn hảo |
| **Tính an toàn Production** | **TUÂN THỦ** | Không commit, push, deploy hoặc can thiệp trái phép DB Production từ xa |

