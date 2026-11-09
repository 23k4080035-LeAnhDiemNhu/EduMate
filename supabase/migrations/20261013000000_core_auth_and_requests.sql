-- ==============================================================================
-- EDUMATE POSTGRESQL MIGRATION: CORE AUTH, PROFILES, ROLES & SERVICE REQUESTS
-- Version: 20261013000000
-- Project: EduMate Huế - "Tìm đúng người dạy – Học đúng điều cần."
-- Scope: profiles, user_roles, service_forms, service_requests
-- Core Security Principles:
-- 1. Nguyên tắc Mặc định Từ chối (Default Deny): Vai trò Manager/Admin là đặc quyền tối cao.
--    Chỉ cho phép cấp, sửa đổi hoặc xóa khi caller thực sự là service_role hoặc superuser database.
--    Phân biệt chính xác giữa session_user (kết nối), auth.role() (JWT claim) và context SECURITY DEFINER.
-- 2. Định danh & Hồ sơ bất biến: id, email, created_at của profiles không thể bị can thiệp qua client API.
--    Mã sinh viên (student_code) một khi xác lập không thể bị tự ý sửa đổi.
-- 3. Nguyên tắc Fail-Closed cho Nghiệp vụ: Nếu bảng payment_intents tồn tại nhưng việc kiểm tra
--    trạng thái thanh toán gặp lỗi hệ thống, trigger BẮT BUỘC TỪ CHỐI cập nhật, không được Fail-Open.
-- 4. Đồng bộ Email Nghiêm ngặt: Trigger trên auth.users tự động đồng bộ email sang profiles.
--    Nếu phát sinh lỗi (xung đột UNIQUE hoặc lỗi hệ thống), ném Exception để Rollback giao dịch,
--    tuyệt đối không âm thầm nuốt lỗi gây mất nhất quán dữ liệu.
-- 5. An toàn hàm & RLS: Mọi hàm SECURITY DEFINER đều khóa search_path = public; RLS bật 100%.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'tutor', 'manager', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Tài khoản người dùng liên kết trực tiếp auth.users)
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

-- 5. SERVICE FORMS TABLE (Định nghĩa loại biểu mẫu dịch vụ học vụ EduMate)
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

-- 6. SERVICE REQUESTS TABLE (Biểu mẫu yêu cầu học vụ từ người học)
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

-- 8. TRIGGER TỰ ĐỘNG CẬP NHẬT UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_service_forms_updated_at ON public.service_forms;
CREATE TRIGGER update_service_forms_updated_at
    BEFORE UPDATE ON public.service_forms
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_service_requests_updated_at ON public.service_requests;
CREATE TRIGGER update_service_requests_updated_at
    BEFORE UPDATE ON public.service_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. SECURITY HELPER FUNCTIONS (Kiểm tra vai trò Quản lý / Gia sư)
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

-- 10. TRIGGER BẢO VỆ CỘT NHẠY CẢM CỦA PROFILES (CHỐNG MẤT ĐỒNG BỘ VỚI AUTH.USERS & CHỐNG GIẢ MẠO)
-- Lưu ý bảo mật: Hàm là SECURITY DEFINER nên current_user luôn là postgres (người tạo hàm).
-- Phải xác thực caller dựa trên auth.role() (JWT) và session_user (kết nối), KHÔNG dùng current_user!
CREATE OR REPLACE FUNCTION public.protect_profile_immutable_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    is_trusted_admin BOOLEAN := false;
    real_auth_email TEXT;
