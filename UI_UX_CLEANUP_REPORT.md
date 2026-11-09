# EDUMATE HUẾ — BÁO CÁO RÀ SOÁT, TINH GỌN VÀ HIỆN ĐẠI HÓA GIAO DIỆN (UI/UX CLEANUP REPORT)

> **Dự án:** EduMate Huế  
> **Khẩu hiệu:** *"Tìm đúng người dạy – Học đúng điều cần."*  
> **Đối tượng thụ hưởng:** Sinh viên, Gia sư và Ban Điều hành EduMate – Trường Đại học Kinh tế, Đại học Huế  
> **Ngày rà soát:** 09/11/2026  

---

## 1. NGUYÊN TẮC RÀ SOÁT & TIÊU CHUẨN ĐÁNH GIÁ (KEEP - IMPROVE - REMOVE)

Quá trình chuẩn hóa và dọn dẹp giao diện EduMate Huế tuân thủ nghiêm ngặt 3 tiêu chí:
1. **GIỮ LẠI (KEEP):** Toàn bộ các quy tắc nghiệp vụ cốt lõi, bảng giá 3 gói học (90k, 360k, 450k), tài khoản thanh toán VietinBank (`107879627729`), quy trình hoàn tiền 100% khi gia sư từ chối, và các trường định danh sinh viên HCE.
2. **NÂNG CẤP (IMPROVE):** Trải nghiệm người dùng, bảng biểu hiện đại, thẻ chỉ số KPI có giải thích công thức, biểu đồ SVG nhẹ tải nhanh, bộ lọc thời gian trực quan, giao diện dark mode sang trọng chuẩn mực.
3. **LOẠI BỎ (REMOVE):** Toàn bộ các component mồ côi (dead components), biến khai báo không sử dụng, cảnh báo linting, và mã nguồn trùng lặp.

---

## 2. KẾT QUẢ RÀ SOÁT TỔNG THỂ THEO TỪNG TRANG & THÀNH PHẦN

### 2.1. Header & Điều Hướng Chung (`src/components/layout/Header.tsx`)
* **Trạng thái:** Hoạt động chính thức.
* **KEEP:** 
  * Logo thương hiệu EduMate với gradient màu xanh dương - ngọc lục bảo (blue-to-emerald).
  * Badge phiên bản `"Huế Edition"` và slogan *"Tìm đúng người dạy – Học đúng điều cần"*.
  * Cơ chế bảo mật: Khi kết nối Supabase Cloud Live, thanh Demo Switcher tự động khóa, hiển thị nhãn `"Supabase RLS"` để tránh nhầm lẫn giữa môi trường thật và demo.
* **IMPROVE:**
  * Hiển thị chỉ báo cơ sở dữ liệu (`Supabase Live` vs `Mô phỏng Local Engine`).
  * Điều hướng phân quyền động: Ẩn/hiện menu phù hợp với từng vai trò `student`, `tutor`, `manager`.
* **REMOVE:**
  * Đã xóa tệp `src/components/Navbar.tsx` (thành phần mồ côi cũ, không còn được tham chiếu trong bất kỳ trang nào).

### 2.2. Trang Chủ (`src/pages/HomePage.tsx`)
* **KEEP:**
  * Slogan chuẩn mực: *“Tìm đúng người dạy – Học đúng điều cần.”*
  * Bảng thông tin 3 nhóm nội dung học tập: Kỹ năng thực hành, Môn học đại cương, Môn học chuyên ngành.
  * Bảng giá 3 gói học EduMate chuẩn:
    * Gói Học Thử: 3 buổi – 90.000 đ
    * Gói Cấp Tốc: 15 buổi – 450.000 đ
    * Gói Dài Hạn: 12 buổi – 360.000 đ
  * Hồ sơ gia sư tiêu biểu đã được Quản trị viên phê duyệt (Verified Tutors).
* **IMPROVE:**
  * Thanh tìm kiếm nhanh kết hợp lọc theo quận/huyện trên địa bàn tỉnh Thừa Thiên Huế (TP. Huế, Hương Thủy, Hương Trà, Phú Vang...).
  * Tối ưu hiển thị responsive trên thiết bị di động (mobile-friendly cards).

### 2.3. Trang Quản Trị & Trung Tâm Báo Cáo (`src/pages/AdminPage.tsx`)
* **KEEP:**
  * Đầy đủ các tab giáo vụ: Hồ sơ Người dạy (Tutors), Yêu cầu học vụ (Learning Requests), Người dùng (Users), Khiếu nại (Reports), Đánh giá (Reviews), Đối soát VietQR & Hoàn tiền (Reconciliation), Nhật ký kiểm toán (Audit Logs).
* **IMPROVE:**
  * Tích hợp tab **Thống Kê & Báo Cáo (`StatisticsTab`)** ở vị trí trang trọng đầu tiên trong thanh công cụ quản trị.
  * Tích hợp 12 KPI cards, biểu đồ xu hướng ngày (Time-Series Area/Bar), 2 biểu đồ phân bổ hình tròn (Donut), và 4 bảng chi tiết có phân trang, lọc và xuất file CSV an toàn.
* **REMOVE:**
  * Loại bỏ các import thừa và biến state dư thừa.

