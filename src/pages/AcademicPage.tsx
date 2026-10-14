import React, { useState } from 'react';
import type { Profile, TutorProfile, UserRole, TeachingMode } from '../types';
import { dataService } from '../services/dataService';
import { EDUMATE_SUBJECTS, SUBJECT_CATEGORIES } from '../data/subjects';
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
  AlertCircle,
  BookOpen,
  Users,
  Filter,
  Check
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
  // Main view tab: 'tutors' (Danh bạ anh/chị khóa trước) or 'curriculum' (Bảng 38 học phần)
  const [activeTab, setActiveTab] = useState<'tutors' | 'curriculum'>('tutors');

  // Filter States for Tutors
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(300000);
  const [selectedSubjectCategory, setSelectedSubjectCategory] = useState<string>('all');

  // Filter States for 38 Curriculum Table
  const [curriculumSearch, setCurriculumSearch] = useState('');
  const [curriculumCategory, setCurriculumCategory] = useState<string>('all');

  // Registration Modal State (Quy trình B: Người dạy đăng ký hồ sơ)
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regFullName, setRegFullName] = useState(currentUser?.full_name || '');
  const [regHeadline, setRegHeadline] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regSubjects, setRegSubjects] = useState<string[]>([]);
  const [regCustomSubject, setRegCustomSubject] = useState('');
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
  const allTutors = dataService.getTutors(currentRole !== 'manager' && currentRole !== 'admin');

  // Filtered tutors logic
  const filteredTutors = allTutors.filter(tutor => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      tutor.full_name.toLowerCase().includes(term) ||
      tutor.headline.toLowerCase().includes(term) ||
      tutor.subjects.some(s => s.toLowerCase().includes(term));

    const matchesDistrict = selectedDistrict === 'all' || tutor.district.toLowerCase().includes(selectedDistrict.toLowerCase());

    const matchesMode = 
      selectedMode === 'all' || 
      tutor.teaching_mode === 'both' || 
      tutor.teaching_mode === selectedMode;

    const matchesPrice = tutor.hourly_rate <= maxPrice;

    // Check if any of tutor's subjects belong to selected subject category or contains subject keyword
    let matchesCategory = selectedSubjectCategory === 'all';
    if (!matchesCategory) {
      if (selectedSubjectCategory === 'Toán') {
        matchesCategory = tutor.subjects.some(s => s.toLowerCase().includes('toán') || s.toLowerCase().includes('thống kê') || s.toLowerCase().includes('kinh tế lượng'));
      } else if (selectedSubjectCategory === 'Tiếng Anh') {
        matchesCategory = tutor.subjects.some(s => s.toLowerCase().includes('tiếng anh') || s.toLowerCase().includes('ielts'));
      } else if (selectedSubjectCategory === 'Lập trình') {
        matchesCategory = tutor.subjects.some(s => s.toLowerCase().includes('lập trình') || s.toLowerCase().includes('cơ sở dữ liệu') || s.toLowerCase().includes('cấu trúc dữ liệu') || s.toLowerCase().includes('erp'));
      } else if (selectedSubjectCategory === 'Kinh tế') {
        matchesCategory = tutor.subjects.some(s => s.toLowerCase().includes('kinh tế') || s.toLowerCase().includes('kế toán') || s.toLowerCase().includes('tài chính'));
      } else if (selectedSubjectCategory === 'Lý luận') {
        matchesCategory = tutor.subjects.some(s => s.toLowerCase().includes('triết học') || s.toLowerCase().includes('tư tưởng') || s.toLowerCase().includes('chính trị') || s.toLowerCase().includes('pháp luật'));
      } else {
        matchesCategory = tutor.subjects.some(s => s.toLowerCase().includes(selectedSubjectCategory.toLowerCase()));
      }
    }

    return matchesSearch && matchesDistrict && matchesMode && matchesPrice && matchesCategory;
  });

  // Filtered 38 Subjects logic
  const filteredCurriculum = EDUMATE_SUBJECTS.filter(item => {
    const term = curriculumSearch.toLowerCase().trim();
    const matchesTerm = 
      !term || 
      item.code.toLowerCase().includes(term) || 
      item.name.toLowerCase().includes(term) ||
      item.category.toLowerCase().includes(term);

    const matchesCat = 
      curriculumCategory === 'all' || 
      item.category === curriculumCategory;

    return matchesTerm && matchesCat;
  });

  // Helper to count tutors teaching a subject
  const getTutorCountForSubject = (subjectName: string, subjectCode: string) => {
    const sName = subjectName.toLowerCase();
    const sCode = subjectCode.toLowerCase();
    return allTutors.filter(t => 
      t.subjects.some(s => {
        const lower = s.toLowerCase();
        return lower.includes(sName) || lower.includes(sCode);
      })
    ).length;
  };

  // Toggle subject in tutor registration
  const toggleSubjectForReg = (subjectName: string) => {
    setRegSubjects(prev => 
      prev.includes(subjectName)
        ? prev.filter(s => s !== subjectName)
        : [...prev, subjectName]
    );
  };

  // Handle Tutor Registration (Quy trình B)
  const handleRegisterTutorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regFullName.trim() || regFullName.trim().length < 2) {
      setRegError('Họ và tên người dạy phải có tối thiểu 2 ký tự.');
      return;
    }

    if (!regHeadline.trim() || regHeadline.trim().length < 5) {
      setRegError('Vui lòng nhập tiêu đề chuyên môn đầy đủ (tối thiểu 5 ký tự).');
      return;
    }

    const finalSubjects = [...regSubjects];
    if (regCustomSubject.trim() && !finalSubjects.includes(regCustomSubject.trim())) {
      finalSubjects.push(regCustomSubject.trim());
    }

    if (finalSubjects.length === 0) {
      setRegError('Vui lòng chọn ít nhất 1 học phần hoặc môn học có thể giảng dạy.');
      return;
    }

    if (regRate <= 0) {
      setRegError('Mức học phí đề xuất phải lớn hơn 0.');
      return;
    }

    try {
      const newTutor = dataService.registerTutorProfile({
        user_id: currentUser?.id || `usr-${Date.now()}`,
        full_name: regFullName.trim(),
        headline: regHeadline.trim(),
        bio: regBio.trim() || 'Sinh viên khóa trên chuyên trách chia sẻ tài liệu và kèm học phần tại Huế.',
        avatar_url: currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
        subjects: finalSubjects,
        hourly_rate: regRate,
        teaching_mode: regMode,
        district: regDistrict.trim(),
        experience_years: 2,
        available_days: regAvailableDays.split(',').map(d => d.trim()),
        certifications: regCertifications.trim() || undefined
      });

      setShowRegisterModal(false);
      showToast(
        'success', 
        'Đăng ký hồ sơ Người dạy thành công!', 
        `Hồ sơ của bạn (Mã: ${newTutor.id}) đã được gửi và chuyển sang trạng thái "Chờ duyệt". Quản trị viên EduMate sẽ thẩm định chuyên môn trước khi hiển thị công khai.`
      );
    } catch (err: any) {
      setRegError(err.message || 'Lỗi khi gửi hồ sơ đăng ký');
    }
  };

  // Handle Quick Request Submission (Quy trình D)
  const handleSendQuickRequest = (e: React.FormEvent) => {
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
        subject_name: requestSubject || selectedTutorForRequest.subjects[0] || 'Học phần đại học',
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

  // Switch to Tutors tab and filter by specific subject
  const handleFilterTutorsBySubject = (subjectName: string) => {
    setSearchTerm(subjectName);
    setSelectedSubjectCategory('all');
    setActiveTab('tutors');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER & ACTIONS */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
              <GraduationCap className="w-6 h-6 text-emerald-400" />
              <span>Tìm Đúng Anh/Chị Khóa Trước & Tra Cứu Học Phần</span>
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {activeTab === 'tutors' ? `${filteredTutors.length} anh/chị sẵn sàng` : `${filteredCurriculum.length} / 38 học phần`}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Nền tảng kết nối sinh viên Đại học Huế với anh/chị khóa trước (K43 - K46) • Chia sẻ đề cương, đề thi và kèm 1-1 theo 38 học phần chuẩn
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
            <span>Đăng ký làm Người dạy (Khóa trước)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW TABS SWITCHER: DANH BẠ ANH/CHỊ KHÓA TRƯỚC VS BẢNG 38 HỌC PHẦN */}
      {/* ========================================================================= */}
      <div className="flex items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-800 max-w-md">
        <button
          onClick={() => setActiveTab('tutors')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'tutors'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Danh Bạ Anh/Chị Khóa Trước ({allTutors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'curriculum'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Bảng 38 Học Phần Đại Học</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DANH BẠ ANH/CHỊ KHÓA TRƯỚC & BỘ LỌC */}
      {/* ========================================================================= */}
      {activeTab === 'tutors' && (
        <div className="space-y-6">
          {/* FILTER TOOLBAR */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              
              {/* Keyword Search */}
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tên anh/chị, mã môn (ECO2013, KTPT...)..."
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
              <span className="text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Khối ngành:</span>
              </span>
              <button
                onClick={() => setSelectedSubjectCategory('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedSubjectCategory === 'all'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Tất cả (38 môn)
              </button>
              <button
                onClick={() => setSelectedSubjectCategory('Kinh tế')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedSubjectCategory === 'Kinh tế'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Kinh tế & Kế toán
              </button>
              <button
                onClick={() => setSelectedSubjectCategory('Lập trình')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedSubjectCategory === 'Lập trình'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Hệ thống TT & Lập trình
              </button>
              <button
                onClick={() => setSelectedSubjectCategory('Toán')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedSubjectCategory === 'Toán'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Toán, Thống kê & Kinh tế lượng
              </button>
              <button
                onClick={() => setSelectedSubjectCategory('Lý luận')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedSubjectCategory === 'Lý luận'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Lý luận Chính trị & Xã hội
              </button>
              <button
                onClick={() => setSelectedSubjectCategory('Tiếng Anh')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedSubjectCategory === 'Tiếng Anh'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Tiếng Anh chuyên ngành
              </button>
            </div>
          </div>

          {/* TUTOR CARDS GRID */}
          {filteredTutors.length === 0 ? (
            <EmptyState
              title="Không tìm thấy anh/chị khóa trước phù hợp"
              description="Thử mở rộng bộ lọc mức phí hoặc chọn xem trực tiếp danh sách 38 học phần đại học để gửi yêu cầu."
              actionText="Xem 38 Học phần Đại học"
              onAction={() => setActiveTab('curriculum')}
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
                              ({tutor.rating_count} đánh giá)
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
                        Học phần đại học có thể hướng dẫn kèm:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tutor.subjects.map((subj, idx) => (
                          <span
                            key={idx}
                            onClick={() => handleFilterTutorsBySubject(subj)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-emerald-300 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-colors"
                            title="Bấm để lọc theo môn này"
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BẢNG TRA CỨU 38 HỌC PHẦN ĐẠI HỌC (CHUẨN HÓA THEO YÊU CẦU) */}
      {/* ========================================================================= */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          
          {/* CURRICULUM CONTROLS */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={curriculumSearch}
                  onChange={(e) => setCurriculumSearch(e.target.value)}
                  placeholder="Tra cứu theo mã học phần (ECO2013, KTPT...) hoặc tên môn..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={curriculumCategory}
                onChange={(e) => setCurriculumCategory(e.target.value)}
                className="px-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer sm:w-64"
              >
                <option value="all">Tất cả khối ngành (38 môn)</option>
                {SUBJECT_CATEGORIES.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1">
              <span>Hiển thị <strong>{filteredCurriculum.length}</strong> trên tổng số 38 học phần</span>
              <span className="text-[11px] text-emerald-400">Nhấn "Tìm anh/chị" để xem danh sách anh/chị khóa trước kèm từng môn tương ứng</span>
            </div>
          </div>

          {/* TABLE OF 38 SUBJECTS */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4 w-14 text-center">STT</th>
                    <th className="py-3.5 px-4 w-32">Mã học phần</th>
                    <th className="py-3.5 px-4 min-w-[220px]">Tên học phần</th>
                    <th className="py-3.5 px-4 hidden md:table-cell min-w-[200px]">Khối chuyên ngành</th>
                    <th className="py-3.5 px-3 text-center w-20">Tín chỉ</th>
                    <th className="py-3.5 px-4 text-center w-28">Khóa trước kèm</th>
                    <th className="py-3.5 px-4 text-right w-48">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCurriculum.map((item) => {
                    const tutorCount = getTutorCountForSubject(item.name, item.code);
                    return (
                      <tr 
                        key={item.code}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                          {item.stt}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                          <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            {item.code}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {item.description}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span className="font-mono font-semibold text-slate-300">
                            {item.credits} TC
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {tutorCount > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {tutorCount} sẵn sàng
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] text-slate-400 bg-slate-900 border border-slate-800">
                              Chờ kết nối
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleFilterTutorsBySubject(item.name)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1"
                              title={`Xem anh/chị khóa trước kèm môn ${item.name}`}
                            >
                              <Search className="w-3 h-3 text-emerald-400" />
                              <span>Tìm anh/chị</span>
                            </button>

                            <button
                              onClick={() => {
                                const matchingTutor = allTutors.find(t => 
                                  t.subjects.some(s => s.toLowerCase().includes(item.name.toLowerCase()) || s.toLowerCase().includes(item.code.toLowerCase()))
                                ) || allTutors[0];
                                
                                setRequestError('');
                                setRequestSubject(`${item.name} (${item.code})`);
                                setSelectedTutorForRequest(matchingTutor);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-[11px] font-bold transition-all shadow-sm cursor-pointer flex items-center space-x-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Gửi yêu cầu</span>
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ĐĂNG KÝ LÀM NGƯỜI DẠY (QUY TRÌNH B) */}
      {/* ========================================================================= */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Đăng ký Hồ sơ Người dạy (Dành cho Anh/Chị Khóa Trước)</h3>
                  <p className="text-[11px] text-slate-400">Dành cho sinh viên khóa trên, cựu sinh viên giỏi chia sẻ đề thi, tài liệu và kèm 1-1 cho các em khóa dưới</p>
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

            <form onSubmit={handleRegisterTutorSubmit} className="space-y-4 text-xs">
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
                <label className="block text-slate-300 font-semibold mb-1">Tiêu đề chuyên môn / Năng lực nổi bật *</label>
                <input
                  type="text"
                  value={regHeadline}
                  onChange={(e) => setRegHeadline(e.target.value)}
                  placeholder="VD: Sinh viên K44 • Kèm ôn thi Toán ứng dụng, Kinh tế lượng & Thống kê"
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* SUBJECT CHIP PICKER FROM 38 SUBJECTS */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-300 font-semibold">
                    Chọn học phần đại học bạn có thể dạy kèm: * ({regSubjects.length} đã chọn)
                  </label>
                  <span className="text-[10px] text-slate-400">Bấm để chọn/bỏ chọn</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 max-h-48 overflow-y-auto flex flex-wrap gap-1.5">
                  {EDUMATE_SUBJECTS.map((sub) => {
                    const isSelected = regSubjects.includes(sub.name);
                    return (
                      <button
                        type="button"
                        key={sub.code}
                        onClick={() => toggleSubjectForReg(sub.name)}
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

                <div className="mt-2 flex items-center space-x-2">
                  <input
                    type="text"
                    value={regCustomSubject}
                    onChange={(e) => setRegCustomSubject(e.target.value)}
                    placeholder="Thêm môn/kỹ năng khác (nếu có)..."
                    className="flex-1 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (regCustomSubject.trim() && !regSubjects.includes(regCustomSubject.trim())) {
                        setRegSubjects(prev => [...prev, regCustomSubject.trim()]);
                        setRegCustomSubject('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Thêm
                  </button>
                </div>
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
                    placeholder="VD: TP. Huế, Hương Thủy, Phú Vang"
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Giới thiệu kinh nghiệm & phương pháp giảng dạy *</label>
                <textarea
                  rows={2}
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  placeholder="Kinh nghiệm dạy kèm học phần, điểm số môn học, phương pháp giải bài tập lớn và hỗ trợ đề cương ôn thi..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chứng chỉ / Minh chứng chuyên môn (nếu có)</label>
                <input
                  type="text"
                  value={regCertifications}
                  onChange={(e) => setRegCertifications(e.target.value)}
                  placeholder="VD: Bằng Cử nhân Xuất sắc ĐH Kinh tế Huế, Điểm A học phần, Giải Olympic..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  Gửi hồ sơ xét duyệt
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: GỬI YÊU CẦU HỌC TẬP (QUY TRÌNH D) */}
      {/* ========================================================================= */}
      {selectedTutorForRequest && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedTutorForRequest.avatar_url}
                  alt={selectedTutorForRequest.full_name}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">Gửi yêu cầu học đến {selectedTutorForRequest.full_name}</h3>
                  <p className="text-[11px] text-emerald-400 font-medium">Học phí: {selectedTutorForRequest.hourly_rate.toLocaleString('vi-VN')} đ/buổi</p>
                </div>
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

            <form onSubmit={handleSendQuickRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Môn học / Học phần cần học *</label>
                <select
                  value={requestSubject}
                  onChange={(e) => setRequestSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <optgroup label="Học phần anh/chị chuyên trách kèm">
                    {selectedTutorForRequest.subjects.map((sub, i) => (
                      <option key={`tut-${i}`} value={sub}>{sub}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Các học phần đại học khác trong chương trình">
                    {EDUMATE_SUBJECTS.map((sub) => (
                      <option key={sub.code} value={`${sub.name} (${sub.code})`}>
                        {sub.name} ({sub.code})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hình thức học *</label>
                  <select
                    value={requestMode}
                    onChange={(e) => setRequestMode(e.target.value as 'online' | 'offline')}
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="offline">Trực tiếp tại Huế</option>
                    <option value="online">Trực tuyến (Meet / Zoom)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Khung giờ mong muốn *</label>
                  <input
                    type="text"
                    value={requestSchedule}
                    onChange={(e) => setRequestSchedule(e.target.value)}
                    placeholder="VD: Tối thứ 2, 4 (19h - 21h)"
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              {requestMode === 'offline' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Địa điểm / Khu vực học tại Huế *</label>
                  <input
                    type="text"
                    value={requestAddress}
                    onChange={(e) => setRequestAddress(e.target.value)}
                    placeholder="VD: Khu Ký túc xá ĐH Huế / Quán cafe học tập TP. Huế"
                    className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mục tiêu học tập & nội dung cần hỗ trợ * (tối thiểu 10 ký tự)</label>
                <textarea
                  rows={3}
                  value={requestGoals}
                  onChange={(e) => setRequestGoals(e.target.value)}
                  placeholder="VD: Em cần anh/chị hỗ trợ ôn tập đề cương, giải bài tập lớn và củng cố kiến thức trước kỳ thi cuối kỳ..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ghi chú bổ sung (nếu có)</label>
                <input
                  type="text"
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="VD: Em muốn học thử 1 buổi trước khi quyết định khóa 6 buổi..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedTutorForRequest(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer flex items-center space-x-1.5"
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
      {/* MODAL 3: XEM ĐÁNH GIÁ CỦA NGƯỜI HỌC (QUY TRÌNH E) */}
      {/* ========================================================================= */}
      {selectedTutorForReviews && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="text-base font-bold text-white">Đánh giá anh/chị: {selectedTutorForReviews.full_name}</h3>
              </div>
              <button
                onClick={() => setSelectedTutorForReviews(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="text-3xl font-black text-amber-400">
                {selectedTutorForReviews.rating_avg > 0 ? selectedTutorForReviews.rating_avg.toFixed(1) : 'Chưa có'}
              </div>
              <div className="text-xs text-slate-400">
                <div className="font-bold text-white">Điểm đánh giá trung bình</div>
                <div>Tính toán thực tế từ {selectedTutorForReviews.rating_count} lượt đánh giá sau khi hoàn thành buổi học</div>
              </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {dataService.getReviews().filter(r => r.tutor_id === selectedTutorForReviews.id).length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4">
                  Chưa có đánh giá nào cho anh/chị này. Đánh giá chỉ được tạo sau khi học viên hoàn thành buổi học kèm.
                </p>
              ) : (
                dataService.getReviews()
                  .filter(r => r.tutor_id === selectedTutorForReviews.id)
                  .map(rev => (
                    <div key={rev.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{rev.student_name}</span>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-300">{rev.comment}</p>
                      <div className="text-[10px] text-slate-500">{new Date(rev.created_at).toLocaleDateString('vi-VN')}</div>
                    </div>
                  ))
              )}
            </div>

            <div className="pt-2 text-right border-t border-slate-800">
              <button
                onClick={() => setSelectedTutorForReviews(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
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
