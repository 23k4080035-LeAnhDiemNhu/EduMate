import React from 'react';
import type { UserRole, Profile } from '../types';
import { 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  Database
} from 'lucide-react';

import { isSupabaseConfigured } from '../lib/supabase';

interface NavbarProps {
  currentRole: UserRole;
  currentProfile: Profile;
  onSwitchRole: (role: UserRole) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentProfile,
  onSwitchRole,
  activeTab,
  onSelectTab
}) => {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('overview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                  EduMate
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Core v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Hệ thống Quản trị & Dịch vụ Học vụ</p>
            </div>
          </div>

          {/* Navigation Links based on role */}
          <nav className="hidden md:flex items-center space-x-1">
            {currentRole === 'student' ? (
              <>
                <button
                  onClick={() => onSelectTab('my-requests')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'my-requests'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Yêu cầu của tôi
                </button>
                <button
                  onClick={() => onSelectTab('academic-catalog')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'academic-catalog'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Học tập & Khóa học
                </button>
                <button
                  onClick={() => onSelectTab('my-orders')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'my-orders'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Đơn hàng & Thanh toán
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onSelectTab('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onSelectTab('approval-workbench')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'approval-workbench'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Thẩm định & Duyệt
                </button>
                <button
                  onClick={() => onSelectTab('academic-crud')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'academic-crud'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Quản lý Khóa học
                </button>
                <button
                  onClick={() => onSelectTab('reconciliation')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'reconciliation'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Đơn hàng & Đối soát
                </button>
                <button
                  onClick={() => onSelectTab('audit-logs')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'audit-logs'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Audit Logs
                </button>
              </>
            )}
          </nav>

          {/* Right Area: Role switcher & profile pill */}
          <div className="flex items-center space-x-3">
            {/* Supabase connection status pill */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-900 border border-slate-800 text-slate-400">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isSupabaseConfigured ? 'Supabase Live' : 'Supabase Ready / Local Engine'}</span>
            </div>

            {/* Role switch toggle */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 p-0.5 rounded-xl">
              <button
                onClick={() => onSwitchRole('student')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'student'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Chuyển sang góc nhìn Sinh viên / Người học"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Người học</span>
              </button>
              <button
                onClick={() => onSwitchRole('manager')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'manager'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Chuyển sang góc nhìn Người quản lý (Admin / Manager)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Quản lý</span>
              </button>
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <img
                src={currentProfile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentProfile.full_name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              <div className="hidden xl:block text-left">
                <div className="text-xs font-medium text-slate-200 leading-tight">
                  {currentProfile.full_name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {currentRole === 'manager' ? 'Admin / Giáo vụ' : currentProfile.student_code || 'Sinh viên'}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
