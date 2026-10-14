import type { 
  Profile, 
  UserRole,
  ServiceForm, 
  ServiceRequest, 
  AcademicItem, 
  Enrollment, 
  Order, 
  Payment, 
  AuditLog,
  RequestStatus,
  PaymentStatus,
  OrderStatus
} from '../types';


// Dữ liệu hạt giống ban đầu (Generic Seed Data) cho mục đích kiểm thử UI/UX
const initialProfiles: Profile[] = [
  {
    id: 'usr-student-01',
    email: 'sinhvien@edumate.vn',
    full_name: 'Nguyễn Văn An',
    phone: '0912345678',
    student_code: 'SV2026-0891',
    role: 'student',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-10-01T08:00:00Z',
    updated_at: '2026-10-01T08:00:00Z'
  },
  {
    id: 'usr-student-02',
    email: 'sinhvien2@edumate.vn',
    full_name: 'Lê Thị Bình',
    phone: '0933221100',
    student_code: 'SV2026-1044',
    role: 'student',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-10-03T08:00:00Z',
    updated_at: '2026-10-03T08:00:00Z'
  },
  {
    id: 'usr-manager-01',
    email: 'quanly@edumate.vn',
    full_name: 'Trần Thị Mai (Trưởng ban Giáo vụ)',
    phone: '0987654321',
    role: 'manager',
    status: 'active',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    created_at: '2026-09-15T08:00:00Z',
    updated_at: '2026-09-15T08:00:00Z'
  }
];

const initialForms: ServiceForm[] = [
  {
    id: 'form-01',
    code: 'FORM-HOAN-THI',
    title: 'Đơn xin hoãn / đổi lịch đánh giá học tập',
    description: 'Dành cho người học có lý do bất khả kháng cần dời lịch đánh giá học phần hoặc kỳ thi.',
    schema_definition: { fields: ['ly_do', 'ngay_mong_muon', 'minh_chung'] },
    is_active: true,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z'
  },
  {
    id: 'form-02',
    code: 'FORM-DANG-KY-HO-TRO',
    title: 'Phiếu yêu cầu Cố vấn & Hỗ trợ học vụ chuyên sâu',
    description: 'Đăng ký nhận hướng dẫn từ đội ngũ trợ giảng và cố vấn học tập học phần nâng cao.',
    schema_definition: { fields: ['hoc_phan', 'noi_dung_can_ho_tro', 'khung_gio_ranh'] },
    is_active: true,
    created_at: '2026-10-02T00:00:00Z',
    updated_at: '2026-10-02T00:00:00Z'
  },
  {
    id: 'form-03',
    code: 'FORM-CAP-BANG-DIEM',
    title: 'Yêu cầu trích sao hồ sơ & Bảng điểm học vụ',
    description: 'Yêu cầu cấp bảng điểm học tập có dấu xác nhận để phục vụ du học, thực tập hoặc việc làm.',
    schema_definition: { fields: ['so_ban', 'hinh_thuc_nhan', 'dia_chi_gui'] },
    is_active: true,
    created_at: '2026-10-05T00:00:00Z',
    updated_at: '2026-10-05T00:00:00Z'
  }
];

