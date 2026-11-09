import { createClient } from '@supabase/supabase-js';
import type { Profile, UserRole, ServiceRequest, RequestStatus } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Kiểm tra xem frontend đã được cấu hình URL & API Key (Hỗ trợ cả Anon Key chuẩn eyJ... và Publishable Key dạng sb_publishable_...)
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim().startsWith('https://') &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('placeholder') &&
  !supabaseAnonKey.includes('your-anon-public-key') &&
  supabaseAnonKey.trim().length > 10
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
// AUTHENTICATION HELPERS & ERROR SANITIZATION
// ==============================================================================

/**
 * Chuẩn hóa và làm sạch thông báo lỗi xác thực:
 * Bảo vệ thông tin nhạy cảm, không để lộ cấu trúc bảng, khóa ngoại hoặc lỗi cơ sở dữ liệu nội bộ.
 */
export function sanitizeAuthError(error: any): string {
  if (!error) return 'Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.';
  const msg = typeof error === 'string' ? error : error.message || '';
  const lower = msg.toLowerCase();

  if (lower.includes('invalid login credentials') || lower.includes('invalid_grant')) {
    return 'Địa chỉ email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Địa chỉ email của bạn chưa được xác minh. Vui lòng kiểm tra hộp thư đến (hoặc thư rác) để hoàn tất kích hoạt tài khoản.';
  }
  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'Địa chỉ email này đã được sử dụng để đăng ký tài khoản. Vui lòng đăng nhập hoặc sử dụng tính năng quên mật khẩu.';
  }
  if (lower.includes('password should be at least') || lower.includes('weak_password')) {
    return 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Bạn đã thực hiện quá nhiều thao tác liên tiếp. Vui lòng chờ vài phút rồi thử lại.';
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Không thể kết nối đến máy chủ xác thực. Vui lòng kiểm tra kết nối mạng của bạn.';
  }
  return 'Xử lý xác thực không thành công. Vui lòng kiểm tra lại thông tin và thử lại sau.';
}

/**
 * Đăng ký tài khoản mới qua Supabase Auth.
 * Hỗ trợ 2 vai trò công khai: 'student' (Người học) hoặc 'tutor' (Người dạy).
 * Tuyệt đối CHẶN việc người dùng tự phong quyền 'manager' hoặc 'admin'.
 */
export async function supabaseSignUp(
  email: string,
  password: string,
  fullName: string,
  role: 'student' | 'tutor' = 'student',
  studentCode?: string,
  phone?: string
) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình biến môi trường.');
  }

  // Sanitize role: Chỉ cho phép 'student' hoặc 'tutor'
  const sanitizedRole: 'student' | 'tutor' = role === 'tutor' ? 'tutor' : 'student';

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        role: sanitizedRole,
        student_code: sanitizedRole === 'student' ? (studentCode?.trim() || null) : null,
        phone: phone?.trim() || null,
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
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Gửi yêu cầu đặt lại mật khẩu qua email người dùng.
 */
export async function supabaseResetPassword(email: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình biến môi trường.');
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/#reset-password`,
  });

  if (error) throw error;
  return data;
}

/**
 * Cập nhật mật khẩu mới cho phiên người dùng hiện tại (dùng khi reset mật khẩu hoặc đổi mật khẩu ban đầu).
 */
export async function supabaseUpdatePassword(newPassword: string) {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình biến môi trường.');
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data;
}

/**
 * Đăng nhập bằng Google OAuth (Chỉ hoạt động khi Google Provider đã được cấu hình trên Supabase Dashboard).
 */
export async function supabaseSignInWithGoogle() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase chưa được cấu hình biến môi trường.');
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
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

  const rawRole = roleData?.role;
  let assignedRole: UserRole = 'student';
  if (rawRole === 'tutor') assignedRole = 'tutor';
  else if (rawRole === 'manager' || rawRole === 'admin') assignedRole = 'manager';

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

/**
 * Sinh viên hủy yêu cầu của chính mình (RLS cho phép nếu status in ('draft', 'submitted')).
 */
export async function supabaseCancelRequest(requestId: string): Promise<boolean> {
  if (!isSupabaseConfigured) throw new Error('Supabase chưa cấu hình');

  const session = await supabaseGetSession();
  if (!session?.user?.id) throw new Error('Chưa đăng nhập');

  const { error } = await supabase
    .from('service_requests')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('student_id', session.user.id)
    .in('status', ['draft', 'submitted']);

  if (error) throw error;
  return true;
}

/**
 * Cập nhật hồ sơ người dùng (RLS bảo vệ: auth.uid() = id, không thể tự sửa role qua đây).
 */
export async function supabaseUpdateProfile(
  userId: string,
  updates: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
    student_code?: string;
  }
): Promise<Profile | null> {
  if (!isSupabaseConfigured) throw new Error('Supabase chưa cấu hình');

  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
  return supabaseFetchProfile(userId);
}
