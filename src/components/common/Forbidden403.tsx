import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import type { UserRole } from '../../types';

interface Forbidden403Props {
  requiredRole?: string;
  currentRole?: UserRole | 'guest';
  resourceName?: string;
  onNavigate: (page: string) => void;
}

export const Forbidden403: React.FC<Forbidden403Props> = ({
  requiredRole = 'Quản trị viên (Manager)',
  currentRole = 'guest',
  resourceName = 'Khu vực quản trị và điều phối dịch vụ',
  onNavigate,
}) => {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student': return 'Người học (Sinh viên)';
      case 'tutor': return 'Người dạy (Anh/Chị khóa trước)';
      case 'manager':
      case 'admin': return 'Quản lý / Ban Quản trị';
      default: return 'Khách vãng lai (Chưa đăng nhập)';
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 animate-fadeIn">
      <div className="glass-panel p-8 rounded-3xl border border-rose-500/30 bg-rose-950/15 shadow-2xl text-center space-y-6">
        
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Header Title */}
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono text-xs font-bold uppercase tracking-wider">
            Lỗi bảo mật 403 – Access Denied
          </span>
          <h2 className="text-2xl font-extrabold text-white">
            Bạn Không Có Quyền Truy Cập
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
            Tài nguyên <strong>{resourceName}</strong> được bảo vệ nghiêm ngặt bởi chính sách phân quyền ba vai trò của nền tảng EduMate Huế.
          </p>
        </div>

        {/* Detailed Role Comparison */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-left space-y-2.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Vai trò yêu cầu:</span>
            <span className="text-emerald-400 font-bold">{requiredRole}</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-800 pt-2">
            <span className="text-slate-400">Vai trò hiện tại của bạn:</span>
            <span className="text-rose-400 font-bold">{getRoleLabel(currentRole)}</span>
          </div>
        </div>

        {/* Explanation message */}
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Nếu bạn là cán bộ quản lý giáo vụ hoặc người phụ trách dự án, vui lòng đăng nhập với tài khoản được cấp quyền Quản lý (<code className="text-slate-300">Leanhdiemnhu240905@gmail.com</code>).
        </p>

        {/* Navigation Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Về Trang chủ</span>
          </button>

          <button
            onClick={() => onNavigate('auth')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng nhập tài khoản khác</span>
          </button>
        </div>

      </div>
    </div>
  );
};