BEGIN
    -- Phân biệt chính xác ngữ cảnh tin cậy:
    -- Chỉ tin cậy khi được gọi qua Secret Service Role Key (auth.role() = 'service_role')
    -- hoặc kết nối trực tiếp database không qua PostgREST (auth.role() IS NULL và session_user là postgres/supabase_admin).
    IF auth.role() = 'service_role' OR (auth.role() IS NULL AND session_user IN ('postgres', 'supabase_admin')) THEN
        is_trusted_admin := true;
    END IF;

    -- A. XỬ LÝ TRƯỜNG HỢP INSERT:
    IF TG_OP = 'INSERT' THEN
        -- Nếu là người dùng qua client API (không phải admin tin cậy):
        IF NOT is_trusted_admin THEN
            -- Truy vấn email xác thực thực tế từ auth.users bằng đặc quyền SECURITY DEFINER
            SELECT email INTO real_auth_email FROM auth.users WHERE id = NEW.id;
            
            IF real_auth_email IS NULL THEN
                RAISE EXCEPTION 'BẢO MẬT: Hồ sơ người dùng bắt buộc phải gắn với tài khoản xác thực hợp lệ trong auth.users.';
            END IF;
            
            -- Ép buộc email trong profiles phải khớp hoàn toàn với auth.users, triệt tiêu nguy cơ mạo danh
            NEW.email := real_auth_email;
        END IF;
        RETURN NEW;
    END IF;

    -- B. XỬ LÝ TRƯỜNG HỢP UPDATE:
    IF TG_OP = 'UPDATE' THEN
        -- Không cho phép thay đổi ID định danh liên kết với auth.users
        IF NEW.id != OLD.id THEN
            RAISE EXCEPTION 'BẢO MẬT: Không được phép thay đổi id định danh của hồ sơ người dùng.';
        END IF;

        -- Email được quản lý tập trung bởi Supabase Auth (auth.users).
        -- Người dùng bình thường không được tự ý sửa email qua client API để tránh mất đồng bộ và chiếm đoạt tài khoản.
        IF NEW.email != OLD.email AND NOT is_trusted_admin THEN
            RAISE EXCEPTION 'BẢO MẬT: Email hồ sơ được quản lý bởi Supabase Auth, không được tự ý sửa đổi trực tiếp.';
        END IF;

        -- Không cho phép người dùng tự sửa student_code khi đã được xác lập (chỉ Manager hoặc admin tin cậy được sửa)
        IF NOT public.is_manager() AND NOT is_trusted_admin THEN
            IF OLD.student_code IS NOT NULL AND NEW.student_code IS DISTINCT FROM OLD.student_code THEN
                RAISE EXCEPTION 'BẢO MẬT: Mã sinh viên (student_code) đã được xác nhận, không thể tự ý sửa đổi. Vui lòng liên hệ Quản trị viên nếu cần điều chỉnh.';
            END IF;
        END IF;

        -- Thời gian tạo hồ sơ là bất biến
        IF NEW.created_at != OLD.created_at THEN
            NEW.created_at := OLD.created_at;
        END IF;

        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_immutable_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_immutable_fields
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_immutable_fields();

-- 11. TRIGGER ĐỒNG BỘ EMAIL AN TOÀN & NHẤT QUÁN NGHIÊM NGẶT KHI ĐỔI EMAIL QUA SUPABASE AUTH
-- Khi người dùng hoàn tất xác minh đổi email trong auth.users, trigger này cập nhật profiles.email.
-- NGUYÊN TẮC NHẤT QUÁN: Nếu xảy ra lỗi hoặc xung đột, ném Exception để Rollback, tuyệt đối không nuốt lỗi!
CREATE OR REPLACE FUNCTION public.handle_user_email_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Chỉ thực hiện khi cột email thực tế trong auth.users có thay đổi
    IF NEW.email IS DISTINCT FROM OLD.email THEN
        -- 1. Nếu có hồ sơ cũ mồ côi (không thuộc user nào trong auth.users) chiếm giữ email này, dọn dẹp an toàn:
        DELETE FROM public.profiles 
        WHERE email = NEW.email AND id != NEW.id AND id NOT IN (SELECT id FROM auth.users);

        -- 2. Cập nhật hồ sơ người dùng với email mới
        UPDATE public.profiles
        SET email = NEW.email,
            updated_at = timezone('utc'::text, now())
        WHERE id = NEW.id;

        -- 3. Nếu chưa có profile (hiếm gặp), tự động khởi tạo để bảo đảm tính nhất quán dữ liệu
        IF NOT FOUND THEN
            INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
            VALUES (
                NEW.id,
                NEW.email,
                split_part(NEW.email, '@', 1),
                timezone('utc'::text, now()),
                timezone('utc'::text, now())
            );
        END IF;
    END IF;
    RETURN NEW;
