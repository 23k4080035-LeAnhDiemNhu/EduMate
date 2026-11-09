# EDUMATE HUẾ — TÀI LIỆU YÊU CẦU NGHIỆP VỤ HỆ THỐNG THỐNG KÊ & BÁO CÁO (REPORTING & METRICS)

> **Dự án:** EduMate Huế  
> **Khẩu hiệu (Slogan):** *"Tìm đúng người dạy – Học đúng điều cần."*  
> **Đơn vị phát triển:** Nhóm Đề án Khởi nghiệp Đổi mới Sáng tạo – Trường Đại học Kinh tế, Đại học Huế (HCE)  
> **Phiên bản:** 2.0 (Supabase Cloud Ready & Local Verified)  
> **Ngày phê duyệt:** 09/11/2026  

---

## 1. TỔNG QUAN & MỤC TIÊU NGHIỆP VỤ

Module **Thống Kê & Báo Cáo** (Statistics & Reporting) được thiết kế nhằm cung cấp cho Ban Quản trị, Quản lý Giáo vụ và Đội ngũ Vận hành EduMate Huế một trung tâm giám sát dữ liệu (Analytics Hub) toàn diện, trực quan và bảo mật.

Hệ thống cho phép:
1. Theo dõi sức khỏe vận hành và hiệu quả kết nối học viên - gia sư sinh viên.
2. Giám sát dòng tiền học phí qua chuyển khoản VietQR (VietinBank `107879627729`).
3. Tách bạch tự động **15% doanh thu phí nền tảng** và **85% thu nhập gia sư**.
4. Quản lý minh bạch quy trình hoàn tiền 100% khi gia sư từ chối lớp.
5. Xuất báo cáo dữ liệu định dạng CSV chuẩn hóa, an toàn chống tấn công **CSV Formula Injection (CWE-1236)**.

---

## 2. CHÍNH SÁCH TÀI CHÍNH & MÔ HÌNH DOANH THU

EduMate Huế áp dụng mô hình phí dịch vụ kết nối cố định **15%** trên mỗi gói học phí đã thực thu:

| Gói Học | Số Buổi | Học Phí (VNĐ) | Phí Nền Tảng (15%) | Thu Nhập Gia Sư (85%) | Ghi Chú Nghiệp Vụ |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Gói Học Thử** | 3 | **90.000 đ** | 13.500 đ | 76.500 đ | Dành cho sinh viên làm quen phương pháp học |
| **Gói Cấp Tốc** | 15 | **450.000 đ** | 67.500 đ | 382.500 đ | Ôn thi cuối kỳ, học phần đồ án, kỹ năng thực hành |
| **Gói Dài Hạn** | 12 | **360.000 đ** | 54.000 đ | 306.000 đ | Học bổ trợ kèm cặp xuyên suốt học kỳ |

### Quy Định Hoàn Tiền 100%:
* **Điều kiện áp dụng:** Khi học viên đã quét VietQR thanh toán thành công (`payment_intents.status = 'paid'`), nhưng gia sư khóa trước từ chối nhận lớp vì lý do bất khả kháng (trùng lịch thi, quá tải, v.v.).
* **Tỷ lệ hoàn trả:** **100% học phí gói học** được chuyển trả lại số tài khoản ngân hàng của học viên.
* **Khấu trừ:** Nền tảng EduMate **không thu bất kỳ khoản phí xử lý nào** (0% penalty).
* **Lưu vết ngân hàng:** Bắt buộc nhập `bank_refund_reference` (Mã tham chiếu ngân hàng chuyển tiền hoàn) khi quản trị viên xác nhận hoàn tất.

---

## 3. DANH MỤC 12 CHỈ SỐ HIỆU SUẤT CỐT LÕI (CORE KPIS)

Giao diện hiển thị dạng lưới 12 Thẻ Chỉ Số (KPI Cards) có biểu tượng màu sắc, nhãn trạng thái và giải thích công thức khi hover:

### Nhóm 1: Hiệu Suất Học Vụ & Kết Nối (Academic & Operations)
1. **Tổng Số Yêu Cầu Học Vụ (`totalRequests`):**
   * *Công thức:* `COUNT(learning_requests.id)` trong khoảng thời gian lọc.
   * *Ý nghĩa:* Tổng số lượt sinh viên gửi nhu cầu tìm người dạy kèm.
