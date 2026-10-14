// ==============================================================================
// EDUMATE COMPREHENSIVE BUSINESS LOGIC & PERMISSIONS TEST SUITE
// Tests Happy Paths, Validation Boundaries, and Unauthorized Access Violations
// ==============================================================================

import assert from 'assert';

console.log('=================================================================');
console.log(' BẮT ĐẦU KIỂM THỬ NGHIỆP VỤ DỮ LIỆU & PHÂN QUYỀN EDUMATE');
console.log('=================================================================\n');

// Mock in-memory DataStore matching DataStore implementation
class TestDataStore {
  constructor() {
    this.profiles = [
      {
        id: 'usr-sv1',
        email: 'sinhvien@edumate.vn',
        full_name: 'Nguyễn Văn An',
        phone: '0912345678',
        student_code: 'SV2026-0891',
        role: 'student',
        status: 'active',
        created_at: '2026-10-01T08:00:00Z',
        updated_at: '2026-10-01T08:00:00Z'
      },
      {
        id: 'usr-sv2',
        email: 'sinhvien2@edumate.vn',
        full_name: 'Lê Thị Bình',
        phone: '0933221100',
        student_code: 'SV2026-1044',
        role: 'student',
        status: 'active',
        created_at: '2026-10-03T08:00:00Z',
        updated_at: '2026-10-03T08:00:00Z'
      },
      {
        id: 'usr-mgr',
        email: 'quanly@edumate.vn',
        full_name: 'Trần Thị Mai (Trưởng ban Giáo vụ)',
        phone: '0987654321',
        role: 'manager',
        status: 'active',
        created_at: '2026-09-15T08:00:00Z',
        updated_at: '2026-09-15T08:00:00Z'
      }
    ];

    this.requests = [];
    this.auditLogs = [];
  }

  getProfileById(id) {
    return this.profiles.find(p => p.id === id) || null;
  }

  updateProfile(id, updates, callerId) {
    if (callerId && callerId !== id) {
      const caller = this.getProfileById(callerId);
      if (!caller || !['manager', 'admin'].includes(caller.role)) {
        throw new Error('UNAUTHORIZED: Bạn chỉ có thể cập nhật hồ sơ cá nhân của chính mình.');
      }
    }

    const idx = this.profiles.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('NOT FOUND: Không tìm thấy hồ sơ người dùng.');

    if (updates.full_name !== undefined) {
      const trimmed = updates.full_name.trim();
      if (!trimmed || trimmed.length < 2) {
        throw new Error('VALIDATION ERROR: Họ và tên không được để trống và phải có ít nhất 2 ký tự.');
      }
    }

    if (updates.phone !== undefined && updates.phone.trim() !== '') {
      const cleaned = updates.phone.replace(/[\s-]/g, '');
      if (!/^[0-9]{9,11}$/.test(cleaned)) {
        throw new Error('VALIDATION ERROR: Số điện thoại không hợp lệ (cần từ 9 đến 11 chữ số).');
      }
    }

    // Strip unmodifiable columns
    const { role: _role, status: _status, id: _id, email: _email, ...allowedUpdates } = updates;
    this.profiles[idx] = {
      ...this.profiles[idx],
      ...allowedUpdates,
      updated_at: new Date().toISOString()
    };
    return this.profiles[idx];
  }

  getRequests(userId, role) {
    if (role === 'student' && userId) {
      return this.requests.filter(r => r.student_id === userId);
    }
    return [...this.requests];
  }