### 2.4. Module Báo Cáo & Phân Tích Mới (`src/components/reporting/`)
* **Thành phần mới bổ sung:**
  1. `StatisticsTab.tsx`: Hub quản trị báo cáo tổng hợp.
  2. `KPICard.tsx`: Hiển thị 12 chỉ số với màu sắc định danh, danh mục và tooltip giải thích công thức.
  3. `DateRangePicker.tsx`: Bộ lọc thời gian với 6 tùy chọn linh hoạt (hôm nay, 7 ngày, 30 ngày, tháng này, toàn bộ, tùy biến).
  4. `ReportingCharts.tsx`: Biểu đồ SVG thuần, không kéo theo thư viện ngoài cồng kềnh, tối ưu hiệu năng render.
  5. `ReportTable.tsx`: Bảng dữ liệu có tìm kiếm, lọc danh mục, sắp xếp cột, phân trang và tải file CSV có UTF-8 BOM.
* **Đảm bảo chất lượng (Quality Assurance):**
  * Sửa lỗi cảnh báo React Immutability và Purity. Đạt chuẩn **0 warnings, 0 errors** với `oxlint`.

### 2.5. Trang Thanh Toán VietQR & Hoàn Tiền (`src/pages/PaymentPage.tsx`)
* **KEEP:**
  * Cấu hình chuyển khoản VietinBank: `107879627729`, Chủ tài khoản: `EDUMATE HUE`.
  * Mã chuyển khoản chuẩn hóa dạng `EDM YCH-2026-xxx`.
  * Hướng dẫn quét mã QR ngân hàng chuẩn NAPAS 24/7.
  * Form cập nhật số tài khoản nhận tiền hoàn của học viên khi gia sư từ chối lớp.
* **IMPROVE:**
  * Nút sao chép 1 chạm thông minh cho Số tài khoản, Số tiền, và Nội dung chuyển khoản.
  * Thông báo hướng dẫn rõ ràng thời gian hoàn tiền và cam kết bảo vệ quyền lợi học viên 100%.

### 2.6. Trang Yêu Cầu Của Tôi (`src/pages/MyRequestsPage.tsx`)
* **KEEP:**
  * Danh sách yêu cầu học vụ theo cả 2 chiều: Sinh viên theo dõi tiến độ lớp, Gia sư tiếp nhận lịch dạy.
  * Phân loại trạng thái rõ ràng: Chờ duyệt, Đã chấp nhận, Chờ thanh toán, Đã thanh toán, Hoàn thành, Đã hủy, Từ chối.
* **IMPROVE:**
  * Nút "Thanh toán ngay" dẫn thẳng đến giao dịch VietQR tương ứng trên `PaymentPage`.
  * Modal gia sư từ chối yêu cầu bắt buộc nhập lý do để tự động kích hoạt tiến trình hoàn tiền cho sinh viên.

### 2.7. Trang Chân Trang (`src/components/layout/Footer.tsx`)
* **KEEP:**
  * Thông tin bản quyền Đề án Khởi nghiệp Đổi mới Sáng tạo – Trường Đại học Kinh tế, Đại học Huế.
  * Địa chỉ và thông tin liên hệ giáo vụ tại TP. Huế.
  * Cam kết bảo mật thông tin và an toàn tài chính sinh viên.

---

## 3. TỔNG HỢP CÁC FILE ĐÃ LOẠI BỎ & DỌN DẸP

| File / Đoạn mã | Trạng thái | Lý do xử lý |
| :--- | :---: | :--- |
| `src/components/Navbar.tsx` | **ĐÃ XÓA (REMOVE)** | Tệp cũ không được import trong dự án, chức năng đã do `Header.tsx` đảm nhiệm. |
| Các icon thừa trong `StatisticsTab.tsx` | **ĐÃ XÓA (REMOVE)** | `CheckCircle2`, `Clock`, `AlertTriangle` không dùng trong file. |
| `BarChart3` trong `ReportingCharts.tsx` | **ĐÃ XÓA (REMOVE)** | Import thừa không được dùng trong tệp. |
| Mutation trong render của `StatusDonutChart` | **ĐÃ CẢI TIẾN (IMPROVE)** | Chuyển sang tính toán thuần túy (pure mapping) với `useMemo`, loại bỏ cảnh báo immutability. |
| Impure call `Date.now()` trong `DateRangePicker` | **ĐÃ CẢI TIẾN (IMPROVE)** | Đưa hàm khởi tạo giá trị ngày ra ngoài scope component, thỏa mãn tiêu chuẩn React Compiler. |

---

## 4. KẾT LUẬN VỀ HIỆU NĂNG & THẨM MỸ GIAO DIỆN

* **Thời gian build Vite:** ~**770ms** (cực kỳ nhanh).
* **Chất lượng mã nguồn:** **0 warnings, 0 errors** trên toàn bộ 41 tệp qua công cụ `oxlint`.
* **Trải nghiệm thị giác:** Giao diện tối màu (Dark Theme) đồng bộ với hiệu ứng kính mờ (glassmorphism), bảng màu chuẩn nhận diện Đại học Kinh tế Huế, font chữ rõ ràng, độ tương phản cao, thao tác mượt mà trên mọi kích cỡ màn hình.

