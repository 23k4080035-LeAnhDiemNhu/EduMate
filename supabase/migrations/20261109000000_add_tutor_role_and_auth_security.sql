-- ==============================================================================
-- EDUMATE POSTGRESQL MIGRATION: ADD TUTOR ROLE & AUTHENTICATION SECURITY
-- Version: 20261109000000
-- Scope: user_role ENUM, handle_new_user trigger, role helpers & RLS security
-- Core Principles:
-- 1. Safely extend user_role to include 'tutor'.
-- 2. Signup trigger allows 'student' and 'tutor'; strictly FORBIDS self-assigned 'manager'/'admin'.
-- 3. Dedicated security definer functions for role checking (is_manager, is_tutor, is_user_tutor, get_auth_role).
-- 4. Secure procedure for provisioning manager role with strict caller authorization.
-- 5. Full RLS policies for 3-role data isolation (Student - Tutor - Manager).
-- ==============================================================================

-- 1. EXTEND user_role ENUM SAFELY
DO $$ 
BEGIN
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'tutor';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. SECURITY HELPER FUNCTIONS
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

CREATE OR REPLACE FUNCTION public.is_tutor()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'tutor'
  );
$$;

-- Hàm kiểm tra một user_id cụ thể có vai trò Gia sư hay không (chống vòng lặp đệ quy RLS)
CREATE OR REPLACE FUNCTION public.is_user_tutor(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = target_user_id AND role = 'tutor'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1),
    'student'::public.user_role
  );
$$;

-- 3. SECURE TRIGGER TỰ ĐỘNG KHỞI TẠO PROFILE & ROLE KHI ĐĂNG KÝ (SIGNUP)
-- Tương thích hoàn toàn: Email/Password, Google OAuth và Công cụ quản trị Admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    requested_role TEXT;
    assigned_role public.user_role;
    user_full_name TEXT;
    user_avatar TEXT;
