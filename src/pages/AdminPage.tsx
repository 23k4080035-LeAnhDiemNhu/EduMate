import React, { useState } from 'react';
import type { 
  Profile, 
  ServiceRequest, 
  AcademicItem, 
  Order, 
  Payment, 
  AuditLog, 
  RequestStatus, 
  AcademicStatus 
} from '../types';
import { dataService } from '../services/dataService';
import { RequestBadge, PaymentBadge, AcademicBadge } from '../components/common/Badge';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  FileSearch, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  AlertCircle
} from 'lucide-react';

interface AdminPageProps {
  currentUser: Profile;
  onNavigate?: (page: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  showToast,
}) => {

  const [adminTab, setAdminTab] = useState<'requests' | 'academic' | 'reconciliation' | 'audit'>('requests');

  // Datasets from service
  const [requests, setRequests] = useState<ServiceRequest[]>(() => dataService.getRequests());
  const [academicItems, setAcademicItems] = useState<AcademicItem[]>(() => dataService.getAcademicItems());
  const [orders, setOrders] = useState<Order[]>(() => dataService.getOrders());
  const [payments, setPayments] = useState<Payment[]>(() => dataService.getPayments());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => dataService.getAuditLogs());

  // Filter & Search states
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('all');
  const [requestSearchTerm, setRequestSearchTerm] = useState('');

  // Review Modal State
  const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
  };

  // Metrics
  const pendingRequestsCount = requests.filter(r => ['submitted', 'in_review'].includes(r.status)).length;
  const approvedRequestsCount = requests.filter(r => r.status === 'approved').length;
  const pendingPaymentsCount = payments.filter(p => p.status === 'pending').length;
  const totalRevenue = payments
    .filter(p => p.status === 'successful')
    .reduce((sum, p) => sum + p.amount, 0);

  // Review logic
  const handleReviewAction = (status: RequestStatus) => {
    if (!selectedReq) return;

    if (status === 'rejected' && (!reviewNotes || reviewNotes.trim().length === 0)) {
      setReviewError('Bắt buộc phải nhập lý do/ghi chú khi từ chối hồ sơ (Ràng buộc toàn vẹn hệ thống)!');
      return;
    }

    setActionLoading(true);

    setTimeout(() => {
      const updated = dataService.updateRequestStatus(
        selectedReq.id,
        status,
        currentUser.id,
        currentUser.full_name,
        reviewNotes.trim() || undefined
      );

      setActionLoading(false);
      if (updated) {
        reloadData();
        setSelectedReq(null);
        setReviewNotes('');
        setReviewError('');
        const statusLabel = status === 'approved' ? 'Phê duyệt' : status === 'rejected' ? 'Từ chối' : 'Đang xử lý';
        showToast('success', `${statusLabel} hồ sơ thành công!`, `Mã yêu cầu: ${updated.request_code}`);
      }
    }, 400);
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

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <span>Khu Vực Quản Trị Giáo Vụ & Xử Lý Hồ Sơ</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Bàn làm việc thẩm định yêu cầu, quản lý danh mục học tập (CRUD) và đối soát giao dịch
          </p>
        </div>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Hồ sơ chờ thẩm định</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">{pendingRequestsCount}</div>
          <div className="text-[11px] text-slate-400">Yêu cầu người học gửi lên</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Hồ sơ đã phê duyệt</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">{approvedRequestsCount}</div>
          <div className="text-[11px] text-slate-400">Đã ban hành kết quả</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Giao dịch chờ đối soát</span>
            <DollarSign className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">{pendingPaymentsCount}</div>
          <div className="text-[11px] text-slate-400">Chờ khớp lệnh ({orders.length} đơn hàng)</div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tổng thu học vụ</span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white">
            {totalRevenue.toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-[11px] text-teal-400">Giao dịch thành công</div>
        </div>
      </div>

      {/* Admin Module Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setAdminTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'requests'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Thẩm định yêu cầu ({requests.length})
        </button>

        <button
          onClick={() => setAdminTab('academic')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'academic'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Quản lý khóa học (CRUD) ({academicItems.length})
        </button>

        <button
          onClick={() => setAdminTab('reconciliation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'reconciliation'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Đối soát giao dịch ({payments.length})
        </button>

        <button
          onClick={() => setAdminTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            adminTab === 'audit'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

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
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Đánh dấu đang thụ lý (In Review)
              </button>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleReviewAction('rejected')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                >
                  Từ chối hồ sơ
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleReviewAction('approved')}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
                >
                  Phê duyệt hồ sơ
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

    </div>
  );
};