  createRequest(data) {
    if (!['draft', 'submitted'].includes(data.status)) {
      throw new Error(`RLS / SECURITY VIOLATION: Sinh viên không được phép tự khởi tạo yêu cầu với trạng thái '${data.status}'.`);
    }

    if (data.reviewer_id || data.reviewed_at) {
      throw new Error('RLS / SECURITY VIOLATION: Sinh viên không thể tự gán người thẩm định hoặc thời điểm thẩm định.');
    }

    const reason = data.form_data?.ly_do_noi_dung || data.form_data?.ly_do || '';
    if (data.status === 'submitted' && (!reason || String(reason).trim().length < 10)) {
      throw new Error('VALIDATION ERROR: Lý do / nội dung yêu cầu phải có tối thiểu 10 ký tự.');
    }

    const count = this.requests.length + 1;
    const newReq = {
      ...data,
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      request_code: `REQ-2026-${String(count).padStart(3, '0')}`,
      reviewer_id: undefined,
      reviewer_name: undefined,
      review_notes: undefined,
      reviewed_at: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.requests.unshift(newReq);
    return newReq;
  }

  cancelRequest(requestId, studentId) {
    const idx = this.requests.findIndex(r => r.id === requestId);
    if (idx === -1) throw new Error('NOT FOUND: Không tìm thấy yêu cầu.');

    if (this.requests[idx].student_id !== studentId) {
      throw new Error('UNAUTHORIZED: Bạn không có quyền hủy yêu cầu của sinh viên khác.');
    }

    if (!['draft', 'submitted'].includes(this.requests[idx].status)) {
      throw new Error(`BUSINESS RULE VIOLATION: Không thể hủy hồ sơ khi đã ở trạng thái '${this.requests[idx].status}'. Chỉ cho phép hủy khi đang ở trạng thái Nháp (Draft) hoặc Chờ xử lý (Submitted).`);
    }

    this.requests[idx].status = 'cancelled';
    this.requests[idx].updated_at = new Date().toISOString();
    return true;
  }

  updateRequestStatus(requestId, status, reviewerId, reviewerName, notes) {
    const reviewer = this.getProfileById(reviewerId);
    if (!reviewer || !['manager', 'admin'].includes(reviewer.role)) {
      throw new Error('UNAUTHORIZED: Chỉ Người quản lý (Manager/Admin) mới có quyền duyệt hoặc từ chối yêu cầu.');
    }

    const validStatuses = ['in_review', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error(`BUSINESS RULE VIOLATION: Trạng thái thẩm định không hợp lệ: '${status}'.`);
    }

    if (status === 'rejected' && (!notes || notes.trim().length === 0)) {
      throw new Error('VALIDATION ERROR: Bắt buộc phải có lý do/ghi chú khi từ chối hồ sơ (Ràng buộc toàn vẹn chk_review_notes_on_reject).');
    }

    const idx = this.requests.findIndex(r => r.id === requestId);
    if (idx === -1) throw new Error('NOT FOUND: Không tìm thấy yêu cầu.');

    if (this.requests[idx].status === 'cancelled') {
      throw new Error('BUSINESS RULE VIOLATION: Không thể xử lý hồ sơ đã bị người học hủy bỏ.');
    }

    this.requests[idx].status = status;
    this.requests[idx].reviewer_id = reviewerId;
    this.requests[idx].reviewer_name = reviewerName;
    this.requests[idx].review_notes = notes ? notes.trim() : this.requests[idx].review_notes;
    this.requests[idx].reviewed_at = new Date().toISOString();
    this.requests[idx].updated_at = new Date().toISOString();

    this.auditLogs.unshift({
      action: status === 'approved' ? 'APPROVE' : status === 'rejected' ? 'REJECT' : 'UPDATE',
      entity_id: requestId,
      performed_by: reviewerId,
      created_at: new Date().toISOString()
    });

    return this.requests[idx];
  }
}

// Instantiate simulator
const ds = new TestDataStore();
let passedTests = 0;
let totalTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`[PASS] Ca ${totalTests}: ${testName}`);
  } catch (err) {
    console.error(`[FAIL] Ca ${totalTests}: ${testName}`);
    console.error(`       Lỗi: ${err.message}\n`);
    process.exitCode = 1;
  }
}

// ==============================================================================
// NHÓM 1: LUỒNG THÀNH CÔNG (HAPPY PATHS)
// ==============================================================================
console.log('--- NHÓM 1: KIỂM THỬ LUỒNG NGHIỆP VỤ THÀNH CÔNG (HAPPY PATHS) ---');

let reqDraftId = '';
let reqSubmittedId = '';