BEGIN
    -- 1. Trích xuất họ tên an toàn (hỗ trợ cả Email Auth, Google OAuth và Admin Dashboard)
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(COALESCE(NEW.email, 'User'), '@', 1)
    );

    -- 2. Trích xuất avatar an toàn (hỗ trợ cả OAuth picture và custom avatar)
    user_avatar := COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        NEW.raw_user_meta_data->>'avatar'
    );

    -- 3. Xác định vai trò: Chỉ cho phép tự chọn 'student' hoặc 'tutor'
    -- Tuyệt đối ngăn chặn việc tự gán 'manager' hoặc 'admin'
    requested_role := lower(COALESCE(NEW.raw_user_meta_data->>'role', 'student'));

    IF requested_role = 'tutor' THEN
        assigned_role := 'tutor'::public.user_role;
    ELSE
        assigned_role := 'student'::public.user_role;
    END IF;

    -- 4. Tạo hoặc cập nhật Profile
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        phone, 
        student_code, 
        avatar_url,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.email, NEW.id::text || '@auth.edumate.vn'),
        COALESCE(user_full_name, 'Thành viên EduMate'),
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'student_code',
        user_avatar,
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
        updated_at = timezone('utc'::text, now());

    -- 5. Gán vai trò ban đầu an toàn vào user_roles
    INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
    VALUES (NEW.id, assigned_role, timezone('utc'::text, now()), timezone('utc'::text, now()))
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Tái tạo trigger trên auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. HÀM QUẢN TRỊ BẢO MẬT: CẤP QUYỀN QUẢN LÝ (MANAGER)
-- Hàm này chỉ có thể được gọi bởi superuser/service_role hoặc quản trị viên từ console trực tiếp
CREATE OR REPLACE FUNCTION public.provision_manager_by_email(target_email TEXT, assigned_by_uuid UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_user_id UUID;
  is_trusted_admin BOOLEAN := false;
BEGIN
  -- NGUYÊN TẮC BẢO MẬT TUYỆT ĐỐI (FAIL-CLOSED):
  -- Chỉ tin cậy khi được gọi qua Secret Service Role Key (auth.role() = 'service_role')
  -- hoặc kết nối database trực tiếp từ console/SQL Editor (auth.role() IS NULL và session_user IN ('postgres', 'supabase_admin')).
  -- Tuyệt đối không dùng current_user vì hàm là SECURITY DEFINER (current_user luôn là postgres)!
  IF auth.role() = 'service_role' OR (auth.role() IS NULL AND session_user IN ('postgres', 'supabase_admin')) THEN
    is_trusted_admin := true;
  END IF;

  IF NOT is_trusted_admin THEN
    RAISE EXCEPTION 'Quyền truy cập bị từ chối: Chỉ Quản trị viên cấp cao (console/service_role) mới có quyền cấp Manager.';
  END IF;

  -- Tìm user theo email
  SELECT id INTO target_user_id FROM auth.users WHERE lower(email) = lower(trim(target_email));
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy tài khoản với email: %', target_email;
  END IF;

  -- Cập nhật hoặc tạo quyền manager
  INSERT INTO public.user_roles (user_id, role, assigned_by, updated_at)
  VALUES (target_user_id, 'manager'::public.user_role, assigned_by_uuid, timezone('utc'::text, now()))
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'manager'::public.user_role,
    assigned_by = EXCLUDED.assigned_by,
    updated_at = timezone('utc'::text, now());

  RETURN TRUE;
END;
$$;

-- THIẾT LẬP QUYỀN EXECUTE CHẶT CHẼ TRÊN HÀM BẢO MẬT
REVOKE EXECUTE ON FUNCTION public.provision_manager_by_email(TEXT, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.provision_manager_by_email(TEXT, UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.provision_manager_by_email(TEXT, UUID) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.provision_manager_by_email(TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.provision_manager_by_email(TEXT, UUID) TO postgres;

GRANT EXECUTE ON FUNCTION public.is_manager() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_tutor() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_user_tutor(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_auth_role() TO authenticated, anon, service_role;

-- 5. RLS POLICIES BỔ SUNG & CỦNG CỐ CHO 3 VAI TRÒ
-- Dọn dẹp triệt để các policy cũ để bảo đảm tính nhất quán logic
DROP POLICY IF EXISTS "user_roles_select_own_or_manager" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert_manager_only" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_update_manager_only" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_delete_manager_only" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_read_policy" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_modify_manager_only" ON public.user_roles;

-- Bảng user_roles: Người dùng xem role của mình; Manager xem tất cả; Cho phép xem role tutor công khai
CREATE POLICY "user_roles_read_policy"
ON public.user_roles FOR SELECT
USING (
    user_id = auth.uid() 
    OR public.is_manager() 
    OR role = 'tutor'
);

-- Phân quyền ghi chặt chẽ trên user_roles:
-- Manager chỉ được phép gán role 'student' hoặc 'tutor' qua client API
-- Tuyệt đối không thể cấp, sửa, xóa vai trò Manager/Admin qua client
CREATE POLICY "user_roles_insert_manager_only" ON public.user_roles
FOR INSERT
WITH CHECK (
    public.is_manager() 
    AND role IN ('student', 'tutor')
);

CREATE POLICY "user_roles_update_manager_only" ON public.user_roles
FOR UPDATE
USING (public.is_manager())
WITH CHECK (
    public.is_manager() 
    AND role IN ('student', 'tutor')
);

CREATE POLICY "user_roles_delete_manager_only" ON public.user_roles
FOR DELETE
USING (
    public.is_manager() 
    AND role IN ('student', 'tutor')
);

-- Bảng profiles: Người học & Khách xem được hồ sơ người dạy để kết nối học tập; Xem hồ sơ của chính mình; Manager xem tất cả
DROP POLICY IF EXISTS "profiles_select_own_or_manager" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id 
  OR public.is_manager()
  OR public.is_user_tutor(profiles.id)
);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_policy" ON public.profiles;
CREATE POLICY "profiles_update_own_policy"
ON public.profiles FOR UPDATE
USING (id = auth.uid() OR public.is_manager())
WITH CHECK (id = auth.uid() OR public.is_manager());

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
FOR INSERT
WITH CHECK (id = auth.uid() OR public.is_manager());

-- 6. GHI CHÚ BẢO MẬT & HƯỚNG DẪN KÍCH HOẠT:
-- Để cấp quyền Manager cho tài khoản dự án (Leanhdiemnhu240905@gmail.com):
-- Sau khi tài khoản đăng ký/tạo trên Supabase, thực thi câu lệnh SQL an toàn trong SQL Editor:
-- SELECT public.provision_manager_by_email('Leanhdiemnhu240905@gmail.com');
