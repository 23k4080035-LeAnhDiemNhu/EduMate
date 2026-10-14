// ==============================================================================
// EDUMATE HUẾ: TUTOR-LEARNER MATCHING PLATFORM BUSINESS SPECIFICATION TEST SUITE
// Slogan: "Tìm đúng người dạy – Học đúng điều cần."
// ==============================================================================

import assert from 'assert';

console.log('=================================================================');
console.log(' KIỂM THỬ ĐẶC TẢ NGHIỆP VỤ NỀN TẢNG KẾT NỐI EDUMATE HUẾ');
console.log(' Slogan: "Tìm đúng người dạy – Học đúng điều cần."');
console.log('=================================================================\n');

class TutorPlatformStore {
  constructor() {
    this.profiles = [
      { id: 'usr-student-01', full_name: 'Nguyễn Văn An', role: 'student', district: 'TP. Huế' },
      { id: 'usr-student-02', full_name: 'Lê Thị Bình', role: 'student', district: 'Hương Thủy' },
      { id: 'usr-tutor-01', full_name: 'Thầy Lê Hoàng Nam', role: 'tutor', district: 'TP. Huế' },
      { id: 'usr-admin-01', full_name: 'Trần Thị Mai', role: 'manager', district: 'TP. Huế' }
    ];

    this.tutors = [
      {
        id: 'tut-01',
        user_id: 'usr-tutor-01',
        full_name: 'Thầy Lê Hoàng Nam',
        subjects: ['Toán cao cấp', 'Giải tích'],
        hourly_rate: 120000,
        teaching_mode: 'both',
        district: 'TP. Huế',
        verification_status: 'verified',
        rating_avg: 4.9,
        rating_count: 18
      }
    ];

    this.learningRequests = [];
    this.reviews = [];
  }

  // 1. Search & Filter Tutors
  searchTutors({ subject, district, mode, maxPrice, verifiedOnly = true }) {
    return this.tutors.filter(t => {
      if (verifiedOnly && t.verification_status !== 'verified') return false;
      if (subject && !t.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase()))) return false;
      if (district && !t.district.toLowerCase().includes(district.toLowerCase())) return false;
      if (mode && mode !== 'both' && t.teaching_mode !== 'both' && t.teaching_mode !== mode) return false;
      if (maxPrice && t.hourly_rate > maxPrice) return false;
      return true;
    });
  }

  // 2. Register Tutor Profile
  registerTutor(data) {
    if (!data.full_name || data.full_name.trim().length < 2) {
      throw new Error('VALIDATION ERROR: Tên người dạy không được để trống.');
    }
    if (!data.subjects || data.subjects.length === 0) {
      throw new Error('VALIDATION ERROR: Người dạy phải đăng ký ít nhất một môn học.');
    }
    if (!data.hourly_rate || data.hourly_rate <= 0) {
      throw new Error('VALIDATION ERROR: Mức học phí phải lớn hơn 0.');
    }

    const newTutor = {
      ...data,
      id: `tut-${Date.now()}`,
      verification_status: 'pending', // Phải chờ duyệt
      rating_avg: 0,
      rating_count: 0
    };
    this.tutors.push(newTutor);
    return newTutor;
  }

  // 3. Admin Verification
  verifyTutor(tutorId, status, callerRole) {
    if (!['manager', 'admin'].includes(callerRole)) {
      throw new Error('UNAUTHORIZED: Chỉ Quản trị viên mới có quyền duyệt hồ sơ người dạy.');
    }
    const tutor = this.tutors.find(t => t.id === tutorId);
    if (!tutor) throw new Error('NOT FOUND: Không tìm thấy hồ sơ người dạy.');
    tutor.verification_status = status;
    return tutor;
  }

  // 4. Create Learning Request
  createRequest(data) {
    if (!data.learning_goals || data.learning_goals.trim().length < 10) {
      throw new Error('VALIDATION ERROR: Nội dung cần học phải có tối thiểu 10 ký tự.');
    }
    const newReq = {
      ...data,
      id: `lreq-${Date.now()}`,
      request_code: `YCH-2026-${String(this.learningRequests.length + 1).padStart(3, '0')}`,
      status: 'pending',
      reviewed: false
    };
    this.learningRequests.push(newReq);
    return newReq;
  }

  // 5. Update Request Status
  updateRequestStatus(requestId, newStatus, callerRole, callerId, notes) {
    const req = this.learningRequests.find(r => r.id === requestId);
    if (!req) throw new Error('NOT FOUND: Không tìm thấy yêu cầu học.');

    // Learner can only cancel if pending
    if (callerRole === 'student') {
      if (newStatus !== 'cancelled') {
        throw new Error('UNAUTHORIZED: Người học chỉ có quyền hủy yêu cầu.');
      }
      if (req.status !== 'pending') {
        throw new Error('BUSINESS RULE VIOLATION: Không thể hủy yêu cầu khi đã được xử lý hoặc đã hoàn thành.');
      }
    }

    // Tutor can accept/reject/complete
    if (callerRole === 'tutor') {
      if (newStatus === 'rejected' && (!notes || notes.trim().length === 0)) {
        throw new Error('VALIDATION ERROR: Từ chối yêu cầu bắt buộc phải có lý do.');
      }
    }

    req.status = newStatus;
    if (notes) req.rejected_reason = notes;
    return req;
  }

  // 6. Add Review
  addReview(data) {
    const req = this.learningRequests.find(r => r.id === data.request_id);
    if (!req) throw new Error('NOT FOUND: Không tìm thấy buổi học.');
    if (req.status !== 'completed') {
      throw new Error('BUSINESS RULE VIOLATION: Chỉ có thể đánh giá sau khi buổi học đã hoàn thành.');
    }
    if (req.reviewed) {
      throw new Error('BUSINESS RULE VIOLATION: Buổi học này đã được đánh giá trước đó.');
    }
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new Error('VALIDATION ERROR: Điểm đánh giá phải từ 1 đến 5 sao.');
    }
    if (!data.comment || data.comment.trim().length < 5) {
      throw new Error('VALIDATION ERROR: Nhận xét phải có ít nhất 5 ký tự.');
    }

    const newRev = { ...data, id: `rev-${Date.now()}` };
    this.reviews.push(newRev);
    req.reviewed = true;

    // Recalculate tutor rating
    const tutorReviews = this.reviews.filter(r => r.tutor_id === data.tutor_id);
    const tutor = this.tutors.find(t => t.id === data.tutor_id);
    if (tutor) {
      const avg = tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length;
      tutor.rating_avg = Math.round(avg * 10) / 10;
      tutor.rating_count = tutorReviews.length;
    }
    return newRev;
  }
}

