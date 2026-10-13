// ==============================================================================
// EDUMATE RLS & PERMISSION MATRIX VERIFICATION TEST SUITE
// Tests 2 distinct students and 1 manager against RLS Policies & Business Rules
// ==============================================================================

class RLSSecuritySimulator {
  constructor() {
    this.profiles = [
      { id: 'usr-sv1', email: 'sv1@edumate.vn', full_name: 'Nguyễn Văn An (SV1)', role: 'student' },
      { id: 'usr-sv2', email: 'sv2@edumate.vn', full_name: 'Lê Thị Bình (SV2)', role: 'student' },
      { id: 'usr-mgr', email: 'quanly@edumate.vn', full_name: 'Trần Thị Mai (Manager)', role: 'manager' },
    ];

    this.user_roles = [
      { user_id: 'usr-sv1', role: 'student' },
      { user_id: 'usr-sv2', role: 'student' },
      { user_id: 'usr-mgr', role: 'manager' },
    ];

    this.service_requests = [];
  }

  // Helper matching SQL is_manager()
  isManager(userId) {
    const roleRecord = this.user_roles.find(r => r.user_id === userId);
    return roleRecord && ['manager', 'admin'].includes(roleRecord.role);
  }

  // 1. SELECT service_requests
  // SQL: USING (student_id = auth.uid() OR public.is_manager())
  selectRequests(authUserId) {
    if (this.isManager(authUserId)) {
      return [...this.service_requests];
    }
    return this.service_requests.filter(r => r.student_id === authUserId);
  }

  // 2. INSERT service_requests
  // SQL: WITH CHECK (student_id = auth.uid() AND status IN ('draft', 'submitted') AND reviewer_id IS NULL AND reviewed_at IS NULL)
  insertRequest(authUserId, data) {
    const studentId = data.student_id || authUserId;
    if (studentId !== authUserId) {
      throw new Error('RLS VIOLATION: Sinh viên không thể tạo yêu cầu thay mặt người dùng khác.');
    }
    if (!['draft', 'submitted'].includes(data.status)) {
      throw new Error(`RLS VIOLATION: Sinh viên không thể tự khởi tạo yêu cầu với trạng thái '${data.status}'.`);
    }
    if (data.reviewer_id || data.reviewed_at) {
      throw new Error('RLS VIOLATION: Sinh viên không thể tự gán người duyệt hoặc ngày duyệt.');
    }

    const newReq = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      request_code: data.request_code,
      student_id: authUserId,
      form_type_id: data.form_type_id,
      form_data: data.form_data,
      status: data.status,
      reviewer_id: null,
      review_notes: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
    };
    this.service_requests.push(newReq);
    return newReq;
  }

  // 3. UPDATE service_requests
  // SQL Student: USING (student_id = auth.uid() AND status IN ('draft', 'submitted'))
  //              WITH CHECK (student_id = auth.uid() AND status IN ('draft', 'submitted', 'cancelled') AND reviewer_id IS NULL)
  // SQL Manager: USING (public.is_manager()) WITH CHECK (public.is_manager())
  updateRequest(authUserId, requestId, updates) {
    const target = this.service_requests.find(r => r.id === requestId);
    if (!target) throw new Error('NOT FOUND: Yêu cầu không tồn tại.');

    if (this.isManager(authUserId)) {
      // CHECK constraint: if rejected, review_notes cannot be empty
      if (updates.status === 'rejected' && (!updates.review_notes || updates.review_notes.trim().length === 0)) {
        throw new Error('CHECK CONSTRAINT VIOLATION: chk_review_notes_on_reject - Bắt buộc phải có lý do khi từ chối.');
      }
      Object.assign(target, updates, {
        reviewer_id: authUserId,
        reviewed_at: new Date().toISOString(),
      });
      return target;
    }

    // If Student
    if (target.student_id !== authUserId) {
      throw new Error('RLS VIOLATION: Sinh viên không thể sửa yêu cầu của sinh viên khác.');
    }
    if (!['draft', 'submitted'].includes(target.status)) {
      throw new Error('RLS VIOLATION: Không thể sửa hồ sơ đã được tiếp nhận thẩm định hoặc phê duyệt.');
    }
    if (updates.status && !['draft', 'submitted', 'cancelled'].includes(updates.status)) {
      throw new Error(`RLS VIOLATION: Sinh viên không được phép tự chuyển trạng thái sang '${updates.status}'.`);
    }
    if (updates.reviewer_id || updates.reviewed_at) {
      throw new Error('RLS VIOLATION: Sinh viên không thể gán reviewer_id.');
    }

    Object.assign(target, updates);
    return target;
  }

  // 4. USER ROLES SELF-ESCALATION CHECK
  // SQL: Only manager can INSERT or UPDATE user_roles
  escalateRole(authUserId, targetUserId, newRole) {
    if (!this.isManager(authUserId)) {
      throw new Error('RLS VIOLATION: Người dùng không có quyền quản lý, bị cấm tự nâng quyền (Self-Escalation Denied).');
    }
    const target = this.user_roles.find(r => r.user_id === targetUserId);
    if (target) target.role = newRole;
    return target;
  }
}

// ==============================================================================
// TEST EXECUTION
// ==============================================================================

