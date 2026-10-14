import React, { useState } from 'react';
import type { UserRole } from '../types';
import { dataService } from '../services/dataService';
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
  Users
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, params?: { search?: string; district?: string; category?: string; tutorId?: string }) => void;
  currentRole: UserRole;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, currentRole: _currentRole }) => {
  const [searchSubject, setSearchSubject] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  const categories = dataService.getSubjectCategories();
  const tutors = dataService.getTutors(true); // Chỉ lấy người dạy Đã duyệt (verified)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('academic', {
      search: searchSubject.trim(),
      district: selectedDistrict
    });
  };

  return (
    <div className="space-y-16 animate-fadeIn">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION & BRAND SLOGAN */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-4 pb-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mô hình kết nối Sinh viên Khóa Trước kèm Khóa Dưới tại Huế</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            “Tìm đúng người dạy – <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Học đúng điều cần.”
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            EduMate kết nối sinh viên Đại học Huế với các <strong>anh/chị khóa trước (thủ khoa, sinh viên giỏi K43 - K46)</strong> đã vượt qua 38 học phần đại học với điểm A/A+, sẵn sàng chia sẻ đề thi, đề cương và kèm 1-1 sát với cấu trúc thi học kỳ.
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
                  placeholder="Mã môn (ECO2013, KTPT...), tên học phần..."
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
                  <span>Tìm anh/chị khóa trước</span>
                </button>
              </div>
            </form>
          </div>

          {/* Value Badges */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Anh/Chị khóa trước đạt điểm A/A+</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Chia sẻ đề cương & đề thi các năm</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-teal-400" />
              <span>Kèm 1-1 tại Huế hoặc Online</span>
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SUBJECT & SKILL CATEGORIES */}
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
          className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-emerald-950/40 to-teal-900/40 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4 cursor-pointer hover:border-emerald-400/60 transition-all group"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white">Tra cứu trọn bộ 38 Học phần Đại học tại Huế</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Chuẩn hóa tín chỉ
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Nguyên lý kế toán (ECO2013), Kinh tế vi mô (KTPT2023), CSDL nâng cao (HTTT4233), ERP (ECO2407), Kinh tế lượng (ECO2411)...
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
      {/* 3. FEATURED VERIFIED TUTORS IN HUẾ */}
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
              Thủ khoa học phần, sinh viên giỏi khóa trên (K43, K44, K45, K46) nắm chắc đề thi và bài tập lớn
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
                  {tutor.subjects.map((sub, idx) => (
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
                  <div className="text-[10px] text-slate-500">Mức phí đề xuất</div>
                  <div className="text-sm font-extrabold text-emerald-400">
                    {tutor.hourly_rate.toLocaleString('vi-VN')} đ <span className="text-[10px] font-normal text-slate-400">/ buổi (2h)</span>
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
                    <span>Gửi yêu cầu</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BUSINESS PROCESS / HOW IT WORKS (QUY TRÌNH A -> E) */}
      {/* ========================================================================= */}
      <section className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-8 bg-gradient-to-b from-slate-900/60 to-slate-950/80">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Quy trình kết nối minh bạch & an tâm
          </h2>
          <p className="text-xs text-slate-400">
            Hệ thống đảm bảo quyền lợi cho cả người học và người dạy qua 4 bước chuẩn mực
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-extrabold flex items-center justify-center text-xs border border-blue-500/30">
              01
            </div>
            <h3 className="text-xs font-bold text-white">Tìm kiếm & Lọc</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Người học tra cứu người dạy theo môn học, mức phí và khu vực cụ thể tại Huế (Hương Thủy, Hương Trà, Phú Vang...).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 font-extrabold flex items-center justify-center text-xs border border-emerald-500/30">
              02
            </div>
            <h3 className="text-xs font-bold text-white">Gửi yêu cầu học</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Điền mục tiêu cần học, hình thức và khung giờ mong muốn. Yêu cầu được gửi ở trạng thái <em>Chờ xác nhận</em>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-teal-600/20 text-teal-400 font-extrabold flex items-center justify-center text-xs border border-teal-500/30">
              03
            </div>
            <h3 className="text-xs font-bold text-white">Xác nhận & Thống nhất</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Người dạy nhận thông báo, xem xét thời gian và chọn chấp nhận hoặc từ chối kèm lý do rõ ràng.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 font-extrabold flex items-center justify-center text-xs border border-amber-500/30">
              04
            </div>
            <h3 className="text-xs font-bold text-white">Hoàn thành & Đánh giá</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sau buổi học hoàn thành, người học gửi đánh giá sao & nhận xét thực tế. Ngăn chặn đánh giá ảo tuyệt đối.
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
      {/* 5. ACADEMIC INTEGRITY & MVP TRANSPARENCY NOTICE */}
      {/* ========================================================================= */}
      <section className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-200">
              Cam kết minh bạch phục vụ Đồ án Sinh viên
            </div>
            <div className="text-[11px] text-slate-400">
              Dữ liệu hiển thị dựa trên hồ sơ thực tế. Chỉ hồ sơ đã được Quản trị viên duyệt mới gắn nhãn "Đã duyệt". Chưa tích hợp cổng thanh toán trực tiếp để bảo vệ người dùng sinh viên.
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-800 text-emerald-400 border border-emerald-500/20">
            MVP Status: Sẵn sàng bảo vệ
          </span>
        </div>
      </section>

    </div>
  );
};