runTest('Sinh viên 1 cập nhật thông tin hồ sơ cá nhân hợp lệ (họ tên, sđt)', () => {
  const updated = ds.updateProfile('usr-sv1', {
    full_name: 'Nguyễn Văn An Cập Nhật',
    phone: '0988776655'
  }, 'usr-sv1');
  assert.strictEqual(updated.full_name, 'Nguyễn Văn An Cập Nhật');
  assert.strictEqual(updated.phone, '0988776655');
  assert.strictEqual(updated.role, 'student'); // Quyền sinh viên giữ nguyên
});

runTest('Sinh viên 1 khởi tạo yêu cầu dịch vụ dạng Nháp (Draft)', () => {
  const created = ds.createRequest({
    student_id: 'usr-sv1',
    form_type_id: 'form-01',
    form_type_title: 'Đơn xin hoãn / đổi lịch đánh giá học tập',
    student_name: 'Nguyễn Văn An Cập Nhật',
    form_data: { ly_do_noi_dung: 'Đang chuẩn bị hồ sơ' },
    status: 'draft'
  });
  assert.ok(created.id);
  assert.strictEqual(created.status, 'draft');
  assert.strictEqual(created.reviewer_id, undefined);
  reqDraftId = created.id;
});

runTest('Sinh viên 1 tự hủy yêu cầu dạng Nháp của mình thành công', () => {
  const res = ds.cancelRequest(reqDraftId, 'usr-sv1');
  assert.strictEqual(res, true);
  const req = ds.requests.find(r => r.id === reqDraftId);
  assert.strictEqual(req.status, 'cancelled');
});

runTest('Sinh viên 1 nộp yêu cầu chính thức (Submitted) với lý do đầy đủ', () => {
  const created = ds.createRequest({
    student_id: 'usr-sv1',
    form_type_id: 'form-01',
    form_type_title: 'Đơn xin hoãn / đổi lịch đánh giá học tập',
    student_name: 'Nguyễn Văn An Cập Nhật',
    form_data: { 
      ly_do_noi_dung: 'Tham dự kỳ thi Olympic Toán học sinh viên toàn quốc',
      ngay_mong_muon: '2026-11-20'
    },
    status: 'submitted'
  });
  assert.ok(created.id);
  assert.strictEqual(created.status, 'submitted');
  reqSubmittedId = created.id;
});

runTest('Sinh viên 2 nộp yêu cầu hỗ trợ học vụ chính thức của mình', () => {
  const created = ds.createRequest({
    student_id: 'usr-sv2',
    form_type_id: 'form-02',
    form_type_title: 'Phiếu yêu cầu Cố vấn & Hỗ trợ học vụ chuyên sâu',
    student_name: 'Lê Thị Bình',
    form_data: { 
      ly_do_noi_dung: 'Cần hướng dẫn chuyên đề Tối ưu hóa truy vấn PostgreSQL và RLS',
      khung_gio_ranh: 'Thứ 6 hàng tuần'
    },
    status: 'submitted'
  });
  assert.ok(created.id);
  assert.strictEqual(created.status, 'submitted');
});

runTest('Cô lập dữ liệu: Sinh viên 1 chỉ xem được yêu cầu của mình, không thấy của Sinh viên 2', () => {
  const sv1Requests = ds.getRequests('usr-sv1', 'student');
  assert.ok(sv1Requests.length >= 2);
  const foundOther = sv1Requests.some(r => r.student_id === 'usr-sv2');
  assert.strictEqual(foundOther, false, 'Sinh viên 1 không được phép nhìn thấy đơn của Sinh viên 2');
});

runTest('Cô lập dữ liệu: Sinh viên 2 chỉ xem được yêu cầu của mình, không thấy của Sinh viên 1', () => {
  const sv2Requests = ds.getRequests('usr-sv2', 'student');
  assert.ok(sv2Requests.length >= 1);
  const foundOther = sv2Requests.some(r => r.student_id === 'usr-sv1');
  assert.strictEqual(foundOther, false, 'Sinh viên 2 không được phép nhìn thấy đơn của Sinh viên 1');
});

