import React, { useState } from 'react';
import type { Profile, TutorProfile, UserRole, TeachingMode } from '../types';
import { dataService } from '../services/dataService';
import { EmptyState } from '../components/common/EmptyState';
import { 
  GraduationCap, 
  Search, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Plus, 
  Send, 
  X, 
  Award,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface AcademicPageProps {
  currentUser: Profile | null;
  currentRole: UserRole;
  onNavigate: (page: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AcademicPage: React.FC<AcademicPageProps> = ({
  currentUser,
  currentRole,
  onNavigate,
  showToast,
}) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Registration Modal State (Quy trình B: Người dạy đăng ký hồ sơ)
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regFullName, setRegFullName] = useState(currentUser?.full_name || '');
  const [regHeadline, setRegHeadline] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regSubjects, setRegSubjects] = useState('');
  const [regRate, setRegRate] = useState(120000);
  const [regMode, setRegMode] = useState<TeachingMode>('both');
  const [regDistrict, setRegDistrict] = useState('TP. Huế');
  const [regCertifications, setRegCertifications] = useState('');
  const [regAvailableDays] = useState('Tối thứ 2, Tối thứ 4, Chủ nhật');
  const [regError, setRegError] = useState('');

  // Quick Request Modal State (Quy trình D: Gửi yêu cầu học)
  const [selectedTutorForRequest, setSelectedTutorForRequest] = useState<TutorProfile | null>(null);
  const [requestGoals, setRequestGoals] = useState('');
  const [requestSubject, setRequestSubject] = useState('');
  const [requestMode, setRequestMode] = useState<'online' | 'offline'>('offline');
  const [requestSchedule, setRequestSchedule] = useState('');
  const [requestAddress, setRequestAddress] = useState('Khu vực TP. Huế');
  const [requestNotes, setRequestNotes] = useState('');
  const [requestError, setRequestError] = useState('');

  // Expanded Reviews Modal State
  const [selectedTutorForReviews, setSelectedTutorForReviews] = useState<TutorProfile | null>(null);

  // Load tutors
  // If Manager/Admin, show all. If Learner/Guest, show verified only.
  const allTutors = dataService.getTutors(currentRole !== 'manager' && currentRole !== 'admin');

  // Filtered tutors logic
  const filteredTutors = allTutors.filter(tutor => {
    // Search by Name, Headline, Subjects
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      tutor.full_name.toLowerCase().includes(term) ||
      tutor.headline.toLowerCase().includes(term) ||
      tutor.subjects.some(s => s.toLowerCase().includes(term));

    // District filter
    const matchesDistrict = selectedDistrict === 'all' || tutor.district.toLowerCase().includes(selectedDistrict.toLowerCase());

    // Mode filter
    const matchesMode = 
      selectedMode === 'all' || 
      tutor.teaching_mode === 'both' || 
      tutor.teaching_mode === selectedMode;

    // Price filter
    const matchesPrice = tutor.hourly_rate <= maxPrice;

    // Category filter
    const matchesCategory = selectedSubject === 'all' || tutor.subjects.some(s => s.toLowerCase().includes(selectedSubject.toLowerCase()));

    return matchesSearch && matchesDistrict && matchesMode && matchesPrice && matchesCategory;
  });

  // Handle Tutor Registration (Quy trình B)
  const handleRegisterTutorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('info', 'Yêu cầu đăng nhập', 'Vui lòng đăng nhập tài khoản trước khi đăng ký hồ sơ người dạy.');
      onNavigate('auth');
      return;
    }

    if (!regFullName.trim() || regFullName.trim().length < 2) {
      setRegError('Họ và tên không được để trống.');
      return;
    }
    if (!regHeadline.trim() || regHeadline.trim().length < 5) {
      setRegError('Tiêu đề giới thiệu chuyên môn quá ngắn (tối thiểu 5 ký tự).');
      return;
    }
    if (!regSubjects.trim()) {
      setRegError('Vui lòng nhập ít nhất 1 môn học hoặc kỹ năng có thể hướng dẫn.');
      return;
    }
    if (regRate < 50000) {
      setRegError('Mức học phí đề xuất tối thiểu là 50.000 đ/buổi.');
      return;
    }

    try {
      const subjectList = regSubjects.split(',').map(s => s.trim()).filter(Boolean);
      dataService.registerTutorProfile({
        user_id: currentUser.id,
        full_name: regFullName.trim(),
        headline: regHeadline.trim(),
        bio: regBio.trim() || 'Người dạy tâm huyết tại Huế.',
        avatar_url: currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        subjects: subjectList,
        hourly_rate: regRate,
        teaching_mode: regMode,
        district: regDistrict,
        experience_years: 2,
        available_days: regAvailableDays.split(',').map(d => d.trim()),
        certifications: regCertifications.trim() || 'Chứng chỉ chuyên môn đang cập nhật'
      });

      setShowRegisterModal(false);
      showToast('success', 'Đăng ký hồ sơ thành công!', 'Hồ sơ của bạn đã được gửi và chuyển sang trạng thái "Chờ duyệt" bởi Quản trị viên EduMate.');
    } catch (err: any) {
      setRegError(err.message || 'Lỗi khi gửi hồ sơ');
    }
  };

  // Handle Quick Request Submit (Quy trình D)
  const handleSendRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('info', 'Yêu cầu đăng nhập', 'Vui lòng đăng nhập tài khoản Người học để gửi yêu cầu học.');
      onNavigate('auth');
      return;
    }

    if (!selectedTutorForRequest) return;

    if (!requestGoals.trim() || requestGoals.trim().length < 10) {
      setRequestError('Vui lòng mô tả mục tiêu/nội dung cần học tối thiểu 10 ký tự.');
      return;
    }

    try {
      const newReq = dataService.createLearningRequest({
        student_id: currentUser.id,
        student_name: currentUser.full_name,
        student_email: currentUser.email,
        student_phone: currentUser.phone,
        tutor_id: selectedTutorForRequest.id,
        tutor_name: selectedTutorForRequest.full_name,
        subject_name: requestSubject || selectedTutorForRequest.subjects[0] || 'Chuyên đề học tập',
        teaching_mode: requestMode,
        preferred_schedule: requestSchedule || 'Tối trong tuần (19:00 - 21:00)',
        learning_goals: requestGoals.trim(),
        address: requestMode === 'offline' ? requestAddress.trim() : undefined,
        notes: requestNotes.trim() || undefined
      });

      setSelectedTutorForRequest(null);
      setRequestGoals('');
      setRequestNotes('');
      showToast('success', 'Gửi yêu cầu học thành công!', `Mã yêu cầu: ${newReq.request_code}. Trạng thái: Chờ người dạy xác nhận.`);
      onNavigate('my-requests');
    } catch (err: any) {
      setRequestError(err.message || 'Không thể gửi yêu cầu');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER & ACTIONS */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
              <GraduationCap className="w-6 h-6 text-emerald-400" />
              <span>Tìm Đúng Người Dạy Tại Huế</span>
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {filteredTutors.length} hồ sơ khả dụng
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tra cứu gia sư, sinh viên xuất sắc và người hướng dẫn kỹ năng theo môn học, khu vực tại Huế và ngân sách
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setRegError('');
              setShowRegisterModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Đăng ký làm Người dạy</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILTER TOOLBAR */}
      {/* ========================================================================= */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Keyword Search */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tên người dạy, môn học..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* District Filter */}
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 pointer-events-none" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Tất cả khu vực tại Huế</option>
              <option value="TP. Huế">TP. Huế (Trung tâm)</option>
              <option value="Hương Thủy">TX. Hương Thủy</option>
              <option value="Hương Trà">TX. Hương Trà</option>
              <option value="Phú Vang">Huyện Phú Vang</option>
              <option value="Phú Lộc">Huyện Phú Lộc</option>
            </select>
          </div>

          {/* Teaching Mode Filter */}
          <div className="relative flex items-center">
            <Clock className="w-4 h-4 text-blue-400 absolute left-3 pointer-events-none" />
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">Tất cả hình thức học</option>
              <option value="offline">Trực tiếp tại Huế</option>
              <option value="online">Trực tuyến (Online)</option>
              <option value="both">Linh hoạt cả hai</option>
            </select>
          </div>

          {/* Max Price Filter */}
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
            <DollarSign className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>Mức phí tối đa:</span>
                <span className="font-bold text-emerald-400">{maxPrice.toLocaleString('vi-VN')} đ</span>
              </div>
              <input
                type="range"
                min="80000"
                max="300000"
                step="10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

        </div>

        {/* Quick Category Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-slate-500 mr-1">Chủ đề:</span>
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              selectedSubject === 'all'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setSelectedSubject('Toán')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              selectedSubject === 'Toán'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Toán cao cấp & Tự nhiên
          </button>
          <button
            onClick={() => setSelectedSubject('Tiếng Anh')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              selectedSubject === 'Tiếng Anh'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Tiếng Anh & IELTS
          </button>
          <button
            onClick={() => setSelectedSubject('Lập trình')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              selectedSubject === 'Lập trình'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Lập trình & CNTT
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TUTOR CARDS GRID */}
      {/* ========================================================================= */}
      {filteredTutors.length === 0 ? (
        <EmptyState
          title="Không tìm thấy người dạy phù hợp"
          description="Thử mở rộng bộ lọc mức phí hoặc tìm kiếm theo khu vực khác tại Huế."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTutors.map((tutor) => (
            <div
              key={tutor.id}
              className="glass-panel rounded-3xl border border-slate-800 hover:border-emerald-500/40 p-6 flex flex-col justify-between space-y-5 transition-all shadow-lg hover:shadow-2xl"
            >
              <div className="space-y-4">
                
                {/* Header: Avatar, Name, Verification badge & Rating */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={tutor.avatar_url}
                      alt={tutor.full_name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-bold text-white">
                          {tutor.full_name}
                        </h3>
                        {tutor.verification_status === 'verified' ? (
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center space-x-1"
                            title="Hồ sơ đã được Quản trị viên EduMate xác minh"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đã xác minh</span>
                          </span>
                        ) : (
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30"
                            title="Hồ sơ mới đăng ký, đang chờ Quản trị viên xem xét"
                          >
                            Chờ duyệt
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        {tutor.headline}
                      </p>

                      <div className="flex items-center space-x-2 mt-1.5 text-xs">
                        <button
                          onClick={() => setSelectedTutorForReviews(tutor)}
                          className="flex items-center space-x-1 text-amber-400 font-bold hover:underline cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{tutor.rating_avg > 0 ? tutor.rating_avg.toFixed(1) : 'Chưa có'}</span>
                        </button>
                        <span className="text-slate-500 text-[11px]">
                          ({tutor.rating_count} đánh giá sau buổi học)
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-[11px] text-slate-400">
                          {tutor.experience_years} năm KN
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hourly Rate Callout */}
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-slate-500">Mức phí đề xuất</div>
                    <div className="text-base font-black text-emerald-400">
                      {tutor.hourly_rate.toLocaleString('vi-VN')} đ
                    </div>
                    <div className="text-[10px] text-slate-400">/ buổi (2 giờ)</div>
                  </div>
                </div>

                {/* Bio text */}
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  {tutor.bio}
                </p>

                {/* Subject Tags */}
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Môn học / Kỹ năng có thể hướng dẫn:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tutor.subjects.map((subj, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-emerald-300 border border-slate-800"
                      >
                        {subj}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Location, Mode & Certifications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">Khu vực: {tutor.district}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>Hình thức: {tutor.teaching_mode === 'both' ? 'Trực tiếp & Online' : tutor.teaching_mode === 'offline' ? 'Trực tiếp tại Huế' : 'Chỉ dạy Online'}</span>
                  </div>
                  {tutor.certifications && (
                    <div className="sm:col-span-2 flex items-start space-x-2 text-[11px] text-slate-400">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{tutor.certifications}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedTutorForReviews(tutor)}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer border border-slate-800"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Xem đánh giá ({tutor.rating_count})</span>
                </button>

                <button
                  onClick={() => {
                    setRequestError('');
                    setRequestSubject(tutor.subjects[0] || '');
                    setRequestMode(tutor.teaching_mode === 'online' ? 'online' : 'offline');
                    setSelectedTutorForRequest(tutor);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi yêu cầu học</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: ĐĂNG KÝ LÀM NGƯỜI DẠY (QUY TRÌNH B) */}
      {/* ========================================================================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Đăng ký Hồ sơ Người dạy (Tutor)</h3>
                  <p className="text-[11px] text-slate-400">Gia nhập cộng đồng người dạy tại Huế • Hồ sơ sẽ được chuyển sang trạng thái Chờ duyệt</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterTutorSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="VD: Lê Hoàng Nam"
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mức phí đề xuất (VNĐ / buổi 2h) *</label>
                  <input
                    type="number"
                    value={regRate}
                    onChange={(e) => setRegRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tiêu đề chuyên môn / Định vị năng lực *</label>
                <input
                  type="text"
                  value={regHeadline}
                  onChange={(e) => setRegHeadline(e.target.value)}
                  placeholder="VD: Cử nhân Sư phạm Toán • Chuyên gia Toán cao cấp"
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Môn học / Kỹ năng có thể hướng dẫn (cách nhau bằng dấu phẩy) *</label>
                <input
                  type="text"
                  value={regSubjects}
                  onChange={(e) => setRegSubjects(e.target.value)}
                  placeholder="VD: Toán cao cấp, Giải tích, Xác suất thống kê"
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hình thức dạy *</label>
                  <select
                    value={regMode}
                    onChange={(e) => setRegMode(e.target.value as TeachingMode)}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="both">Cả trực tiếp tại Huế & Trực tuyến</option>
                    <option value="offline">Chỉ dạy trực tiếp tại Huế</option>
                    <option value="online">Chỉ dạy trực tuyến (Online)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Khu vực có thể dạy tại Huế *</label>
                  <input
                    type="text"
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    placeholder="VD: TP. Huế, Hương Thủy"
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Giới thiệu bản thân & Phương pháp giảng dạy</label>
                <textarea
                  rows={2}
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  placeholder="Nêu kinh nghiệm thực tế, phong cách giảng dạy, cam kết kết quả học tập..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chứng chỉ / Minh chứng năng lực</label>
                <input
                  type="text"
                  value={regCertifications}
                  onChange={(e) => setRegCertifications(e.target.value)}
                  placeholder="VD: Cử nhân Sư phạm loại Giỏi, IELTS 8.0, Giải Olympic..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30"
                >
                  Nộp hồ sơ chờ duyệt
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL: GỬI YÊU CẦU HỌC (QUY TRÌNH D) */}
      {/* ========================================================================= */}
      {selectedTutorForRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">
                  Gửi Yêu Cầu Học Đến: {selectedTutorForRequest.full_name}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Phí đề xuất: {selectedTutorForRequest.hourly_rate.toLocaleString('vi-VN')} đ/buổi • Yêu cầu sẽ ở trạng thái Chờ xác nhận
                </p>
              </div>
              <button
                onClick={() => setSelectedTutorForRequest(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {requestError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{requestError}</span>
              </div>
            )}

            <form onSubmit={handleSendRequestSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Môn học cần kèm *</label>
                <select
                  value={requestSubject}
                  onChange={(e) => setRequestSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  {selectedTutorForRequest.subjects.map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hình thức học *</label>
                  <select
                    value={requestMode}
                    onChange={(e) => setRequestMode(e.target.value as 'online' | 'offline')}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="offline">Trực tiếp tại Huế</option>
                    <option value="online">Trực tuyến qua Google Meet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Khung giờ rảnh mong muốn *</label>
                  <input
                    type="text"
                    value={requestSchedule}
                    onChange={(e) => setRequestSchedule(e.target.value)}
                    placeholder="VD: Tối thứ 2, 4 (19h-21h)"
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {requestMode === 'offline' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Địa chỉ học trực tiếp tại Huế</label>
                  <input
                    type="text"
                    value={requestAddress}
                    onChange={(e) => setRequestAddress(e.target.value)}
                    placeholder="VD: Ký túc xá ĐH Huế hoặc Nhà riêng..."
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nội dung / Mục tiêu cần học (Tối thiểu 10 ký tự) *</label>
                <textarea
                  rows={3}
                  value={requestGoals}
                  onChange={(e) => setRequestGoals(e.target.value)}
                  placeholder="Nêu rõ kiến thức bị hổng, bài tập cần hỗ trợ hoặc kỳ thi đang chuẩn bị..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ghi chú thêm cho người dạy</label>
                <input
                  type="text"
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="VD: Cần học gấp trong 2 tuần tới..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTutorForRequest(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Xác nhận gửi yêu cầu</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: XEM ĐÁNH GIÁ (REVIEWS) TỪ HỌC VIÊN ĐÃ HOÀN THÀNH */}
      {/* ========================================================================= */}
      {selectedTutorForReviews && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedTutorForReviews.avatar_url}
                  alt={selectedTutorForReviews.full_name}
                  className="w-10 h-10 rounded-xl object-cover ring-1 ring-emerald-500/40"
                />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Đánh giá: {selectedTutorForReviews.full_name}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{selectedTutorForReviews.rating_avg.toFixed(1)} / 5.0</span>
                    <span className="text-slate-500 font-normal">({selectedTutorForReviews.rating_count} nhận xét đã đối soát)</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTutorForReviews(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
              {dataService.getReviews(selectedTutorForReviews.id).length === 0 ? (
                <p className="text-slate-400 italic py-4 text-center">
                  Chưa có nhận xét nào được ghi nhận cho người dạy này.
                </p>
              ) : (
                dataService.getReviews(selectedTutorForReviews.id).map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{rev.student_name}</span>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      "{rev.comment}"
                    </p>
                    <div className="text-[10px] text-slate-500 pt-1">
                      Xác nhận hoàn thành khóa học vào {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 text-right border-t border-slate-800">
              <button
                onClick={() => setSelectedTutorForReviews(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
