import { createClient } from '@supabase/supabase-js';
import type { Profile, UserRole, ServiceRequest, RequestStatus } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Kiểm tra xem frontend đã được cung cấp URL & Anon Key hợp lệ chưa
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project')
);

// Khởi tạo Supabase Client (Chỉ dùng Anon Key, tuyệt đối không dùng Service Role Key trên Client)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// ==============================================================================
// AUTHENTICATION HELPERS
// ==============================================================================

/**
 * Đăng ký tài khoản mới qua Supabase Auth.
 * Triggers trong database sẽ tự tạo bản ghi trong `profiles` và `user_roles` (role='student').
 */
export async function supabaseSignUp(
  email: string,
  password: string,
  fullName: string,
  studentCode?: string,
  phone?: string
) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình biến môi trường.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        student_code: studentCode || null,
        phone: phone || null,
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Đăng nhập tài khoản qua Supabase Auth với Email & Password.
 */
export async function supabaseSignIn(email: string, password: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình biến môi trường.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Đăng xuất khỏi phiên Supabase Auth.
 */
export async function supabaseSignOut() {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Khôi phục phiên làm việc hiện tại (Restore Session).
 */
export async function supabaseGetSession() {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('Lỗi lấy session Supabase:', error.message);
    return null;
  }
  return data.session;
}

/**
 * Lấy hồ sơ tài khoản và vai trò từ `profiles` kết hợp `user_roles`.
 */
export async function supabaseFetchProfile(userId: string): Promise<Profile | null> {
  if (!isSupabaseConfigured) return null;

  // Lấy Profile
  const { data: profileData, error: profileErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileErr || !profileData) {
    console.warn('Không tìm thấy profile cho user:', userId, profileErr?.message);
    return null;
  }

  // Lấy Role từ bảng user_roles (Bảo mật, độc lập)
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  const assignedRole: UserRole = roleData?.role || 'student';

  return {
    id: profileData.id,
    email: profileData.email,
    full_name: profileData.full_name,
    phone: profileData.phone || undefined,
    student_code: profileData.student_code || undefined,
    role: assignedRole,
    status: 'active',
    avatar_url: profileData.avatar_url || undefined,
    created_at: profileData.created_at,
    updated_at: profileData.updated_at,
  };
}

// ==============================================================================
// SERVICE REQUESTS DATABASE HELPERS (RLS PROTECTED)
// ==============================================================================

/**
 * Lấy danh sách yêu cầu dịch vụ (RLS tự lọc: Sinh viên chỉ nhận của mình, Quản lý nhận tất cả).
 */
export async function supabaseFetchRequests(): Promise<ServiceRequest[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      service_forms(title),
      profiles!service_requests_student_id_fkey(full_name, email, student_code)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Lỗi truy vấn service_requests qua Supabase RLS:', error.message);
    throw error;
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    request_code: row.request_code,
    student_id: row.student_id,
    form_type_id: row.form_type_id,
    form_type_title: row.service_forms?.title || 'Yêu cầu học vụ',
    student_name: row.profiles?.full_name || 'Người học',
    student_email: row.profiles?.email,
    student_code: row.profiles?.student_code,
    form_data: row.form_data || {},
    status: row.status as RequestStatus,
    reviewer_id: row.reviewer_id,
    review_notes: row.review_notes,
    reviewed_at: row.reviewed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

/**
 * Tạo yêu cầu mới (RLS bắt buộc: student_id = auth.uid(), status in ('draft', 'submitted')).
 */
export async function supabaseCreateRequest(payload: {
  requestCode: string;
  formTypeId: string;
  formData: Record<string, any>;
  status: 'draft' | 'submitted';
}) {
  if (!isSupabaseConfigured) throw new Error('Supabase chưa cấu hình');

  const session = await supabaseGetSession();
  if (!session?.user?.id) throw new Error('Chưa đăng nhập');

  const { data, error } = await supabase
    .from('service_requests')
    .insert({
      request_code: payload.requestCode,
      student_id: session.user.id,
      form_type_id: payload.formTypeId,
      form_data: payload.formData,
      status: payload.status,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cập nhật trạng thái duyệt hồ sơ (Chỉ Manager được RLS cấp phép).
 */
export async function supabaseReviewRequest(
  requestId: string,
  status: RequestStatus,
  reviewNotes?: string
) {
  if (!isSupabaseConfigured) throw new Error('Supabase chưa cấu hình');

  const session = await supabaseGetSession();
  if (!session?.user?.id) throw new Error('Chưa đăng nhập');

  const { data, error } = await supabase
    .from('service_requests')
    .update({
      status,
      reviewer_id: session.user.id,
      review_notes: reviewNotes || null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
