// ==============================================================================
// EDUMATE HUẾ: KIỂM THỬ ĐẶC TẢ GÓI HỌC CHUẨN HÓA & MÔ HÌNH TÀI CHÍNH PHÍ 15%
// Căn cứ: Đồ án Khởi nghiệp Đổi mới và Sáng tạo EduMate Huế
// Tác giả: Nguyễn Thị Nhân (23K4080030) & Lê Ánh Diễm Như (23K4080035)
// GVHD: ThS. Trần Thái Hòa - Trường ĐH Kinh tế, ĐH Huế (HCE)
// ==============================================================================

import assert from 'assert';

console.log('=================================================================');
console.log(' KIỂM THỬ ĐẶC TẢ GÓI HỌC & TÀI CHÍNH PHÍ 15% EDUMATE HUẾ (THEO PDF)');
console.log(' Slogan: "Tìm đúng người dạy – Học đúng điều cần."');
console.log('=================================================================\n');

// 1. ĐỊNH NGHĨA 3 GÓI HỌC CHUẨN HÓA THEO CHƯƠNG 2.6.3 & 3.3
const EDUMATE_PACKAGES = [
  {
    id: 'trial',
    name: 'Gói học thử',
    sessions: 3,
    price: 90000,
    price_per_session: 30000,
    platform_fee: 13500, // 15%
    tutor_earnings: 76500 // 85%
  },
  {
    id: 'intensive',
    name: 'Gói cấp tốc',
    sessions: 15,
    price: 450000,
    price_per_session: 30000,
    platform_fee: 67500, // 15%
    tutor_earnings: 382500 // 85%
  },
  {
    id: 'long_term',
    name: 'Gói dài hạn',
    sessions: 12,
    price: 360000,
    price_per_session: 30000,
    platform_fee: 54000, // 15%
    tutor_earnings: 306000 // 85%
  }
];

// 2. ĐỊNH NGHĨA 3 TRỤ CỘT NỘI DUNG THEO CHƯƠNG 1.2 & 4.1
const EDUMATE_CONTENT_GROUPS = [
  { id: 'practical_skills', name: 'Kỹ năng thực hành', examples: ['Excel', 'PowerPoint', 'Canva', 'Tin học MOS'] },
  { id: 'general_education', name: 'Môn học đại cương', examples: ['Triết học', 'Kinh tế CT', 'Toán ứng dụng', 'Pháp luật'] },
  { id: 'major_specialization', name: 'Môn học chuyên ngành', examples: ['Nguyên lý kế toán', 'Kinh tế lượng', 'HTTT Quản lý'] }
];

// 3. STORE MÔ PHỎNG NỀN TẢNG
class EduMatePlatformPackageStore {
  constructor() {
    this.packages = EDUMATE_PACKAGES;
    this.contentGroups = EDUMATE_CONTENT_GROUPS;
    this.requests = [];
    this.reviews = [];
  }

  // Tạo yêu cầu học theo gói chuẩn
  createLearningRequest(data) {
    const pkg = this.packages.find(p => p.id === data.package_type);
    if (!pkg) {
      throw new Error('INVALID PACKAGE: Gói học không hợp lệ trong hệ sinh thái EduMate.');
    }
    if (!data.learning_goals || data.learning_goals.trim().length < 10) {
      throw new Error('VALIDATION ERROR: Mục tiêu học tập phải có tối thiểu 10 ký tự.');
    }

    const calculatedPlatformFee = Math.round(pkg.price * 0.15);
    const calculatedTutorEarnings = pkg.price - calculatedPlatformFee;

    const newReq = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      request_code: `REQ-2026-${String(this.requests.length + 1).padStart(3, '0')}`,
      student_id: data.student_id,
      student_name: data.student_name,
      tutor_id: data.tutor_id,
      tutor_name: data.tutor_name,
      subject_name: data.subject_name,
      content_group: data.content_group,
      package_type: data.package_type,
      package_name: pkg.name,
      total_sessions: pkg.sessions,
      total_price: pkg.price,
      platform_fee: calculatedPlatformFee,
      tutor_earnings: calculatedTutorEarnings,
      teaching_mode: data.teaching_mode || 'offline',
      status: 'pending',
      reviewed: false,
      created_at: new Date().toISOString()
    };

