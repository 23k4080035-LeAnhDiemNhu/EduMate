import React, { useState, useEffect } from 'react';
import type { 
  Profile, 
  ServiceRequest, 
  AcademicItem, 
  Order, 
  Payment, 
  AuditLog, 
  RequestStatus, 
  AcademicStatus,
  TutorProfile,
  LearningRequest,
  ReportItem,
  UserRole,
  Review
} from '../types';
import { dataService } from '../services/dataService';
import { isSupabaseConfigured, supabaseReviewRequest, supabaseFetchRequests } from '../lib/supabase';
import { RequestBadge, PaymentBadge, AcademicBadge } from '../components/common/Badge';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  FileSearch, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  AlertCircle,
  ShieldAlert,
  Loader2,
  Users, 
  MessageSquareWarning, 
  Star, 
  Trash2
} from 'lucide-react';

interface AdminPageProps {
  currentUser: Profile;
  onNavigate?: (page: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  onNavigate,
  showToast,
}) => {
  const [adminTab, setAdminTab] = useState<'tutors' | 'learning_requests' | 'users' | 'reports' | 'reviews' | 'requests' | 'academic' | 'reconciliation' | 'audit'>('tutors');

  // Datasets from service
  const [tutors, setTutors] = useState<TutorProfile[]>(() => dataService.getTutors(false));
  const [learningRequests, setLearningRequests] = useState<LearningRequest[]>(() => dataService.getLearningRequests());
  const [requests, setRequests] = useState<ServiceRequest[]>(() => dataService.getRequests());
  const [academicItems, setAcademicItems] = useState<AcademicItem[]>(() => dataService.getAcademicItems());
  const [_orders, setOrders] = useState<Order[]>(() => dataService.getOrders());
  const [payments, setPayments] = useState<Payment[]>(() => dataService.getPayments());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => dataService.getAuditLogs());
  const [users, setUsers] = useState<Profile[]>(() => dataService.getUsers());
  const [reports, setReports] = useState<ReportItem[]>(() => dataService.getReports());
  const [reviews, setReviews] = useState<Review[]>(() => dataService.getReviews());

  // Filter & Search states
  const [tutorFilter, setTutorFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');
  const [requestSearchTerm, setRequestSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [reportFilterStatus, setReportFilterStatus] = useState<string>('all');

  // Review Modal State (Academic service request)
  const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Report Resolution Modal State
  const [resolvingReport, setResolvingReport] = useState<ReportItem | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Academic Modal State
  const [showAddAcademicModal, setShowAddAcademicModal] = useState(false);
  const [academicForm, setAcademicForm] = useState({
    code: '',
    title: '',
    description: '',
    category: 'Chuyên môn Học vụ',
    standard_fee: 1500000,
    status: 'published' as AcademicStatus,
  });

  const reloadData = () => {
    setRequests(dataService.getRequests());
    setAcademicItems(dataService.getAcademicItems());
    setOrders(dataService.getOrders());
    setPayments(dataService.getPayments());
    setAuditLogs(dataService.getAuditLogs());
    setTutors(dataService.getTutors(false));
    setLearningRequests(dataService.getLearningRequests());
    setUsers(dataService.getUsers());
    setReports(dataService.getReports());
    setReviews(dataService.getReviews());
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabaseFetchRequests()
      .then(liveReqs => setRequests(liveReqs))
      .catch(err => console.warn('Supabase fetch error:', err));
  }, []);

  // Tutor Verification logic (Quy trình B)
  const handleVerifyTutor = (tutorId: string, status: 'verified' | 'rejected') => {
    try {
      dataService.verifyTutor(tutorId, status, currentUser.id, currentUser.full_name);
      reloadData();
      if (status === 'verified') {
        showToast('success', 'Đã phê duyệt hồ sơ anh/chị khóa trước!', 'Hồ sơ đã được cấp nhãn "Đã xác minh" và hiển thị công khai.');
      } else {
        showToast('info', 'Đã từ chối hồ sơ anh/chị khóa trước', 'Hồ sơ đã được lưu vết và chuyển trạng thái từ chối.');
      }
    } catch (err: any) {
      showToast('error', 'Lỗi kiểm duyệt', err.message);
    }
  };

  // User Management
  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    try {
      dataService.updateUserRole(userId, newRole, currentUser.id, currentUser.full_name);
      reloadData();
      showToast('success', 'Cập nhật phân quyền thành công!', `Tài khoản đã được gán vai trò: ${newRole}`);
    } catch (err: any) {
      showToast('error', 'Lỗi phân quyền', err.message);
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    try {
      const updated = dataService.toggleUserStatus(userId, currentUser.id, currentUser.full_name);
      reloadData();
      showToast('info', 'Trạng thái tài khoản', `Tài khoản đã chuyển sang: ${updated?.status === 'active' ? 'Đang hoạt động' : 'Tạm khóa'}`);
    } catch (err: any) {
      showToast('error', 'Lỗi trạng thái', err.message);
    }
  };

  // Report Resolution
  const handleResolveReport = (status: 'resolved' | 'dismissed') => {
    if (!resolvingReport) return;
    try {
      dataService.resolveReport(resolvingReport.id, status, resolutionNotes.trim() || undefined, currentUser.id, currentUser.full_name);
      reloadData();
      showToast('success', status === 'resolved' ? 'Đã giải quyết khiếu nại thành công!' : 'Đã bác bỏ khiếu nại!');
      setResolvingReport(null);
      setResolutionNotes('');
    } catch (err: any) {
      showToast('error', 'Lỗi xử lý phản ánh', err.message);
    }
  };

  // Review Deletion
  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn gỡ bỏ đánh giá này? Điểm trung bình của người dạy sẽ được tự động tính toán lại.')) {
      try {
        dataService.deleteReview(reviewId, currentUser.id, currentUser.full_name);
        reloadData();
        showToast('success', 'Đã gỡ bỏ đánh giá vi phạm', 'Hệ thống đã cập nhật lại điểm đánh giá.');
      } catch (err: any) {
        showToast('error', 'Lỗi gỡ đánh giá', err.message);
      }
    }
  };

  // Metrics
  const pendingTutorsCount = tutors.filter(t => t.verification_status === 'pending').length;
  const verifiedTutorsCount = tutors.filter(t => t.verification_status === 'verified').length;
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  const allReviews = reviews.map(r => {
    const t = tutors.find(tut => tut.id === r.tutor_id);
    return {
      ...r,
      tutor_name: t?.full_name || 'Anh/Chị khóa trước',
      tutor_avatar: t?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
    };
  });

  // Review logic
  const handleReviewAction = async (status: RequestStatus) => {
    if (!selectedReq || actionLoading) return;

    if (status === 'rejected' && (!reviewNotes || reviewNotes.trim().length === 0)) {
      setReviewError('Bắt buộc phải nhập lý do/ghi chú khi từ chối hồ sơ (Ràng buộc toàn vẹn hệ thống)!');
      return;
    }

    setActionLoading(true);
    setReviewError('');

    try {
      if (isSupabaseConfigured) {
        await supabaseReviewRequest(selectedReq.id, status, reviewNotes.trim() || undefined);
        await reloadData();
      } else {
        dataService.updateRequestStatus(
          selectedReq.id,
          status,
          currentUser.id,
          currentUser.full_name,
          reviewNotes.trim() || undefined
        );
        reloadData();
      }

      const statusLabel = status === 'approved' ? 'Phê duyệt' : status === 'rejected' ? 'Từ chối' : 'Đang xử lý';
      showToast('success', `${statusLabel} hồ sơ thành công!`, `Mã yêu cầu: ${selectedReq.request_code}`);
      setSelectedReq(null);
      setReviewNotes('');
      setReviewError('');
    } catch (err: any) {
      setReviewError(err?.message || 'Có lỗi xảy ra khi thẩm định hồ sơ');
      showToast('error', 'Thao tác không thành công', err?.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Create Academic Item logic
  const handleCreateAcademic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicForm.code.trim() || !academicForm.title.trim()) {
      showToast('error', 'Lỗi nhập liệu', 'Vui lòng điền đầy đủ mã và tên mục học tập');
      return;
    }

    dataService.createAcademicItem({
      code: academicForm.code.trim().toUpperCase(),
      title: academicForm.title.trim(),
      description: academicForm.description.trim(),
      category: academicForm.category,
      standard_fee: Number(academicForm.standard_fee) || 0,
      status: academicForm.status,
      created_by: currentUser.id,
    });

    reloadData();
    setShowAddAcademicModal(false);
    setAcademicForm({
      code: '',
      title: '',
      description: '',
      category: 'Chuyên môn Học vụ',
      standard_fee: 1500000,
      status: 'published',
    });
    showToast('success', 'Đã thêm mục học tập mới!', 'Dữ liệu đã được lưu vào hệ thống');
  };

  // Payment Verification logic
  const handleVerifyPayment = (paymentId: string, status: 'successful' | 'failed') => {
    dataService.verifyPayment(paymentId, status, currentUser.id, currentUser.full_name);
    reloadData();
    if (status === 'successful') {
      showToast('success', 'Đã xác nhận thanh toán hợp lệ!', 'Đơn hàng tương ứng đã tự động chuyển sang ĐÃ THANH TOÁN');
    } else {
      showToast('info', 'Đã từ chối giao dịch', 'Giao dịch được đánh dấu từ chối');
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesStatus = requestStatusFilter === 'all' || r.status === requestStatusFilter;
    const matchesSearch = 
      r.request_code.toLowerCase().includes(requestSearchTerm.toLowerCase()) ||
      (r.student_name && r.student_name.toLowerCase().includes(requestSearchTerm.toLowerCase())) ||
      (r.form_type_title && r.form_type_title.toLowerCase().includes(requestSearchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // SECURITY & ACCESS CONTROL GUARD:
  // Strictly disallow non-manager users from viewing or interacting with admin workbench
  if (currentUser.role !== 'manager' && currentUser.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 glass-panel rounded-3xl border border-rose-800/40 text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Truy Cập Bị Từ Chối (403 Forbidden)</h2>
        <p className="text-xs sm:text-sm text-slate-300">
          Bạn đang đăng nhập với vai trò <strong>{currentUser.role === 'tutor' ? 'Người dạy (Tutor)' : 'Sinh viên / Người học'}</strong>.
        </p>
        <p className="text-xs text-slate-400">
          Hệ thống bảo mật Row Level Security và phân quyền EduMate đã ngăn chặn hiển thị dữ liệu quản trị. Chỉ tài khoản <strong>Người Quản Lý (Manager/Admin)</strong> mới có quyền truy cập khu vực này.
        </p>
        {onNavigate && (
          <div className="pt-2">
            <button
              onClick={() => onNavigate('home')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              Trở về Trang chủ
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span>Khu Vực Quản Trị Hệ Thống EduMate Huế</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Duyệt hồ sơ người dạy, quản lý yêu cầu kết nối học, danh mục môn học và nhật ký kiểm toán
          </p>
        </div>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Hồ sơ người dạy chờ duyệt</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{pendingTutorsCount}</div>
          <div className="text-[11px] text-slate-400">Cần xác minh bằng cấp</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Người dạy đã xác minh</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{verifiedTutorsCount}</div>
          <div className="text-[11px] text-slate-400">Hiển thị công khai tại Huế</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Yêu cầu kết nối học</span>
            <FileSearch className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">{learningRequests.length}</div>
          <div className="text-[11px] text-slate-400">Giữa người học & người dạy</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Yêu cầu học vụ</span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            {requests.length}
          </div>
          <div className="text-[11px] text-teal-400">Biểu mẫu hành chính</div>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('tutors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
            adminTab === 'tutors'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>Duyệt Anh/Chị Khóa Trước ({tutors.length})</span>
          {pendingTutorsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black">
              {pendingTutorsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('learning_requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'learning_requests'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Yêu Cầu Kết Nối Học ({learningRequests.length})
        </button>

        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
            adminTab === 'users'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Tài Khoản & Quyền ({users.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
            adminTab === 'reports'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MessageSquareWarning className="w-3.5 h-3.5" />
          <span>Xử Lý Phản Ánh ({reports.length})</span>
          {pendingReportsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-black animate-pulse">
              {pendingReportsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setAdminTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
            adminTab === 'reviews'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Kiểm Duyệt Đánh Giá ({allReviews.length})</span>
        </button>

        <button
          onClick={() => setAdminTab('academic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'academic'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          38 Học Phần Đại Học ({academicItems.length})
        </button>

        <button
          onClick={() => setAdminTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'requests'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Hồ Sơ Học Vụ ({requests.length})
        </button>

        <button
          onClick={() => setAdminTab('reconciliation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'reconciliation'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Đối Soát ({payments.length})
        </button>

        <button
          onClick={() => setAdminTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'audit'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* TAB 0: DUYỆT HỒ SƠ NGƯỜI DẠY (QUY TRÌNH B) */}
      {adminTab === 'tutors' && (
        <section className="space-y-4">
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Lọc theo trạng thái:</span>
              {(['all', 'pending', 'verified', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setTutorFilter(f)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                    tutorFilter === f
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Chờ duyệt' : f === 'verified' ? 'Đã duyệt' : 'Từ chối'}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-400">
              * Chỉ hồ sơ đã duyệt mới được gắn nhãn đã xác minh trên trang chủ & tìm kiếm
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Anh/Chị Khóa Trước</th>
                    <th className="px-5 py-3.5">Môn Hướng Dẫn</th>
                    <th className="px-5 py-3.5">Khu Vực & Hình Thức</th>
                    <th className="px-5 py-3.5">Mức Phí</th>
                    <th className="px-5 py-3.5">Trạng Thái</th>
                    <th className="px-5 py-3.5 text-right">Kiểm Duyệt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {tutors
                    .filter(t => tutorFilter === 'all' || t.verification_status === tutorFilter)
                    .map(tutor => (
                      <tr key={tutor.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-3">
                            <img src={tutor.avatar_url} alt="" className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-700" />
                            <div>
                              <div className="font-bold text-white">{tutor.full_name}</div>
                              <div className="text-[11px] text-slate-400 line-clamp-1">{tutor.headline}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1">
                            {tutor.subjects.map((s, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-300">
                          <div>{tutor.district}</div>
                          <div className="text-[10px] text-slate-500">{tutor.teaching_mode === 'both' ? 'Trực tiếp & Online' : tutor.teaching_mode === 'offline' ? 'Trực tiếp tại Huế' : 'Online'}</div>
                        </td>
                        <td className="px-5 py-4 font-bold text-emerald-400">
                          {tutor.hourly_rate.toLocaleString('vi-VN')} đ/buổi
                        </td>
                        <td className="px-5 py-4">
                          {tutor.verification_status === 'verified' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Đã xác minh
                            </span>
                          )}
                          {tutor.verification_status === 'pending' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                              Chờ duyệt
                            </span>
                          )}
                          {tutor.verification_status === 'rejected' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Bị từ chối
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {tutor.verification_status === 'pending' ? (
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleVerifyTutor(tutor.id, 'rejected')}
                                className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 font-semibold border border-rose-800/60 transition-all cursor-pointer"
                              >
                                Từ chối
                              </button>
                              <button
                                onClick={() => handleVerifyTutor(tutor.id, 'verified')}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                              >
                                Phê duyệt
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Đã xử lý</span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 0.5: QUẢN LÝ YÊU CẦU HỌC TẬP (LEARNING REQUESTS) */}
      {adminTab === 'learning_requests' && (
        <section className="space-y-4">
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Mã Yêu Cầu</th>
                    <th className="px-5 py-3.5">Người Học</th>
                    <th className="px-5 py-3.5">Người Dạy</th>
                    <th className="px-5 py-3.5">Môn & Hình Thức</th>
                    <th className="px-5 py-3.5">Lịch Mong Muốn</th>
                    <th className="px-5 py-3.5">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {learningRequests.map((lr) => (
                    <tr key={lr.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-white">{lr.request_code}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-200">{lr.student_name}</td>
                      <td className="px-5 py-3.5 text-emerald-400 font-semibold">{lr.tutor_name}</td>
                      <td className="px-5 py-3.5">{lr.subject_name} ({lr.teaching_mode === 'offline' ? 'Trực tiếp' : 'Online'})</td>
                      <td className="px-5 py-3.5 text-slate-400">{lr.preferred_schedule}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lr.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                          lr.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-400' :
                          lr.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {lr.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB: QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN */}
      {adminTab === 'users' && (
        <section className="space-y-4">
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm tên, email, MSSV, khu vực..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-400 hidden sm:inline">Vai trò:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs w-full md:w-auto"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="student">Người học (Student)</option>
                <option value="tutor">Người dạy (Tutor)</option>
                <option value="manager">Quản trị viên (Manager)</option>
                <option value="admin">Root Admin</option>
              </select>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Người Dùng</th>
                    <th className="px-5 py-3.5">Mã SV / Khu Vực</th>
                    <th className="px-5 py-3.5">Vai Trò Hệ Thống</th>
                    <th className="px-5 py-3.5">Trạng Thái</th>
                    <th className="px-5 py-3.5">Ngày Tham Gia</th>
                    <th className="px-5 py-3.5 text-right">Khóa / Mở Khóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {users
                    .filter(u => {
                      const matchRole = userRoleFilter === 'all' || u.role === userRoleFilter;
                      const term = userSearchTerm.toLowerCase();
                      const matchSearch = !term || 
                        u.full_name.toLowerCase().includes(term) ||
                        u.email.toLowerCase().includes(term) ||
                        (u.student_code && u.student_code.toLowerCase().includes(term)) ||
                        (u.district && u.district.toLowerCase().includes(term));
                      return matchRole && matchSearch;
                    })
                    .map((user) => (
                      <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                            />
                            <div>
                              <div className="font-bold text-white flex items-center space-x-1.5">
                                <span>{user.full_name}</span>
                                {user.id === currentUser.id && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    Bạn
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="text-slate-300 font-medium">{user.student_code || 'Không có MSSV'}</div>
                          <div className="text-[10px] text-slate-500">{user.district || 'Thừa Thiên Huế'}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <select
                            value={user.role}
                            disabled={user.id === currentUser.id}
                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value as UserRole)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-60"
                          >
                            <option value="student">Người học (Student)</option>
                            <option value="tutor">Người dạy (Tutor)</option>
                            <option value="manager">Quản trị viên (Manager)</option>
                            <option value="admin">Root Admin</option>
                          </select>
                        </td>
                        <td className="px-5 py-3.5">
                          {user.status === 'active' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Đang hoạt động
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                              Tạm khóa
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                          {new Date(user.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            disabled={user.id === currentUser.id}
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                              user.status === 'active'
                                ? 'bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60'
                                : 'bg-emerald-950/60 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-800/60'
                            }`}
                          >
                            {user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB: XỬ LÝ PHẢN ÁNH & KHIẾU NẠI */}
      {adminTab === 'reports' && (
        <section className="space-y-4">
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Lọc theo trạng thái:</span>
              {(['all', 'pending', 'resolved', 'dismissed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setReportFilterStatus(f)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                    reportFilterStatus === f
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {f === 'all' ? 'Tất cả' : f === 'pending' ? 'Chờ xử lý' : f === 'resolved' ? 'Đã giải quyết' : 'Đã bác bỏ'}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-400">
              * Quản trị viên thẩm tra khiếu nại giữa người học và anh/chị khóa trước
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Mã & Ngày Gửi</th>
                    <th className="px-5 py-3.5">Người Gửi Phản Ánh</th>
                    <th className="px-5 py-3.5">Đối Tượng Phản Ánh</th>
                    <th className="px-5 py-3.5">Lý Do / Nội Dung</th>
                    <th className="px-5 py-3.5">Trạng Thái</th>
                    <th className="px-5 py-3.5">Ghi Chú Xử Lý</th>
                    <th className="px-5 py-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {reports
                    .filter(r => reportFilterStatus === 'all' || r.status === reportFilterStatus)
                    .map((report) => (
                      <tr key={report.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3.5 font-mono">
                          <div className="font-bold text-white">{report.id}</div>
                          <div className="text-[10px] text-slate-400">{new Date(report.created_at).toLocaleDateString('vi-VN')}</div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-200">
                          {report.reporter_name}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-rose-300">{report.target_name}</div>
                          <div className="text-[10px] text-slate-400 capitalize">Loại: {report.type}</div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-300 max-w-xs">
                          {report.reason}
                        </td>
                        <td className="px-5 py-3.5">
                          {report.status === 'pending' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                              Chờ xử lý
                            </span>
                          )}
                          {report.status === 'resolved' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Đã giải quyết
                            </span>
                          )}
                          {report.status === 'dismissed' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                              Đã bác bỏ
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 italic max-w-xs text-[11px]">
                          {report.resolution_notes || 'Chưa có ghi chú'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {report.status === 'pending' ? (
                            <button
                              onClick={() => {
                                setResolvingReport(report);
                                setResolutionNotes(report.resolution_notes || '');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold transition-all shadow-md cursor-pointer"
                            >
                              Xử lý khiếu nại
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setResolvingReport(report);
                                setResolutionNotes(report.resolution_notes || '');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
                            >
                              Xem lại
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB: KIỂM DUYỆT ĐÁNH GIÁ */}
      {adminTab === 'reviews' && (
        <section className="space-y-4">
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Tổng số đánh giá trong toàn hệ thống: <strong className="text-white">{allReviews.length}</strong>
            </span>
            <span className="text-[11px] text-slate-400">
              * Xóa đánh giá spam hoặc vi phạm chuẩn mực sẽ tự động cập nhật lại điểm sao của người dạy
            </span>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Người Học Đánh Giá</th>
                    <th className="px-5 py-3.5">Người Dạy</th>
                    <th className="px-5 py-3.5">Điểm Số</th>
                    <th className="px-5 py-3.5">Nhận Xét Chi Tiết</th>
                    <th className="px-5 py-3.5">Thời Gian</th>
                    <th className="px-5 py-3.5 text-right">Gỡ Bỏ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {allReviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white">
                        {rev.student_name}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-2">
                          <img src={rev.tutor_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                          <span className="text-emerald-400 font-medium">{rev.tutor_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-1 text-amber-400 font-bold">
                          <span>{rev.rating}</span>
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300 max-w-md">
                        "{rev.comment}"
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-[11px]">
                        {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 transition-all cursor-pointer"
                          title="Gỡ bỏ đánh giá vi phạm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 1: YÊU CẦU DỊCH VỤ & THẨM ĐỊNH */}
      {adminTab === 'requests' && (
        <section className="space-y-4">
          {/* Filter Bar */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm mã hồ sơ, tên sinh viên..."
                value={requestSearchTerm}
                onChange={(e) => setRequestSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-slate-400 hidden sm:inline">Trạng thái:</span>
              <select
                value={requestStatusFilter}
                onChange={(e) => setRequestStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs w-full md:w-auto"
              >
                <option value="all">Tất cả yêu cầu</option>
                <option value="submitted">Chờ xử lý (Submitted)</option>
                <option value="in_review">Đang thẩm định (In Review)</option>
                <option value="approved">Đã phê duyệt (Approved)</option>
                <option value="rejected">Đã từ chối (Rejected)</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Mã Yêu Cầu</th>
                    <th className="px-5 py-3.5">Người Học</th>
                    <th className="px-5 py-3.5">Loại Biểu Mẫu</th>
                    <th className="px-5 py-3.5">Ngày Nộp</th>
                    <th className="px-5 py-3.5">Trạng Thái</th>
                    <th className="px-5 py-3.5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                        Không có yêu cầu nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4 font-mono font-bold text-indigo-400">
                          {req.request_code}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white">{req.student_name}</div>
                          <div className="text-[11px] text-slate-400">{req.student_code}</div>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-200">
                          {req.form_type_title}
                        </td>
                        <td className="px-5 py-4 text-slate-400">
                          {new Date(req.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-5 py-4">
                          <RequestBadge status={req.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedReq(req);
                              setReviewNotes(req.review_notes || '');
                              setReviewError('');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-sm cursor-pointer"
                          >
                            Thẩm định hồ sơ
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: QUẢN LÝ DỮ LIỆU HỌC TẬP (CRUD) */}
      {adminTab === 'academic' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Quản lý toàn bộ danh mục chương trình, chuyên đề đào tạo và học phí
            </p>
            <button
              onClick={() => setShowAddAcademicModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mục học vụ mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {academicItems.map((item) => (
              <div key={item.id} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                    {item.code}
                  </span>
                  <AcademicBadge status={item.status} />
                </div>

                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Học phí: <strong className="text-emerald-400">{item.standard_fee.toLocaleString('vi-VN')} ₫</strong>
                  </span>
                  <button
                    onClick={() => {
                      const next = item.status === 'published' ? 'draft' : 'published';
                      dataService.updateAcademicItem(item.id, { status: next }, currentUser.id, currentUser.full_name);
                      reloadData();
                      showToast('info', 'Đã chuyển đổi trạng thái', `Mục "${item.code}" chuyển sang: ${next}`);
                    }}
                    className="text-xs text-indigo-400 hover:underline cursor-pointer"
                  >
                    {item.status === 'published' ? 'Chuyển về nháp' : 'Công khai ngay'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: ĐỐI SOÁT GIAO DỊCH */}
      {adminTab === 'reconciliation' && (
        <section className="space-y-4">
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Mã Giao Dịch</th>
                    <th className="px-5 py-3.5">Mã Đơn Hàng</th>
                    <th className="px-5 py-3.5">Mã Tham Chiếu NH</th>
                    <th className="px-5 py-3.5">Số Tiền</th>
                    <th className="px-5 py-3.5">Trạng Thái</th>
                    <th className="px-5 py-3.5 text-right">Đối Soát</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40">
                      <td className="px-5 py-4 font-mono font-bold text-indigo-400">{p.payment_code}</td>
                      <td className="px-5 py-4 font-mono text-amber-400">{p.order_code}</td>
                      <td className="px-5 py-4 font-mono text-slate-200">{p.transaction_ref || 'N/A'}</td>
                      <td className="px-5 py-4 font-bold text-emerald-400">{p.amount.toLocaleString('vi-VN')} ₫</td>
                      <td className="px-5 py-4">
                        <PaymentBadge status={p.status} />
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {p.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleVerifyPayment(p.id, 'successful')}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all cursor-pointer shadow-sm"
                            >
                              Khớp lệnh hợp lệ
                            </button>
                            <button
                              onClick={() => handleVerifyPayment(p.id, 'failed')}
                              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all cursor-pointer"
                            >
                              Từ chối
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-500">Đã kiểm toán</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {adminTab === 'audit' && (
        <section className="space-y-4">
          <div className="glass-card rounded-2xl border border-slate-800 p-4 space-y-2">
            {auditLogs.slice(0, 20).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-indigo-400">[{log.action}]</span>
                    <span className="text-slate-200 font-mono">{log.entity_name}</span>
                    <span className="text-slate-400">
                      bởi: <strong className="text-white">{log.performed_by_name || 'Quản lý'}</strong>
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">ID: {log.entity_id}</div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {new Date(log.created_at).toLocaleString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODAL: Thẩm Định Hồ Sơ Chi Tiết */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FileSearch className="w-5 h-5 text-indigo-400" />
                <span>Thẩm Định Hồ Sơ: {selectedReq.request_code}</span>
              </h3>
              <button
                onClick={() => setSelectedReq(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="text-slate-400">Người nộp đơn:</div>
                <div className="font-bold text-white text-sm">{selectedReq.student_name}</div>
                <div className="text-slate-400">Mã SV: <span className="font-mono text-slate-200">{selectedReq.student_code}</span></div>
                <div className="text-slate-400">Email: {selectedReq.student_email}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="text-slate-400">Loại biểu mẫu:</div>
                <div className="font-bold text-indigo-300 text-sm">{selectedReq.form_type_title}</div>
                <div className="text-slate-400 mt-1">Ngày nộp: {new Date(selectedReq.created_at).toLocaleString('vi-VN')}</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="font-bold text-slate-300 mb-1">Dữ liệu biểu mẫu người học đã gửi:</div>
              <pre className="font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(selectedReq.form_data, null, 2)}
              </pre>
            </div>

            {reviewError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{reviewError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Ghi chú thẩm định / Lý do phê duyệt hoặc từ chối (Bắt buộc nếu từ chối):
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Nhập phản hồi, hướng dẫn hoặc căn cứ xử lý hồ sơ..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleReviewAction('in_review')}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Đánh dấu đang thụ lý (In Review)</span>
              </button>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleReviewAction('rejected')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Từ chối hồ sơ</span>
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleReviewAction('approved')}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Phê duyệt hồ sơ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Thêm Mục Học Tập Mới */}
      {showAddAcademicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Thêm Mục Học Tập / Học Phần Mới</span>
              </h3>
              <button
                onClick={() => setShowAddAcademicModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAcademic} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Mã định danh:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: EDU-TECH-305"
                  value={academicForm.code}
                  onChange={(e) => setAcademicForm({ ...academicForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Tên mục học tập:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phân Tích Yêu Cầu Phần Mềm Thực Chiến"
                  value={academicForm.title}
                  onChange={(e) => setAcademicForm({ ...academicForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Mô tả tóm tắt:</label>
                <textarea
                  rows={2}
                  value={academicForm.description}
                  onChange={(e) => setAcademicForm({ ...academicForm, description: e.target.value })}
                  placeholder="Nội dung, mục tiêu của chuyên đề..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Định mức học phí (VND):</label>
                  <input
                    type="number"
                    min="0"
                    value={academicForm.standard_fee}
                    onChange={(e) => setAcademicForm({ ...academicForm, standard_fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Trạng thái phát hành:</label>
                  <select
                    value={academicForm.status}
                    onChange={(e) => setAcademicForm({ ...academicForm, status: e.target.value as AcademicStatus })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="published">Công khai (Published)</option>
                    <option value="draft">Bản nháp (Draft)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAcademicModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Lưu & Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Xử Lý Khiếu Nại & Phản Ánh */}
      {resolvingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <MessageSquareWarning className="w-5 h-5 text-rose-400" />
                <span>Xử Lý Phản Ánh & Khiếu Nại (#{resolvingReport.id})</span>
              </h3>
              <button
                onClick={() => setResolvingReport(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
              <div>
                <span className="text-slate-400">Người gửi: </span>
                <strong className="text-white">{resolvingReport.reporter_name}</strong>
              </div>
              <div>
                <span className="text-slate-400">Đối tượng phản ánh: </span>
                <strong className="text-rose-300">{resolvingReport.target_name}</strong> ({resolvingReport.type})
              </div>
              <div>
                <span className="text-slate-400">Nội dung: </span>
                <span className="text-slate-200">{resolvingReport.reason}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block text-slate-300 font-medium">Ghi chú xử lý / Quyết định phân giải:</label>
              <textarea
                rows={3}
                placeholder="Nhập ghi chú xử lý, kết quả liên hệ hòa giải hoặc giải pháp cho hai bên..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleResolveReport('dismissed')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Bác bỏ khiếu nại (Dismiss)
              </button>
              <button
                type="button"
                onClick={() => handleResolveReport('resolved')}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                Xác nhận đã giải quyết (Resolved)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
