import React from 'react';
import type { UserRole } from '../types';
import { 
  FileText, 
  BookOpen, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sparkles
} from 'lucide-react';


interface HomePageProps {
  onNavigate: (page: string) => void;
  currentRole: UserRole;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, currentRole }) => {
  return (
    <div className="space-y-16 animate-fadeIn">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-12 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nền Tảng Dịch Vụ & Quản Trị Học Vụ Chuẩn Hóa</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Quản trị yêu cầu học vụ <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-200 bg-clip-text text-transparent">
                Minh bạch & Tức thời
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              EduMate số hóa quy trình nộp biểu mẫu yêu cầu, quản lý dữ liệu học tập và xử lý thanh toán đơn hàng giữa Người học và Ban Quản trị Giáo vụ theo chuẩn bảo mật PostgreSQL RLS.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {currentRole === 'student' ? (
                <>
                  <button
                    onClick={() => onNavigate('submit-request')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Nộp biểu mẫu yêu cầu ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('my-requests')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-sm font-semibold transition-all cursor-pointer"
                  >
                    Theo dõi tiến độ hồ sơ
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('admin')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Truy cập Bàn làm việc Quản trị</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onNavigate('academic')}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-sm font-semibold transition-all cursor-pointer"
                  >
                    Xem danh mục học vụ
                  </button>
                </>
              )}
            </div>

            {/* Micro proof badges */}
            <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Thẩm định có đối soát</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Bảo mật cấp dòng (RLS)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Thời gian phản hồi 24h</span>
              </span>
            </div>
          </div>

          {/* Quick interactive card preview */}
          <div className="w-full max-w-md">
            <div className="glass-panel rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Quy trình xử lý yêu cầu mẫu</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">REQ-2026-LIVE</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-slate-400">Bước 1: Nộp đơn</div>
                    <div className="font-semibold text-white">Biểu mẫu hoãn thi / Đổi lịch</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                    SUBMITTED
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-slate-400">Bước 2: Thẩm định</div>
                    <div className="font-semibold text-white">Ban Giáo vụ kiểm tra minh chứng</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                    IN_REVIEW
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-emerald-400 font-semibold">Bước 3: Phê duyệt</div>
                    <div className="text-[11px] text-slate-300">Đã ban hành thông báo điện tử</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    APPROVED
                  </span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => onNavigate('my-requests')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center justify-center space-x-1 mx-auto cursor-pointer"
                >
                  <span>Xem chi tiết hồ sơ cá nhân</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4 Pillars Section */}
      <section className="space-y-8 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            4 Phân Hệ Dữ Liệu Được Chuẩn Hóa
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Kiến trúc trung lập tuân thủ đặc tả nghiệp vụ, đáp ứng tính mở rộng và linh hoạt cao.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div 
            onClick={() => onNavigate('profile')}
            className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Hồ sơ & Tài khoản</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quản lý định danh người học, mã sinh viên, thông tin liên lạc và vai trò phân quyền chi tiết.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('submit-request')}
            className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. Biểu mẫu & Yêu cầu</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Khởi tạo hồ sơ, lưu nháp, nộp trực tuyến và nhận phản hồi phê duyệt hoặc từ chối kèm lý do.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('academic')}
            className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Thông tin học tập</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tra cứu danh mục môn học, chuyên đề đào tạo, quản lý trạng thái ghi danh và kết quả học vụ.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('orders')}
            className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">4. Đơn hàng & Thanh toán</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Theo dõi nghĩa vụ học phí, lệ phí học vụ, nộp xác nhận chuyển khoản và quản lý đối soát.
            </p>
          </div>

        </div>
      </section>

      {/* 4-Step Process Flow */}
      <section className="glass-panel rounded-3xl p-8 border border-slate-800 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white">Quy Trình Hoạt Động Khép Kín</h2>
          <p className="text-xs text-slate-400">
            Từ lúc người học gửi biểu mẫu đến khi hoàn tất phê chuẩn và đối soát tài chính
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-indigo-400">01. ĐĂNG KÝ / NỘP ĐƠN</div>
            <h4 className="text-sm font-semibold text-white">Chọn loại biểu mẫu</h4>
            <p className="text-xs text-slate-400">Điền thông tin và đính kèm giấy tờ chứng minh theo yêu cầu.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-amber-400">02. THẨM ĐỊNH GIÁO VỤ</div>
            <h4 className="text-sm font-semibold text-white">Xem xét & Phản hồi</h4>
            <p className="text-xs text-slate-400">Ban quản lý kiểm tra tính hợp lệ và cập nhật trạng thái hồ sơ.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-emerald-400">03. PHÊ DUYỆT CHÍNH THỨC</div>
            <h4 className="text-sm font-semibold text-white">Ban hành kết quả</h4>
            <p className="text-xs text-slate-400">Người học nhận thông báo kết quả duyệt kèm chỉ dẫn chi tiết.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-xs font-mono font-bold text-teal-400">04. ĐỐI SOÁT & HOÀN TẤT</div>
            <h4 className="text-sm font-semibold text-white">Xác nhận nghĩa vụ</h4>
            <p className="text-xs text-slate-400">Đối chiếu biên lai nộp lệ phí học vụ và lưu vết nhật ký kiểm toán.</p>
          </div>
        </div>
      </section>

    </div>
  );
};
