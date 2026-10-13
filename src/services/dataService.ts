import type { 
  Profile, 
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

  updateProfile(id: string, updates: Partial<Profile>): Profile | null {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === id);
    if (idx === -1) return null;

    profiles[idx] = {
      ...profiles[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.set('profiles', profiles);
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
    const idx = requests.findIndex(r => r.id === requestId && r.student_id === studentId);
    if (idx === -1) return false;

    // Only allow cancelling draft or submitted requests
    if (!['draft', 'submitted'].includes(requests[idx].status)) {
      return false;
    }

    requests[idx].status = 'cancelled';
    requests[idx].updated_at = new Date().toISOString();
    this.set('requests', requests);
    this.logAction('service_requests', requestId, 'UPDATE', studentId, requests[idx].student_name, null, requests[idx]);
    return true;
  }


  // Forms
  getServiceForms(): ServiceForm[] {
    return this.get('forms', initialForms);
  }

  // Requests
  getRequests(): ServiceRequest[] {
    return this.get('requests', initialRequests);
  }

  createRequest(data: Omit<ServiceRequest, 'id' | 'request_code' | 'created_at' | 'updated_at'>): ServiceRequest {
    const requests = this.getRequests();
    const count = requests.length + 1;
    const newReq: ServiceRequest = {
      ...data,
      id: `req-${Date.now()}`,
      request_code: `REQ-2026-${String(count).padStart(3, '0')}`,
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
    const requests = this.getRequests();
    const idx = requests.findIndex(r => r.id === requestId);
    if (idx === -1) return null;

    const old = { ...requests[idx] };
    requests[idx] = {
      ...requests[idx],
      status,
      reviewer_id: reviewerId,
      reviewer_name: reviewerName,
      review_notes: notes || requests[idx].review_notes,
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
  getEnrollments(): Enrollment[] {
    return this.get('enrollments', initialEnrollments);
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
  getOrders(): Order[] {
    return this.get('orders', initialOrders);
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
