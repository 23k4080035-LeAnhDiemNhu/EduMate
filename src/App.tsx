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
import { Forbidden403 } from './components/common/Forbidden403';


// 8 Pages
import { HomePage } from './pages/HomePage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { SubmitRequestPage } from './pages/SubmitRequestPage';
import { MyRequestsPage } from './pages/MyRequestsPage';
import { AcademicPage } from './pages/AcademicPage';
import { OrdersPage } from './pages/OrdersPage';
import { AdminPage } from './pages/AdminPage';
import { PaymentPage } from './pages/PaymentPage';

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

  // Switch role handler: Automatically syncs with a profile matching that role (Demo Sandbox only)
  const handleSwitchRole = (newRole: UserRole) => {
    // SECURITY ENFORCEMENT: Role Switcher is strictly DISABLED in Live Production
    if (isSupabaseConfigured) {
      showToast(
        'error',
        'Thao tác không được phép',
        'Trong môi trường thực tế, vai trò được xác thực độc lập từ Supabase Auth. Vui lòng đăng nhập với tài khoản có vai trò tương ứng.'
      );
      return;
    }

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

  const [pageParams, setPageParams] = useState<any>({});
  const [academicParams, setAcademicParams] = useState<{
    search?: string;
    district?: string;
    category?: string;
    tutorId?: string;
  }>({});

  const handleNavigate = (page: string, params?: any) => {
    if (params) {
      setPageParams(params);
      setAcademicParams(params);
    } else {
      setPageParams({});
      setAcademicParams({});
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render the current active page
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} currentRole={currentRole} />;

      case 'auth':
        return (
          <AuthPage
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        );

      case 'profile':
        if (!currentUser) {
          return (
            <AuthPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={handleNavigate}
              showToast={showToast}
            />
          );
        }
        return (
          <ProfilePage
            currentUser={currentUser}
            onProfileUpdated={handleProfileUpdated}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        );

      case 'submit-request':
        if (!currentUser) {
          return (
            <AuthPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={handleNavigate}
              showToast={showToast}
            />
          );
        }
        return (
          <SubmitRequestPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        );

      case 'my-requests':
        if (!currentUser) {
          return (
            <AuthPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={handleNavigate}
              showToast={showToast}
            />
          );
        }
        return (
          <MyRequestsPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        );

      case 'academic':
        return (
          <AcademicPage
            currentUser={currentUser}
            currentRole={currentRole}
            onNavigate={handleNavigate}
            showToast={showToast}
            initialParams={academicParams}
          />
        );

      case 'orders':
        if (!currentUser) {
          return (
            <AuthPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={handleNavigate}
              showToast={showToast}
            />
          );
        }
        return (
          <OrdersPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        );

      case 'payment':
        if (!currentUser) {
          return (
            <AuthPage
              onLoginSuccess={handleLoginSuccess}
              onNavigate={handleNavigate}
              showToast={showToast}
            />
          );
        }
        if (currentUser.role === 'tutor') {
          return (
            <Forbidden403
              requiredRole="Người học (Student)"
              currentRole="tutor"
              resourceName="Cổng thanh toán học phí VietQR"
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <PaymentPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            showToast={showToast}
            initialParams={pageParams}
          />
        );

      case 'admin':
        if (!currentUser || (currentUser.role !== 'manager' && currentUser.role !== 'admin')) {
          return (
            <Forbidden403
              requiredRole="Quản trị viên (Manager)"
              currentRole={currentUser?.role || 'guest'}
              resourceName="Bảng điều khiển Quản trị & Đối soát tài chính"
              onNavigate={handleNavigate}
            />
          );
        }
        return (
          <AdminPage
            currentUser={currentUser}
            onNavigate={handleNavigate}
            showToast={showToast}
          />
        );

      default:
        return <HomePage onNavigate={handleNavigate} currentRole={currentRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Top Universal Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
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
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
