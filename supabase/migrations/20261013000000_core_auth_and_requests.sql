-- ==============================================================================
-- EDUMATE POSTGRESQL MIGRATION: CORE AUTH, PROFILES, ROLES & SERVICE REQUESTS
-- Version: 20261013000000
-- Scope: profiles, user_roles, service_forms, service_requests (Excludes courses, enrollments, orders, payments)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'manager', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Tài khoản người dùng liên kết auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    student_code TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. USER ROLES TABLE (Phân định vai trò riêng biệt để chống tự leo thang quyền)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    role user_role NOT NULL DEFAULT 'student',
    assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. SERVICE FORMS TABLE (Định nghĩa loại biểu mẫu dịch vụ)
CREATE TABLE IF NOT EXISTS public.service_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    schema_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. SERVICE REQUESTS TABLE (Biểu mẫu yêu cầu từ người học)
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_code TEXT NOT NULL UNIQUE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    form_type_id UUID NOT NULL REFERENCES public.service_forms(id) ON DELETE RESTRICT,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status request_status NOT NULL DEFAULT 'draft',
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_review_notes_on_reject CHECK (
        (status != 'rejected') OR (review_notes IS NOT NULL AND length(trim(review_notes)) > 0)
    )
);

-- 7. CHỈ MỤC HIỆU NĂNG (INDEXES)
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_student ON public.service_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_form ON public.service_requests(form_type_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_created ON public.service_requests(created_at DESC);

-- 8. SECURITY HELPER FUNCTION (Kiểm tra vai trò Quản lý / Admin)
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('manager', 'admin')
  );
$$;

-- 9. TRIGGER TỰ ĐỘNG KHỞI TẠO PROFILE & ROLE KHI ĐĂNG KÝ (SIGNUP)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Tạo Profile mặc định
  INSERT INTO public.profiles (id, email, full_name, phone, student_code, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'student_code',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

  -- Luôn gán vai trò ban đầu là 'student' (Chặn người dùng tự phong quyền)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Kích hoạt RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RLS POLICIES CHO BẢNG PROFILES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_own_or_manager" ON public.profiles;
CREATE POLICY "profiles_select_own_or_manager"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_manager());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- RLS POLICIES CHO BẢNG USER_ROLES (Chặn người dùng tự nâng quyền)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_roles_select_own_or_manager" ON public.user_roles;
CREATE POLICY "user_roles_select_own_or_manager"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid() OR public.is_manager());

-- Chỉ Manager mới có quyền gán hoặc sửa đổi vai trò
DROP POLICY IF EXISTS "user_roles_insert_manager_only" ON public.user_roles;
CREATE POLICY "user_roles_insert_manager_only"
ON public.user_roles FOR INSERT
WITH CHECK (public.is_manager());

DROP POLICY IF EXISTS "user_roles_update_manager_only" ON public.user_roles;
CREATE POLICY "user_roles_update_manager_only"
ON public.user_roles FOR UPDATE
USING (public.is_manager())
WITH CHECK (public.is_manager());

DROP POLICY IF EXISTS "user_roles_delete_manager_only" ON public.user_roles;
CREATE POLICY "user_roles_delete_manager_only"
ON public.user_roles FOR DELETE
USING (public.is_manager());

-- ------------------------------------------------------------------------------
-- RLS POLICIES CHO BẢNG SERVICE_FORMS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "service_forms_select_active" ON public.service_forms;
CREATE POLICY "service_forms_select_active"
ON public.service_forms FOR SELECT
USING (is_active = true OR public.is_manager());

DROP POLICY IF EXISTS "service_forms_manage_manager" ON public.service_forms;
CREATE POLICY "service_forms_manage_manager"
ON public.service_forms FOR ALL
USING (public.is_manager());

-- ------------------------------------------------------------------------------
-- RLS POLICIES CHO BẢNG SERVICE_REQUESTS
-- ------------------------------------------------------------------------------
-- Sinh viên chỉ xem yêu cầu của mình, Quản lý xem toàn bộ
DROP POLICY IF EXISTS "service_requests_select" ON public.service_requests;
CREATE POLICY "service_requests_select"
ON public.service_requests FOR SELECT
USING (student_id = auth.uid() OR public.is_manager());