    this.requests.push(newReq);
    return newReq;
  }

  // Gia sư chấp nhận yêu cầu
  acceptRequest(requestId, tutorId) {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) throw new Error('NOT FOUND: Không tìm thấy yêu cầu học.');
    if (req.tutor_id !== tutorId) {
      throw new Error('UNAUTHORIZED: Chỉ gia sư được chỉ định mới có quyền chấp nhận yêu cầu này.');
    }
    if (req.status !== 'pending') {
      throw new Error('INVALID STATE: Chỉ có thể chấp nhận yêu cầu đang ở trạng thái pending.');
    }
    req.status = 'accepted';
    return req;
  }

  // Gia sư xác nhận hoàn thành khóa học
  completeRequest(requestId, tutorId) {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) throw new Error('NOT FOUND: Không tìm thấy yêu cầu học.');
    if (req.tutor_id !== tutorId) {
      throw new Error('UNAUTHORIZED: Chỉ gia sư được chỉ định mới có quyền xác nhận hoàn thành.');
    }
    if (req.status !== 'accepted') {
      throw new Error('INVALID STATE: Khóa học phải ở trạng thái accepted mới có thể hoàn thành.');
    }
    req.status = 'completed';
    return req;
  }

  // Người học gửi đánh giá
  submitReview(requestId, studentId, rating, comment) {
    const req = this.requests.find(r => r.id === requestId);
    if (!req) throw new Error('NOT FOUND: Không tìm thấy yêu cầu học.');
    if (req.student_id !== studentId) {
      throw new Error('UNAUTHORIZED: Chỉ người học tạo yêu cầu mới có quyền gửi đánh giá.');
    }
    if (req.status !== 'completed') {
      throw new Error('BUSINESS RULE VIOLATION: Chỉ có thể đánh giá sau khi khóa học đã hoàn thành.');
    }
    if (req.reviewed) {
      throw new Error('BUSINESS RULE VIOLATION: Khóa học này đã được đánh giá trước đó.');
    }
    if (rating < 1 || rating > 5) {
      throw new Error('VALIDATION ERROR: Điểm đánh giá phải từ 1 đến 5 sao.');
    }

    const review = {
      id: `rev-${Date.now()}`,
      request_id: requestId,
      student_id: studentId,
      tutor_id: req.tutor_id,
      rating,
      comment
    };
    req.reviewed = true;
    this.reviews.push(review);
    return review;
  }

  // Tính toán chỉ số tài chính theo Chương 2.6.6 của PDF
  getFinancialMetrics() {
    const completed = this.requests.filter(r => r.status === 'completed');
    const total_gmv = completed.reduce((sum, r) => sum + r.total_price, 0);
    const total_platform_fee = completed.reduce((sum, r) => sum + r.platform_fee, 0);
    const total_tutor_earnings = completed.reduce((sum, r) => sum + r.tutor_earnings, 0);

    const monthly_operating_cost = 2200000;
    const avg_package_fee = 45000;
    const break_even_target_packages = 49;

    return {
      completed_packages_count: completed.length,
      total_gmv,
      total_platform_fee,
      total_tutor_earnings,
      platform_fee_percent: 15,
      monthly_operating_cost,
      avg_package_fee,
      break_even_target_packages,
      break_even_percent: Math.min(100, Math.round((completed.length / break_even_target_packages) * 100))
    };
  }
}

// ==============================================================================
// THỰC THI CÁC CA KIỂM THỬ (TEST CASES)
// ==============================================================================

const store = new EduMatePlatformPackageStore();

