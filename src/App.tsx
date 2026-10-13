import { useState } from 'react';
import type { UserRole, Profile } from './types';
import { dataService } from './services/dataService';
import { Navbar } from './components/Navbar';
import { StudentView } from './features/student/StudentView';
import { ManagerView } from './features/manager/ManagerView';


export function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [activeTab, setActiveTab] = useState<string>('my-requests');

  // Load current profile based on role
  const profiles = dataService.getProfiles();
  const currentProfile: Profile = 
    profiles.find(p => p.role === currentRole) || profiles[0];

  const handleSwitchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'student') {
      setActiveTab('my-requests');
    } else {
      setActiveTab('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentRole}
        currentProfile={currentProfile}
        onSwitchRole={handleSwitchRole}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Role Notice Banner */}
        <div className="mb-8 p-4 rounded-2xl glass-panel border border-indigo-500/20 bg-gradient-to-r from-indigo-950/30 via-slate-900/40 to-purple-950/30 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-md ${
              currentRole === 'student' ? 'bg-emerald-600' : 'bg-indigo-600'
            }`}>
              {currentRole === 'student' ? 'SV' : 'QL'}
            </div>
            <div>
              <div className="text-sm font-semibold text-white flex items-center space-x-2">
                <span>Bạn đang trải nghiệm với vai trò:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  currentRole === 'student' 
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {currentRole === 'student' ? 'Sinh viên / Người học (Nguyễn Văn An)' : 'Ban Quản trị / Giáo vụ (Trần Thị Mai)'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentRole === 'student' 
                  ? 'Giao diện cho phép tạo biểu mẫu, xem tiến độ duyệt, đăng ký học phần và nộp biên lai thanh toán.'
                  : 'Giao diện quản trị cho phép tiếp nhận hồ sơ, duyệt/từ chối kèm lý do, quản lý dữ liệu học tập và đối soát đơn hàng.'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 self-end md:self-auto">
            <span className="hidden sm:inline">Thử chuyển vai trò ở góc trên bên phải</span>
            <span className="text-indigo-400 font-bold">↗</span>
          </div>
        </div>

        {/* Dynamic View rendering based on current role */}
        {currentRole === 'student' ? (
          <StudentView 
            currentProfile={currentProfile} 
            activeTab={activeTab} 
          />
        ) : (
          <ManagerView 
            currentProfile={currentProfile} 
            activeTab={activeTab} 
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">EduMate Platform Core</span>
            <span>•</span>
            <span>React + TypeScript + Vite + Tailwind CSS + Supabase BaaS</span>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <span>Thiết kế theo chuẩn bảo mật PostgreSQL RLS</span>
            <span>•</span>
            <span className="text-indigo-400 font-medium">Bảo mật cấp dòng dữ liệu (Row-Level Security)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
