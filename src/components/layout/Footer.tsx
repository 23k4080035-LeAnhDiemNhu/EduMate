import React from 'react';
import { GraduationCap, ShieldCheck } from 'lucide-react';


interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/90 py-10 mt-16 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-emerald-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white">EduMate Huế</span>
            </div>
            <p className="text-xs text-slate-300 font-medium italic">
              “Tìm đúng người dạy – Học đúng điều cần.”
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nền tảng trung gian kết nối người học và anh/chị khóa trước uy tín tại Huế, hỗ trợ ôn thi và kèm 1-1 theo 38 học phần đại học chuẩn.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Phân Hệ Học Tập EduMate</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('academic')} className="hover:text-emerald-400 transition-colors">
                  Tìm anh/chị kèm 38 học phần
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('submit-request')} className="hover:text-emerald-400 transition-colors">
                  Đăng ký 3 gói học chuẩn hóa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('my-requests')} className="hover:text-emerald-400 transition-colors">
                  Theo dõi yêu cầu & lịch học
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-emerald-400 transition-colors">
                  Đối soát chuyển khoản ngân hàng
                </button>
              </li>
            </ul>
          </div>

          {/* Management links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Quản Trị EduMate</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-emerald-400 transition-colors">
                  Duyệt hồ sơ anh/chị khóa trước
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-emerald-400 transition-colors">
                  Báo cáo & Thống kê tài chính
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-emerald-400 transition-colors">
                  Quản lý yêu cầu kết nối học
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-emerald-400 transition-colors">
                  Kiểm duyệt đánh giá & phản ánh
                </button>
              </li>
            </ul>
          </div>

          {/* Compliance & Security statement */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Bảo Mật & Pháp Lý</h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>EduMate RLS & Security Engine</span>
              </div>
              <p className="text-slate-400 leading-normal">
                Phân quyền bảo mật nghiêm ngặt. Cam kết bảo vệ quyền lợi sinh viên và chuyển khoản trực tiếp an toàn theo Chương 4.4 của PDF Đồ án.
              </p>
            </div>
          </div>

        </div>

        {/* Academic Authorship Banner from PDF */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300 space-y-1 leading-relaxed">
          <div className="font-bold text-white text-xs">
            Đề tài Khởi nghiệp Đổi mới Sáng tạo: "EduMate - Nền tảng kết nối người học và người dạy"
          </div>
          <div>
            <strong>Sinh viên thực hiện:</strong> Nguyễn Thị Nhân (MSSV: 23K4080030) & Lê Ánh Diễm Như (MSSV: 23K4080035)
          </div>
          <div className="text-slate-400">
            <strong>Giảng viên hướng dẫn:</strong> ThS. Trần Thái Hòa • Khoa Hệ thống thông tin kinh tế - Trường Đại học Kinh tế, Đại học Huế (HCE)
          </div>
        </div>

        <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
          <div>© 2026 EduMate Huế Platform. Bảo lưu mọi quyền theo Đồ án Khởi nghiệp Đổi mới Sáng tạo.</div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>React 19 + TypeScript</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Supabase BaaS</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
