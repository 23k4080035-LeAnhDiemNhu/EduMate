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
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Phân Hệ Người Học</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('submit-request')} className="hover:text-indigo-400 transition-colors">
                  Nộp biểu mẫu yêu cầu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('my-requests')} className="hover:text-indigo-400 transition-colors">
                  Theo dõi trạng thái duyệt
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('academic')} className="hover:text-indigo-400 transition-colors">
                  Danh mục mục học tập & khóa học
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('orders')} className="hover:text-indigo-400 transition-colors">
                  Đơn hàng & Xác nhận nộp phí
                </button>
              </li>
            </ul>
          </div>

          {/* Management links */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Quản Trị Giáo Vụ</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-indigo-400 transition-colors">
                  Bàn làm việc thẩm định hồ sơ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-indigo-400 transition-colors">
                  Quản lý danh mục học vụ (CRUD)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-indigo-400 transition-colors">
                  Đối soát giao dịch chuyển khoản
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-indigo-400 transition-colors">
                  Nhật ký kiểm toán (Audit Trails)
                </button>
              </li>
            </ul>
          </div>

          {/* Compliance & Security statement */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Bảo Mật & Phạm Vi</h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex items-center space-x-1.5 text-indigo-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PostgreSQL RLS Engine</span>
              </div>
              <p className="text-slate-400 leading-normal">
                Kiểm soát truy cập mức hàng (Row-Level Security). Chưa tích hợp cổng thanh toán trực tiếp, toàn bộ giao dịch được đối soát có kiểm chứng.
              </p>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
          <div>© 2026 EduMate Platform. Bản quyền hệ thống thuộc về dự án EduMate.</div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>React + TypeScript + Vite</span>
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
