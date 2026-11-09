// ==============================================================================
// EDUMATE DOMAIN TYPES - PLATFORM FOR CONNECTING LEARNERS & TUTORS (HUẾ)
// Slogan: "Tìm đúng người dạy – Học đúng điều cần."
// ==============================================================================

export type UserRole = 'student' | 'tutor' | 'manager' | 'admin';
export type UserStatus = 'active' | 'suspended';

export type TeachingMode = 'online' | 'offline' | 'both';
export type TutorVerificationStatus = 'pending' | 'verified' | 'rejected';

// 3 nhóm nội dung đào tạo chính theo Chương 1 & 4 của PDF Đồ Án
export type ContentGroup = 
  | 'practical_skills'     // Kỹ năng thực hành (Excel, PowerPoint, Canva, Tin học văn phòng...)
  | 'general_education'    // Môn học đại cương (Triết học, Toán cao cấp, Pháp luật đại cương...)
  | 'major_specialization'; // Môn học chuyên ngành (Kinh tế, Kế toán, Tài chính, QTKD, HTTT...)

// 3 gói học chuẩn hóa theo Chương 2.6.3 & Chương 3.3 của PDF Đồ Án
export type CoursePackageType = 'trial' | 'intensive' | 'long_term';

export interface CoursePackage {
  id: CoursePackageType;
  name: string;
  sessions: number;
  price: number;
  price_per_session: number;
  platform_fee_percent: number;
  platform_fee: number;
  tutor_earnings: number;
  description: string;
  suitable_for: string;
  popular?: boolean;
}

export const EDUMATE_PACKAGES: CoursePackage[] = [
  {
    id: 'trial',
    name: 'Gói học thử',
    sessions: 3,
    price: 90000,
    price_per_session: 30000,
    platform_fee_percent: 15,
    platform_fee: 13500,
    tutor_earnings: 76500,
    description: 'Trải nghiệm phương pháp giảng dạy, làm quen và đánh giá mức độ phù hợp với người hướng dẫn.',
    suitable_for: 'Sinh viên muốn kiểm chứng phương pháp dạy hoặc cần giải đáp nhanh một chủ đề khó.',
    popular: false
  },
  {
    id: 'intensive',
    name: 'Gói cấp tốc',
    sessions: 15,
    price: 450000,
    price_per_session: 30000,
    platform_fee_percent: 15,
    platform_fee: 67500,
    tutor_earnings: 382500,
    description: 'Học tập chuyên sâu trước kỳ thi, giải trọn bộ đề thi các năm, hệ thống toàn bộ kiến thức trọng tâm.',
    suitable_for: 'Sinh viên đang chuẩn bị thi học kỳ hoặc cần lấy lại gốc kiến thức nhanh chóng.',
    popular: true
  },
  {
    id: 'long_term',
    name: 'Gói dài hạn',
    sessions: 12,
    price: 360000,
    price_per_session: 30000,
    platform_fee_percent: 15,
    platform_fee: 54000,
    tutor_earnings: 306000,
    description: 'Đồng hành suốt học kỳ, giải bài tập lớn định kỳ, rèn luyện kỹ năng thực hành bài bản.',
    suitable_for: 'Sinh viên muốn duy trì phong độ học tập ổn định hoặc thành thạo kỹ năng thực hành.',
    popular: false
  }
];

export type LearningRequestStatus = 
  | 'pending'     // Chờ xác nhận
  | 'accepted'    // Đã chấp nhận
  | 'rejected'    // Bị từ chối
  | 'completed'   // Đã hoàn thành
  | 'cancelled';  // Đã hủy

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  student_code?: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  bio?: string;
  district?: string;
  university?: string;
  faculty?: string;
  created_at: string;
  updated_at: string;
}