const store = new TutorPlatformStore();
let passed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] Ca ${++passed}: ${name}`);
  } catch (err) {
    console.error(`[FAIL] Ca ${passed + 1}: ${name}`);
    console.error(`       Lỗi: ${err.message}`);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// NHÓM 1: TÌM KIẾM VÀ LỌC NGƯỜI DẠY TẠI HUẾ
// -------------------------------------------------------------
runTest('Khách/Người học tìm gia sư môn Toán tại TP. Huế', () => {
  const results = store.searchTutors({ subject: 'Toán', district: 'TP. Huế' });
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].full_name, 'Thầy Lê Hoàng Nam');
});

runTest('Bộ lọc học phí: Tìm gia sư ngân sách tối đa 100.000đ/buổi không ra thầy 120.000đ', () => {
  const results = store.searchTutors({ maxPrice: 100000 });
  assert.strictEqual(results.length, 0);
});

// -------------------------------------------------------------
// NHÓM 2: ĐĂNG KÝ VÀ DUYỆT HỒ SƠ NGƯỜI DẠY (QUY TRÌNH B)
// -------------------------------------------------------------
let pendingTutor;
runTest('Người dạy mới đăng ký hồ sơ thành công ở trạng thái Chờ duyệt (pending)', () => {
  pendingTutor = store.registerTutor({
    user_id: 'usr-tutor-02',
    full_name: 'Cô Trần Thị Bích Ngọc',
    subjects: ['Tiếng Anh giao tiếp', 'IELTS'],
    hourly_rate: 150000,
    teaching_mode: 'both',
    district: 'Hương Thủy'
  });
  assert.strictEqual(pendingTutor.verification_status, 'pending');
});

runTest('Hồ sơ chờ duyệt chưa xuất hiện trong danh sách tìm kiếm công khai', () => {
  const publicResults = store.searchTutors({ verifiedOnly: true });
  const exists = publicResults.some(t => t.id === pendingTutor.id);
  assert.strictEqual(exists, false);
});

runTest('Bảo mật: Người học cố tình duyệt hồ sơ người dạy bị chặn (UNAUTHORIZED)', () => {
  assert.throws(
    () => store.verifyTutor(pendingTutor.id, 'verified', 'student'),
    /UNAUTHORIZED/
  );
});

runTest('Quản trị viên phê duyệt hồ sơ người dạy thành công (verified)', () => {
  const verified = store.verifyTutor(pendingTutor.id, 'verified', 'manager');
  assert.strictEqual(verified.verification_status, 'verified');
  
  // Sau khi duyệt, xuất hiện công khai
  const publicResults = store.searchTutors({ verifiedOnly: true });
  assert.strictEqual(publicResults.some(t => t.id === pendingTutor.id), true);
});

// -------------------------------------------------------------
// NHÓM 3: GỬI VÀ XỬ LÝ YÊU CẦU HỌC (QUY TRÌNH D)
// -------------------------------------------------------------
let req1;
runTest('Người học gửi yêu cầu học với đầy đủ thông tin (status: pending)', () => {
  req1 = store.createRequest({
    student_id: 'usr-student-01',
    student_name: 'Nguyễn Văn An',
    tutor_id: pendingTutor.id,
    subject_name: 'Tiếng Anh giao tiếp',
    learning_goals: 'Luyện thi chứng chỉ TOEIC và phản xạ giao tiếp đi làm'
  });
  assert.strictEqual(req1.status, 'pending');
  assert.strictEqual(req1.reviewed, false);
});

runTest('Ràng buộc: Gửi yêu cầu nội dung quá ngắn (<10 ký tự) bị từ chối', () => {
  assert.throws(
    () => store.createRequest({
      student_id: 'usr-student-01',
      student_name: 'Nguyễn Văn An',
      tutor_id: pendingTutor.id,
      learning_goals: 'Học'
    }),
    /VALIDATION ERROR/
  );
});

runTest('Người dạy chấp nhận yêu cầu học (status: accepted)', () => {
  const updated = store.updateRequestStatus(req1.id, 'accepted', 'tutor', 'usr-tutor-02');
  assert.strictEqual(updated.status, 'accepted');
});

runTest('Bảo mật: Người học không thể hủy yêu cầu khi người dạy đã chấp nhận', () => {
  assert.throws(
    () => store.updateRequestStatus(req1.id, 'cancelled', 'student', 'usr-student-01'),
    /BUSINESS RULE VIOLATION/
  );
});

// -------------------------------------------------------------
// NHÓM 4: ĐÁNH GIÁ NGƯỜI DẠY (QUY TRÌNH E)
// -------------------------------------------------------------
runTest('Bảo mật: Người học không thể đánh giá khi buổi học chưa hoàn thành', () => {
  assert.throws(
    () => store.addReview({
      request_id: req1.id,
      student_id: 'usr-student-01',
      tutor_id: pendingTutor.id,
      rating: 5,
      comment: 'Học rất tốt!'
    }),
    /BUSINESS RULE VIOLATION/
  );
});

runTest('Người dạy xác nhận hoàn thành khóa học (status: completed)', () => {
  const completed = store.updateRequestStatus(req1.id, 'completed', 'tutor', 'usr-tutor-02');
  assert.strictEqual(completed.status, 'completed');
});

runTest('Người học gửi đánh giá 5 sao sau khi hoàn thành khóa học', () => {
  const rev = store.addReview({
    request_id: req1.id,
    student_id: 'usr-student-01',
    tutor_id: pendingTutor.id,
    rating: 5,
    comment: 'Cô giáo dạy cực kỳ tận tâm, phương pháp học giao tiếp rất cuốn hút!'
  });
  assert.strictEqual(rev.rating, 5);
  assert.strictEqual(pendingTutor.rating_avg, 5.0);
  assert.strictEqual(pendingTutor.rating_count, 1);
});

runTest('Bảo mật: Không được gửi đánh giá trùng lặp cho cùng một yêu cầu', () => {
  assert.throws(
    () => store.addReview({
      request_id: req1.id,
      student_id: 'usr-student-01',
      tutor_id: pendingTutor.id,
      rating: 4,
      comment: 'Thử gửi đánh giá lần 2'
    }),
    /BUSINESS RULE VIOLATION/
  );
});

console.log('\n=================================================================');
console.log(` KẾT QUẢ KIỂM THỬ: ${passed}/${passed} KIỂM THỬ THÀNH CÔNG (100% PASS)`);
console.log(' ĐẶC TẢ NGHIỆP VỤ EDUMATE HUẾ HOÀN TOÀN ĐẠT CHUẨN NGHIỆM THU!');
console.log('=================================================================');