EXCEPTION 
    WHEN unique_violation THEN
        RAISE EXCEPTION 'ĐỒNG BỘ EMAIL THẤT BẠI: Email % đã được sử dụng bởi một tài khoản khác trong hệ thống. Thao tác đổi email bị hủy bỏ để bảo đảm tính nhất quán dữ liệu.', NEW.email;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'ĐỒNG BỘ EMAIL THẤT BẠI: Không thể cập nhật email mới cho hồ sơ % do lỗi hệ thống (%). Thao tác đổi email bị hủy bỏ.', NEW.id, SQLERRM;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_sync();

-- 12. TRIGGER BẢO VỆ TÍNH TOÀN VẸN NGHIỆP VỤ & TÀI CHÍNH CỦA SERVICE_REQUESTS (NGUYÊN TẮC FAIL-CLOSED)
CREATE OR REPLACE FUNCTION public.protect_service_request_immutable_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    has_active_payment BOOLEAN := false;
BEGIN
    -- 1. Các trường định danh cốt lõi là bất biến tuyệt đối
    IF NEW.id != OLD.id THEN
        RAISE EXCEPTION 'BẢO MẬT: Không được phép thay đổi id yêu cầu.';
    END IF;
    IF NEW.request_code != OLD.request_code THEN
        RAISE EXCEPTION 'BẢO MẬT: Mã yêu cầu (request_code) là định danh nghiệp vụ bất biến.';
    END IF;
    IF NEW.student_id != OLD.student_id THEN
        RAISE EXCEPTION 'BẢO MẬT: Không được phép thay đổi người sở hữu yêu cầu (student_id).';
    END IF;
    IF NEW.created_at != OLD.created_at THEN
        NEW.created_at := OLD.created_at;
    END IF;

    -- 2. Kiểm soát thẩm quyền nếu người thao tác không phải Manager
    IF NOT public.is_manager() THEN
        -- Học viên không được can thiệp vào các trường xét duyệt của Quản lý
        IF NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id 
           OR NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at 
           OR NEW.review_notes IS DISTINCT FROM OLD.review_notes THEN
            RAISE EXCEPTION 'BẢO MẬT: Học viên không có quyền gán người duyệt, thời gian duyệt hoặc ghi chú thẩm định.';
        END IF;

        -- Khi đã nộp chính thức, không được đổi loại biểu mẫu
        IF OLD.status != 'draft' AND NEW.form_type_id != OLD.form_type_id THEN
            RAISE EXCEPTION 'NGHIỆP VỤ: Không thể thay đổi loại biểu mẫu sau khi yêu cầu đã được nộp chính thức.';
        END IF;

        -- NGUYÊN TẮC FAIL-CLOSED CHO GIAO DỊCH THANH TOÁN:
        -- Đối chiếu chính xác schema payment_intents từ Migration 2:
        -- Cột: learning_request_id (TEXT), request_code (TEXT), status (payment_intent_status).
        -- Nếu bảng tồn tại, kiểm tra giao dịch liên quan. Nếu phát sinh lỗi, TỪ CHỐI CẬP NHẬT (Fail-Closed).
        IF to_regclass('public.payment_intents') IS NOT NULL THEN
            BEGIN
                EXECUTE 'SELECT EXISTS (
                    SELECT 1 FROM public.payment_intents pi
                    WHERE (pi.learning_request_id = $1 OR pi.request_code = $2)
                    AND pi.status::text IN (''pending'', ''awaiting_verification'', ''paid'', ''needs_review'', ''refund_pending'', ''refunded'')
                )' INTO has_active_payment USING OLD.id::text, OLD.request_code;
            EXCEPTION WHEN OTHERS THEN
                RAISE EXCEPTION 'AN TOÀN HỆ THỐNG (FAIL-CLOSED): Không thể kiểm tra trạng thái giao dịch thanh toán do lỗi hệ thống (%). Cập nhật bị từ chối để bảo vệ tính toàn vẹn nghiệp vụ và tài chính.', SQLERRM;
            END;

            IF has_active_payment THEN
                -- Nếu đã phát sinh thanh toán, khóa hoàn toàn nội dung form_data
                IF NEW.form_data IS DISTINCT FROM OLD.form_data THEN
                    RAISE EXCEPTION 'NGHIỆP VỤ: Yêu cầu đã phát sinh giao dịch thanh toán hoặc đang đối soát, không được phép thay đổi nội dung biểu mẫu.';
                END IF;

                -- Học viên không được tự chuyển trạng thái về nháp khi đã có giao dịch
                IF NEW.status = 'draft' AND OLD.status != 'draft' THEN
                    RAISE EXCEPTION 'NGHIỆP VỤ: Yêu cầu đã phát sinh giao dịch, không thể chuyển ngược về trạng thái nháp.';
                END IF;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_service_request_immutable_fields ON public.service_requests;