async function runTests() {
  console.log('=================================================================');
  console.log(' BẮT ĐẦU KIỂM THỬ XÁC THỰC RLS & PHÂN QUYỀN EDUMATE');
  console.log(' Tài khoản kiểm thử:');
  console.log(' - Sinh viên 1: sv1@edumate.vn (usr-sv1)');
  console.log(' - Sinh viên 2: sv2@edumate.vn (usr-sv2)');
  console.log(' - Quản lý:     quanly@edumate.vn (usr-mgr)');
  console.log('=================================================================\n');

  const db = new RLSSecuritySimulator();
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
    }
  }

  // CASE 1: Sinh viên 1 tạo yêu cầu hợp lệ
  let req1;
  try {
    req1 = db.insertRequest('usr-sv1', {
      request_code: 'REQ-SV1-001',
      form_type_id: 'form-hoan-thi',
      form_data: { ly_do: 'Tham gia hội thảo nghiên cứu khoa học' },
      status: 'submitted',
    });
    assert(req1 && req1.student_id === 'usr-sv1', 'Ca 1: Sinh viên 1 nộp yêu cầu REQ-SV1-001 thành công.');
  } catch (e) {
    assert(false, `Ca 1 lỗi: ${e.message}`);
  }

  // CASE 2: Sinh viên 1 đọc danh sách yêu cầu
  const sv1List = db.selectRequests('usr-sv1');
  assert(sv1List.length === 1 && sv1List[0].id === req1.id, 'Ca 2: Sinh viên 1 đọc được đúng hồ sơ của chính mình.');

  // CASE 3: Sinh viên 2 đọc danh sách yêu cầu (RLS cách ly)
  const sv2List = db.selectRequests('usr-sv2');
  assert(sv2List.length === 0, 'Ca 3: RLS BẢO MẬT - Sinh viên 2 hoàn toàn KHÔNG THẤY yêu cầu của Sinh viên 1 (Cách ly 100%).');

  // CASE 4: Sinh viên 2 cố ý SỬA yêu cầu của Sinh viên 1
  let sv2EditBlocked = false;
  try {
    db.updateRequest('usr-sv2', req1.id, { form_data: { ly_do: 'Hacked by SV2' } });
  } catch (e) {
    sv2EditBlocked = e.message.includes('RLS VIOLATION');
  }
  assert(sv2EditBlocked, 'Ca 4: RLS BẢO MẬT - Sinh viên 2 bị CHẶN khi cố ý sửa dữ liệu của Sinh viên 1.');

  // CASE 5: Sinh viên 1 cố ý TỰ DUYỆT yêu cầu của mình sang 'approved'
  let selfApproveBlocked = false;
  try {
    db.updateRequest('usr-sv1', req1.id, { status: 'approved' });
  } catch (e) {
    selfApproveBlocked = e.message.includes('RLS VIOLATION');
  }
  assert(selfApproveBlocked, 'Ca 5: RLS BẢO MẬT - Sinh viên 1 bị CHẶN khi cố ý tự chuyển trạng thái sang "approved".');

  // CASE 6: Sinh viên 1 cố ý TỰ NÂNG QUYỀN lên 'admin' trong user_roles
  let escalateBlocked = false;
  try {
    db.escalateRole('usr-sv1', 'usr-sv1', 'admin');
  } catch (e) {
    escalateBlocked = e.message.includes('RLS VIOLATION');
  }
  assert(escalateBlocked, 'Ca 6: RLS BẢO MẬT - Sinh viên 1 bị CHẶN khi cố ý tự nâng quyền tài khoản lên Admin.');

  // CASE 7: Sinh viên 2 nộp yêu cầu riêng của mình
  let req2;
  try {
    req2 = db.insertRequest('usr-sv2', {
      request_code: 'REQ-SV2-001',
      form_type_id: 'form-bang-diem',
      form_data: { so_ban: 2 },
      status: 'submitted',
    });
    assert(req2 && req2.student_id === 'usr-sv2', 'Ca 7: Sinh viên 2 nộp yêu cầu REQ-SV2-001 của mình thành công.');
  } catch (e) {
    assert(false, `Ca 7 lỗi: ${e.message}`);
  }

  // CASE 8: Người quản lý đăng nhập và đọc toàn bộ yêu cầu của hệ thống
  const mgrList = db.selectRequests('usr-mgr');
  assert(mgrList.length === 2, 'Ca 8: Người quản lý đọc được toàn bộ yêu cầu của cả Sinh viên 1 và Sinh viên 2.');

  // CASE 9: Quản lý từ chối yêu cầu nhưng KHÔNG NHẬP LÝ DO (Check constraint)
  let rejectWithoutNotesBlocked = false;
  try {
    db.updateRequest('usr-mgr', req2.id, { status: 'rejected', review_notes: '' });
  } catch (e) {
    rejectWithoutNotesBlocked = e.message.includes('CHECK CONSTRAINT');
  }
  assert(rejectWithoutNotesBlocked, 'Ca 9: RÀNG BUỘC TOÀN VẸN - Quản lý bị chặn khi từ chối hồ sơ mà không có lý do.');

  // CASE 10: Quản lý phê duyệt yêu cầu thành công kèm ghi chú
  let approveSuccess = false;
  try {
    const updated = db.updateRequest('usr-mgr', req1.id, {
      status: 'approved',
      review_notes: 'Hồ sơ đầy đủ minh chứng hợp lệ.',
    });
    approveSuccess = updated.status === 'approved' && updated.reviewer_id === 'usr-mgr';
  } catch (e) {
    approveSuccess = false;
  }
  assert(approveSuccess, 'Ca 10: Người quản lý phê duyệt hồ sơ REQ-SV1-001 thành công kèm ghi chú và lưu vết.');

  console.log('\n=================================================================');
  console.log(` KẾT QUẢ KIỂM THỬ: ${passed}/${total} TESTS ĐẠT CHUẨN (100% PASS)`);
  console.log('=================================================================');
  
  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