// CA 1: Kiểm tra tính đúng đắn của 3 gói học chuẩn theo PDF Chương 2.6.3 & 3.3
console.log('--- 1. KIỂM THỬ ĐỊNH MỨC 3 GÓI HỌC CHUẨN HÓA (CHƯƠNG 2.6.3 & 3.3) ---');
const trialPkg = store.packages.find(p => p.id === 'trial');
assert.strictEqual(trialPkg.sessions, 3, 'Gói học thử phải gồm 3 buổi');
assert.strictEqual(trialPkg.price, 90000, 'Gói học thử phải có giá 90.000 VNĐ');
assert.strictEqual(trialPkg.price_per_session, 30000, 'Đơn giá mỗi buổi phải là 30.000 VNĐ');
assert.strictEqual(trialPkg.platform_fee, 13500, 'Phí nền tảng 15% gói học thử là 13.500 VNĐ');
assert.strictEqual(trialPkg.tutor_earnings, 76500, 'Thu nhập gia sư gói học thử là 76.500 VNĐ');
console.log('[PASS] Ca 1: Gói học thử chuẩn xác (3 buổi, 90.000đ, phí 15% = 13.500đ, gia sư 76.500đ)');

const intensivePkg = store.packages.find(p => p.id === 'intensive');
assert.strictEqual(intensivePkg.sessions, 15, 'Gói cấp tốc phải gồm 15 buổi');
assert.strictEqual(intensivePkg.price, 450000, 'Gói cấp tốc phải có giá 450.000 VNĐ');
assert.strictEqual(intensivePkg.price_per_session, 30000, 'Đơn giá mỗi buổi phải là 30.000 VNĐ');
assert.strictEqual(intensivePkg.platform_fee, 67500, 'Phí nền tảng 15% gói cấp tốc là 67.500 VNĐ');
assert.strictEqual(intensivePkg.tutor_earnings, 382500, 'Thu nhập gia sư gói cấp tốc là 382.500 VNĐ');
console.log('[PASS] Ca 2: Gói cấp tốc chuẩn xác (15 buổi, 450.000đ, phí 15% = 67.500đ, gia sư 382.500đ)');

const longTermPkg = store.packages.find(p => p.id === 'long_term');
assert.strictEqual(longTermPkg.sessions, 12, 'Gói dài hạn phải gồm 12 buổi');
assert.strictEqual(longTermPkg.price, 360000, 'Gói dài hạn phải có giá 360.000 VNĐ');
assert.strictEqual(longTermPkg.price_per_session, 30000, 'Đơn giá mỗi buổi phải là 30.000 VNĐ');
assert.strictEqual(longTermPkg.platform_fee, 54000, 'Phí nền tảng 15% gói dài hạn là 54.000 VNĐ');
assert.strictEqual(longTermPkg.tutor_earnings, 306000, 'Thu nhập gia sư gói dài hạn là 306.000 VNĐ');
console.log('[PASS] Ca 3: Gói dài hạn chuẩn xác (12 buổi, 360.000đ, phí 15% = 54.000đ, gia sư 306.000đ)');

// CA 4: Kiểm tra 3 trụ cột nội dung đào tạo (Chương 1.2 & 4.1)
console.log('\n--- 2. KIỂM THỬ 3 TRỤ CỘT NỘI DUNG ĐÀO TẠO (CHƯƠNG 1.2 & 4.1) ---');
assert.strictEqual(store.contentGroups.length, 3, 'EduMate phải có đúng 3 trụ cột nội dung');
const ids = store.contentGroups.map(g => g.id);
assert.ok(ids.includes('practical_skills'), 'Phải có nhóm Kỹ năng thực hành');
assert.ok(ids.includes('general_education'), 'Phải có nhóm Môn học đại cương');
assert.ok(ids.includes('major_specialization'), 'Phải có nhóm Môn học chuyên ngành');
console.log('[PASS] Ca 4: Đầy đủ 3 trụ cột (Kỹ năng thực hành, Đại cương, Chuyên ngành)');