2. **Yêu Cầu Chờ Gia Sư Phản Hồi (`pendingRequests`):**
   * *Công thức:* `COUNT(learning_requests.id)` WHERE `status = 'pending'`.
   * *Ý nghĩa:* Số lớp đang chờ gia sư đồng ý hoặc từ chối.
3. **Yêu Cầu Đã Chấp Nhận (`acceptedRequests`):**
   * *Công thức:* `COUNT(learning_requests.id)` WHERE `status IN ('accepted', 'completed')`.
   * *Ý nghĩa:* Số lớp đã được gia sư tiếp nhận hướng dẫn thành công.
4. **Yêu Cầu Từ Chối / Hủy (`rejectedRequests`):**
   * *Công thức:* `COUNT(learning_requests.id)` WHERE `status IN ('rejected', 'cancelled')`.
   * *Ý nghĩa:* Các trường hợp không kết nối được hoặc học viên hủy trước khi học.
5. **Tỷ Lệ Kết Nối Thành Công (`completionRate`):**
   * *Công thức:* `ROUND((acceptedRequests / totalRequests) * 100)%`.
   * *Ý nghĩa:* Thước đo hiệu quả mai mối học thuật giữa sinh viên và gia sư khóa trước.
6. **Số Lượng Gia Sư Đang Hoạt Động (`activeTutorsCount`):**
   * *Công thức:* `COUNT(DISTINCT tutor_id)` WHERE `status NOT IN ('rejected', 'cancelled')`.
   * *Ý nghĩa:* Quy mô mạng lưới anh/chị sinh viên giỏi tham gia giảng dạy.

### Nhóm 2: Tài Chính & Doanh Thu VietQR (Financial & Revenue)
7. **Tổng Giá Trị Đăng Ký - Gross GMV (`totalGMV`):**
   * *Công thức:* `SUM(learning_requests.total_price)` trong khoảng thời gian.
   * *Ý nghĩa:* Tổng quy mô thị trường học phí đăng ký trên nền tảng.
8. **Giao Dịch Đã Xác Nhận - Confirmed GMV (`confirmedGMV`):**
   * *Công thức:* `SUM(payment_intents.amount_vnd)` WHERE `status = 'paid'`.
   * *Ý nghĩa:* Tổng số tiền học phí thực tế đã về tài khoản ngân hàng VietinBank của EduMate.
9. **Doanh Thu Nền Tảng Thực Nhận - Net Revenue (`netPlatformRevenue`):**
   * *Công thức:* `ROUND((confirmedGMV - totalRefundedAmount) * 0.15)`.
   * *Ý nghĩa:* Doanh thu 15% thực tế của EduMate Huế sau khi trừ các khoản đã hoàn tiền.
10. **Khoản Phải Trả Cho Người Dạy (`tutorPayable`):**
    * *Công thức:* `ROUND((confirmedGMV - totalRefundedAmount) * 0.85)`.
    * *Ý nghĩa:* 85% học phí chuyển trả cho gia sư sau khi hoàn thành các buổi giảng dạy.
11. **Giao Dịch Đang Chờ Đối Soát (`pendingVerificationGMV`):**
    * *Công thức:* `SUM(payment_intents.amount_vnd)` WHERE `status = 'awaiting_verification'`.
    * *Ý nghĩa:* Học viên đã ấn nút xác nhận chuyển khoản, chờ kế toán đối chiếu sao kê.

### Nhóm 3: Hoàn Tiền Bảo Vệ Người Học (Student Refund Protection)
12. **Thống Kê Yêu Cầu Hoàn Tiền (`totalRefundRequests` & `totalRefundedAmount`):**
    * *Công thức:* `COUNT(refund_requests.id)` và `SUM(refund_requests.refund_amount_vnd)` WHERE `status = 'refunded'`.
    * *Ý nghĩa:* Đo lường mức độ tin cậy và giải quyết khiếu nại bảo vệ quyền lợi sinh viên.

---

