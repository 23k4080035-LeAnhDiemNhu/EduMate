import React, { useState } from 'react';
import type { Profile, TeachingMode, CoursePackageType } from '../types';
import { EDUMATE_PACKAGES } from '../types';
import { dataService } from '../services/dataService';
import { EDUMATE_SUBJECTS } from '../data/subjects';
import { isSupabaseConfigured, supabaseUpdateProfile } from '../lib/supabase';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Calendar, 
  Save, 
  Loader2,
  MapPin,
  CheckCircle2,
  Clock,
  Star,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  Check,
  Plus
} from 'lucide-react';

interface ProfilePageProps {
  currentUser: Profile;
  onProfileUpdated: (updated: Profile) => void;
  onNavigate: (page: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

const HUE_DISTRICTS = [
  'TP. Huế',
  'Hương Thủy',
  'Hương Trà',
  'Phú Vang',
  'Phú Lộc',
  'Phong Điền',
  'Quảng Điền',
  'A Lưới',
  'Nam Đông'
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onProfileUpdated,
  onNavigate,
  showToast,
}) => {
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [district, setDistrict] = useState(currentUser.district || 'TP. Huế');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // EduMate Platform data
  const learningRequests = dataService.getLearningRequests(currentUser.id, currentUser.role);
  const allTutors = dataService.getTutors(false);
  const tutorRecord = currentUser.role === 'tutor' 
    ? allTutors.find(t => t.user_id === currentUser.id) 
    : null;
  const userReviews = dataService.getReviews().filter(r => 
    currentUser.role === 'tutor' 
      ? (tutorRecord && r.tutor_id === tutorRecord.id) 
      : r.student_id === currentUser.id
  );

  // Tutor Self-Management State
  const [tutorHeadline, setTutorHeadline] = useState(tutorRecord?.headline || '');
  const [tutorHourlyRate, setTutorHourlyRate] = useState(tutorRecord?.hourly_rate || 30000);
  const [tutorTeachingMode, setTutorTeachingMode] = useState<TeachingMode>(tutorRecord?.teaching_mode || 'both');
  const [tutorAvailableDays, setTutorAvailableDays] = useState<string[]>(tutorRecord?.available_days || ['Tối thứ 2', 'Tối thứ 4', 'Chủ nhật']);
  const [tutorSubjects, setTutorSubjects] = useState<string[]>(tutorRecord?.subjects || []);
  const [tutorCertifications, setTutorCertifications] = useState(tutorRecord?.certifications || '');
  const [tutorUniversity, setTutorUniversity] = useState(tutorRecord?.university || 'Trường Đại học Kinh tế, Đại học Huế');
  const [tutorFaculty, setTutorFaculty] = useState(tutorRecord?.faculty || 'Khoa Hệ thống thông tin kinh tế');
  const [tutorPackages, setTutorPackages] = useState<CoursePackageType[]>(tutorRecord?.packages || ['trial', 'intensive', 'long_term']);
  const [tutorSaving, setTutorSaving] = useState(false);
  const [newAvailableDay, setNewAvailableDay] = useState('');

  const toggleTutorSubject = (subjectName: string) => {
    if (tutorSubjects.includes(subjectName)) {
      setTutorSubjects(prev => prev.filter(s => s !== subjectName));
    } else {
      setTutorSubjects(prev => [...prev, subjectName]);
    }
  };

  const toggleTutorPackage = (pkgId: CoursePackageType) => {
    setTutorPackages(prev => {
      if (prev.includes(pkgId)) {
        if (prev.length <= 1) return prev; // Keep at least 1 package
        return prev.filter(p => p !== pkgId);
      }
      return [...prev, pkgId];
    });
  };

  const handleSaveTutorProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setTutorSaving(true);
    try {
      if (!tutorRecord) {
        dataService.registerTutorProfile({
          user_id: currentUser.id,
          full_name: fullName.trim(),
          headline: tutorHeadline.trim() || 'Sinh viên khóa trên Đại học Huế',
          bio: bio.trim() || 'Chia sẻ đề thi và kèm học phần đại học.',
          avatar_url: avatarUrl.trim() || currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
          subjects: tutorSubjects.length > 0 ? tutorSubjects : ['Toán ứng dụng trong kinh tế'],
          hourly_rate: Number(tutorHourlyRate) || 30000,
          teaching_mode: tutorTeachingMode,
          district: district,
          experience_years: 1,
          available_days: tutorAvailableDays,
          certifications: tutorCertifications.trim() || undefined,
          university: tutorUniversity.trim(),
          faculty: tutorFaculty.trim(),
          packages: tutorPackages
        });
        showToast('success', 'Đã khởi tạo hồ sơ người dạy!', 'Hồ sơ đã được gửi ở trạng thái Chờ duyệt.');
      } else {
        dataService.updateTutorProfile(tutorRecord.id, {
          headline: tutorHeadline.trim(),
          hourly_rate: Number(tutorHourlyRate) || 30000,
          teaching_mode: tutorTeachingMode,
          available_days: tutorAvailableDays,
          subjects: tutorSubjects,
          certifications: tutorCertifications.trim() || undefined,
          university: tutorUniversity.trim(),
          faculty: tutorFaculty.trim(),
          packages: tutorPackages
        }, currentUser.id);
        showToast('success', 'Đã lưu hồ sơ giảng dạy!', 'Thông tin chuyên môn, gói học, trường/khoa và lịch rảnh của bạn đã được cập nhật.');
      }
    } catch (err: any) {
      showToast('error', 'Lỗi lưu hồ sơ giảng dạy', err.message);
    } finally {
      setTutorSaving(false);
    }
  };