runTest('Người quản lý xem được toàn bộ danh sách yêu cầu của tất cả sinh viên', () => {
  const allRequests = ds.getRequests('usr-mgr', 'manager');
  const hasSv1 = allRequests.some(r => r.student_id === 'usr-sv1');
  const hasSv2 = allRequests.some(r => r.student_id === 'usr-sv2');
  assert.ok(hasSv1 && hasSv2, 'Người quản lý phải thấy toàn bộ hồ sơ');
});

runTest('Người quản lý tiếp nhận thẩm định (In Review) yêu cầu của Sinh viên 1', () => {
  const updated = ds.updateRequestStatus(
    reqSubmittedId,
    'in_review',
    'usr-mgr',
    'Trần Thị Mai',
    'Ban giáo vụ đã tiếp nhận và đang đối chiếu lịch đánh giá'
  );
  assert.strictEqual(updated.status, 'in_review');
  assert.strictEqual(updated.reviewer_id, 'usr-mgr');
  assert.ok(updated.reviewed_at);
});

runTest('Người quản lý phê duyệt chính thức (Approved) hồ sơ kèm ghi chú và lưu vết', () => {
  const updated = ds.updateRequestStatus(
    reqSubmittedId,
    'approved',
    'usr-mgr',
    'Trần Thị Mai',
    'Hồ sơ hợp lệ, đã chấp thuận hoãn thi sang ngày 2026-11-20.'
  );
  assert.strictEqual(updated.status, 'approved');
  assert.strictEqual(updated.review_notes, 'Hồ sơ hợp lệ, đã chấp thuận hoãn thi sang ngày 2026-11-20.');
  assert.ok(ds.auditLogs.some(l => l.entity_id === reqSubmittedId && l.action === 'APPROVE'));
});

// ==============================================================================
// NHÓM 2: DỮ LIỆU KHÔNG HỢP LỆ (VALIDATION & BOUNDARY CONDITIONS)
// ==============================================================================
console.log('\n--- NHÓM 2: KIỂM THỬ DỮ LIỆU KHÔNG HỢP LỆ & RÀNG BUỘC TOÀN VẸN ---');

runTest('Ràng buộc: Nộp hồ sơ chính thức với lý do quá ngắn (<10 ký tự) bị từ chối', () => {
  assert.throws(() => {
    ds.createRequest({
      student_id: 'usr-sv1',
      form_type_id: 'form-01',
      student_name: 'Nguyễn Văn An',
      form_data: { ly_do_noi_dung: 'Hoãn thi' }, // Chỉ 8 ký tự
      status: 'submitted'
    });
  }, /VALIDATION ERROR/);
});

runTest('Ràng buộc: Cập nhật hồ sơ với tên rỗng hoặc dưới 2 ký tự bị chặn', () => {
  assert.throws(() => {
    ds.updateProfile('usr-sv1', { full_name: ' ' }, 'usr-sv1');
  }, /VALIDATION ERROR/);
});

runTest('Ràng buộc: Cập nhật hồ sơ với số điện thoại sai định dạng bị chặn', () => {
  assert.throws(() => {
    ds.updateProfile('usr-sv1', { phone: 'abc12345' }, 'usr-sv1');
  }, /VALIDATION ERROR/);
});

runTest('Ràng buộc chk_review_notes_on_reject: Quản lý từ chối hồ sơ nhưng bỏ trống lý do bị chặn', () => {
  assert.throws(() => {
    ds.updateRequestStatus(
      reqSubmittedId,
      'rejected',
      'usr-mgr',
      'Trần Thị Mai',
      '' // Rỗng
    );
  }, /chk_review_notes_on_reject/);
});

runTest('Ràng buộc: Quản lý thẩm định với trạng thái không có trong danh mục bị từ chối', () => {
  assert.throws(() => {
    ds.updateRequestStatus(
      reqSubmittedId,
      'tam_hoan_khong_xac_dinh', // Trạng thái chưa được duyệt
      'usr-mgr',
      'Trần Thị Mai',
      'Ghi chú'
    );
  }, /BUSINESS RULE VIOLATION/);
});