// CA 5: Người học đăng ký gói học thử Kỹ năng thực hành (Canva/Excel)
console.log('\n--- 3. KIỂM THỬ LUỒNG ĐẶT GÓI HỌC & TỰ ĐỘNG PHÂN BỔ DOANH THU 15% ---');
const req1 = store.createLearningRequest({
  student_id: 'usr-student-01',
  student_name: 'Nguyễn Văn An (K45 HCE)',
  tutor_id: 'tut-01',
  tutor_name: 'Lê Hoàng Nam (K44)',
  subject_name: 'Thiết kế slide PowerPoint & Canva chuyên nghiệp',
  content_group: 'practical_skills',
  package_type: 'trial',
  learning_goals: 'Cần hướng dẫn thiết kế slide thuyết trình bài tập lớn môn Marketing và CV xin việc'
});
assert.strictEqual(req1.status, 'pending', 'Yêu cầu mới tạo phải ở trạng thái pending');
assert.strictEqual(req1.package_name, 'Gói học thử');
assert.strictEqual(req1.total_sessions, 3);
assert.strictEqual(req1.total_price, 90000);
assert.strictEqual(req1.platform_fee, 13500);
assert.strictEqual(req1.tutor_earnings, 76500);
console.log('[PASS] Ca 5: Tạo yêu cầu Gói học thử tự động tính đúng 15% phí nền tảng (13.500đ) & 85% thu nhập gia sư (76.500đ)');

// CA 6: Người học đăng ký gói cấp tốc Môn chuyên ngành (Kinh tế lượng)
const req2 = store.createLearningRequest({
  student_id: 'usr-student-02',
  student_name: 'Trần Thị Thảo (K46 HCE)',
  tutor_id: 'tut-02',
  tutor_name: 'Trần Thị Thu Thảo (K43)',
  subject_name: 'Kinh tế lượng',
  content_group: 'major_specialization',
  package_type: 'intensive',
  learning_goals: 'Ôn thi cấp tốc 15 buổi giải đề thi mô hình hồi quy đa biến và chạy kiểm định trên Stata'
});
assert.strictEqual(req2.package_name, 'Gói cấp tốc');
assert.strictEqual(req2.total_sessions, 15);
assert.strictEqual(req2.total_price, 450000);
assert.strictEqual(req2.platform_fee, 67500);
assert.strictEqual(req2.tutor_earnings, 382500);
console.log('[PASS] Ca 6: Tạo yêu cầu Gói cấp tốc tự động tính đúng 15% phí nền tảng (67.500đ) & 85% thu nhập gia sư (382.500đ)');

// CA 7: Người học đăng ký gói dài hạn Môn đại cương (Toán ứng dụng)
const req3 = store.createLearningRequest({
  student_id: 'usr-student-03',
  student_name: 'Hoàng Minh Quân (K46 HCE)',
  tutor_id: 'tut-01',
  tutor_name: 'Lê Hoàng Nam (K44)',
  subject_name: 'Toán ứng dụng trong kinh tế',
  content_group: 'general_education',
  package_type: 'long_term',
  learning_goals: 'Kèm dài hạn 12 buổi suốt học kỳ để nắm vững đạo hàm, ma trận và bài toán tối ưu'
});
assert.strictEqual(req3.package_name, 'Gói dài hạn');
assert.strictEqual(req3.total_sessions, 12);
assert.strictEqual(req3.total_price, 360000);
assert.strictEqual(req3.platform_fee, 54000);
assert.strictEqual(req3.tutor_earnings, 306000);
console.log('[PASS] Ca 7: Tạo yêu cầu Gói dài hạn tự động tính đúng 15% phí nền tảng (54.000đ) & 85% thu nhập gia sư (306.000đ)');

// CA 8: Bảo mật: Gia sư khác không thể chấp nhận yêu cầu của người khác
console.log('\n--- 4. KIỂM THỬ BẢO MẬT & VÒNG ĐỜI TRẠNG THÁI GÓI HỌC ---');
assert.throws(() => {
  store.acceptRequest(req1.id, 'tut-intruder');
}, /UNAUTHORIZED/, 'Gia sư lạ không thể chấp nhận yêu cầu của gia sư khác');
console.log('[PASS] Ca 8: Bảo mật: Ngăn chặn gia sư khác can thiệp yêu cầu học');

// CA 9: Chấp nhận yêu cầu hợp lệ
store.acceptRequest(req1.id, 'tut-01');
assert.strictEqual(req1.status, 'accepted');
console.log('[PASS] Ca 9: Gia sư chỉ định chấp nhận yêu cầu thành công (status: accepted)');

