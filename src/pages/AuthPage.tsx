import React, { useState, useEffect } from 'react';
import type { Profile } from '../types';
import { dataService } from '../services/dataService';
import { 
  isSupabaseConfigured, 
  supabaseSignIn, 
  supabaseSignUp, 
  supabaseFetchProfile,
  supabaseResetPassword,
  supabaseUpdatePassword,
  supabaseSignInWithGoogle,
  sanitizeAuthError
} from '../lib/supabase';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  UserCheck, 
  GraduationCap,
  ArrowRight, 
  Loader2,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (profile: Profile) => void;
  onNavigate: (page: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onNavigate, showToast }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password' | 'reset_password'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash.includes('type=recovery') || hash.includes('reset-password')) {
        return 'reset_password';
      }
    }
    return 'login';
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [role, setRole] = useState<'student' | 'tutor'>('student');
  const [resetSuccessMessage, setResetSuccessMessage] = useState('');

  // Check URL hash for password recovery
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.includes('type=recovery') || hash.includes('reset-password')) {
        setMode('reset_password');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Quick login for Sandbox Demo mode
  const handleQuickLogin = (userEmail: string) => {
    setLoading(true);
    setTimeout(() => {
      const profiles = dataService.getProfiles();
      const found = profiles.find(p => p.email.toLowerCase() === userEmail.toLowerCase());
      setLoading(false);
      if (found) {
        showToast('success', 'Đăng nhập thành công (Mô phỏng)!', `Chào mừng, ${found.full_name}`);
        onLoginSuccess(found);
      } else {
        showToast('error', 'Không tìm thấy tài khoản', 'Email này chưa có trong dữ liệu mô phỏng');
      }
    }, 400);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (mode === 'forgot_password') {
      if (!email.trim()) {
        newErrors.email = 'Vui lòng nhập địa chỉ email';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Địa chỉ email không đúng định dạng';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (mode === 'reset_password') {
      if (!newPassword) {
        newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
      } else if (newPassword.length < 6) {
        newErrors.newPassword = 'Mật khẩu mới phải có tối thiểu 6 ký tự';
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Địa chỉ email không đúng định dạng';
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có tối thiểu 6 ký tự';
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Vui lòng nhập họ và tên đầy đủ';
      }
      if (role === 'student' && !studentCode.trim()) {
        newErrors.studentCode = 'Vui lòng nhập mã số sinh viên (VD: 23K4080035)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    setResetSuccessMessage('');

    // 1. SUPABASE AUTH PRODUCTION FLOW
    if (isSupabaseConfigured) {
      try {
        if (mode === 'login') {
          const authRes = await supabaseSignIn(email.trim(), password);
          if (authRes?.user) {
            const profile = await supabaseFetchProfile(authRes.user.id);
            setLoading(false);
            if (profile) {
              showToast('success', 'Đăng nhập thành công!', `Chào mừng ${profile.full_name} (${profile.role})`);
              onLoginSuccess(profile);
            } else {
              const fallbackProfile: Profile = {
                id: authRes.user.id,
                email: authRes.user.email || email,
                full_name: authRes.user.user_metadata?.full_name || email.split('@')[0],
                role: 'student',
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              showToast('success', 'Đăng nhập thành công!', `Chào mừng ${fallbackProfile.full_name}`);
              onLoginSuccess(fallbackProfile);
            }
          }
        } else if (mode === 'register') {
          // Public signup only accepts 'student' or 'tutor'
          const authRes = await supabaseSignUp(
            email.trim(),
            password,
            fullName.trim(),
            role,
            role === 'student' ? studentCode.trim() : undefined,
            phone.trim() || undefined
          );

          setLoading(false);
          if (authRes?.user) {
            // Check if confirmation is needed or auto-confirmed
            if (authRes.session) {
              const profile = await supabaseFetchProfile(authRes.user.id);
              if (profile) {
                showToast('success', 'Đăng ký thành công!', `Chào mừng ${profile.full_name}`);
                onLoginSuccess(profile);
                return;
              }
            }
            showToast(
              'info', 
              'Đăng ký tài khoản thành công!', 
              'Vui lòng kiểm tra email của bạn để xác thực liên kết trước khi đăng nhập.'
            );
            setMode('login');
          }
        } else if (mode === 'forgot_password') {
          await supabaseResetPassword(email.trim());
          setLoading(false);
          setResetSuccessMessage('Đã gửi liên kết khôi phục mật khẩu vào email của bạn. Vui lòng kiểm tra hộp thư đến hoặc thư rác.');
          showToast('success', 'Đã gửi email khôi phục', 'Vui lòng kiểm tra hộp thư');
        } else if (mode === 'reset_password') {
          await supabaseUpdatePassword(newPassword);
          setLoading(false);
          showToast('success', 'Cập nhật mật khẩu thành công!', 'Bạn có thể đăng nhập bằng mật khẩu mới.');
          setMode('login');
          window.location.hash = '';
        }
      } catch (err: any) {
        setLoading(false);
        const safeMsg = sanitizeAuthError(err);
        setErrors({ form: safeMsg });
        showToast('error', 'Lỗi xác thực', safeMsg);
      }
      return;
    }

    // 2. DEMO / SANDBOX FALLBACK FLOW (Local Engine)
    setTimeout(() => {
      setLoading(false);

      if (mode === 'login') {
        const profiles = dataService.getProfiles();
        const found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
        if (found) {
          showToast('success', 'Đăng nhập thành công (Sandbox)!', `Chào mừng ${found.full_name}`);
          onLoginSuccess(found);
        } else {
          setErrors({ form: 'Địa chỉ email hoặc mật khẩu không chính xác trong dữ liệu thử nghiệm.' });
          showToast('error', 'Đăng nhập thất bại', 'Email không tồn tại trong danh sách tài khoản');
        }
      } else if (mode === 'register') {
        const existing = dataService.getProfiles().some(p => p.email.toLowerCase() === email.toLowerCase());
        if (existing) {
          setErrors({ email: 'Địa chỉ email này đã được sử dụng!' });
          showToast('error', 'Đăng ký không thành công', 'Email đã tồn tại trong hệ thống');
          return;
        }

        const newProfile = dataService.registerProfile({
          email: email.trim(),
          full_name: fullName.trim(),
          phone: phone.trim() || undefined,
          student_code: role === 'student' ? studentCode.trim() : undefined,
          role: role,
          status: 'active',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'
        });

        showToast('success', 'Tạo tài khoản thành công (Sandbox)!', `Chào mừng ${newProfile.full_name}`);
        onLoginSuccess(newProfile);
      } else if (mode === 'forgot_password') {
        setResetSuccessMessage('Chế độ mô phỏng: Liên kết đặt lại mật khẩu đã được xử lý giả lập.');
        showToast('info', 'Mô phỏng khôi phục mật khẩu', 'Email khôi phục đã được giả lập thành công');
      } else if (mode === 'reset_password') {
        showToast('success', 'Đã đổi mật khẩu (Mô phỏng)', 'Bạn có thể đăng nhập bằng mật khẩu mới');
        setMode('login');
      }
    }, 400);
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      showToast('info', 'Google OAuth (Mô phỏng)', 'Tính năng Google OAuth sẽ tự động kích hoạt khi bạn cấu hình Google Provider trên Supabase Dashboard.');
      return;
    }

    try {
      await supabaseSignInWithGoogle();
    } catch (err: any) {
      const msg = sanitizeAuthError(err);
      showToast('error', 'Lỗi Google OAuth', msg);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-4 pb-12 animate-fadeIn">
      <div className="glass-panel rounded-3xl p-8 border border-slate-700 shadow-2xl space-y-6">
        
        {/* Header Tabs */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-white">
            {mode === 'login' && 'Đăng Nhập EduMate'}
            {mode === 'register' && 'Đăng Ký Tài Khoản'}
            {mode === 'forgot_password' && 'Khôi Phục Mật Khẩu'}
            {mode === 'reset_password' && 'Đặt Lại Mật Khẩu Mới'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login' && 'Nhập email và mật khẩu của bạn để truy cập hệ thống'}
            {mode === 'register' && 'Tạo tài khoản để kết nối học tập hoặc chia sẻ kiến thức'}
            {mode === 'forgot_password' && 'Nhập email đã đăng ký để nhận liên kết khôi phục'}
            {mode === 'reset_password' && 'Nhập mật khẩu mới an toàn cho tài khoản của bạn'}
          </p>

          {(mode === 'login' || mode === 'register') && (
            <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-xl mt-4">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrors({}); }}
                className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'login' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrors({}); }}
                className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  mode === 'register' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Đăng ký mới
              </button>
            </div>
          )}
        </div>

        {/* Global Error Banner */}
        {errors.form && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
            <div className="leading-relaxed">{errors.form}</div>
          </div>
        )}

        {/* Success Notice Banner */}
        {resetSuccessMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
            <div className="leading-relaxed">{resetSuccessMessage}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* MODE: REGISTER -> Role Selection (STUDENT vs TUTOR only) */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Chọn vai trò của bạn:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-3 rounded-xl border text-left flex items-start space-x-2 transition-all cursor-pointer ${
                      role === 'student'
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Người học</div>
                      <div className="text-[10px] text-slate-400">Sinh viên tìm anh/chị khóa trước</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('tutor')}
                    className={`p-3 rounded-xl border text-left flex items-start space-x-2 transition-all cursor-pointer ${
                      role === 'tutor'
                        ? 'border-blue-500 bg-blue-950/30 text-blue-300 shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                    <div>
                      <div className="font-semibold text-white">Người dạy</div>
                      <div className="text-[10px] text-slate-400">Anh/chị khóa trước kèm 1-1</div>
                    </div>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 flex items-center space-x-1">
                  <ShieldAlert className="w-3 h-3 text-slate-400" />
                  <span>Quyền Quản lý do Ban Quản trị cấp bảo mật qua phân quyền hệ thống.</span>
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Họ và tên đầy đủ: <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="VD: Lê Anh Diễm Như"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {errors.fullName && <p className="text-rose-400 mt-1">{errors.fullName}</p>}
              </div>

              {role === 'student' && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Mã số sinh viên: <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                    placeholder="VD: 23K4080035"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                  />
                  {errors.studentCode && <p className="text-rose-400 mt-1">{errors.studentCode}</p>}
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Số điện thoại liên hệ:
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0987654321"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {/* EMAIL INPUT (Login, Register, Forgot Password) */}
          {mode !== 'reset_password' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-medium">
                  Địa chỉ Email: <span className="text-rose-400">*</span>
                </label>
                {mode === 'register' && role === 'student' && (
                  <span className="text-[10px] text-emerald-400">Ưu tiên email sinh viên @hce.edu.vn</span>
                )}
                {mode === 'register' && role === 'tutor' && (
                  <span className="text-[10px] text-blue-400">Sử dụng tài khoản Gmail thật</span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    mode === 'register' && role === 'student'
                      ? '23K4080035@hce.edu.vn'
                      : 'email@gmail.com'
                  }
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>
              {errors.email && <p className="text-rose-400 mt-1">{errors.email}</p>}
            </div>
          )}

          {/* PASSWORD INPUT (Login, Register) */}
          {(mode === 'login' || mode === 'register') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-300 font-medium">
                  Mật khẩu: <span className="text-rose-400">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setErrors({}); }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              {errors.password && <p className="text-rose-400 mt-1">{errors.password}</p>}
            </div>
          )}

          {/* RESET PASSWORD INPUTS */}
          {mode === 'reset_password' && (
            <>
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Mật khẩu mới: <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {errors.newPassword && <p className="text-rose-400 mt-1">{errors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Xác nhận mật khẩu mới: <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                {errors.confirmPassword && <p className="text-rose-400 mt-1">{errors.confirmPassword}</p>}
              </div>
            </>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý thông tin...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login' && 'Đăng nhập vào hệ thống'}
                  {mode === 'register' && 'Hoàn tất đăng ký tài khoản'}
                  {mode === 'forgot_password' && 'Gửi liên kết khôi phục'}
                  {mode === 'reset_password' && 'Xác nhận đổi mật khẩu'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Back to Login link when in forgot/reset password mode */}
          {(mode === 'forgot_password' || mode === 'reset_password') && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrors({}); }}
                className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Quay lại màn hình Đăng nhập
              </button>
            </div>
          )}
        </form>

        {/* GOOGLE OAUTH BUTTON */}
        {mode === 'login' && (
          <div className="pt-2 border-t border-slate-800 space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2.5 transition-all cursor-pointer hover:bg-slate-800/60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục với Google OAuth</span>
            </button>
          </div>
        )}

        {/* DEMO FAST LOGINS SECTION (Only displayed in Sandbox Demo Mode) */}
        {!isSupabaseConfigured ? (
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[11px] text-amber-400 font-semibold flex items-center justify-between">
              <span>Tài khoản chỉ định kiểm thử (Mô phỏng):</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono uppercase">
                Sandbox
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('23K4080035@hce.edu.vn')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all text-left cursor-pointer group"
                title="23K4080035@hce.edu.vn"
              >
                <div className="text-[9px] text-emerald-400 font-bold uppercase">Người học</div>
                <div className="font-semibold truncate text-[11px] group-hover:text-emerald-300">23K4080035</div>
                <div className="text-[9px] text-slate-500 truncate font-mono">@hce.edu.vn</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('lehoangnam.k44@gmail.com')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white transition-all text-left cursor-pointer group"
                title="lehoangnam.k44@gmail.com"
              >
                <div className="text-[9px] text-blue-400 font-bold uppercase">Người dạy</div>
                <div className="font-semibold truncate text-[11px] group-hover:text-blue-300">Anh Nam K44</div>
                <div className="text-[9px] text-slate-500 truncate font-mono">@gmail.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('Leanhdiemnhu240905@gmail.com')}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all text-left cursor-pointer group"
                title="Leanhdiemnhu240905@gmail.com"
              >
                <div className="text-[9px] text-indigo-400 font-bold uppercase">Quản lý</div>
                <div className="font-semibold truncate text-[11px] group-hover:text-indigo-300">Diễm Như</div>
                <div className="text-[9px] text-slate-500 truncate font-mono">@gmail.com</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-800 text-center">
            <p className="text-[11px] text-emerald-400 flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Chế độ Supabase Auth Live đang hoạt động an toàn</span>
            </p>
          </div>
        )}

        {/* Back to Home */}
        <div className="pt-1 text-center">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            ← Quay về Trang chủ EduMate
          </button>
        </div>

      </div>
    </div>
  );
};
