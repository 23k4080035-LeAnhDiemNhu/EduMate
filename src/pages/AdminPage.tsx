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
  Review,
  PaymentIntent,
  PaymentVerificationStatus,
  RefundRequest,
  RefundStatus,
  BankConfig
} from '../types';
import { dataService } from '../services/dataService';
import { isSupabaseConfigured, supabaseReviewRequest, supabaseFetchRequests } from '../lib/supabase';
import { RequestBadge, AcademicBadge } from '../components/common/Badge';
import { Forbidden403 } from '../components/common/Forbidden403';
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
  AlertTriangle,
  Loader2,
  Users, 
  MessageSquareWarning, 
  Star, 
  Trash2,
  DollarSign,
  TrendingUp,
  Target,
  PieChart,
  Info,
  QrCode,
  Banknote,
  Building,
  BarChart3
} from 'lucide-react';
import { StatisticsTab } from '../components/reporting/StatisticsTab';

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
  const [adminTab, setAdminTab] = useState<'statistics' | 'financial' | 'tutors' | 'learning_requests' | 'users' | 'reports' | 'reviews' | 'academic' | 'requests' | 'reconciliation' | 'audit'>('statistics');

  // Datasets from service
  const [tutors, setTutors] = useState<TutorProfile[]>(() => dataService.getTutors(false));
  const [learningRequests, setLearningRequests] = useState<LearningRequest[]>(() => dataService.getLearningRequests());
  const [financialMetrics, setFinancialMetrics] = useState(() => dataService.getPlatformFinancialMetrics());
  const [requests, setRequests] = useState<ServiceRequest[]>(() => dataService.getRequests());
  const [academicItems, setAcademicItems] = useState<AcademicItem[]>(() => dataService.getAcademicItems());
  const [_orders, setOrders] = useState<Order[]>(() => dataService.getOrders());
  const [_payments, setPayments] = useState<Payment[]>(() => dataService.getPayments());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => dataService.getAuditLogs());
  const [users, setUsers] = useState<Profile[]>(() => dataService.getUsers());
  const [reports, setReports] = useState<ReportItem[]>(() => dataService.getReports());
  const [reviews, setReviews] = useState<Review[]>(() => dataService.getReviews());
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>(() => dataService.getPaymentIntents());
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>(() => dataService.getRefundRequests());
  const [bankConfig, setBankConfig] = useState<BankConfig>(() => dataService.getBankConfig());
  const [bankConfigForm, setBankConfigForm] = useState<BankConfig>(() => dataService.getBankConfig());
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [reconciliationSubTab, setReconciliationSubTab] = useState<'awaiting' | 'paid' | 'needs_review' | 'refunds' | 'all' | 'bank_config'>('awaiting');

  // Verify Payment Modal
  const [verifyingIntent, setVerifyingIntent] = useState<PaymentIntent | null>(null);
  const [verifyStatusChoice, setVerifyStatusChoice] = useState<PaymentVerificationStatus>('verified');
  const [verifyBankRef, setVerifyBankRef] = useState('');
  const [verifyNotes, setVerifyNotes] = useState('');

  // Process Refund Modal
  const [processingRefund, setProcessingRefund] = useState<RefundRequest | null>(null);
  const [refundStatusChoice, setRefundStatusChoice] = useState<RefundStatus>('approved');
  const [refundBankRef, setRefundBankRef] = useState('');
  const [refundNotes, setRefundNotes] = useState('');

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
    setFinancialMetrics(dataService.getPlatformFinancialMetrics());
    setUsers(dataService.getUsers());
    setReports(dataService.getReports());
    setReviews(dataService.getReviews());
    setPaymentIntents(dataService.getPaymentIntents());
    setRefundRequests(dataService.getRefundRequests());
    setBankConfig(dataService.getBankConfig());
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

  // VietQR Payment Reconciliation Logic
  const handleVerifyPaymentIntent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingIntent) return;

    try {
      dataService.verifyPaymentIntent(
        verifyingIntent.id,
        verifyStatusChoice,
        currentUser.id,
        currentUser.full_name,
        verifyBankRef.trim() || verifyingIntent.transfer_reference || 'N/A',
        verifyNotes.trim() || undefined
      );
      reloadData();
      setVerifyingIntent(null);
      setVerifyBankRef('');
      setVerifyNotes('');
      showToast(
        verifyStatusChoice === 'verified' ? 'success' : 'info',
        'Cập nhật đối soát thành công!',
        `Giao dịch ${verifyingIntent.request_code} đã chuyển sang trạng thái: ${verifyStatusChoice}`
      );
    } catch (err: any) {
      showToast('error', 'Lỗi đối soát', err.message);
    }
  };

  // Refund Management Logic
  const handleProcessRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingRefund) return;

    if (refundStatusChoice === 'refunded' && !refundBankRef.trim()) {
      showToast('error', 'Thiếu mã chuyển tiền', 'Bắt buộc phải nhập mã giao dịch ngân hàng để xác nhận đã hoàn tiền thực tế.');
      return;
    }

    if (refundStatusChoice === 'rejected' && !refundNotes.trim()) {
      showToast('error', 'Thiếu lý do từ chối', 'Bắt buộc phải nhập lý do khi từ chối yêu cầu hoàn tiền.');
      return;
    }

    try {
      dataService.processRefundRequest(
        processingRefund.id,
        refundStatusChoice,
        currentUser.id,
        currentUser.full_name,
        refundBankRef.trim() || undefined,
        refundNotes.trim() || undefined
      );
      reloadData();
      setProcessingRefund(null);
      setRefundBankRef('');
      setRefundNotes('');
      showToast(
        refundStatusChoice === 'refunded' ? 'success' : 'info',
        'Cập nhật yêu cầu hoàn tiền thành công!',
        `Yêu cầu hoàn tiền đã chuyển sang trạng thái: ${refundStatusChoice}`
      );
    } catch (err: any) {
      showToast('error', 'Lỗi xử lý hoàn tiền', err.message);
    }
  };

  // Cập nhật cấu hình tài khoản ngân hàng nhận học phí
  const handleSaveBankConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankConfigForm.bank_id.trim() || !bankConfigForm.account_number.trim() || !bankConfigForm.account_holder.trim()) {
      showToast('error', 'Thiếu thông tin bắt buộc', 'Vui lòng điền đầy đủ Mã ngân hàng, Số tài khoản và Tên chủ tài khoản.');
      return;
    }
    setIsSavingBank(true);
    try {
      const updated = dataService.updateBankConfig(bankConfigForm, currentUser.id);
      setBankConfig(updated);
      setBankConfigForm(updated);
      setAuditLogs(dataService.getAuditLogs());
      showToast('success', 'Đã lưu cấu hình ngân hàng', `Ngân hàng: ${updated.bank_name} - STK: ${updated.account_number}`);
    } catch (err: any) {
      showToast('error', 'Lỗi lưu cấu hình', err.message);
    } finally {
      setIsSavingBank(false);
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
      <Forbidden403
        requiredRole="Quản lý Giáo vụ (Manager)"
        currentRole={currentUser.role}
        resourceName="Khu vực Quản trị & Đối soát tài chính"
        onNavigate={onNavigate || (() => {})}
      />
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
          onClick={() => setAdminTab('statistics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
            adminTab === 'statistics'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Thống Kê & Báo Cáo</span>
        </button>

        <button
          onClick={() => setAdminTab('financial')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
            adminTab === 'financial'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>Tài Chính & Phí Nền Tảng 15%</span>
        </button>

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
          Hồ Sơ Hành Chính (Bổ trợ) ({requests.length})
        </button>

        <button
          onClick={() => setAdminTab('reconciliation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
            adminTab === 'reconciliation'
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
          <span>Đối Soát & Hoàn Tiền VietQR ({paymentIntents.length})</span>
          {paymentIntents.filter(i => i.status === 'awaiting_verification').length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-black animate-pulse">
              {paymentIntents.filter(i => i.status === 'awaiting_verification').length}
            </span>
          )}
          {refundRequests.filter(r => ['requested', 'under_review'].includes(r.status)).length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500 text-white font-black">
              {refundRequests.filter(r => ['requested', 'under_review'].includes(r.status)).length} hoàn
            </span>
          )}
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

      {/* TAB: THỐNG KÊ & BÁO CÁO TỔNG THỂ */}
      {adminTab === 'statistics' && (
        <StatisticsTab />
      )}

      {/* TAB: TÀI CHÍNH & DOANH THU PHÍ 15% (CHƯƠNG 2.6.6 & 3.3 CỦA PDF) */}
      {adminTab === 'financial' && (
        <section className="space-y-6 animate-fadeIn">
          {/* Business Model Summary Banner */}
          <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-slate-900/90 via-emerald-950/20 to-slate-900/90 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Mô hình Doanh thu & Kế hoạch Tài chính EduMate Huế</h3>
                <p className="text-xs text-slate-400">
                  Căn cứ Chương 2.6.6 & Chương 3.3 Đồ án Khởi nghiệp: EduMate thu phí nền tảng 15% trên mỗi gói học; 85% chi trả trực tiếp cho gia sư.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-slate-400 text-[11px] font-semibold">Chi phí vận hành cố định</div>
                <div className="text-base font-extrabold text-white mt-0.5">2.200.000 đ / tháng</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Hosting, tên miền, truyền thông sinh viên ĐH Kinh tế Huế</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-slate-400 text-[11px] font-semibold">Phí trung bình mỗi gói (15%)</div>
                <div className="text-base font-extrabold text-emerald-400 mt-0.5">45.000 đ / gói</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Tính trên giá trị gói bình quân 300.000 đ</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <div className="text-slate-400 text-[11px] font-semibold">Điểm hòa vốn lý thuyết</div>
                <div className="text-base font-extrabold text-amber-400 mt-0.5">49 gói / tháng</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Mục tiêu 100 gói/tháng: Lợi nhuận ~2.300.000 đ/tháng</div>
              </div>
            </div>
          </div>

          {/* 4 Financial KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Tổng giá trị giao dịch (GMV)</span>
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {financialMetrics.total_gmv.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-slate-400">{financialMetrics.completed_packages_count} gói đã hoàn thành</div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-emerald-500/30 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Doanh thu EduMate (Phí 15%)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {financialMetrics.total_platform_fee.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-emerald-400/90 font-medium">15% phí dịch vụ nền tảng</div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Chi trả Người dạy (85%)</span>
                <PieChart className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-purple-300">
                {financialMetrics.total_tutor_earnings.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-slate-400">Thu nhập thực nhận của gia sư</div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Tiến độ hòa vốn tháng</span>
                <Target className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-400">
                {financialMetrics.completed_packages_count} / {financialMetrics.break_even_target_packages}
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.max(5, financialMetrics.break_even_percent)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 text-right">{financialMetrics.break_even_percent}% mục tiêu 49 gói</div>
            </div>
          </div>

          {/* VietQR Payment & Refund Financial Realization Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-4 border border-blue-500/30 bg-blue-950/10 space-y-1">
              <div className="flex items-center justify-between text-blue-300 text-xs">
                <span>Chờ đối soát chuyển khoản (Chưa ghi nhận doanh thu)</span>
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xl font-black text-blue-400">
                {financialMetrics.pending_verification_volume.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-slate-400">
                {financialMetrics.pending_verification_count} giao dịch đang chờ khớp lệnh ngân hàng
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-purple-500/30 bg-purple-950/10 space-y-1">
              <div className="flex items-center justify-between text-purple-300 text-xs">
                <span>Nghĩa vụ hoàn tiền (Người dạy từ chối)</span>
                <Banknote className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl font-black text-purple-400">
                {financialMetrics.refund_liability_volume.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-slate-400">
                {financialMetrics.refund_liability_count} yêu cầu hoàn 100% đang xử lý
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-teal-500/30 bg-teal-950/10 space-y-1">
              <div className="flex items-center justify-between text-teal-300 text-xs">
                <span>Đã hoàn tiền thực tế</span>
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-xl font-black text-teal-400">
                {financialMetrics.refunded_volume.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-slate-400">
                {financialMetrics.refunded_count} lệnh hoàn tất (đã trừ khỏi doanh thu ròng)
              </div>
            </div>
          </div>

          {/* Standardized Packages Structure Breakdown Table */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden space-y-3 p-5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <span>Bảng định mức 3 Gói học chuẩn hóa EduMate (Chương 2.6.3 & 3.3)</span>
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Gói học</th>
                    <th className="px-4 py-3">Số buổi</th>
                    <th className="px-4 py-3">Đơn giá / buổi</th>
                    <th className="px-4 py-3">Tổng học phí</th>
                    <th className="px-4 py-3">Phí EduMate (15%)</th>
                    <th className="px-4 py-3">Thu nhập Gia sư (85%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-800/20">
                    <td className="px-4 py-3 font-bold text-white">Gói học thử</td>
                    <td className="px-4 py-3">3 buổi</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">30.000 đ</td>
                    <td className="px-4 py-3 font-bold text-white">90.000 đ</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">13.500 đ</td>
                    <td className="px-4 py-3 text-purple-300 font-bold">76.500 đ</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="px-4 py-3 font-bold text-white">Gói cấp tốc</td>
                    <td className="px-4 py-3">15 buổi</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">30.000 đ</td>
                    <td className="px-4 py-3 font-bold text-white">450.000 đ</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">67.500 đ</td>
                    <td className="px-4 py-3 text-purple-300 font-bold">382.500 đ</td>
                  </tr>
                  <tr className="hover:bg-slate-800/20">
                    <td className="px-4 py-3 font-bold text-white">Gói dài hạn</td>
                    <td className="px-4 py-3">12 buổi</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">30.000 đ</td>
                    <td className="px-4 py-3 font-bold text-white">360.000 đ</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">54.000 đ</td>
                    <td className="px-4 py-3 text-purple-300 font-bold">306.000 đ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

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
                    <th className="px-5 py-3.5">Gói Học Chuẩn</th>
                    <th className="px-5 py-3.5">Môn & Hình Thức</th>
                    <th className="px-5 py-3.5">Học Phí & Phí 15%</th>
                    <th className="px-5 py-3.5">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {learningRequests.map((lr) => (
                    <tr key={lr.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-white">{lr.request_code}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-200">{lr.student_name}</td>
                      <td className="px-5 py-3.5 text-emerald-400 font-semibold">{lr.tutor_name}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-white">{lr.package_name || 'Gói học thử'}</span>
                        <div className="text-[10px] text-slate-400">{lr.total_sessions || 3} buổi</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div>{lr.subject_name}</div>
                        <div className="text-[10px] text-slate-400">{lr.teaching_mode === 'offline' ? 'Trực tiếp tại Huế' : 'Online'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white">{(lr.total_price || 90000).toLocaleString('vi-VN')} đ</div>
                        <div className="text-[10px] text-emerald-400">Phí 15%: {(lr.platform_fee || 13500).toLocaleString('vi-VN')} đ</div>
                      </td>
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
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center space-x-2.5">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span><strong>Mô-đun bổ trợ:</strong> Quản lý hồ sơ hành chính & dịch vụ sinh viên tổng hợp (Được bảo lưu để tương thích hệ thống; luồng cốt lõi EduMate tập trung vào kết nối người học và người dạy).</span>
          </div>
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

      {/* TAB 3: ĐỐI SOÁT & HOÀN TIỀN VIETQR */}
      {adminTab === 'reconciliation' && (
        <section className="space-y-5 animate-fadeIn">
          {/* Sub Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setReconciliationSubTab('awaiting')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  reconciliationSubTab === 'awaiting'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Chờ Đối Soát ({paymentIntents.filter(i => i.status === 'awaiting_verification').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setReconciliationSubTab('paid')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  reconciliationSubTab === 'paid'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã Xác Nhận ({paymentIntents.filter(i => i.status === 'paid').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setReconciliationSubTab('needs_review')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  reconciliationSubTab === 'needs_review'
                    ? 'bg-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Cần Kiểm Tra ({paymentIntents.filter(i => i.status === 'needs_review').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setReconciliationSubTab('refunds')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  reconciliationSubTab === 'refunds'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Yêu Cầu Hoàn Tiền ({refundRequests.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setReconciliationSubTab('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  reconciliationSubTab === 'all'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                Tất Cả Giao Dịch ({paymentIntents.length})
              </button>

              <button
                type="button"
                onClick={() => setReconciliationSubTab('bank_config')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  reconciliationSubTab === 'bank_config'
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Cấu Hình Tài Khoản Nhận</span>
              </button>
            </div>
          </div>

          {/* SUB-VIEW 1: CHỜ ĐỐI SOÁT */}
          {reconciliationSubTab === 'awaiting' && (
            <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden space-y-3">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Danh Sách Giao Dịch Người Học Đã Chuyển Khoản – Chờ Khớp Lệnh Sao Kê</span>
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Quản trị viên kiểm tra sao kê ngân hàng {bankConfig.bank_name} số {bankConfig.account_number} và nhấn "Khớp lệnh" để kích hoạt gói học.
                  </p>
                </div>
              </div>

              {paymentIntents.filter(i => i.status === 'awaiting_verification').length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Không có giao dịch nào đang chờ đối soát.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Mã Yêu Cầu</th>
                        <th className="px-4 py-3">Người Học</th>
                        <th className="px-4 py-3">Người Dạy</th>
                        <th className="px-4 py-3">Gói Học</th>
                        <th className="px-4 py-3">Số Tiền</th>
                        <th className="px-4 py-3">Mã Tham Chiếu SV Khai</th>
                        <th className="px-4 py-3">Nội Dung Chuẩn</th>
                        <th className="px-4 py-3 text-right">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {paymentIntents.filter(i => i.status === 'awaiting_verification').map(intent => (
                        <tr key={intent.id} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3.5 font-mono font-bold text-indigo-400">{intent.request_code}</td>
                          <td className="px-4 py-3.5 font-semibold text-white">{intent.student_name}</td>
                          <td className="px-4 py-3.5 text-slate-300">{intent.tutor_name}</td>
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[11px]">
                              {intent.package_name}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-bold text-emerald-400">
                            {intent.amount_vnd.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="px-4 py-3.5 font-mono text-amber-300">
                            {intent.transfer_reference || 'Chưa cung cấp'}
                          </td>
                          <td className="px-4 py-3.5 font-mono text-indigo-300">{intent.transfer_memo}</td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyingIntent(intent);
                                setVerifyStatusChoice('verified');
                                setVerifyBankRef(intent.transfer_reference || '');
                                setVerifyNotes('Đã khớp sao kê tài khoản ngân hàng EduMate');
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                            >
                              Khớp Lệnh Ngân Hàng
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 2: ĐÃ XÁC NHẬN */}
          {reconciliationSubTab === 'paid' && (
            <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden space-y-3">
              <div className="p-4 border-b border-slate-800 text-xs">
                <h4 className="font-bold text-white flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Danh Sách Giao Dịch Đã Xác Minh Thanh Toán Thực Tế (Doanh Thu Ghi Nhận)</span>
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Mã Yêu Cầu</th>
                      <th className="px-4 py-3">Người Học</th>
                      <th className="px-4 py-3">Người Dạy</th>
                      <th className="px-4 py-3">Gói Học</th>
                      <th className="px-4 py-3">Tổng Thu</th>
                      <th className="px-4 py-3">Phí EduMate (15%)</th>
                      <th className="px-4 py-3">Gia Sư Nhận (85%)</th>
                      <th className="px-4 py-3">Thời Gian Duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {paymentIntents.filter(i => i.status === 'paid').map(intent => (
                      <tr key={intent.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3.5 font-mono font-bold text-indigo-400">{intent.request_code}</td>
                        <td className="px-4 py-3.5 text-white font-semibold">{intent.student_name}</td>
                        <td className="px-4 py-3.5 text-slate-300">{intent.tutor_name}</td>
                        <td className="px-4 py-3.5 text-emerald-400 font-bold">{intent.package_name}</td>
                        <td className="px-4 py-3.5 font-bold text-white">{intent.amount_vnd.toLocaleString('vi-VN')} ₫</td>
                        <td className="px-4 py-3.5 font-bold text-emerald-400">{intent.platform_fee_vnd.toLocaleString('vi-VN')} ₫</td>
                        <td className="px-4 py-3.5 font-bold text-purple-300">{intent.tutor_share_vnd.toLocaleString('vi-VN')} ₫</td>
                        <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                          {intent.paid_at ? new Date(intent.paid_at).toLocaleString('vi-VN') : 'Đã duyệt'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: CẦN KIỂM TRA */}
          {reconciliationSubTab === 'needs_review' && (
            <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden space-y-3">
              <div className="p-4 border-b border-slate-800 text-xs">
                <h4 className="font-bold text-white flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span>Giao Dịch Cần Kiểm Tra (Người dạy từ chối khi đang xác minh...)</span>
                </h4>
              </div>

              {paymentIntents.filter(i => i.status === 'needs_review').length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Không có giao dịch nào cần xử lý khẩn cấp.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Mã Yêu Cầu</th>
                        <th className="px-4 py-3">Người Học</th>
                        <th className="px-4 py-3">Người Dạy</th>
                        <th className="px-4 py-3">Số Tiền</th>
                        <th className="px-4 py-3">Mã Tham Chiếu</th>
                        <th className="px-4 py-3 text-right">Xử Lý</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {paymentIntents.filter(i => i.status === 'needs_review').map(intent => (
                        <tr key={intent.id} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3.5 font-mono font-bold text-indigo-400">{intent.request_code}</td>
                          <td className="px-4 py-3.5 text-white">{intent.student_name}</td>
                          <td className="px-4 py-3.5 text-slate-300">{intent.tutor_name}</td>
                          <td className="px-4 py-3.5 font-bold text-amber-400">{intent.amount_vnd.toLocaleString('vi-VN')} ₫</td>
                          <td className="px-4 py-3.5 font-mono text-slate-300">{intent.transfer_reference}</td>
                          <td className="px-4 py-3.5 text-right space-x-2">
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyingIntent(intent);
                                setVerifyStatusChoice('verified');
                                setVerifyBankRef(intent.transfer_reference || '');
                                setVerifyNotes('Đã nhận tiền, chuyển hoàn cho học viên vì gia sư từ chối.');
                              }}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
                            >
                              Đã nhận (Tạo hoàn tiền)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setVerifyingIntent(intent);
                                setVerifyStatusChoice('rejected');
                                setVerifyBankRef('');
                                setVerifyNotes('Chưa nhận được tiền vào tài khoản ngân hàng, hủy yêu cầu.');
                              }}
                              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer"
                            >
                              Không nhận được (Hủy)
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 4: YÊU CẦU HOÀN TIỀN */}
          {reconciliationSubTab === 'refunds' && (
            <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden space-y-3">
              <div className="p-4 border-b border-slate-800 text-xs">
                <h4 className="font-bold text-white flex items-center space-x-2">
                  <Banknote className="w-4 h-4 text-purple-400" />
                  <span>Quản Lý Yêu Cầu Hoàn Tiền 100% Học Phí Cho Học Viên (Chính Sách Bảo Vệ Người Học)</span>
                </h4>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Áp dụng khi người dạy từ chối trước buổi học đầu tiên hoặc yêu cầu bị hủy hợp lệ. Hoàn trả 100% không phạt phí nền tảng.
                </p>
              </div>

              {refundRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Chưa có yêu cầu hoàn tiền nào.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Mã Hoàn Tiền</th>
                        <th className="px-4 py-3">Mã Yêu Cầu</th>
                        <th className="px-4 py-3">Học Viên</th>
                        <th className="px-4 py-3">Số Tiền Hoàn (100%)</th>
                        <th className="px-4 py-3">Tài Khoản Nhận Hoàn Tiền</th>
                        <th className="px-4 py-3">Trạng Thái</th>
                        <th className="px-4 py-3 text-right">Xử Lý Lệnh</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {refundRequests.map(refund => (
                        <tr key={refund.id} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3.5 font-mono font-bold text-purple-400">{refund.id}</td>
                          <td className="px-4 py-3.5 font-mono text-white">{refund.request_code}</td>
                          <td className="px-4 py-3.5 font-semibold text-white">{refund.student_name}</td>
                          <td className="px-4 py-3.5 font-bold text-emerald-400 text-sm">
                            {refund.refund_amount_vnd.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="px-4 py-3.5 text-xs">
                            {refund.student_bank_account ? (
                              <div className="space-y-0.5">
                                <div className="text-white font-semibold">{refund.student_bank_account.bank_name}</div>
                                <div className="font-mono text-emerald-300 font-bold">{refund.student_bank_account.account_number}</div>
                                <div className="text-[11px] text-slate-400 uppercase">{refund.student_bank_account.account_holder}</div>
                              </div>
                            ) : (
                              <span className="text-amber-400 italic">Chờ học viên cập nhật STK</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              refund.status === 'refunded'
                                ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                                : refund.status === 'approved'
                                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                                : refund.status === 'processing'
                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                : refund.status === 'rejected'
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}>
                              {refund.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {refund.status === 'refunded' ? (
                              <span className="text-[11px] font-mono text-slate-500">
                                Ref: {refund.bank_refund_reference}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setProcessingRefund(refund);
                                  setRefundStatusChoice(refund.status === 'requested' ? 'approved' : 'refunded');
                                  setRefundBankRef(refund.bank_refund_reference || '');
                                  setRefundNotes(refund.admin_notes || 'Hoàn tiền 100% học phí theo chính sách EduMate');
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-purple-600/20"
                              >
                                Cập Nhật Tiến Trình
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 5: TẤT CẢ GIAO DỊCH */}
          {reconciliationSubTab === 'all' && (
            <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden space-y-3">
              <div className="p-4 border-b border-slate-800 text-xs font-bold text-white">
                Toàn Bộ Nhật Ký Giao Dịch VietQR ({paymentIntents.length})
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Mã GD</th>
                      <th className="px-4 py-3">Mã Yêu Cầu</th>
                      <th className="px-4 py-3">Học Viên</th>
                      <th className="px-4 py-3">Gói Học</th>
                      <th className="px-4 py-3">Số Tiền</th>
                      <th className="px-4 py-3">Trạng Thái</th>
                      <th className="px-4 py-3">Thời Gian Tạo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {paymentIntents.map(i => (
                      <tr key={i.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono text-indigo-400">{i.id}</td>
                        <td className="px-4 py-3 font-mono font-bold text-white">{i.request_code}</td>
                        <td className="px-4 py-3">{i.student_name}</td>
                        <td className="px-4 py-3">{i.package_name}</td>
                        <td className="px-4 py-3 font-bold text-emerald-400">{i.amount_vnd.toLocaleString('vi-VN')} ₫</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            i.status === 'paid' ? 'bg-emerald-500/20 text-emerald-300' :
                            i.status === 'awaiting_verification' ? 'bg-blue-500/20 text-blue-300' :
                            i.status === 'refunded' ? 'bg-teal-500/20 text-teal-300' :
                            i.status === 'refund_pending' ? 'bg-purple-500/20 text-purple-300' :
                            i.status === 'cancelled' ? 'bg-slate-800 text-slate-400' :
                            'bg-amber-500/20 text-amber-300'
                          }`}>
                            {i.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-[11px]">
                          {new Date(i.created_at).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUB-VIEW 6: CẤU HÌNH TÀI KHOẢN NHẬN TIỀN */}
          {reconciliationSubTab === 'bank_config' && (
            <div className="glass-card rounded-2xl border border-slate-800 p-6 space-y-5 max-w-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span>Cấu Hình Tài Khoản Nhận Thanh Toán VietQR</span>
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase ${
                  bankConfig.is_demo ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {bankConfig.is_demo ? 'Sandbox Demo' : 'Live Production'}
                </span>
              </div>

              {bankConfig.is_demo ? (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                  <strong>Chế độ Mô Phỏng (Demo Sandbox):</strong> Hệ thống đang hiển thị cảnh báo MÔ PHỎNG – KHÔNG CHUYỂN TIỀN THẬT cho người học.
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  <strong>Chế độ Thực Tế (Live Production):</strong> Tài khoản thụ hưởng đang hoạt động chính thức. Người học quét VietQR và chuyển khoản học phí trực tiếp vào tài khoản này.
                </div>
              )}

              <form onSubmit={handleSaveBankConfig} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mã ngân hàng VietQR (Bank ID):</label>
                  <input
                    type="text"
                    required
                    value={bankConfigForm.bank_id}
                    onChange={(e) => setBankConfigForm({ ...bankConfigForm, bank_id: e.target.value.toUpperCase().trim() })}
                    placeholder="Ví dụ: ICB, VCB, MB..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Gợi ý mã chuẩn: <strong>ICB</strong> (VietinBank), <strong>VCB</strong> (Vietcombank), <strong>MB</strong> (MBBank), <strong>BIDV</strong> (BIDV)
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tên đầy đủ ngân hàng:</label>
                  <input
                    type="text"
                    required
                    value={bankConfigForm.bank_name}
                    onChange={(e) => setBankConfigForm({ ...bankConfigForm, bank_name: e.target.value })}
                    placeholder="Ví dụ: Ngân hàng TMCP Công thương Việt Nam (VietinBank)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Số tài khoản nhận học phí:</label>
                  <input
                    type="text"
                    required
                    value={bankConfigForm.account_number}
                    onChange={(e) => setBankConfigForm({ ...bankConfigForm, account_number: e.target.value.trim() })}
                    placeholder="Ví dụ: 107879627729"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tên người thụ hưởng (In hoa không dấu):</label>
                  <input
                    type="text"
                    required
                    value={bankConfigForm.account_holder}
                    onChange={(e) => setBankConfigForm({ ...bankConfigForm, account_holder: e.target.value.toUpperCase() })}
                    placeholder="Ví dụ: EDUMATE HUE"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold uppercase focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bankConfigForm.is_demo}
                      onChange={(e) => setBankConfigForm({ ...bankConfigForm, is_demo: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-slate-300">Bật chế độ thử nghiệm (Demo Sandbox)</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSavingBank}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isSavingBank ? 'Đang lưu...' : 'Lưu Cấu Hình Ngân Hàng'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

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
                type="button"
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

      {/* MODAL: Đối Soát Giao Dịch Chuyển Khoản VietQR */}
      {verifyingIntent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span>Đối Soát Giao Dịch: {verifyingIntent.request_code}</span>
              </h3>
              <button
                type="button"
                onClick={() => setVerifyingIntent(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Người học:</span>
                <strong className="text-white">{verifyingIntent.student_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Người dạy kèm:</span>
                <span className="text-slate-200">{verifyingIntent.tutor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gói học:</span>
                <span className="text-emerald-400 font-bold">{verifyingIntent.package_name}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold">
                <span className="text-slate-300">Số tiền gói học:</span>
                <span className="text-emerald-400 text-sm">{verifyingIntent.amount_vnd.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Nội dung chuẩn:</span>
                <span className="font-mono text-indigo-300 font-bold">{verifyingIntent.transfer_memo}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Mã SV đã khai báo:</span>
                <span className="font-mono text-amber-300 font-bold">{verifyingIntent.transfer_reference || 'N/A'}</span>
              </div>
              {verifyingIntent.student_note && (
                <div className="text-[11px] text-slate-400 italic pt-1">
                  Ghi chú của SV: "{verifyingIntent.student_note}"
                </div>
              )}
            </div>

            <form onSubmit={handleVerifyPaymentIntent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Kết quả đối soát với sao kê ngân hàng:
                </label>
                <select
                  value={verifyStatusChoice}
                  onChange={(e) => setVerifyStatusChoice(e.target.value as PaymentVerificationStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="verified">Khớp lệnh thành công (Đã nhận đủ tiền vào tài khoản EduMate)</option>
                  <option value="needs_review">Cần kiểm tra thêm (Tiền chưa thấy hoặc sai lệch)</option>
                  <option value="rejected">Từ chối (Không tìm thấy giao dịch chuyển tiền)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mã giao dịch ngân hàng khớp sao kê:
                </label>
                <input
                  type="text"
                  required={verifyStatusChoice === 'verified'}
                  value={verifyBankRef}
                  onChange={(e) => setVerifyBankRef(e.target.value)}
                  placeholder="Ví dụ: MB8472910394 hoặc FT26..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ghi chú đối soát / Biên bản kiểm toán:
                </label>
                <textarea
                  rows={2}
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="Nhập ghi chú đối soát..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setVerifyingIntent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  Xác Nhận & Lưu Vết Đối Soát
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Xử Lý Yêu Cầu Hoàn Tiền 100% */}
      {processingRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Banknote className="w-5 h-5 text-purple-400" />
                <span>Xử Lý Hoàn Tiền 100%: {processingRefund.id}</span>
              </h3>
              <button
                type="button"
                onClick={() => setProcessingRefund(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-purple-300">Người học:</span>
                <strong className="text-white">{processingRefund.student_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-300">Mã yêu cầu học:</span>
                <span className="font-mono text-white">{processingRefund.request_code}</span>
              </div>
              <div className="flex justify-between border-t border-purple-800/40 pt-1.5 font-bold">
                <span className="text-white">Số tiền hoàn trả 100%:</span>
                <span className="text-emerald-400 text-sm font-extrabold">{processingRefund.refund_amount_vnd.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Lý do: <span className="italic">{processingRefund.reason}</span>
              </div>

              {/* Bank Account info */}
              <div className="pt-2 border-t border-purple-800/40">
                <div className="text-[11px] font-bold text-purple-300 mb-1">Tài khoản học viên nhận tiền hoàn:</div>
                {processingRefund.student_bank_account ? (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-0.5 text-[11px]">
                    <div>Ngân hàng: <strong className="text-white">{processingRefund.student_bank_account.bank_name}</strong></div>
                    <div>Số tài khoản: <strong className="font-mono text-emerald-400 text-xs">{processingRefund.student_bank_account.account_number}</strong></div>
                    <div>Chủ tài khoản: <strong className="text-slate-200 uppercase">{processingRefund.student_bank_account.account_holder}</strong></div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px]">
                    Học viên chưa cập nhật tài khoản ngân hàng nhận tiền. Hãy liên hệ học viên bổ sung.
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleProcessRefund} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Trạng thái xử lý hoàn tiền:
                </label>
                <select
                  value={refundStatusChoice}
                  onChange={(e) => setRefundStatusChoice(e.target.value as RefundStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="under_review">Đang thẩm định (Under Review)</option>
                  <option value="approved">Phê duyệt lệnh hoàn tiền (Approved)</option>
                  <option value="processing">Đang chuyển khoản hoàn tiền (Processing)</option>
                  <option value="refunded">Đã hoàn tiền thành công (Refunded - Đã chuyển tiền qua NH)</option>
                  <option value="rejected">Từ chối hoàn tiền (Rejected)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mã giao dịch chuyển tiền hoàn qua ngân hàng {refundStatusChoice === 'refunded' && <span className="text-rose-400">* (Bắt buộc)</span>}:
                </label>
                <input
                  type="text"
                  required={refundStatusChoice === 'refunded'}
                  value={refundBankRef}
                  onChange={(e) => setRefundBankRef(e.target.value)}
                  placeholder="Ví dụ: MB-REF-8472910394"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ghi chú quản trị viên {refundStatusChoice === 'rejected' && <span className="text-rose-400">* (Bắt buộc nếu từ chối)</span>}:
                </label>
                <textarea
                  rows={2}
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Ghi chú xác nhận hoặc lý do giải trình..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setProcessingRefund(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/30 cursor-pointer"
                >
                  Cập Nhật Tiến Trình Hoàn Tiền
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