CREATE TRIGGER trg_protect_service_request_immutable_fields
    BEFORE UPDATE ON public.service_requests
    FOR EACH ROW EXECUTE FUNCTION public.protect_service_request_immutable_fields();

-- 13. TRIGGER CHỐNG TỰ PHONG, HẠ QUYỀN HOẶC XÓA VAI TRÒ MANAGER/ADMIN (DEFAULT DENY)
CREATE OR REPLACE FUNCTION public.protect_user_roles_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    is_trusted_admin BOOLEAN := false;
BEGIN
    -- NGUYÊN TẮC MẶC ĐỊNH TỪ CHỐI (DEFAULT DENY):
    -- Chỉ chấp nhận là ngữ cảnh quản trị tin cậy khi caller thực sự là service_role
    -- hoặc kết nối database trực tiếp không qua JWT (auth.role() IS NULL và session_user là postgres/supabase_admin).
    -- Tuyệt đối không dựa vào "auth.uid() IS NULL", vì các truy vấn nặc danh (anon) cũng có auth.uid() IS NULL.
    IF auth.role() = 'service_role' OR (auth.role() IS NULL AND session_user IN ('postgres', 'supabase_admin')) THEN
        is_trusted_admin := true;
    END IF;

    -- TRƯỜNG HỢP 1: THÊM MỚI HOẶC NÂNG CẤP LÊN MANAGER / ADMIN
    IF TG_OP IN ('INSERT', 'UPDATE') THEN
        IF NEW.role IN ('manager', 'admin') AND NOT is_trusted_admin THEN
            RAISE EXCEPTION 'BẢO MẬT: Quyền Manager và Admin là đặc quyền hệ thống tối cao, chỉ được cấp qua quy trình quản trị tin cậy (service_role/console). Mọi hành vi tự cấp qua Client API đều bị chặn đứng.';
        END IF;
    END IF;

    -- TRƯỜNG HỢP 2: HẠ QUYỀN HOẶC XÓA BỎ VAI TRÒ MANAGER / ADMIN HIỆN HỮU
    IF TG_OP IN ('UPDATE', 'DELETE') THEN
        IF OLD.role IN ('manager', 'admin') AND NOT is_trusted_admin THEN
            RAISE EXCEPTION 'BẢO MẬT: Không thể hạ quyền, thay đổi hoặc xóa bỏ vai trò Manager/Admin của tài khoản đặc quyền ngoại trừ qua quy trình quản trị tin cậy.';
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_user_roles_escalation ON public.user_roles;
CREATE TRIGGER trg_protect_user_roles_escalation
    BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_roles_escalation();