  const completedRequests = learningRequests.filter(r => r.status === 'completed');
  const activeRequests = learningRequests.filter(r => r.status === 'accepted');

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
          onProfileUpdated({ ...updated, district, bio });
          showToast('success', 'Đã lưu hồ sơ (Supabase)!', 'Dữ liệu hồ sơ đã được đồng bộ vào database');
        }
      } else {
        const updated = dataService.updateProfile(currentUser.id, {
          full_name: trimmedName,
          phone: phone.trim() || undefined,
          district: district,
          bio: bio.trim() || undefined,
          avatar_url: avatarUrl.trim() || currentUser.avatar_url
        }, currentUser.id);

        if (updated) {
          onProfileUpdated(updated);
          showToast('success', 'Đã lưu thay đổi hồ sơ!', 'Thông tin cá nhân tại EduMate Huế đã được cập nhật');
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

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'manager':
      case 'admin':
        return {
          label: 'Quản Trị Viên EduMate',
          classes: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
        };
      case 'tutor':
        return {
          label: 'Người Dạy (Anh/Chị Khóa Trước)',
          classes: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
        };
      case 'student':
      default:
        return {
          label: 'Người Học (Sinh Viên Khóa Dưới)',
          classes: 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
        };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Profile Header Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-700 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <img
          src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
          alt={currentUser.full_name}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-500/30 shadow-lg"
        />

        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-2xl font-extrabold text-white">{currentUser.full_name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${roleInfo.classes}`}>
              {roleInfo.label}
            </span>
            {currentUser.role === 'tutor' && tutorRecord && (
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                tutorRecord.verification_status === 'verified'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {tutorRecord.verification_status === 'verified' ? (
                  <>
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Đã duyệt hồ sơ</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Chờ Admin duyệt</span>
                  </>
                )}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentUser.email}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentUser.district || 'TP. Huế'}</span>
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

          {currentUser.bio && (
            <p className="text-xs text-slate-300 pt-1 italic line-clamp-2">
              "{currentUser.bio}"
            </p>
          )}
        </div>
      </div>

      {/* Tutor Status Alert Banner (if role is tutor) */}
      {currentUser.role === 'tutor' && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          tutorRecord?.verification_status === 'verified'
            ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
            : tutorRecord
            ? 'bg-amber-950/30 border-amber-800 text-amber-300'
            : 'bg-blue-950/30 border-blue-800 text-blue-300'
        }`}>
          <div className="flex items-center gap-3">
            {tutorRecord?.verification_status === 'verified' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : tutorRecord ? (
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
            )}
            <div className="text-xs">
              <div className="font-bold">
                {tutorRecord?.verification_status === 'verified'
                  ? 'Hồ sơ người dạy đã kích hoạt công khai'
                  : tutorRecord
                  ? 'Hồ sơ đang chờ Quản trị viên duyệt'
                  : 'Bạn chưa tạo hồ sơ Người Dạy công khai'}
              </div>
              <div className="text-slate-400">
                {tutorRecord?.verification_status === 'verified'
                  ? `Người học tại Huế có thể tìm kiếm và gửi yêu cầu học đến bạn. Đánh giá: ${tutorRecord.rating_avg} ★ (${tutorRecord.rating_count} lượt)`
                  : tutorRecord
                  ? 'Ban quản trị EduMate Huế sẽ kiểm tra chuyên môn và xác thực hồ sơ của bạn trong vòng 24h.'
                  : 'Hãy đăng ký hồ sơ giảng dạy để người học tại Huế có thể kết nối với bạn.'}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('academic')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{tutorRecord ? 'Xem danh bạ' : 'Đăng ký ngay'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Activity Statistics Metrics (Role-tailored for EduMate) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('my-requests')}
          className="glass-card rounded-2xl p-4 border border-slate-800 text-center space-y-1 cursor-pointer hover:border-blue-500/50 transition-colors"
        >
          <div className="text-2xl font-black text-blue-400">{learningRequests.length}</div>
          <div className="text-xs text-slate-400 font-medium">
            {currentUser.role === 'tutor' ? 'Yêu cầu nhận được' : 'Yêu cầu kết nối'}
          </div>
        </div>

        <div 
          onClick={() => onNavigate('my-requests')}
          className="glass-card rounded-2xl p-4 border border-slate-800 text-center space-y-1 cursor-pointer hover:border-emerald-500/50 transition-colors"
        >
          <div className="text-2xl font-black text-emerald-400">{activeRequests.length}</div>
          <div className="text-xs text-slate-400 font-medium">Lớp đang giảng dạy/học</div>
        </div>

        <div 
          onClick={() => onNavigate('my-requests')}
          className="glass-card rounded-2xl p-4 border border-slate-800 text-center space-y-1 cursor-pointer hover:border-violet-500/50 transition-colors"
        >
          <div className="text-2xl font-black text-violet-400">{completedRequests.length}</div>
          <div className="text-xs text-slate-400 font-medium">Đã hoàn thành</div>
        </div>

        <div 
          onClick={() => onNavigate('academic')}
          className="glass-card rounded-2xl p-4 border border-slate-800 text-center space-y-1 cursor-pointer hover:border-amber-500/50 transition-colors"
        >
          <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-1">
            {currentUser.role === 'tutor' && tutorRecord ? (
              <>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{tutorRecord.rating_avg.toFixed(1)}</span>
              </>
            ) : (
              <span>{userReviews.length}</span>
            )}
          </div>
          <div className="text-xs text-slate-400 font-medium">
            {currentUser.role === 'tutor' ? 'Điểm đánh giá' : 'Đánh giá đã gửi'}
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-700 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-400" />
            <span>Cập Nhật Thông Tin Cá Nhân</span>
          </h2>
          <p className="text-xs text-slate-400">
            Chỉnh sửa thông tin liên lạc và khu vực hoạt động tại Thừa Thiên Huế
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
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
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
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
              />
              {errors.phone && <p className="text-rose-400 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Khu vực tại Thừa Thiên Huế:
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {HUE_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
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
              <span className="text-[10px] text-slate-400">Email quản trị bởi EduMate Auth</span>
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

            <div className={currentUser.student_code ? '' : 'md:col-span-2'}>
              <label className="block text-slate-300 font-medium mb-1">
                Link ảnh đại diện (Avatar URL):
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">
                Giới thiệu bản thân / Mục tiêu học tập & giảng dạy:
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Chia sẻ ngắn về ngành học, trường đại học tại Huế (ĐH Khoa học, ĐH Sư phạm, ĐH Ngoại ngữ...) hoặc nguyện vọng học tập..."
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
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

      {/* ========================================================================= */}
      {/* TUTOR TEACHING PROFILE & SCHEDULE MANAGEMENT (QUY TRÌNH NGƯỜI DẠY) */}
      {/* ========================================================================= */}
      {currentUser.role === 'tutor' && (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-700 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>Quản Lý Hồ Sơ Giảng Dạy & Lịch Rảnh (Dành Cho Người Dạy)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Thiết lập môn học kèm trong 38 học phần đại học, mức phí và khung giờ rảnh nhận học viên
              </p>
            </div>
            {tutorRecord && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${
                tutorRecord.verification_status === 'verified'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : tutorRecord.verification_status === 'rejected'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
              }`}>
                {tutorRecord.verification_status === 'verified' ? '✓ Đã xác minh' : tutorRecord.verification_status === 'rejected' ? '✗ Bị từ chối' : '⏳ Chờ duyệt'}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveTutorProfile} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">
                  Tiêu đề chuyên môn / Năng lực nổi bật: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={tutorHeadline}
                  onChange={(e) => setTutorHeadline(e.target.value)}
                  placeholder="VD: Sinh viên K44 • Kèm ôn thi Toán ứng dụng, Kinh tế lượng & Thống kê"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Trường đại học tại Huế: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={tutorUniversity}
                  onChange={(e) => setTutorUniversity(e.target.value)}
                  placeholder="VD: Trường Đại học Kinh tế, Đại học Huế"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Khoa / Khóa học: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={tutorFaculty}
                  onChange={(e) => setTutorFaculty(e.target.value)}
                  placeholder="VD: Khoa Hệ thống thông tin kinh tế (K44)"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-slate-300 font-medium">
                  3 Gói học chuẩn hóa bạn nhận kèm (Chương 2.6.3 & 3.3 PDF):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {EDUMATE_PACKAGES.map((pkg) => {
                    const isChecked = tutorPackages.includes(pkg.id);
                    return (
                      <div
                        key={pkg.id}
                        onClick={() => toggleTutorPackage(pkg.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isChecked ? 'text-emerald-400' : 'text-slate-300'}`}>
                            {pkg.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-semibold text-slate-300">
                            {pkg.sessions} buổi
                          </span>
                        </div>
                        <div className="text-sm font-extrabold text-white mt-1">
                          {pkg.price.toLocaleString('vi-VN')} đ
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Thu nhập: <span className="text-emerald-400 font-semibold">{pkg.tutor_earnings.toLocaleString('vi-VN')} đ</span> (85%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Đơn giá chuẩn gói (VNĐ / buổi): <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  value={tutorHourlyRate}
                  onChange={(e) => setTutorHourlyRate(Number(e.target.value))}
                  min={30000}
                  step={5000}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Hình thức có thể giảng dạy: <span className="text-rose-400">*</span>
                </label>
                <select
                  value={tutorTeachingMode}
                  onChange={(e) => setTutorTeachingMode(e.target.value as TeachingMode)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="both">Cả trực tiếp tại Huế & Trực tuyến</option>
                  <option value="offline">Chỉ dạy kèm trực tiếp tại Huế</option>
                  <option value="online">Chỉ dạy trực tuyến (Google Meet / Zoom)</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-medium">
                    Học phần đại học bạn có khả năng kèm: ({tutorSubjects.length} đã chọn)
                  </label>
                  <span className="text-[10px] text-slate-500">Bấm để chọn/bỏ chọn</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 max-h-48 overflow-y-auto flex flex-wrap gap-1.5">
                  {EDUMATE_SUBJECTS.map((sub) => {
                    const isSelected = tutorSubjects.includes(sub.name);
                    return (
                      <button
                        type="button"
                        key={sub.code}
                        onClick={() => toggleTutorSubject(sub.name)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold shadow-sm'
                            : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{sub.name}</span>
                        <span className="opacity-60 text-[10px]">({sub.code})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-slate-300 font-medium">
                  Khung giờ & Lịch rảnh nhận học viên:
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tutorAvailableDays.map((day, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-xl bg-blue-950/40 text-blue-300 border border-blue-800/50 text-[11px] font-medium flex items-center space-x-1.5">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>{day}</span>
                      <button
                        type="button"
                        onClick={() => setTutorAvailableDays(prev => prev.filter((_, i) => i !== idx))}
                        className="text-blue-400 hover:text-rose-400 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newAvailableDay}
                    onChange={(e) => setNewAvailableDay(e.target.value)}
                    placeholder="VD: Tối thứ 3 (19h-21h), Chiều Chủ nhật..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newAvailableDay.trim() && !tutorAvailableDays.includes(newAvailableDay.trim())) {
                        setTutorAvailableDays(prev => [...prev, newAvailableDay.trim()]);
                        setNewAvailableDay('');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm lịch</span>
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-300 font-medium mb-1">
                  Chứng chỉ, điểm thi hoặc minh chứng năng lực (nếu có):
                </label>
                <input
                  type="text"
                  value={tutorCertifications}
                  onChange={(e) => setTutorCertifications(e.target.value)}
                  placeholder="VD: Điểm A+ Toán ứng dụng, Điểm A CSDL nâng cao, IELTS 7.5..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

            </div>

            <div className="flex items-center justify-end pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={tutorSaving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {tutorSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Lưu hồ sơ giảng dạy</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
