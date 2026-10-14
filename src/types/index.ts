// ==============================================================================
// EDUMATE DOMAIN TYPES - PLATFORM FOR CONNECTING LEARNERS & TUTORS (HUẾ)
// Slogan: "Tìm đúng người dạy – Học đúng điều cần."
// ==============================================================================

export type UserRole = 'student' | 'tutor' | 'manager' | 'admin';
export type UserStatus = 'active' | 'suspended';

export type TeachingMode = 'online' | 'offline' | 'both';
export type TutorVerificationStatus = 'pending' | 'verified' | 'rejected';

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
  hourly_rate: number; // Mức phí VNĐ / buổi (2 giờ)
  teaching_mode: TeachingMode;
  district: string; // Khu vực tại Thừa Thiên Huế (TP. Huế, Hương Thủy, Hương Trà, Phú Vang...)
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
  teaching_mode: TeachingMode;
  preferred_schedule: string;
  learning_goals: string;
  address?: string;
  notes?: string;
  status: LearningRequestStatus;
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