-- 14. TRIGGER TỰ ĐỘNG KHỞI TẠO PROFILE & ROLE KHI ĐĂNG KÝ (SIGNUP)
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Kích hoạt RLS trên tất cả các bảng
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
-- RLS POLICIES CHO BẢNG USER_ROLES (Chống tự leo thang quyền & giới hạn phân quyền)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_roles_select_own_or_manager" ON public.user_roles;
CREATE POLICY "user_roles_select_own_or_manager"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid() OR public.is_manager());

-- Manager chỉ được phép gán role 'student' hoặc 'tutor' cho người dùng qua client API
DROP POLICY IF EXISTS "user_roles_insert_manager_only" ON public.user_roles;
CREATE POLICY "user_roles_insert_manager_only" ON public.user_roles
FOR INSERT
WITH CHECK (
    public.is_manager() 
    AND role IN ('student', 'tutor')
);

DROP POLICY IF EXISTS "user_roles_update_manager_only" ON public.user_roles;
CREATE POLICY "user_roles_update_manager_only" ON public.user_roles
FOR UPDATE
USING (public.is_manager())
WITH CHECK (
    public.is_manager() 
    AND role IN ('student', 'tutor')
);

-- Manager chỉ được phép xóa role 'student' hoặc 'tutor', tuyệt đối không được xóa Manager/Admin khác
DROP POLICY IF EXISTS "user_roles_delete_manager_only" ON public.user_roles;
CREATE POLICY "user_roles_delete_manager_only" ON public.user_roles
FOR DELETE
USING (
    public.is_manager() 
    AND role IN ('student', 'tutor')
);

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
-- 16. THIẾT LẬP QUYỀN GRANTS (BẢO ĐẢM HOẠT ĐỘNG DƯỚI SUPABASE POSTGREST & RLS)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT SELECT ON public.user_roles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_forms TO anon, authenticated;
GRANT ALL ON public.service_forms TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_requests TO authenticated;

GRANT EXECUTE ON FUNCTION public.is_manager() TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.is_tutor() TO authenticated, anon, service_role;

-- ==============================================================================
-- 17. DỮ LIỆU KHỞI TẠO MẪU CHO BIỂU MẪU DỊCH VỤ (SEED DATA CHUẨN HÓA EDUMATE)
-- ==============================================================================
INSERT INTO public.service_forms (code, title, description, schema_definition, is_active)
VALUES 
    (
        'FORM-HOAN-THI', 
        'Đơn xin hoãn / đổi lịch học kèm hoặc đánh giá học vụ', 
        'Dành cho người học EduMate có lý do bất khả kháng cần dời lịch học kèm hoặc kiểm tra đánh giá tiến độ.',
        '{"fields": ["ly_do_noi_dung", "ngay_mong_muon", "ghi_chu_them"]}'::jsonb,
        true
    ),
    (
        'FORM-DANG-KY-HO-TRO', 
        'Phiếu yêu cầu Cố vấn & Hỗ trợ học vụ chuyên sâu', 
        'Đăng ký nhận hướng dẫn đặc biệt từ ban cố vấn học tập EduMate và trợ giảng chuyên môn cao.',
        '{"fields": ["ly_do_noi_dung", "khung_gio_ranh", "ghi_chu_them"]}'::jsonb,
        true
    ),
    (
        'FORM-CAP-BANG-DIEM', 
        'Yêu cầu trích sao hồ sơ & Chứng nhận hoàn thành học vụ', 
        'Cấp phiếu xác nhận tiến độ học tập hoặc chứng nhận hoàn thành gói học kèm EduMate.',
        '{"fields": ["ly_do_noi_dung", "so_ban", "hinh_thuc_nhan", "dia_chi_gui"]}'::jsonb,
        true
    )
ON CONFLICT (code) DO NOTHING;