export interface TutorProfile {
  id: string;
  user_id: string;
  full_name: string;
  headline: string;
  bio: string;
  avatar_url: string;
  subjects: string[];
  packages?: CoursePackageType[]; // Các gói học cung cấp (trial, intensive, long_term)
  hourly_rate: number; // Mức phí VNĐ / buổi (2 giờ) - tương thích ngược
  teaching_mode: TeachingMode;
  district: string; // Khu vực tại Thừa Thiên Huế (TP. Huế, Hương Thủy, Hương Trà, Phú Vang...)
  university?: string; // Trường đại học (mặc định: Trường Đại học Kinh tế, Đại học Huế)
  faculty?: string;    // Khoa (HTTT Kinh tế, Kế toán - Kiểm toán, QTKD...)
  experience_years: number;
  verification_status: TutorVerificationStatus;
  rating_avg: number;
  rating_count: number;
  available_days: string[];
  certifications?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LearningRequest {
  id: string;
  request_code: string;
  student_id: string;
  student_name: string;
  student_phone?: string;
  student_email?: string;
  tutor_id: string;
  tutor_name: string;
  subject_name: string;
  content_group?: ContentGroup;
  package_type?: CoursePackageType; // Gói học lựa chọn: trial, intensive, long_term
  package_name?: string;            // Tên gói học
  total_sessions?: number;          // Số buổi học (3, 15, 12)
  total_price?: number;             // Học phí gói (90.000đ, 450.000đ, 360.000đ)
  platform_fee?: number;            // Phí nền tảng 15% (13.500đ, 67.500đ, 54.000đ)
  tutor_earnings?: number;          // Người dạy thực nhận (76.500đ, 382.500đ, 306.000đ)
  teaching_mode: TeachingMode;
  preferred_schedule: string;
  learning_goals: string;
  address?: string;
  notes?: string;
  status: LearningRequestStatus;
  payment_status?: PaymentIntentStatus;
  payment_intent_id?: string;
  rejected_reason?: string;
  completed_at?: string;
  reviewed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  request_id: string;
  student_id: string;
  student_name: string;
  tutor_id: string;
  rating: number; // 1 to 5 stars
  comment: string;
  created_at: string;
}

export interface CourseSubject {
  stt: number;
  code: string;
  name: string;
  category: string;
  content_group?: ContentGroup; // Phân loại vào 3 nhóm trụ cột
  credits: number;
  description: string;
}

export interface SubjectCategory {
  id: string;
  code: string;
  name: string;
  icon?: string;
  description: string;
  tutor_count: number;
}

export interface ReportItem {
  id: string;
  reporter_id: string;
  reporter_name: string;
  target_id: string;
  target_name: string;
  type: 'tutor_profile' | 'request' | 'review';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolution_notes?: string;
  created_at: string;
}

// ------------------------------------------------------------------------------
// Legacy & Compatibility Types
// ------------------------------------------------------------------------------
export type RequestStatus = 
  | 'draft' 
  | 'submitted' 
  | 'in_review' 
  | 'approved' 
  | 'rejected' 
  | 'cancelled';

export type AcademicStatus = 'draft' | 'published' | 'archived';
export type EnrollmentStatus = 'enrolled' | 'active' | 'completed' | 'cancelled';
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'successful' | 'failed' | 'refunded';
export type PaymentMethod = 'bank_transfer' | 'vnpay' | 'momo' | 'cash' | 'other';

export interface ServiceForm {
  id: string;
  code: string;
  title: string;
  description: string;
  schema_definition: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequest {
  id: string;
  request_code: string;
  student_id: string;
  form_type_id: string;
  form_type_title?: string;
  student_name?: string;
  student_email?: string;
  student_code?: string;
  form_data: Record<string, any>;
  status: RequestStatus;
  reviewer_id?: string;
  reviewer_name?: string;
  review_notes?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AcademicItem {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  standard_fee: number;
  status: AcademicStatus;
  metadata?: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  academic_item_id: string;
  academic_item_title?: string;
  request_id?: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_code: string;
  student_id: string;
  student_name?: string;
  request_id?: string;
  total_amount: number;
  status: OrderStatus;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  academic_item_id?: string;
  item_name: string;
  unit_price: number;
  quantity: number;
}

export interface Payment {
  id: string;
  payment_code: string;
  order_id: string;
  order_code?: string;
  payment_method: PaymentMethod;
  transaction_ref?: string;
  amount: number;
  proof_attachment_url?: string;
  status: PaymentStatus;
  confirmed_by?: string;
  confirmed_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  entity_name: string;
  entity_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT';
  performed_by: string;
  performed_by_name?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  created_at: string;
}

// ==============================================================================
// VIETQR PAYMENTS & REFUNDS DOMAIN TYPES (HỆ THỐNG THANH TOÁN & HOÀN TIỀN EDUMATE)
// Slogan: "Tìm đúng người dạy – Học đúng điều cần."
// ==============================================================================

export type PaymentIntentStatus = 
  | 'pending'               // Chờ chuyển khoản
  | 'awaiting_verification' // Học viên đã báo chuyển khoản, chờ Quản trị viên đối soát
  | 'paid'                  // Quản trị viên đã xác minh nhận tiền thành công
  | 'cancelled'             // Hủy thanh toán (do người học hủy hoặc gia sư từ chối khi chưa trả)
  | 'needs_review'          // Cần kiểm tra (Gia sư từ chối khi đang đối soát...)
  | 'refund_pending'        // Chờ hoàn tiền (Gia sư từ chối sau khi đã thanh toán)
  | 'refunded';             // Đã hoàn tiền thành công

export type PaymentVerificationStatus = 'verified' | 'rejected' | 'needs_review';

export type RefundStatus = 
  | 'requested'     // Đã tạo yêu cầu hoàn tiền
  | 'under_review'  // Quản trị viên đang rà soát hồ sơ hoàn tiền
  | 'approved'      // Quản trị viên đã phê duyệt hoàn tiền
  | 'processing'    // Đang xử lý lệnh chuyển tiền hoàn trả
  | 'refunded'      // Đã hoàn tiền thành công (kèm mã giao dịch ngân hàng)
  | 'rejected'      // Từ chối hoàn tiền (kèm lý do)
  | 'failed';       // Hoàn tiền thất bại

export interface StudentBankAccount {
  bank_name: string;
  bank_code?: string;
  account_number: string;
  account_holder: string;
}

export interface BankConfig {
  bank_id: string;        // Ví dụ: 'MB', 'ICB', 'VCB'
  bank_name: string;
  account_number: string;
  account_holder: string;
  is_demo: boolean;
}

export const DEFAULT_BANK_CONFIG: BankConfig = {
  bank_id: 'ICB',
  bank_name: 'Ngân hàng TMCP Công thương Việt Nam (VietinBank)',
  account_number: '107879627729',
  account_holder: 'EDUMATE HUE',
  is_demo: false
};

export interface PaymentIntent {
  id: string;
  learning_request_id: string;
  request_code: string;
  student_id: string;
  student_name: string;
  student_phone?: string;
  student_email?: string;
  tutor_id: string;
  tutor_name: string;
  package_id: CoursePackageType;
  package_name: string;
  amount_vnd: number;
  platform_fee_vnd: number;
  tutor_share_vnd: number;
  transfer_reference?: string;   // Mã tham chiếu người học nhập hoặc mã giao dịch ngân hàng
  transfer_memo: string;         // Nội dung chuyển khoản chuẩn hóa (VD: "EDM YCH-2026-001")
  status: PaymentIntentStatus;
  idempotency_key?: string;      // Khóa chống thanh toán/tạo đơn trùng lặp
  payment_method: 'vietqr_transfer';
  proof_url?: string;            // Ảnh chứng từ hoặc link mô phỏng
  student_note?: string;         // Ghi chú của học viên
  is_demo: boolean;
  created_at: string;
  updated_at: string;
  paid_at?: string;
}

export interface PaymentVerification {
  id: string;
  payment_intent_id: string;
  bank_transaction_reference: string;
  verified_amount_vnd: number;
  verification_status: PaymentVerificationStatus;
  verified_by: string;
  verified_by_name: string;
  verified_at: string;
  notes?: string;
}

export interface RefundRequest {
  id: string;
  payment_intent_id: string;
  learning_request_id: string;
  request_code: string;
  student_id: string;
  student_name: string;
  refund_amount_vnd: number;     // 100% học phí gói học nếu người dạy từ chối trước khi bắt đầu
  reason: string;
  status: RefundStatus;
  requested_at: string;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  refunded_at?: string;
  bank_refund_reference?: string; // Mã tham chiếu chuyển khoản ngân hàng trả lại tiền
  student_bank_account?: StudentBankAccount;
  admin_notes?: string;
  updated_at: string;
}

