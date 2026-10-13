import React, { useState } from 'react';
import type { UserRole, Profile } from '../types';
import { dataService } from '../services/dataService';
import { 
  isSupabaseConfigured, 
  supabaseSignIn, 
  supabaseSignUp, 
  supabaseFetchProfile 
} from '../lib/supabase';
import { 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  Loader2,
  AlertCircle
} from 'lucide-react';


interface AuthPageProps {
  onLoginSuccess: (profile: Profile) => void;
  onNavigate: (page: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onNavigate, showToast }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [role, setRole] = useState<UserRole>('student');

  // Quick login with seeded accounts
  const handleQuickLogin = (userEmail: string) => {
    setLoading(true);
    setTimeout(() => {
      const profiles = dataService.getProfiles();
      const found = profiles.find(p => p.email.toLowerCase() === userEmail.toLowerCase());
      setLoading(false);
      if (found) {
        showToast('success', 'Đăng nhập thành công!', `Chào mừng trở lại, ${found.full_name}`);
        onLoginSuccess(found);
      } else {
        showToast('error', 'Không tìm thấy tài khoản', 'Vui lòng kiểm tra lại địa chỉ email');
      }
    }, 400);
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

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
        newErrors.studentCode = 'Vui lòng nhập mã số sinh viên';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    if (isSupabaseConfigured) {
      try {
        if (mode === 'login') {
          const authRes = await supabaseSignIn(email.trim(), password);
          if (authRes?.user) {
            const profile = await supabaseFetchProfile(authRes.user.id);
            setLoading(false);
            if (profile) {
              showToast('success', 'Đăng nhập Supabase Auth thành công!', `Chào mừng ${profile.full_name}`);
              onLoginSuccess(profile);
            } else {
              // Profile might be in sync process
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
        } else {
          // Register via Supabase Auth
          const authRes = await supabaseSignUp(
            email.trim(),
            password,
            fullName.trim(),
            role === 'student' ? studentCode.trim() : undefined,
            phone.trim() || undefined
          );

          setLoading(false);
          if (authRes?.user) {
            if (authRes.session) {
              const profile = await supabaseFetchProfile(authRes.user.id);
              if (profile) {
                showToast('success', 'Đăng ký thành công!', `Chào mừng ${profile.full_name}`);
                onLoginSuccess(profile);
                return;
              }
            }
            showToast('info', 'Đăng ký thành công!', 'Tài khoản đã tạo trên Supabase. Bạn có thể đăng nhập ngay.');
            setMode('login');
          }
        }
      } catch (err: any) {
        setLoading(false);
        const errMsg = err?.message || 'Lỗi xử lý xác thực Supabase';
        setErrors({ form: errMsg });
        showToast('error', 'Lỗi xác thực Supabase', errMsg);
      }
      return;
    }

    // Chế độ Sandbox / Local fallback khi chưa cấu hình .env
    setTimeout(() => {
      setLoading(false);
      if (mode === 'login') {
        const profiles = dataService.getProfiles();
        const found = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
        if (found) {
          showToast('success', 'Đăng nhập thành công (Sandbox)!', `Chào mừng ${found.full_name}`);
          onLoginSuccess(found);
        } else {
          setErrors({ form: 'Email hoặc mật khẩu không chính xác trong dữ liệu lưu trữ!' });
          showToast('error', 'Đăng nhập thất bại', 'Email không tồn tại trong danh sách tài khoản');
        }
      } else {
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
      }
    }, 400);
  };


  return (
    <div className="max-w-md mx-auto pt-4 pb-12 animate-fadeIn">
      <div className="glass-panel rounded-3xl p-8 border border-slate-700 shadow-2xl space-y-6">
        
        {/* Header Tabs */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-white">
            {mode === 'login' ? 'Đăng Nhập EduMate' : 'Đăng Ký Tài Khoản Mới'}
          </h2>
          <p className="text-xs text-slate-400">
            Truy cập cổng dịch vụ học vụ và bảng quản trị bảo mật
          </p>

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
        </div>

        {errors.form && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Vai trò đăng ký:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                      role === 'student'
                        ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">Sinh viên / Người học</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('manager')}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                      role === 'manager'
                        ? 'border-indigo-500 bg-indigo-950/20 text-indigo-300'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span className="font-semibold">Quản lý / Giáo vụ</span>
                  </button>
                </div>
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
                    placeholder="VD: Trần Văn Bình"
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
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="VD: SV2026-1050"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
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
                    placeholder="VD: 0988123456"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Địa chỉ Email: <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: sinhvien@edumate.vn"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            {errors.email && <p className="text-rose-400 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Mật khẩu: <span className="text-rose-400">*</span>
            </label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý thông tin...</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Đăng nhập vào hệ thống' : 'Hoàn tất đăng ký'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Logins Section */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <div className="text-[11px] text-slate-400 font-semibold text-center">
            Tài khoản dùng thử nghiệm có sẵn:
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('sinhvien@edumate.vn')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all text-left cursor-pointer"
            >
              <div className="text-[9px] text-emerald-400 font-bold uppercase">Sinh viên 1</div>
              <div className="font-semibold truncate text-[11px]">Văn An</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('sinhvien2@edumate.vn')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-white transition-all text-left cursor-pointer"
            >
              <div className="text-[9px] text-teal-400 font-bold uppercase">Sinh viên 2</div>
              <div className="font-semibold truncate text-[11px]">Thị Bình</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('quanly@edumate.vn')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all text-left cursor-pointer"
            >
              <div className="text-[9px] text-indigo-400 font-bold uppercase">Quản lý</div>
              <div className="font-semibold truncate text-[11px]">Thị Mai</div>
            </button>
          </div>

          <div className="pt-2 text-center">
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
    </div>
  );
};

