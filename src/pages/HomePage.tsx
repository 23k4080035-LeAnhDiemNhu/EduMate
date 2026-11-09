import React, { useState } from 'react';
import type { UserRole } from '../types';
import { dataService } from '../services/dataService';
import { EDUMATE_PACKAGES } from '../types';
import { 
  GraduationCap, 
  Search, 
  MapPin, 
  BookOpen, 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Users, 
  Check 
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, params?: { search?: string; district?: string; category?: string; tutorId?: string; packageType?: string }) => void;
  currentRole: UserRole;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, currentRole }) => {
  const [searchSubject, setSearchSubject] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  const categories = dataService.getSubjectCategories();
  const tutors = dataService.getTutors(true); // Chỉ lấy người dạy Đã duyệt (verified)
  const packages = EDUMATE_PACKAGES;
  const contentGroups = dataService.getContentGroups();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('academic', {
      search: searchSubject.trim(),
      district: selectedDistrict
    });
  };

  return (
    <div className="space-y-16 animate-fadeIn pb-12">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION & BRAND SLOGAN */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-4 pb-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đề Án Khởi Nghiệp Đổi Mới Sáng Tạo • Trường Đại học Kinh tế, Đại học Huế</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            “Tìm đúng người dạy – <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Học đúng điều cần.”
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            EduMate là nền tảng số kết nối sinh viên Đại học Huế với các <strong>anh/chị khóa trước đạt điểm A/A+</strong>, giải quyết trực tiếp nhu cầu về <strong>Kỹ năng thực hành</strong>, <strong>Môn học đại cương</strong> và <strong>Môn học chuyên ngành</strong> với mô hình gói học minh bạch, tiết kiệm.
          </p>

          {/* Quick Search Bar */}
          <div className="pt-2 max-w-3xl mx-auto">
            <form 
              onSubmit={handleSearchSubmit}
              className="p-2 sm:p-3 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-2xl backdrop-blur-md grid grid-cols-1 sm:grid-cols-12 gap-2 text-left"
            >
              {/* Keyword / Subject input */}
              <div className="sm:col-span-5 relative flex items-center">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchSubject}
                  onChange={(e) => setSearchSubject(e.target.value)}
                  placeholder="Môn học (Kinh tế lượng, Kế toán...) hoặc kỹ năng (Excel, Canva)..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* District select */}
              <div className="sm:col-span-4 relative flex items-center">
                <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 pointer-events-none" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="all">Tất cả khu vực tại Huế</option>
                  <option value="TP. Huế">TP. Huế (Trung tâm)</option>
                  <option value="Hương Thủy">TX. Hương Thủy</option>
                  <option value="Hương Trà">TX. Hương Trà</option>
                  <option value="Phú Vang">Huyện Phú Vang</option>
                  <option value="Phú Lộc">Huyện Phú Lộc</option>
                </select>
              </div>

              {/* Search Button */}
              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full h-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Tìm người dạy phù hợp</span>
                </button>
              </div>
            </form>
          </div>

          {/* Value Badges */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Hồ sơ người dạy được kiểm duyệt</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>3 Gói học chuẩn hóa: 30.000đ/buổi</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Hoàn tiền 100% nếu người dạy từ chối</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-teal-400" />
              <span>Học kèm 1-1 tại Huế hoặc Online</span>
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THREE CORE CONTENT PILLARS (CHƯƠNG 1 & 4 CỦA PDF) */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span>3 Trụ cột nội dung đào tạo trọng tâm</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Nội dung EduMate kết nối & hỗ trợ
          </h2>
          <p className="text-xs text-slate-400">
            Tập trung vào ba nhóm dịch vụ thiết thực nhất đối với sinh viên Trường Đại học Kinh tế và Đại học Huế
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contentGroups.map((group, idx) => (
            <div 
              key={group.id}
              onClick={() => onNavigate('academic')}
              className="glass-panel p-6 rounded-3xl border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/70 transition-all cursor-pointer space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  Trụ cột 0{idx + 1}
                </span>
                <span className="text-[11px] text-slate-400 group-hover:text-emerald-300 flex items-center space-x-1">
                  <span>Xem môn</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {group.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {group.short_desc}
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Môn/kỹ năng tiêu biểu:</div>
                <div className="flex flex-wrap gap-1.5">
                  {group.examples.map((ex, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THREE STANDARDIZED COURSE PACKAGES (CHƯƠNG 2.6.3 & CHƯƠNG 3.3 CỦA PDF) */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span>Chính sách giá & Doanh thu theo đồ án</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            3 Gói học chuẩn hóa – Chi phí tối ưu cho sinh viên
          </h2>
          <p className="text-xs text-slate-400">
            Mức giá đồng nhất <strong>30.000 đồng/buổi</strong> học kèm chất lượng. Học phí minh bạch, tiết kiệm tối ưu cho sinh viên.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div 
              key={pkg.id}
              className={`rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all relative ${
                pkg.popular 
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10'
                  : 'glass-panel border border-slate-800 hover:border-slate-700'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
                  Gói phổ biến nhất
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pkg.description}</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-emerald-400">
                      {pkg.price.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {pkg.sessions} buổi học
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                    <span>Đơn giá mỗi buổi:</span>
                    <span className="font-semibold text-white">{pkg.price_per_session.toLocaleString('vi-VN')} đ / buổi</span>
                  </div>
                  {currentRole === 'tutor' ? (
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Thu nhập bạn nhận được:</span>
                      <span className="font-semibold text-emerald-400">{pkg.tutor_earnings.toLocaleString('vi-VN')} đ</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Học phí người học đóng:</span>
                      <span className="font-semibold text-emerald-400">{pkg.price.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Phù hợp với:</div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">{pkg.suitable_for}</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">Chia sẻ đề cương, ngân hàng đề thi & bài tập lớn</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300">Được gửi phản hồi, đánh giá chất lượng sau khi hoàn thành</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('academic', { packageType: pkg.id })}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  pkg.popular
                    ? 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <span>Tìm người dạy gói này</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SUBJECT CATEGORIES */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>Danh mục Môn học & Kỹ năng nổi bật</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Khám phá các lĩnh vực học tập đang có người dạy sẵn sàng nhận học viên tại Huế
            </p>
          </div>
          <button
            onClick={() => onNavigate('academic')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
          >
            <span>Xem tất cả danh mục</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigate('academic', { category: cat.name })}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between pb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600/20 to-emerald-600/20 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                  {cat.tutor_count} người dạy
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Banner Quick Link to 38 University Subjects Table */}
        <div 
          onClick={() => onNavigate('academic')}
          className="p-5 rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-emerald-950/60 border border-slate-700/80 hover:border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer transition-all shadow-xl group"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Bảng Tra Cứu Học Phần Đại Học & Kỹ Năng Thực Hành
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Chuẩn hóa theo PDF
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Xem chi tiết mã môn, số tín chỉ, đề cương tóm tắt và danh sách anh/chị khóa trước sẵn sàng nhận kèm theo từng môn
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 group-hover:text-emerald-300 shrink-0">
            <span>Mở bảng tra cứu & tìm người dạy</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FEATURED VERIFIED TUTORS IN HUẾ */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-2">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Hồ sơ đã kiểm duyệt bởi Quản trị viên EduMate</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Đội ngũ Anh/Chị Khóa Trước Tiêu Biểu Tại Huế
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Thủ khoa học phần, sinh viên giỏi khóa trên (K43, K44, K45, K46) trường Đại học Kinh tế, Đại học Huế
            </p>
          </div>
          <button
            onClick={() => onNavigate('academic')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
          >
            <span>Khám phá toàn bộ hồ sơ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tutors.slice(0, 3).map((tutor) => (
            <div
              key={tutor.id}
              className="glass-panel rounded-2xl border border-slate-800 hover:border-blue-500/40 p-5 flex flex-col justify-between space-y-4 hover:shadow-xl transition-all"
            >
              <div className="space-y-3">
                {/* Header: Avatar, Name, Verification badge */}
                <div className="flex items-start space-x-3">
                  <img
                    src={tutor.avatar_url}
                    alt={tutor.full_name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <h3 className="text-sm font-bold text-white truncate">
                        {tutor.full_name}
                      </h3>
                      {tutor.verification_status === 'verified' && (
                        <span 
                          className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center space-x-0.5"
                          title="Hồ sơ đã được Quản trị viên EduMate xác minh bằng cấp & căn cước"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          <span>Đã duyệt</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {tutor.headline}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="flex items-center space-x-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{tutor.rating_avg.toFixed(1)}</span>
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({tutor.rating_count} đánh giá)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subjects tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tutor.subjects.slice(0, 4).map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                {/* District & Teaching mode */}
                <div className="space-y-1 text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{tutor.district}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>Hình thức: {tutor.teaching_mode === 'both' ? 'Trực tiếp & Trực tuyến' : tutor.teaching_mode === 'offline' ? 'Chỉ dạy trực tiếp' : 'Dạy trực tuyến'}</span>
                  </div>
                </div>
              </div>

              {/* Footer: Fee & CTA */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500">Gói học kèm từ</div>
                  <div className="text-sm font-extrabold text-emerald-400">
                    30.000 đ <span className="text-[10px] font-normal text-slate-400">/ buổi</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onNavigate('academic', { tutorId: tutor.id })}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Xem hồ sơ
                  </button>
                  <button
                    onClick={() => onNavigate('academic', { tutorId: tutor.id })}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Chọn gói</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SIX-STEP CORE WORKFLOW (CHƯƠNG 4.3 CỦA PDF) */}
      {/* ========================================================================= */}
      <section className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-8 bg-gradient-to-b from-slate-900/60 to-slate-950/80">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span>Quy trình sử dụng nền tảng (Chương 4.3 PDF)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            6 Bước kết nối học tập chuẩn mực
          </h2>
          <p className="text-xs text-slate-400">
            Minh bạch quyền lợi và trách nhiệm của người học và người dạy
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-extrabold flex items-center justify-center text-xs border border-blue-500/30">
              01
            </div>
            <h3 className="text-xs font-bold text-white">Tạo hồ sơ & Đăng gói học</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Người dạy tạo hồ sơ năng lực, chọn môn học/kỹ năng có thể kèm và đăng ký cung cấp 3 gói học chuẩn (Học thử, Cấp tốc, Dài hạn).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 font-extrabold flex items-center justify-center text-xs border border-emerald-500/30">
              02
            </div>
            <h3 className="text-xs font-bold text-white">Tìm kiếm & Chọn gói phù hợp</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Người học tra cứu theo môn, kỹ năng, khu vực tại Huế và tham khảo số buổi, mức phí của từng gói học.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-teal-600/20 text-teal-400 font-extrabold flex items-center justify-center text-xs border border-teal-500/30">
              03
            </div>
            <h3 className="text-xs font-bold text-white">Gửi yêu cầu kết nối</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Điền mục tiêu cần học, khung giờ mong muốn và gửi yêu cầu ở trạng thái <em>Chờ xác nhận</em> đến người dạy.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 font-extrabold flex items-center justify-center text-xs border border-amber-500/30">
              04
            </div>
            <h3 className="text-xs font-bold text-white">Xác nhận & Thống nhất lịch</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Người dạy xem xét yêu cầu và phản hồi chấp nhận hoặc từ chối kèm lý do. Hai bên thống nhất lịch học chi tiết.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 font-extrabold flex items-center justify-center text-xs border border-indigo-500/30">
              05
            </div>
            <h3 className="text-xs font-bold text-white">Thực hiện các buổi học</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Hai bên tiến hành các buổi học theo thỏa thuận (trực tiếp tại Huế hoặc Online), chia sẻ đề cương và giải bài tập lớn.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-rose-600/20 text-rose-400 font-extrabold flex items-center justify-center text-xs border border-rose-500/30">
              06
            </div>
            <h3 className="text-xs font-bold text-white">Hoàn thành & Phản hồi</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sau khi gói học hoàn tất, người học gửi đánh giá sao & nhận xét thực tế để nâng cao độ tin cậy của nền tảng.
            </p>
          </div>

        </div>

        {/* Action Call for Tutors and Learners */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-800/80">
          <button
            onClick={() => onNavigate('academic')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Duyệt danh sách Anh/Chị Khóa Trước ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => onNavigate('academic')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            Đăng ký làm Người dạy (Khóa trước)
          </button>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 7. ACADEMIC INTEGRITY & MVP TRANSPARENCY NOTICE */}
      {/* ========================================================================= */}
      <section className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-200">
              Đề tài Khởi nghiệp Đổi mới Sáng tạo • Đại học Huế
            </div>
            <div className="text-[11px] text-slate-400">
              Sinh viên thực hiện: Nguyễn Thị Nhân (23K4080030) & Lê Ánh Diễm Như (23K4080035) • GVHD: ThS. Trần Thái Hòa • Khoa Hệ thống thông tin kinh tế, Trường Đại học Kinh tế, Đại học Huế.
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-800 text-emerald-400 border border-emerald-500/20">
            EduMate Huế v2.0
          </span>
        </div>
      </section>

    </div>
  );
};