const initialRequests: ServiceRequest[] = [
  {
    id: 'req-101',
    request_code: 'REQ-2026-001',
    student_id: 'usr-student-01',
    form_type_id: 'form-01',
    form_type_title: 'Đơn xin hoãn / đổi lịch đánh giá học tập',
    student_name: 'Nguyễn Văn An',
    student_email: 'sinhvien@edumate.vn',
    student_code: 'SV2026-0891',
    form_data: {
      ly_do: 'Tham gia hội thảo nghiên cứu khoa học cấp quốc gia',
      ngay_mong_muon: '2026-11-05',
      ghi_chu_them: 'Đã có giấy xác nhận từ ban tổ chức'
    },
    status: 'submitted',
    created_at: '2026-10-10T14:30:00Z',
    updated_at: '2026-10-10T14:30:00Z'
  },
  {
    id: 'req-102',
    request_code: 'REQ-2026-002',
    student_id: 'usr-student-01',
    form_type_id: 'form-03',
    form_type_title: 'Yêu cầu trích sao hồ sơ & Bảng điểm học vụ',
    student_name: 'Nguyễn Văn An',
    student_email: 'sinhvien@edumate.vn',
    student_code: 'SV2026-0891',
    form_data: {
      so_ban: 2,
      hinh_thuc_nhan: 'Chuyển phát nhanh bưu điện',
      dia_chi_gui: 'Số 123 Đường Cầu Giấy, Hà Nội'
    },
    status: 'approved',
    reviewer_id: 'usr-manager-01',
    reviewer_name: 'Trần Thị Mai',
    review_notes: 'Hồ sơ đầy đủ điều kiện. Ban giáo vụ đã ký số và phát hành bản điện tử kèm bưu điện.',
    reviewed_at: '2026-10-11T09:15:00Z',
    created_at: '2026-10-08T10:00:00Z',
    updated_at: '2026-10-11T09:15:00Z'
  },
  {
    id: 'req-103',
    request_code: 'REQ-2026-003',
    student_id: 'usr-student-02',
    form_type_id: 'form-02',
    form_type_title: 'Phiếu yêu cầu Cố vấn & Hỗ trợ học vụ chuyên sâu',
    student_name: 'Lê Thị Bình',
    student_email: 'sinhvien2@edumate.vn',
    student_code: 'SV2026-1044',
    form_data: {
      hoc_phan: 'Toán cao cấp & Thống kê ứng dụng',
      noi_dung_can_ho_tro: 'Cần trợ giảng hướng dẫn phần phương sai và kiểm định giả thuyết',
      khung_gio_ranh: 'Chiều thứ 4 hàng tuần'
    },
    status: 'submitted',
    created_at: '2026-10-12T16:00:00Z',
    updated_at: '2026-10-12T16:00:00Z'
  }
];

const initialAcademicItems: AcademicItem[] = [
  {
    id: 'acad-01',
    code: 'EDU-CORE-101',
    title: 'Phương pháp Tư duy Khoa học & Nghiên cứu Học vụ',
    description: 'Trang bị phương pháp luận thu thập dữ liệu, phân tích định lượng và trình bày luận điểm học thuật.',
    category: 'Kỹ năng nền tảng',
    standard_fee: 1200000,
    status: 'published',
    created_by: 'usr-manager-01',
    created_at: '2026-09-20T00:00:00Z',
    updated_at: '2026-09-20T00:00:00Z'
  },
  {
    id: 'acad-02',
    code: 'EDU-TECH-204',
    title: 'Phát triển Hệ thống Dữ liệu Hiện đại với PostgreSQL & RLS',
    description: 'Chuyên đề kiến trúc cơ sở dữ liệu bảo mật cao, mô hình RBAC và kiểm soát truy cập mức dòng.',
    category: 'Chuyên môn Công nghệ',
    standard_fee: 2500000,
    status: 'published',
    created_by: 'usr-manager-01',
    created_at: '2026-09-25T00:00:00Z',
    updated_at: '2026-09-25T00:00:00Z'
  },
  {
    id: 'acad-03',
    code: 'EDU-MGT-301',
    title: 'Quản trị Dự án Phần mềm Nâng cao (Draft)',
    description: 'Giáo trình thực chiến mô hình Agile, bóc tách BA và quản lý chất lượng phần mềm.',
    category: 'Quản lý',
    standard_fee: 1800000,
    status: 'draft',
    created_by: 'usr-manager-01',
    created_at: '2026-10-05T00:00:00Z',
    updated_at: '2026-10-05T00:00:00Z'
  }
];

const initialEnrollments: Enrollment[] = [
  {
    id: 'enr-01',
    student_id: 'usr-student-01',
    academic_item_id: 'acad-01',
    academic_item_title: 'Phương pháp Tư duy Khoa học & Nghiên cứu Học vụ',
    status: 'active',
    enrolled_at: '2026-10-05T10:00:00Z',
    updated_at: '2026-10-05T10:00:00Z'
  }
];

const initialOrders: Order[] = [
  {
    id: 'ord-001',
    order_code: 'ORD-2026-8801',
    student_id: 'usr-student-01',
    student_name: 'Nguyễn Văn An',
    total_amount: 1200000,
    status: 'paid',
    items: [
      {
        id: 'item-01',
        order_id: 'ord-001',
        academic_item_id: 'acad-01',
        item_name: 'Phương pháp Tư duy Khoa học & Nghiên cứu Học vụ',
        unit_price: 1200000,
        quantity: 1
      }
    ],
    created_at: '2026-10-05T09:30:00Z',
    updated_at: '2026-10-05T10:00:00Z'
  },
  {
    id: 'ord-002',
    order_code: 'ORD-2026-8802',
    student_id: 'usr-student-01',
    student_name: 'Nguyễn Văn An',
    total_amount: 150000,
    status: 'pending',
    request_id: 'req-102',
    items: [
      {
        id: 'item-02',
        order_id: 'ord-002',
        item_name: 'Lệ phí trích sao hồ sơ & Cước bưu điện (Yêu cầu REQ-2026-002)',
        unit_price: 150000,
        quantity: 1
      }
    ],
    created_at: '2026-10-11T09:20:00Z',
    updated_at: '2026-10-11T09:20:00Z'
  }
];

