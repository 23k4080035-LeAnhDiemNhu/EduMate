import React, { useState } from 'react';
import type { UserRole, Profile } from '../../types';
import { 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  Database,
  Menu,
  X,
  LogOut,
  User,
  Home,
  FilePlus2,
  ListFilter,
  BookOpen,
  Settings
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  currentUser: Profile | null;
  currentRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  currentRole,
  onSwitchRole,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Trang chủ', icon: Home, roles: ['all'] },
    { id: 'academic', label: 'Tìm người dạy', icon: BookOpen, roles: ['all'] },
    { id: 'submit-request', label: 'Gửi yêu cầu học', icon: FilePlus2, roles: ['student'] },
    { id: 'my-requests', label: 'Yêu cầu & Lịch dạy', icon: ListFilter, roles: ['student', 'tutor'] },
    { id: 'admin', label: 'Khu vực Quản trị', icon: Settings, roles: ['manager', 'admin'] },
  ];

  const visibleLinks = navLinks.filter(
    (item) => item.roles.includes('all') || item.roles.includes(currentRole)
  );

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none" 
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
                  EduMate
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Huế Edition
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Tìm đúng người dạy – Học đúng điều cần</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header: Role switcher, Status & Profile */}
          <div className="flex items-center space-x-3">
            
            {/* Database indicator */}
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] bg-slate-900 border border-slate-800 text-slate-400">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>{isSupabaseConfigured ? 'Supabase Live' : 'Mô phỏng Local Engine'}</span>
            </div>

            {/* 3-Role switch toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-xl">
              <button
                onClick={() => onSwitchRole('student')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'student'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Đổi vai trò sang Người học (Học viên)"
              >
                <UserCheck className="w-3 h-3" />
                <span className="hidden sm:inline">Người học</span>
              </button>
              <button
                onClick={() => onSwitchRole('tutor')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'tutor'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Đổi vai trò sang Người dạy (Anh/Chị khóa trước)"
              >
                <GraduationCap className="w-3 h-3" />
                <span className="hidden sm:inline">Người dạy</span>
              </button>
              <button
                onClick={() => onSwitchRole('manager')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'manager' || currentRole === 'admin'
                    ? 'bg-gradient-to-r from-indigo-600 to-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Đổi vai trò sang Quản trị viên"
              >
                <ShieldCheck className="w-3 h-3" />
                <span className="hidden sm:inline">Quản lý</span>
              </button>
            </div>

            {/* Profile or Login Button */}
            {currentUser ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <button
                  onClick={() => onNavigate('profile')}
                  className={`flex items-center space-x-2 p-1 rounded-xl transition-all ${
                    currentPage === 'profile' ? 'ring-2 ring-indigo-500' : 'hover:bg-slate-800/60'
                  }`}
                  title="Xem hồ sơ cá nhân"
                >
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={currentUser.full_name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                  />
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-semibold text-slate-200 leading-tight">
                      {currentUser.full_name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {currentRole === 'manager' ? 'Admin' : currentUser.student_code || 'Học viên'}
                    </div>
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
              >
                Đăng nhập
              </button>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-4 space-y-1 bg-slate-950/95 animate-fadeIn">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </button>
            );
          })}
          {currentUser && (
            <button
              onClick={() => {
                onNavigate('profile');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80"
            >
              <User className="w-4 h-4" />
              <span>Hồ sơ cá nhân</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
