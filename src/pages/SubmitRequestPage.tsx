import React, { useState } from 'react';
import type { Profile, CoursePackageType } from '../types';
import { EDUMATE_PACKAGES } from '../types';
import { dataService } from '../services/dataService';
import {
  Send,
  MapPin,
  CheckCircle2,
  Sparkles,
  Info,
  Percent
} from 'lucide-react';

interface SubmitRequestPageProps {
  currentUser: Profile;
  onNavigate: (page: string, params?: any) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const SubmitRequestPage: React.FC<SubmitRequestPageProps> = ({
  currentUser,
  onNavigate,
  showToast,
}) => {
  const verifiedTutors = dataService.getTutors(true);
  const [selectedTutorId, setSelectedTutorId] = useState<string>(verifiedTutors[0]?.id || '');
  const [selectedPackageType, setSelectedPackageType] = useState<CoursePackageType>('trial');
  const [subject, setSubject] = useState<string>(verifiedTutors[0]?.subjects[0] || 'Toán ứng dụng trong kinh tế');
  const [mode, setMode] = useState<'offline' | 'online'>('offline');
  const [schedule, setSchedule] = useState<string>('Tối thứ 2, 4, 6 (19:00 - 21:00)');
  const [address, setAddress] = useState<string>('TP. Huế (Khu Ký túc xá ĐH Huế, 42 Lê Hồng Phong)');
  const [goals, setGoals] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const selectedTutor = verifiedTutors.find(t => t.id === selectedTutorId) || verifiedTutors[0];
  const selectedPkg = EDUMATE_PACKAGES.find(p => p.id === selectedPackageType) || EDUMATE_PACKAGES[0];

  const handleTutorChange = (tutorId: string) => {
    setSelectedTutorId(tutorId);
    const tutor = verifiedTutors.find(t => t.id === tutorId);
    if (tutor && tutor.subjects.length > 0) {
      setSubject(tutor.subjects[0]);
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!goals.trim()) {
      errs.goals = 'Vui lòng nêu rõ mục tiêu hoặc nội dung kiến thức bạn cần anh/chị khóa trước hỗ trợ.';
    } else if (goals.trim().length < 10) {
      errs.goals = 'Nội dung mục tiêu quá ngắn (tối thiểu 10 ký tự để anh/chị nắm bắt).';
    }

    if (!schedule.trim()) {
      errs.schedule = 'Vui lòng nhập khung giờ rảnh mong muốn của bạn.';
    }

    if (mode === 'offline' && !address.trim()) {
      errs.address = 'Vui lòng nhập khu vực hoặc địa chỉ dự kiến học tại Huế.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!validate()) {
      showToast('error', 'Biểu mẫu chưa hợp lệ', 'Vui lòng kiểm tra lại các trường được đánh dấu đỏ');
      return;
    }

    if (!selectedTutor) {
      showToast('error', 'Chưa chọn người dạy', 'Vui lòng chọn anh/chị khóa trước trong danh sách');
      return;
    }

    setLoading(true);

    try {
      const newReq = dataService.createLearningRequest({
        student_id: currentUser.id,
        student_name: currentUser.full_name,
        student_email: currentUser.email,
        student_phone: currentUser.phone,
        tutor_id: selectedTutor.id,
        tutor_name: selectedTutor.full_name,
        subject_name: subject,
        package_type: selectedPackageType,
        package_name: selectedPkg.name,
        total_sessions: selectedPkg.sessions,
        total_price: selectedPkg.price,
        platform_fee: selectedPkg.platform_fee,
        tutor_earnings: selectedPkg.tutor_earnings,
        teaching_mode: mode,
        preferred_schedule: schedule.trim(),
        learning_goals: goals.trim(),
        address: mode === 'offline' ? address.trim() : undefined,
        notes: notes.trim() || undefined
      });

      showToast(
        'success',
        'Gửi yêu cầu học theo gói thành công!',
        `Mã yêu cầu: ${newReq.request_code} (${selectedPkg.name} - ${selectedPkg.sessions} buổi). Đang chuyển đến cổng thanh toán VietQR...`
      );
      onNavigate('payment', { requestId: newReq.id, paymentIntentId: newReq.payment_intent_id });
    } catch (err: any) {
      showToast('error', 'Lỗi gửi yêu cầu', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">

      {/* Page Title */}
      <div className="space-y-1.5 pb-2 border-b border-slate-800">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quy trình gửi yêu cầu học theo gói chuẩn hóa (Chương 4.3 PDF)</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
          <Send className="w-6 h-6 text-emerald-400" />
          <span>Biểu Mẫu Gửi Yêu Cầu Học Tập</span>
        </h1>
        <p className="text-xs text-slate-400">
          Chọn người dạy thuộc Trường Đại học Kinh tế & ĐH Huế, lựa chọn gói học phù hợp và gửi yêu cầu kèm lịch rảnh mong muốn
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-2xl space-y-6">

        {/* Selected Tutor Card preview */}
        {selectedTutor && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <img
                src={selectedTutor.avatar_url}
                alt={selectedTutor.full_name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
              />
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-bold text-white">{selectedTutor.full_name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center space-x-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Đã duyệt</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium line-clamp-1">{selectedTutor.headline}</p>
                <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedTutor.district}</span>
                  </span>
                  <span>•</span>
                  <span className="text-slate-400">{selectedTutor.university || 'Trường Đại học Kinh tế, Đại học Huế'}</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
              <div className="text-[10px] text-slate-400">Đơn giá học kèm chuẩn</div>
              <div className="text-sm font-extrabold text-emerald-400">
                30.000 đ <span className="text-[10px] text-slate-400 font-normal">/ buổi</span>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">

          {/* Select Tutor Dropdown */}
          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              Anh/Chị khóa trước tiếp nhận yêu cầu *
            </label>
            <select
              value={selectedTutorId}
              onChange={(e) => handleTutorChange(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {verifiedTutors.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name} – {t.headline} ({t.district})
                </option>
              ))}
            </select>
          </div>

          {/* STANDARDIZED COURSE PACKAGE SELECTION (CHƯƠNG 2.6.3 & CHƯƠNG 3.3 CỦA PDF) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-200 font-semibold">
                Lựa chọn Gói học chuẩn hóa theo Đồ án EduMate: *
              </label>
              <span className="text-[11px] text-emerald-400 font-medium">Đồng giá 30.000 đ/buổi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {EDUMATE_PACKAGES.map((pkg) => {
                const isSelected = selectedPackageType === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageType(pkg.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                        {pkg.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 font-bold text-slate-300 border border-slate-800">
                        {pkg.sessions} buổi
                      </span>
                    </div>

                    <div className="text-base font-black text-white mt-2">
                      {pkg.price.toLocaleString('vi-VN')} đ
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {pkg.description}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] space-y-0.5">
                      <div className="text-slate-400 flex justify-between">
                        <span>Đơn giá mỗi buổi:</span>
                        <span className="text-white font-medium">{pkg.price_per_session.toLocaleString('vi-VN')} đ / buổi</span>
                      </div>
                      <div className="text-slate-400 flex justify-between">
                        <span>Học phí người học đóng:</span>
                        <span className="text-emerald-400 font-bold">{pkg.price.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject & Teaching Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-200 font-semibold mb-1">
                Môn học / Kỹ năng thực hành cần học *
              </label>
              {selectedTutor?.subjects && selectedTutor.subjects.length > 0 ? (
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {selectedTutor.subjects.map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="VD: Toán ứng dụng, Excel kinh tế, Canva..."
                  className="w-full px-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              )}
            </div>

            <div>
              <label className="block text-slate-200 font-semibold mb-1">
                Hình thức học mong muốn *
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'offline' | 'online')}
                className="w-full px-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="offline">Học kèm trực tiếp tại Huế</option>
                <option value="online">Học trực tuyến qua Google Meet / Zoom</option>
              </select>
            </div>
          </div>

          {/* Preferred Schedule & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-200 font-semibold mb-1">
                Khung thời gian rảnh mong muốn *
              </label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="VD: Tối thứ 2, 4, 6 (19h - 21h)"
                className="w-full px-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
              />
              {errors.schedule && <p className="text-rose-400 text-[11px] mt-1">{errors.schedule}</p>}
            </div>

            {mode === 'offline' && (
              <div>
                <label className="block text-slate-200 font-semibold mb-1">
                  Khu vực / Địa chỉ học tại Huế *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="VD: Ký túc xá ĐH Huế, 42 Lê Hồng Phong..."
                  className="w-full px-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
                {errors.address && <p className="text-rose-400 text-[11px] mt-1">{errors.address}</p>}
              </div>
            )}
          </div>

          {/* Goals / Needs */}
          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              Mục tiêu học tập & Nội dung cần anh/chị hỗ trợ (Tối thiểu 10 ký tự) *
            </label>
            <textarea
              rows={3}
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Nêu rõ tình trạng học tập hiện tại, phần kiến thức bị hổng, kỳ thi hoặc bài tập lớn đang cần anh/chị kèm..."
              className="w-full px-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            />
            {errors.goals && <p className="text-rose-400 text-[11px] mt-1">{errors.goals}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              Ghi chú thêm cho anh/chị khóa trước
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Em muốn dành 1 buổi đầu để hệ thống lại các dạng bài tập..."
              className="w-full px-3 py-2.5 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Financial Summary Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <Percent className="w-4 h-4 text-emerald-400" />
              <span>Tóm tắt chi phí gói học: {selectedPkg.name}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Gói học lựa chọn:</span>
                <span className="font-bold text-white">{selectedPkg.name} ({selectedPkg.sessions} buổi)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Đơn giá mỗi buổi:</span>
                <span className="font-bold text-white">{selectedPkg.price_per_session.toLocaleString('vi-VN')} đ / buổi</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Học phí người học đóng:</span>
                <span className="font-bold text-emerald-400 text-sm">{selectedPkg.price.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>

          {/* Notice box */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Yêu cầu sau khi gửi sẽ ở trạng thái <strong>Chờ xác nhận</strong> (Bước 3). Người dạy sẽ xem xét và phản hồi trong vòng 24 giờ (Bước 4). Bạn có thể theo dõi tiến độ hoặc hủy yêu cầu tại mục <em>Yêu cầu & Lịch dạy</em>.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={() => onNavigate('academic')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-all cursor-pointer"
            >
              Xem người dạy khác
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Gửi yêu cầu và thanh toán ({selectedPkg.price.toLocaleString('vi-VN')} đ)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
