import React, { useState } from 'react';
import type { Profile } from '../types';
import { dataService } from '../services/dataService';
import { isSupabaseConfigured, supabaseUpdateProfile } from '../lib/supabase';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Calendar, 
  Save, 
  Loader2
} from 'lucide-react';

interface ProfilePageProps {
  currentUser: Profile;
  onProfileUpdated: (updated: Profile) => void;
  onNavigate: (page: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onProfileUpdated,
  onNavigate,
  showToast,
}) => {
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calculate user activity statistics
  const userRequests = dataService.getRequests(currentUser.id, currentUser.role);
  const userEnrollments = dataService.getEnrollments(currentUser.id, currentUser.role);
  const userOrders = dataService.getOrders(currentUser.id, currentUser.role);
  const approvedRequests = userRequests.filter(r => r.status === 'approved');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      newErrors.fullName = 'Họ và tên không được để trống';
    } else if (trimmedName.length < 2) {
      newErrors.fullName = 'Họ và tên phải có tối thiểu 2 ký tự';
    }

    if (phone && !/^[0-9]{9,11}$/.test(phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (cần 9-11 chữ số)';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('error', 'Dữ liệu không hợp lệ', 'Vui lòng kiểm tra các trường báo lỗi');
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        const updated = await supabaseUpdateProfile(currentUser.id, {
          full_name: trimmedName,
          phone: phone.trim() || undefined,
          avatar_url: avatarUrl.trim() || undefined,
        });
        if (updated) {
          onProfileUpdated(updated);
          showToast('success', 'Đã lưu hồ sơ (Supabase)!', 'Dữ liệu hồ sơ đã được đồng bộ vào database');
        }
      } else {
        const updated = dataService.updateProfile(currentUser.id, {
          full_name: trimmedName,
          phone: phone.trim() || undefined,
          avatar_url: avatarUrl.trim() || currentUser.avatar_url
        }, currentUser.id);

        if (updated) {
          onProfileUpdated(updated);
          showToast('success', 'Đã lưu thay đổi hồ sơ!', 'Thông tin cá nhân đã được cập nhật thành công');
        } else {
          showToast('error', 'Cập nhật thất bại', 'Không thể lưu thông tin hồ sơ');
        }
      }
    } catch (err: any) {
      showToast('error', 'Lỗi cập nhật hồ sơ', err?.message || 'Đã có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Profile Header Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-700 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <img
          src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
          alt={currentUser.full_name}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-lg"
        />

        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-2xl font-extrabold text-white">{currentUser.full_name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              currentUser.role === 'manager' 
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {currentUser.role === 'manager' ? 'Người Quản Lý' : 'Sinh Viên / Người Học'}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentUser.email}</span>
            </span>
            {currentUser.student_code && (
              <span className="flex items-center space-x-1">
                <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono text-slate-300">MSSV: {currentUser.student_code}</span>
              </span>
            )}
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Tham gia: {new Date(currentUser.created_at).toLocaleDateString('vi-VN')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Activity Statistics Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('my-requests')}
          className="glass-card rounded-2xl p-4 border border-slate-800 text-center space-y-1 cursor-pointer"
        >
          <div className="text-2xl font-black text-indigo-400">{userRequests.length}</div>
          <div className="text-xs text-slate-400 font-medium">Yêu cầu đã gửi</div>
        </div>

        <div 
          onClick={() => onNavigate('my-requests')}
          className="glass-card rounded-2xl p-4 border border-slate-800 text-center space-y-1 cursor-pointer"
        >
          <div className="text-2xl font-black text-emerald-400">{approvedRequests.length}</div>
          <div className="text-xs text-slate-400 font-medium">Hồ sơ đã duyệt</div>
        </div>

        <div 
          onClick={() => onNavigate('academic')}
          className="glass-card rounded-2xl p-4 border border-slate-800 text-center space-y-1 cursor-pointer"
        >
          <div className="text-2xl font-black text-violet-400">{userEnrollments.length}</div>
          <div className="text-xs text-slate-400 font-medium">Học phần ghi danh</div>
        </div>

        <div 
          onClick={() => onNavigate('orders')}
          className="glass-card rounded-2xl p-4 border border-slate-800 text-center space-y-1 cursor-pointer"
        >
          <div className="text-2xl font-black text-amber-400">{userOrders.length}</div>
          <div className="text-xs text-slate-400 font-medium">Đơn hàng / Khoản thu</div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-700 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-indigo-400" />
            <span>Cập Nhật Thông Tin Cá Nhân</span>
          </h2>
          <p className="text-xs text-slate-400">
            Chỉnh sửa thông tin liên lạc và hiển thị trong hồ sơ học vụ
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Họ và tên: <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              {errors.fullName && <p className="text-rose-400 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Số điện thoại liên lạc:
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0912345678"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              {errors.phone && <p className="text-rose-400 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Địa chỉ Email (Định danh hệ thống - Cố định):
              </label>
              <input
                type="text"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">Email quản trị bởi Supabase Auth</span>
            </div>

            {currentUser.student_code && (
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Mã số sinh viên (Cố định):
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser.student_code}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 cursor-not-allowed font-mono"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                Link ảnh đại diện (Avatar URL):
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Lưu thay đổi hồ sơ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