// CA 10: Ràng buộc: Không được đánh giá khi chưa hoàn thành
assert.throws(() => {
  store.submitReview(req1.id, 'usr-student-01', 5, 'Rất hài lòng');
}, /BUSINESS RULE VIOLATION/, 'Không thể đánh giá khóa học chưa hoàn thành');
console.log('[PASS] Ca 10: Ràng buộc: Ngăn chặn gửi đánh giá khi khóa học chưa hoàn thành');

// CA 11: Hoàn thành khóa học
store.completeRequest(req1.id, 'tut-01');
assert.strictEqual(req1.status, 'completed');
console.log('[PASS] Ca 11: Gia sư xác nhận hoàn thành khóa học thành công (status: completed)');

// CA 12: Gửi đánh giá sau khi hoàn thành
const review = store.submitReview(req1.id, 'usr-student-01', 5, 'Anh dạy rất kỹ và tài liệu ôn thi rất sát với đề');
assert.strictEqual(review.rating, 5);
assert.strictEqual(req1.reviewed, true);
console.log('[PASS] Ca 12: Người học gửi đánh giá thành công sau khi khóa học hoàn thành');

// CA 13: Ràng buộc: Không thể đánh giá 2 lần
assert.throws(() => {
  store.submitReview(req1.id, 'usr-student-01', 5, 'Đánh giá lần 2');
}, /BUSINESS RULE VIOLATION/, 'Không thể đánh giá trùng lặp');
console.log('[PASS] Ca 13: Ràng buộc: Ngăn chặn gửi đánh giá trùng lặp');

// Hoàn thành thêm req2 để kiểm thử tài chính
store.acceptRequest(req2.id, 'tut-02');
store.completeRequest(req2.id, 'tut-02');

// CA 14: Kiểm thử chỉ số tài chính và điểm hòa vốn theo Chương 2.6.6 của PDF
console.log('\n--- 5. KIỂM THỬ TÀI CHÍNH & ĐIỂM HÒA VỐN 49 GÓI/THÁNG (CHƯƠNG 2.6.6) ---');
const metrics = store.getFinancialMetrics();
// 2 gói hoàn thành: req1 (90k) + req2 (450k) = 540.000đ GMV
assert.strictEqual(metrics.completed_packages_count, 2, 'Số gói hoàn thành phải là 2');
assert.strictEqual(metrics.total_gmv, 540000, 'GMV phải là 540.000đ (90k + 450k)');
assert.strictEqual(metrics.total_platform_fee, 81000, 'Phí EduMate 15% phải là 81.000đ (13.500 + 67.500)');
assert.strictEqual(metrics.total_tutor_earnings, 459000, 'Thu nhập gia sư 85% phải là 459.000đ (76.500 + 382.500)');
assert.strictEqual(metrics.monthly_operating_cost, 2200000, 'Chi phí vận hành cố định phải là 2.200.000đ/tháng');
assert.strictEqual(metrics.avg_package_fee, 45000, 'Phí trung bình 15% mỗi gói là 45.000đ');
assert.strictEqual(metrics.break_even_target_packages, 49, 'Mục tiêu hòa vốn là 49 gói/tháng');
assert.strictEqual(metrics.break_even_percent, Math.round((2 / 49) * 100), 'Phần trăm tiến độ hòa vốn tính đúng');
console.log('[PASS] Ca 14: Chỉ số tài chính & Điểm hòa vốn 49 gói/tháng tính toán hoàn toàn chuẩn xác theo Chương 2.6.6 PDF');

console.log('\n=================================================================');
console.log(' KẾT QUẢ: 14/14 KIỂM THỬ GÓI HỌC & TÀI CHÍNH THÀNH CÔNG (100% PASS)');
console.log(' NỀN TẢNG ĐẠT CHUẨN ĐẶC TẢ NGHIỆP VỤ & TÀI CHÍNH THEO PDF ĐỒ ÁN!');
console.log('=================================================================\n');

