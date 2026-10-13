// EduMate Domain Types - Aligned with PostgreSQL Schema and ERD Specification

export type UserRole = 'student' | 'manager' | 'admin';
export type UserStatus = 'active' | 'suspended';

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

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  student_code?: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

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
