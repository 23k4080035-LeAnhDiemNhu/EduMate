-- ==============================================================================
-- EDUMATE POSTGRESQL MIGRATION: VIETQR PAYMENTS, RECONCILIATION & REFUNDS
-- Version: 20261108000000
-- Scope: payment_intents, payment_verifications, refund_requests
-- Core Rules:
-- 1. VietQR payment immediately follows LearningRequest submission.
-- 2. Learner reporting transfer moves state to 'awaiting_verification' (NEVER auto-'paid').
-- 3. Only Manager/Admin can verify payments and mark 'paid'.
-- 4. Tutor rejection when 'paid' auto-creates 100% refund (NO 15% platform fee deduction).
-- 5. Marking 'refunded' strictly requires bank_refund_reference.
-- 6. Strict RLS: Tutors cannot view sensitive learner bank account information.
-- ==============================================================================

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE payment_intent_status AS ENUM (
        'pending', 
        'awaiting_verification', 
        'paid', 
        'cancelled', 
        'needs_review', 
        'refund_pending', 
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_verification_status AS ENUM (
        'verified', 
        'rejected', 
        'needs_review'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE refund_status AS ENUM (
        'requested', 
        'under_review', 
        'approved', 
        'processing', 
        'refunded', 
        'rejected', 
        'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. PAYMENT INTENTS TABLE (Quản lý giao dịch VietQR)
CREATE TABLE IF NOT EXISTS public.payment_intents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_request_id TEXT NOT NULL,
    request_code TEXT NOT NULL,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    student_name TEXT NOT NULL,
    student_phone TEXT,
    student_email TEXT,
    tutor_id TEXT NOT NULL,
    tutor_name TEXT NOT NULL,
    package_id TEXT NOT NULL,
    package_name TEXT NOT NULL,
    amount_vnd NUMERIC(12, 2) NOT NULL CHECK (amount_vnd > 0),
    platform_fee_vnd NUMERIC(12, 2) NOT NULL DEFAULT 0,
    tutor_share_vnd NUMERIC(12, 2) NOT NULL DEFAULT 0,
    transfer_memo TEXT NOT NULL,
    transfer_reference TEXT,
    status payment_intent_status NOT NULL DEFAULT 'pending',
    idempotency_key TEXT UNIQUE,
    payment_method TEXT NOT NULL DEFAULT 'vietqr_transfer',
    proof_url TEXT,
    student_note TEXT,
    is_demo BOOLEAN NOT NULL DEFAULT false,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PAYMENT VERIFICATIONS TABLE (Lịch sử đối soát của Quản trị viên)
CREATE TABLE IF NOT EXISTS public.payment_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_intent_id UUID NOT NULL REFERENCES public.payment_intents(id) ON DELETE CASCADE,
    bank_transaction_reference TEXT NOT NULL,
    verified_amount_vnd NUMERIC(12, 2) NOT NULL CHECK (verified_amount_vnd > 0),
    verification_status payment_verification_status NOT NULL,
    verified_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    notes TEXT,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. REFUND REQUESTS TABLE (Quy trình hoàn tiền 100% khi gia sư từ chối / hủy hợp lệ)
CREATE TABLE IF NOT EXISTS public.refund_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_intent_id UUID NOT NULL REFERENCES public.payment_intents(id) ON DELETE RESTRICT UNIQUE,
    learning_request_id TEXT NOT NULL,
    request_code TEXT NOT NULL,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    student_name TEXT NOT NULL,
    refund_amount_vnd NUMERIC(12, 2) NOT NULL CHECK (refund_amount_vnd > 0),
    reason TEXT NOT NULL,
    status refund_status NOT NULL DEFAULT 'requested',
    student_bank_name TEXT,
    student_bank_code TEXT,
    student_bank_account_number TEXT,
    student_bank_account_holder TEXT,
    bank_refund_reference TEXT,
    admin_notes TEXT,
    approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- Ràng buộc: Hoàn tất bắt buộc có mã giao dịch ngân hàng
    CONSTRAINT chk_refund_reference_on_refunded CHECK (
        (status != 'refunded') OR (bank_refund_reference IS NOT NULL AND length(trim(bank_refund_reference)) > 0)
    ),
    -- Ràng buộc: Từ chối hoàn tiền bắt buộc có lý do
    CONSTRAINT chk_refund_notes_on_rejected CHECK (
        (status != 'rejected') OR (admin_notes IS NOT NULL AND length(trim(admin_notes)) > 0)
    )
);

-- 5. CHỈ MỤC HIỆU NĂNG (INDEXES)
CREATE INDEX IF NOT EXISTS idx_payment_intents_student ON public.payment_intents(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON public.payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_req ON public.payment_intents(learning_request_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_idempotency ON public.payment_intents(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_intent ON public.payment_verifications(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_student ON public.refund_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON public.refund_requests(status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_intent ON public.refund_requests(payment_intent_id);

-- 6. TỰ ĐỘNG CẬP NHẬT UPDATED_AT CHO GIAO DỊCH VÀ HOÀN TIỀN
DROP TRIGGER IF EXISTS update_payment_intents_updated_at ON public.payment_intents;
CREATE TRIGGER update_payment_intents_updated_at
    BEFORE UPDATE ON public.payment_intents
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS update_refund_requests_updated_at ON public.refund_requests;
CREATE TRIGGER update_refund_requests_updated_at
    BEFORE UPDATE ON public.refund_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. TRIGGER BẢO VỆ DỮ LIỆU CỐT LÕI (CHỐNG GIAN LẬN SỐ TIỀN & TRẠNG THÁI)
CREATE OR REPLACE FUNCTION public.protect_payment_intent_immutable_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    is_trusted_admin BOOLEAN := false;
BEGIN
    IF auth.role() = 'service_role' OR (auth.role() IS NULL AND session_user IN ('postgres', 'supabase_admin')) OR public.is_manager() THEN
        is_trusted_admin := true;
    END IF;

    IF NOT is_trusted_admin THEN
        -- Chặn học viên/người dùng thường tự ý duyệt đã thanh toán hoặc hoàn tất hoàn tiền
        IF NEW.status IN ('paid', 'refunded') AND OLD.status NOT IN ('paid', 'refunded') THEN
            RAISE EXCEPTION 'BẢO MẬT: Chỉ Quản trị viên mới có thẩm quyền xác nhận thanh toán (paid) hoặc hoàn tất hoàn tiền.';
        END IF;

        IF NEW.amount_vnd != OLD.amount_vnd 
           OR NEW.platform_fee_vnd != OLD.platform_fee_vnd 
           OR NEW.tutor_share_vnd != OLD.tutor_share_vnd
           OR NEW.learning_request_id != OLD.learning_request_id
           OR NEW.student_id != OLD.student_id
           OR NEW.tutor_id != OLD.tutor_id THEN
            RAISE EXCEPTION 'Học viên không được sửa đổi số tiền hoặc thông tin cốt lõi của giao dịch.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_payment_intent ON public.payment_intents;
CREATE TRIGGER trg_protect_payment_intent
    BEFORE UPDATE ON public.payment_intents
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_payment_intent_immutable_fields();

CREATE OR REPLACE FUNCTION public.protect_refund_request_immutable_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    is_trusted_admin BOOLEAN := false;
BEGIN
    IF auth.role() = 'service_role' OR (auth.role() IS NULL AND session_user IN ('postgres', 'supabase_admin')) OR public.is_manager() THEN
        is_trusted_admin := true;
    END IF;

    IF NOT is_trusted_admin THEN
        IF NEW.status != OLD.status 
           OR NEW.refund_amount_vnd != OLD.refund_amount_vnd
           OR NEW.payment_intent_id != OLD.payment_intent_id
           OR NEW.learning_request_id != OLD.learning_request_id
           OR NEW.student_id != OLD.student_id
           OR NEW.bank_refund_reference IS DISTINCT FROM OLD.bank_refund_reference
           OR NEW.approved_by IS DISTINCT FROM OLD.approved_by
           OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
           OR NEW.refunded_at IS DISTINCT FROM OLD.refunded_at THEN
            RAISE EXCEPTION 'Chỉ Quản trị viên mới có quyền phê duyệt, đối soát hoặc cập nhật trạng thái hoàn tiền.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_refund_request ON public.refund_requests;
CREATE TRIGGER trg_protect_refund_request
    BEFORE UPDATE ON public.refund_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_refund_request_immutable_fields();

-- 8. KÍCH HOẠT ROW LEVEL SECURITY (RLS)
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

-- 9. RLS POLICIES FOR PAYMENT_INTENTS
DROP POLICY IF EXISTS "Students can view own payment intents" ON public.payment_intents;
CREATE POLICY "Students can view own payment intents"
    ON public.payment_intents
    FOR SELECT
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Tutors can view payment intents assigned to them" ON public.payment_intents;
CREATE POLICY "Tutors can view payment intents assigned to them"
    ON public.payment_intents
    FOR SELECT
    USING (
        tutor_id = auth.uid()::text
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.id::text = payment_intents.tutor_id
        )
    );

DROP POLICY IF EXISTS "Students can insert own payment intents in pending status" ON public.payment_intents;
CREATE POLICY "Students can insert own payment intents in pending status"
    ON public.payment_intents
    FOR INSERT
    WITH CHECK (
        student_id = auth.uid() 
        AND status = 'pending'
    );

DROP POLICY IF EXISTS "Students can submit transfer notification" ON public.payment_intents;
CREATE POLICY "Students can submit transfer notification"
    ON public.payment_intents
    FOR UPDATE
    USING (
        student_id = auth.uid() 
        AND status IN ('pending', 'needs_review')
    )
    WITH CHECK (
        student_id = auth.uid() 
        AND status IN ('awaiting_verification', 'cancelled')
    );

DROP POLICY IF EXISTS "Managers can manage all payment intents" ON public.payment_intents;
CREATE POLICY "Managers can manage all payment intents"
    ON public.payment_intents
    FOR ALL
    USING (public.is_manager())
    WITH CHECK (public.is_manager());

-- 10. RLS POLICIES FOR PAYMENT_VERIFICATIONS
DROP POLICY IF EXISTS "Students can view verifications for own intents" ON public.payment_verifications;
CREATE POLICY "Students can view verifications for own intents"
    ON public.payment_verifications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.payment_intents pi
            WHERE pi.id = payment_verifications.payment_intent_id
            AND pi.student_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Tutors can view verifications for own intents" ON public.payment_verifications;
CREATE POLICY "Tutors can view verifications for own intents"
    ON public.payment_verifications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.payment_intents pi
            WHERE pi.id = payment_verifications.payment_intent_id
            AND (pi.tutor_id = auth.uid()::text)
        )
    );

DROP POLICY IF EXISTS "Managers can manage payment verifications" ON public.payment_verifications;
CREATE POLICY "Managers can manage payment verifications"
    ON public.payment_verifications
    FOR ALL
    USING (public.is_manager())
    WITH CHECK (public.is_manager());

-- 11. RLS POLICIES FOR REFUND_REQUESTS
DROP POLICY IF EXISTS "Students can view own refund requests" ON public.refund_requests;
CREATE POLICY "Students can view own refund requests"
    ON public.refund_requests
    FOR SELECT
    USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students can request refund for own paid intent" ON public.refund_requests;
CREATE POLICY "Students can request refund for own paid intent"
    ON public.refund_requests
    FOR INSERT
    WITH CHECK (
        student_id = auth.uid()
        AND status = 'requested'
        AND EXISTS (
            SELECT 1 FROM public.payment_intents pi
            WHERE pi.id = refund_requests.payment_intent_id
            AND pi.student_id = auth.uid()
            AND pi.status IN ('paid', 'refund_pending')
        )
    );

DROP POLICY IF EXISTS "Tutors can create refund request when rejecting paid intent" ON public.refund_requests;
CREATE POLICY "Tutors can create refund request when rejecting paid intent"
    ON public.refund_requests
    FOR INSERT
    WITH CHECK (
        status = 'requested'
        AND EXISTS (
            SELECT 1 FROM public.payment_intents pi
            WHERE pi.id = refund_requests.payment_intent_id
            AND (pi.tutor_id = auth.uid()::text)
            AND pi.status IN ('paid', 'refund_pending')
            AND pi.student_id = refund_requests.student_id
        )
    );

DROP POLICY IF EXISTS "Students can update own refund bank account" ON public.refund_requests;
CREATE POLICY "Students can update own refund bank account"
    ON public.refund_requests
    FOR UPDATE
    USING (student_id = auth.uid() AND status IN ('requested', 'under_review'))
    WITH CHECK (
        student_id = auth.uid() 
        AND status IN ('requested', 'under_review')
        AND approved_by IS NULL
        AND approved_at IS NULL
        AND refunded_at IS NULL
        AND bank_refund_reference IS NULL
    );

DROP POLICY IF EXISTS "Managers can manage all refund requests" ON public.refund_requests;
CREATE POLICY "Managers can manage all refund requests"
    ON public.refund_requests
    FOR ALL
    USING (public.is_manager())
    WITH CHECK (public.is_manager());

-- 12. VIEW TRẠNG THÁI HOÀN TIỀN CHO NGƯỜI DẠY (CÁCH LY DỮ LIỆU & ẨN TÀI KHOẢN NGÂN HÀNG)
-- Người dạy CHỈ được xem trạng thái yêu cầu hoàn tiền liên quan đến lớp của mình
-- Tuyệt đối KHÔNG ĐƯỢC XEM số tài khoản ngân hàng nhạy cảm của người học
CREATE OR REPLACE VIEW public.v_tutor_refund_status AS
SELECT 
    rr.id,
    rr.payment_intent_id,
    rr.learning_request_id,
    rr.request_code,
    pi.tutor_id,
    rr.refund_amount_vnd,
    rr.reason,
    rr.status,
    rr.requested_at,
    rr.refunded_at
FROM public.refund_requests rr
JOIN public.payment_intents pi ON pi.id = rr.payment_intent_id
WHERE (
    pi.tutor_id = auth.uid()::text 
    OR public.is_manager()
    OR rr.student_id = auth.uid()
);

-- 13. THIẾT LẬP QUYỀN TRUY CẬP (GRANTS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_intents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.refund_requests TO authenticated;

GRANT ALL ON public.payment_intents TO service_role;
GRANT ALL ON public.payment_verifications TO service_role;
GRANT ALL ON public.refund_requests TO service_role;

GRANT SELECT ON public.v_tutor_refund_status TO authenticated;