## 4. BỘ LỌC THỜI GIAN ĐA NĂNG (DATE RANGE PICKER)

Bộ lọc thời gian hỗ trợ 6 chế độ:
* `today`: Lọc giao dịch trong ngày hiện tại (`00:00:00` đến `23:59:59`).
* `last7days`: 7 ngày gần nhất tính đến thời điểm hiện tại.
* `last30days`: 30 ngày gần nhất.
* `thisMonth`: Toàn bộ các ngày từ ngày 1 của tháng hiện tại đến hôm nay.
* `all`: Không giới hạn thời gian (toàn bộ lịch sử).
* `custom`: Cho phép người dùng chọn ngày bắt đầu (`startDate`) và ngày kết thúc (`endDate`).

---

## 5. BIỂU ĐỒ TRỰC QUAN HÓA (VISUAL CHARTS)

Sử dụng công nghệ SVG Native responsive cực nhẹ, tải trang tức thì không phụ thuộc thư viện nặng:
1. **Biểu đồ hỗn hợp Time-Series Trend Chart:**
   * Cột (Bar Chart): Số lượng yêu cầu kết nối học tập theo ngày.
   * Đường & Vùng (Area/Line Chart): Doanh thu GMV xác nhận biến thiên theo ngày.
   * Tooltip: Tương tác hover hiển thị chi tiết Ngày, Lớp học, GMV và 15% phí dịch vụ.
2. **Biểu đồ phân bổ Donut Charts (Status Distribution):**
   * Phân bổ trạng thái lớp học: Chờ nhận, Đã chấp nhận, Đã hoàn thành, Từ chối, Đã hủy.
   * Phân bổ cơ cấu tài khoản: Học viên (student), Người dạy (tutor), Quản lý (manager).
   * Vòng tròn donut hiển thị tổng số ở tâm và chú thích tỷ lệ phần trăm (`%`).

---

## 6. DANH SÁCH BẢNG CHI TIẾT & TÍNH NĂNG DRILL-DOWN

Hệ thống cung cấp 4 bảng dữ liệu chuyên sâu chuyển đổi linh hoạt bằng Subtabs:
1. **Báo Cáo Yêu Cầu Học Vụ:** Mã lớp, Học viên, Người dạy, Môn học, Số buổi, Học phí, Trạng thái.
2. **Báo Cáo Giao Dịch VietQR:** Mã thanh toán, Mã tham chiếu, Học viên, Gói học, Số tiền, 15% phí, 85% gia sư, Trạng thái đối soát.
3. **Báo Cáo Hoàn Tiền 100%:** Mã lớp, Học viên, Số tiền hoàn, Lý do từ chối, Tài khoản ngân hàng nhận tiền, Mã giao dịch ngân hàng, Trạng thái.
4. **Báo Cáo Tài Khoản Người Dùng:** Email, Họ tên, Mã sinh viên HCE, Vai trò tài khoản, Ngày tham gia.

Mỗi bảng đều trang bị:
* Ô tìm kiếm từ khóa tức thì (instant search).
* Lọc theo phân loại danh mục.
* Sắp xếp tăng/giảm theo cột (column sorting).
* Phân trang tùy chọn (5, 10, 25, 50 dòng/trang).

---

## 7. AN TOÀN BẢO MẬT & XUẤT TỆP CSV

Để phòng chống tấn công **CSV Formula Injection (CWE-1236)** khi người quản lý mở tệp bằng Microsoft Excel hoặc Google Sheets:
* **UTF-8 BOM (`\uFEFF`):** Được chèn vào đầu tệp CSV để mọi phiên bản Excel hiển thị đúng font tiếng Việt có dấu.
* **Khử mã độc Formula Injection:** Mọi giá trị dữ liệu bắt đầu bằng các ký tự công thức nguy hiểm như `=`, `+`, `-`, `@`, ký tự tab (`\t`), hoặc xuống dòng (`\r`) đều tự động được bao bọc thêm tiền tố dấu nháy đơn `'`.
* **Chuẩn RFC 4180:** Mọi dấu ngoặc kép (`"`) bên trong ô dữ liệu đều được nhân đôi (`""`) và bọc trong cặp ngoặc kép.