// ==============================================================================
// NHÓM 3: TRUY CẬP TRÁI PHÉP & LEO THANG QUYỀN (SECURITY VIOLATIONS)
// ==============================================================================
console.log('\n--- NHÓM 3: KIỂM THỬ PHÒNG CHỐNG TRUY CẬP TRÁI PHÉP & LEO THANG QUYỀN ---');

runTest('Bảo mật: Sinh viên 1 cố tình gọi hàm duyệt đơn bị chặn (UNAUTHORIZED)', () => {
  assert.throws(() => {
    ds.updateRequestStatus(
      reqSubmittedId,
      'approved',
      'usr-sv1', // Sinh viên tự phong mình làm reviewer
      'Nguyễn Văn An',
      'Tự duyệt đơn'
    );
  }, /UNAUTHORIZED/);
});

runTest('Bảo mật: Sinh viên cố tình tự gán status = "approved" khi nộp đơn bị chặn', () => {
  assert.throws(() => {
    ds.createRequest({
      student_id: 'usr-sv1',
      form_type_id: 'form-01',
      student_name: 'Nguyễn Văn An',
      form_data: { ly_do_noi_dung: 'Hồ sơ xin phép học phần nâng cao đầy đủ' },
      status: 'approved' // Gian lận trạng thái
    });
  }, /RLS \/ SECURITY VIOLATION/);
});

runTest('Bảo mật: Sinh viên cố tình tự gán reviewer_id khi tạo đơn bị chặn', () => {
  assert.throws(() => {
    ds.createRequest({
      student_id: 'usr-sv1',
      form_type_id: 'form-01',
      student_name: 'Nguyễn Văn An',
      form_data: { ly_do_noi_dung: 'Hồ sơ xin phép học phần nâng cao đầy đủ' },
      status: 'submitted',
      reviewer_id: 'usr-mgr' // Gian lận người duyệt
    });
  }, /RLS \/ SECURITY VIOLATION/);
});

runTest('Bảo mật: Sinh viên 2 cố tình hủy đơn của Sinh viên 1 bị chặn (UNAUTHORIZED)', () => {
  assert.throws(() => {
    ds.cancelRequest(reqSubmittedId, 'usr-sv2'); // SV2 cố hủy đơn của SV1
  }, /UNAUTHORIZED/);
});

runTest('Bảo mật: Sinh viên 1 cố hủy đơn đã ở trạng thái Approved bị chặn', () => {
  assert.throws(() => {
    ds.cancelRequest(reqSubmittedId, 'usr-sv1'); // Đơn đã Approved, không thể hủy
  }, /BUSINESS RULE VIOLATION/);
});

runTest('Bảo mật: Sinh viên 1 cố sửa thông tin hồ sơ của Sinh viên 2 bị chặn', () => {
  assert.throws(() => {
    ds.updateProfile('usr-sv2', { full_name: 'Tên Giả Mạo' }, 'usr-sv1');
  }, /UNAUTHORIZED/);
});

runTest('Bảo mật: Sinh viên cố tình tự sửa role thành "admin" bị vô hiệu hóa', () => {
  const res = ds.updateProfile('usr-sv1', {
    full_name: 'Nguyễn Văn An Cập Nhật',
    role: 'admin' // Cố leo thang đặc quyền
  }, 'usr-sv1');
  assert.strictEqual(res.role, 'student', 'Role phải giữ nguyên là student');
});

runTest('Bảo mật: Quản lý cố duyệt đơn đã bị hủy bỏ bởi sinh viên bị từ chối', () => {
  assert.throws(() => {
    ds.updateRequestStatus(
      reqDraftId, // reqDraftId đã bị cancelled
      'approved',
      'usr-mgr',
      'Trần Thị Mai',
      'Duyệt đơn đã hủy'
    );
  }, /BUSINESS RULE VIOLATION/);
});

console.log('\n=================================================================');
console.log(` KẾT QUẢ KIỂM ĐỊNH TOÀN DIỆN: ${passedTests}/${totalTests} TESTS ĐẠT CHUẨN (${Math.round((passedTests/totalTests)*100)}% PASS)`);
console.log('=================================================================');
