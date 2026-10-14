import { useState, useEffect } from 'react';

import type { UserRole, Profile } from './types';
import { dataService } from './services/dataService';
import { 
  isSupabaseConfigured, 
  supabaseGetSession, 
  supabaseFetchProfile, 
  supabaseSignOut, 
  supabase 
} from './lib/supabase';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ToastContainer, type ToastMessage, type ToastType } from './components/common/Toast';


// 8 Pages
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { SubmitRequestPage } from './pages/SubmitRequestPage';
import { MyRequestsPage } from './pages/MyRequestsPage';
import { AcademicPage } from './pages/AcademicPage';
import { OrdersPage } from './pages/OrdersPage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    const profiles = dataService.getProfiles();
    return profiles.find(p => p.role === 'student') || profiles[0] || null;
  });

  // Global Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: ToastType, title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Khôi phục trạng thái phiên làm việc khi tải ứng dụng (Supabase Auth Session Restore)
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // 1. Kiểm tra session hiện có
    supabaseGetSession().then(async (session) => {
      if (session?.user) {
        const profile = await supabaseFetchProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
          setCurrentRole(profile.role);
          showToast('info', 'Phiên làm việc đã khôi phục', `Đã đồng bộ tài khoản: ${profile.full_name}`);
        }
      }
    });

    // 2. Lắng nghe thay đổi trạng thái xác thực
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await supabaseFetchProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
          setCurrentRole(profile.role);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Switch role handler: Automatically syncs with a profile matching that role
  const handleSwitchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    const profiles = dataService.getProfiles();
    const matchingProfile = profiles.find(p => p.role === newRole) || profiles[0];
    setCurrentUser(matchingProfile);

    // Contextual redirection
    if (newRole === 'manager') {
      if (['submit-request', 'orders'].includes(currentPage)) {
        setCurrentPage('admin');
      }
      showToast('info', 'Đã chuyển sang vai trò Quản lý', `Tài khoản: ${matchingProfile.full_name}`);
    } else if (newRole === 'tutor') {
      if (currentPage === 'admin' || currentPage === 'submit-request') {
        setCurrentPage('my-requests');
      }
      showToast('info', 'Đã chuyển sang vai trò Người dạy (Khóa trước)', `Tài khoản: ${matchingProfile.full_name}`);
    } else {
      if (currentPage === 'admin') {
        setCurrentPage('home');
      }
      showToast('info', 'Đã chuyển sang vai trò Người học', `Tài khoản: ${matchingProfile.full_name}`);
    }
  };

  const handleLoginSuccess = (profile: Profile) => {
    setCurrentUser(profile);
    setCurrentRole(profile.role);
    if (profile.role === 'manager') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('home');
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabaseSignOut();
      } catch (err: any) {
        console.warn('Lỗi đăng xuất:', err.message);
      }
    }
    setCurrentUser(null);
    setCurrentPage('home');
    showToast('info', 'Đã đăng xuất', 'Bạn hiện đang xem hệ thống với tư cách Khách');
  };


  const handleProfileUpdated = (updated: Profile) => {
    setCurrentUser(updated);
  };

  // Render the current active page
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} currentRole={currentRole} />;

      case 'auth':
        return (
          <AuthPage
            onLoginSuccess={handleLoginSuccess}
            onNavigate={setCurrentPage}
            showToast={showToast}
          />
        );

      case 'profile':
        if (!currentUser) {
          return (
            <AuthPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={setCurrentPage}
              showToast={showToast}
            />
          );
        }
        return (
          <ProfilePage
            currentUser={currentUser}
            onProfileUpdated={handleProfileUpdated}
            onNavigate={setCurrentPage}
            showToast={showToast}
          />
        );

      case 'submit-request':
        if (!currentUser) {
          return (
            <AuthPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={setCurrentPage}
              showToast={showToast}
            />
          );
        }
        return (
          <SubmitRequestPage
            currentUser={currentUser}
            onNavigate={setCurrentPage}
            showToast={showToast}
          />
        );

      case 'my-requests':
        if (!currentUser) {
          return (
            <AuthPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={setCurrentPage}
              showToast={showToast}
            />
          );
        }
        return (
          <MyRequestsPage
            currentUser={currentUser}
            onNavigate={setCurrentPage}
            showToast={showToast}
          />
        );

      case 'academic':
        return (
          <AcademicPage
            currentUser={currentUser}
            currentRole={currentRole}
            onNavigate={setCurrentPage}
            showToast={showToast}
          />
        );

      case 'orders':
        if (!currentUser) {
          return (
            <AuthPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={setCurrentPage}
              showToast={showToast}
            />
          );
        }
        return (
          <OrdersPage
            currentUser={currentUser}
            onNavigate={setCurrentPage}
            showToast={showToast}
          />
        );

      case 'admin':
        if (!currentUser || currentRole !== 'manager') {
          return (
            <div className="max-w-md mx-auto text-center py-16 space-y-4">
              <div className="text-4xl">🛡️</div>
              <h2 className="text-lg font-bold text-white">Yêu cầu quyền Người quản lý</h2>
              <p className="text-xs text-slate-400">
                Khu vực này chỉ dành cho Ban Quản trị Giáo vụ. Vui lòng chuyển đổi vai trò ở thanh tiêu đề sang "Quản lý".
              </p>
              <button
                onClick={() => handleSwitchRole('manager')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
              >
                Chuyển sang vai trò Quản lý
              </button>
            </div>
          );
        }
        return (
          <AdminPage
            currentUser={currentUser}
            onNavigate={setCurrentPage}
            showToast={showToast}
          />
        );

      default:
        return <HomePage onNavigate={setCurrentPage} currentRole={currentRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Top Universal Header */}
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        currentUser={currentUser}
        currentRole={currentRole}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
      />

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderPage()}
      </main>

      {/* Universal Footer */}
      <Footer onNavigate={setCurrentPage} />
    </div>
  );
}

export default App;