const initialPayments: Payment[] = [
  {
    id: 'pay-001',
    payment_code: 'PAY-2026-001',
    order_id: 'ord-001',
    order_code: 'ORD-2026-8801',
    payment_method: 'bank_transfer',
    transaction_ref: 'MB-VCB-8839210',
    amount: 1200000,
    proof_attachment_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400',
    status: 'successful',
    confirmed_by: 'usr-manager-01',
    confirmed_at: '2026-10-05T10:00:00Z',
    created_at: '2026-10-05T09:45:00Z'
  }
];

const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    entity_name: 'service_requests',
    entity_id: 'req-102',
    action: 'APPROVE',
    performed_by: 'usr-manager-01',
    performed_by_name: 'Trần Thị Mai',
    new_values: { status: 'approved', notes: 'Hồ sơ đầy đủ điều kiện' },
    created_at: '2026-10-11T09:15:00Z'
  }
];

// Persistent state management using LocalStorage
class DataStore {
  private get<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(`edumate_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, data: T): void {
    try {
      localStorage.setItem(`edumate_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage failed', e);
    }
  }

  // Profiles
  getProfiles(): Profile[] {
    return this.get('profiles', initialProfiles);
  }

  getProfileById(id: string): Profile | null {
    const profiles = this.getProfiles();
    return profiles.find(p => p.id === id) || null;
  }

  updateProfile(id: string, updates: Partial<Profile>, callerId?: string): Profile | null {
    // Security check: caller can only update their own profile unless manager/admin
    if (callerId && callerId !== id) {
      const caller = this.getProfileById(callerId);
      if (!caller || !['manager', 'admin'].includes(caller.role)) {
        throw new Error('UNAUTHORIZED: Bạn chỉ có thể cập nhật hồ sơ cá nhân của chính mình.');
      }
    }

    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) return null;

    // Validation: full_name
    if (updates.full_name !== undefined) {
      const trimmed = updates.full_name.trim();
      if (!trimmed || trimmed.length < 2) {
        throw new Error('VALIDATION ERROR: Họ và tên không được để trống và phải có ít nhất 2 ký tự.');
      }
    }

    // Validation: phone
    if (updates.phone !== undefined && updates.phone.trim() !== '') {
      const cleaned = updates.phone.replace(/[\s-]/g, '');
      if (!/^[0-9]{9,11}$/.test(cleaned)) {
        throw new Error('VALIDATION ERROR: Số điện thoại không hợp lệ (cần từ 9 đến 11 chữ số).');
      }
    }

    // Security check: Stripping protected columns to prevent privilege escalation
    // role and status can never be changed via profile update
    const { role: _role, status: _status, id: _id, email: _email, ...allowedUpdates } = updates;

    const old = { ...profiles[idx] };
    profiles[idx] = {
      ...profiles[idx],
      ...allowedUpdates,
      updated_at: new Date().toISOString()
    };
    this.set('profiles', profiles);
    this.logAction('profiles', id, 'UPDATE', callerId || id, profiles[idx].full_name, old, profiles[idx]);
    return profiles[idx];
  }

  registerProfile(newProfileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Profile {
    const profiles = this.getProfiles();
    const newProfile: Profile = {
      ...newProfileData,
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    profiles.push(newProfile);
    this.set('profiles', profiles);
    return newProfile;
  }

  cancelRequest(requestId: string, studentId: string): boolean {
    const requests = this.getRequests();
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx === -1) {
      throw new Error('NOT FOUND: Không tìm thấy yêu cầu.');
    }

    // Data isolation / ownership check
    if (requests[idx].student_id !== studentId) {
      throw new Error('UNAUTHORIZED: Bạn không có quyền hủy yêu cầu của sinh viên khác.');
    }

    // Only allow cancelling draft or submitted requests
    if (!['draft', 'submitted'].includes(requests[idx].status)) {
      throw new Error(`BUSINESS RULE VIOLATION: Không thể hủy hồ sơ khi đã ở trạng thái '${requests[idx].status}'. Chỉ cho phép hủy khi đang ở trạng thái Nháp (Draft) hoặc Chờ xử lý (Submitted).`);
    }

    const old = { ...requests[idx] };
    requests[idx] = {
      ...requests[idx],
      status: 'cancelled',
      updated_at: new Date().toISOString()
    };
    this.set('requests', requests);
    this.logAction('service_requests', requestId, 'UPDATE', studentId, requests[idx].student_name, old, requests[idx]);
    return true;
  }

  // Forms
  getServiceForms(): ServiceForm[] {
    return this.get('forms', initialForms);
  }

  // Requests
  getRequests(userId?: string, role?: UserRole): ServiceRequest[] {
    const list = this.get('requests', initialRequests);
    if (role === 'student' && userId) {
      return list.filter(r => r.student_id === userId);
    }
    return list;
  }

  createRequest(data: Omit<ServiceRequest, 'id' | 'request_code' | 'created_at' | 'updated_at'>): ServiceRequest {
    // Security check: Initial status must only be draft or submitted
    if (!['draft', 'submitted'].includes(data.status)) {
      throw new Error(`RLS / SECURITY VIOLATION: Sinh viên không được phép tự khởi tạo yêu cầu với trạng thái '${data.status}'.`);
    }

    // Security check: Reviewer cannot be assigned by student
    if (data.reviewer_id || data.reviewed_at) {
      throw new Error('RLS / SECURITY VIOLATION: Sinh viên không thể tự gán người thẩm định hoặc thời điểm thẩm định.');
    }

    // Business validation: if submitted, reason must be at least 10 characters
    const reason = data.form_data?.ly_do_noi_dung || data.form_data?.ly_do || '';
    if (data.status === 'submitted' && (!reason || String(reason).trim().length < 10)) {
      throw new Error('VALIDATION ERROR: Lý do / nội dung yêu cầu phải có tối thiểu 10 ký tự.');
    }

    // Duplicate check: prevent rapid double-clicks (within 2 seconds with identical payload)
    const requests = this.getRequests();
    const now = Date.now();
    const recentDuplicate = requests.find(r => 
      r.student_id === data.student_id &&
      r.form_type_id === data.form_type_id &&
      r.status === data.status &&
      (now - new Date(r.created_at).getTime()) < 2000
    );
    if (recentDuplicate) {
      throw new Error('SPAM PREVENTION: Yêu cầu tương tự vừa được gửi. Vui lòng đợi trong giây lát để tránh gửi lặp.');
    }

    const count = requests.length + 1;
    const newReq: ServiceRequest = {
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
    requests.unshift(newReq);
    this.set('requests', requests);
    this.logAction('service_requests', newReq.id, 'CREATE', data.student_id, data.student_name, null, newReq);
    return newReq;
  }

  updateRequestStatus(
    requestId: string, 
    status: RequestStatus, 
    reviewerId: string, 
    reviewerName: string, 
    notes?: string
  ): ServiceRequest | null {
    // Security check: Reviewer must be manager or admin
    const reviewer = this.getProfileById(reviewerId);
    if (!reviewer || !['manager', 'admin'].includes(reviewer.role)) {
      throw new Error('UNAUTHORIZED: Chỉ Người quản lý (Manager/Admin) mới có quyền duyệt hoặc từ chối yêu cầu.');
    }

    // Business validation: Approved statuses only
    const validStatuses: RequestStatus[] = ['in_review', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error(`BUSINESS RULE VIOLATION: Trạng thái thẩm định không hợp lệ: '${status}'.`);
    }

    // Check constraint: rejected status requires non-empty review_notes
    if (status === 'rejected' && (!notes || notes.trim().length === 0)) {
      throw new Error('VALIDATION ERROR: Bắt buộc phải có lý do/ghi chú khi từ chối hồ sơ (Ràng buộc toàn vẹn chk_review_notes_on_reject).');
    }

    const requests = this.getRequests();
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx === -1) {
      throw new Error('NOT FOUND: Không tìm thấy yêu cầu.');
    }

    // Transition validation: cannot review already cancelled request
    if (requests[idx].status === 'cancelled') {
      throw new Error('BUSINESS RULE VIOLATION: Không thể xử lý hồ sơ đã bị người học hủy bỏ.');
    }

    const old = { ...requests[idx] };
    requests[idx] = {
      ...requests[idx],
      status,
      reviewer_id: reviewerId,
      reviewer_name: reviewerName,
      review_notes: notes ? notes.trim() : requests[idx].review_notes,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.set('requests', requests);
    const action = status === 'approved' ? 'APPROVE' : status === 'rejected' ? 'REJECT' : 'UPDATE';
    this.logAction('service_requests', requestId, action, reviewerId, reviewerName, old, requests[idx]);
    return requests[idx];
  }

  // Academic Items
  getAcademicItems(): AcademicItem[] {
    return this.get('academic_items', initialAcademicItems);
  }

  createAcademicItem(item: Omit<AcademicItem, 'id' | 'created_at' | 'updated_at'>): AcademicItem {
    const items = this.getAcademicItems();
    const newItem: AcademicItem = {
      ...item,
      id: `acad-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    items.unshift(newItem);
    this.set('academic_items', items);
    this.logAction('academic_items', newItem.id, 'CREATE', item.created_by || 'system', 'Manager', null, newItem);
    return newItem;
  }

  updateAcademicItem(id: string, updates: Partial<AcademicItem>, managerId: string, managerName: string): AcademicItem | null {
    const items = this.getAcademicItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const old = { ...items[idx] };
    items[idx] = {
      ...items[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.set('academic_items', items);
    this.logAction('academic_items', id, 'UPDATE', managerId, managerName, old, items[idx]);
    return items[idx];
  }

  // Enrollments
  getEnrollments(userId?: string, role?: UserRole): Enrollment[] {
    const list = this.get('enrollments', initialEnrollments);
    if (role === 'student' && userId) {
      return list.filter(e => e.student_id === userId);
    }
    return list;
  }

  enrollStudent(studentId: string, academicItemId: string, itemTitle: string): Enrollment {
    const enrollments = this.getEnrollments();
    const newEnr: Enrollment = {
      id: `enr-${Date.now()}`,
      student_id: studentId,
      academic_item_id: academicItemId,
      academic_item_title: itemTitle,
      status: 'active',
      enrolled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    enrollments.unshift(newEnr);
    this.set('enrollments', enrollments);
    return newEnr;
  }

  // Orders
  getOrders(userId?: string, role?: UserRole): Order[] {
    const list = this.get('orders', initialOrders);
    if (role === 'student' && userId) {
      return list.filter(o => o.student_id === userId);
    }
    return list;
  }

  updateOrderStatus(orderId: string, status: OrderStatus, managerId: string, managerName: string): Order | null {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;

    const old = { ...orders[idx] };
    orders[idx] = {
      ...orders[idx],
      status,
      updated_at: new Date().toISOString()
    };
    this.set('orders', orders);
    this.logAction('orders', orderId, 'UPDATE', managerId, managerName, old, orders[idx]);
    return orders[idx];
  }

  // Payments
  getPayments(): Payment[] {
    return this.get('payments', initialPayments);
  }

  createPayment(payment: Omit<Payment, 'id' | 'payment_code' | 'created_at'>): Payment {
    const payments = this.getPayments();
    const count = payments.length + 1;
    const newPay: Payment = {
      ...payment,
      id: `pay-${Date.now()}`,
      payment_code: `PAY-2026-${String(count).padStart(3, '0')}`,
      created_at: new Date().toISOString()
    };
    payments.unshift(newPay);
    this.set('payments', payments);
    return newPay;
  }

  verifyPayment(paymentId: string, status: PaymentStatus, managerId: string, managerName: string): Payment | null {
    const payments = this.getPayments();
    const idx = payments.findIndex(p => p.id === paymentId);
    if (idx === -1) return null;

    const old = { ...payments[idx] };
    payments[idx] = {
      ...payments[idx],
      status,
      confirmed_by: managerId,
      confirmed_at: new Date().toISOString()
    };
    this.set('payments', payments);

    // If payment is successful, automatically mark order as paid
    if (status === 'successful') {
      this.updateOrderStatus(payments[idx].order_id, 'paid', managerId, managerName);
    }

    this.logAction('payments', paymentId, 'UPDATE', managerId, managerName, old, payments[idx]);
    return payments[idx];
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return this.get('audit_logs', initialAuditLogs);
  }

  private logAction(
    entity_name: string,
    entity_id: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT',
    performed_by: string,
    performed_by_name?: string,
    old_values?: any,
    new_values?: any
  ): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      entity_name,
      entity_id,
      action,
      performed_by,
      performed_by_name,
      old_values,
      new_values,
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.set('audit_logs', logs.slice(0, 50)); // Giữ 50 log mới nhất
  }
}

export const dataService = new DataStore();