-- Sinh viên chỉ tạo yêu cầu cho chính mình, trạng thái ban đầu bắt buộc là draft hoặc submitted
-- Tuyệt đối không được gán reviewer_id hoặc tự duyệt
DROP POLICY IF EXISTS "service_requests_insert_student" ON public.service_requests;
CREATE POLICY "service_requests_insert_student"
ON public.service_requests FOR INSERT
WITH CHECK (
    student_id = auth.uid() 
    AND status IN ('draft', 'submitted')
    AND reviewer_id IS NULL
    AND reviewed_at IS NULL
);

-- Sinh viên chỉ sửa yêu cầu của mình khi còn ở trạng thái draft hoặc submitted
-- Không thể tự chuyển trạng thái sang approved hoặc rejected
DROP POLICY IF EXISTS "service_requests_update_student" ON public.service_requests;
CREATE POLICY "service_requests_update_student"
ON public.service_requests FOR UPDATE
USING (
    student_id = auth.uid() 
    AND status IN ('draft', 'submitted')
)
WITH CHECK (
    student_id = auth.uid() 
    AND status IN ('draft', 'submitted', 'cancelled')
    AND reviewer_id IS NULL
    AND reviewed_at IS NULL
);

-- Sinh viên chỉ xóa được hồ sơ nháp
DROP POLICY IF EXISTS "service_requests_delete_student_draft" ON public.service_requests;
CREATE POLICY "service_requests_delete_student_draft"
ON public.service_requests FOR DELETE
USING (
    student_id = auth.uid() 
    AND status = 'draft'
);

-- Người quản lý có toàn quyền cập nhật trạng thái thẩm định, ghi chú và reviewer_id
DROP POLICY IF EXISTS "service_requests_update_manager" ON public.service_requests;
CREATE POLICY "service_requests_update_manager"
ON public.service_requests FOR UPDATE
USING (public.is_manager())
WITH CHECK (public.is_manager());

DROP POLICY IF EXISTS "service_requests_delete_manager" ON public.service_requests;
CREATE POLICY "service_requests_delete_manager"
ON public.service_requests FOR DELETE
USING (public.is_manager());

-- ==============================================================================
-- 11. DỮ LIỆU KHỞI TẠO MẪU CHO BIỂU MẪU DỊCH VỤ (SEED DATA)
-- ==============================================================================
INSERT INTO public.service_forms (code, title, description, schema_definition, is_active)
VALUES 
    (
        'FORM-HOAN-THI', 
        'Đơn xin hoãn / đổi lịch đánh giá học tập', 
        'Dành cho người học có lý do bất khả kháng cần dời lịch đánh giá học phần hoặc kỳ thi.',
        '{"fields": ["ly_do_noi_dung", "ngay_mong_muon", "ghi_chu_them"]}'::jsonb,
        true
    ),
    (
        'FORM-DANG-KY-HO-TRO', 
        'Phiếu yêu cầu Cố vấn & Hỗ trợ học vụ chuyên sâu', 
        'Đăng ký nhận hướng dẫn từ đội ngũ trợ giảng và cố vấn học tập học phần nâng cao.',
        '{"fields": ["ly_do_noi_dung", "khung_gio_ranh", "ghi_chu_them"]}'::jsonb,
        true
    ),
    (
        'FORM-CAP-BANG-DIEM', 
        'Yêu cầu trích sao hồ sơ & Bảng điểm học vụ', 
        'Yêu cầu cấp bảng điểm học tập có dấu xác nhận để phục vụ du học, thực tập hoặc việc làm.',
        '{"fields": ["ly_do_noi_dung", "so_ban", "hinh_thuc_nhan", "dia_chi_gui"]}'::jsonb,
        true
    )
ON CONFLICT (code) DO NOTHING;
