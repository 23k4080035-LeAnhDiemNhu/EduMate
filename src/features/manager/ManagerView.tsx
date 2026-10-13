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
} from '../../types';
import { dataService } from '../../services/dataService';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  FileSearch, 
  Plus, 
  DollarSign, 
  History, 
  Layers,
  Search,
  XCircle
} from 'lucide-react';


interface ManagerViewProps {
  currentProfile: Profile;
  activeTab: string;
}

export const ManagerView: React.FC<ManagerViewProps> = ({ currentProfile, activeTab }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>(() => dataService.getRequests());
  const [academicItems, setAcademicItems] = useState<AcademicItem[]>(() => dataService.getAcademicItems());
  const [orders, setOrders] = useState<Order[]>(() => dataService.getOrders());
  const [payments, setPayments] = useState<Payment[]>(() => dataService.getPayments());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => dataService.getAuditLogs());

  // Filter & Search state for requests
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Review Modal State
  const [reviewingReq, setReviewingReq] = useState<ServiceRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionError, setActionError] = useState('');

  // Academic Modal State
  const [showAddAcademicModal, setShowAddAcademicModal] = useState(false);
  const [newAcademicForm, setNewAcademicForm] = useState({
    code: '',
    title: '',
    description: '',
    category: 'Chuyên môn Học vụ',
    standard_fee: 1000000,
    status: 'published' as AcademicStatus
  });

  // Calculate Metrics
  const pendingRequestsCount = requests.filter(r => r.status === 'submitted' || r.status === 'in_review').length;
  const approvedRequestsCount = requests.filter(r => r.status === 'approved').length;
  const pendingPaymentsCount = payments.filter(p => p.status === 'pending').length;
  const totalRevenue = payments
    .filter(p => p.status === 'successful')
    .reduce((sum, p) => sum + p.amount, 0);

  // Handle Review Action (Approve / Reject)
  const handlePerformReview = (status: RequestStatus) => {
    if (!reviewingReq) return;

    // Enforce DB CHECK CONSTRAINT: If rejected, review notes is mandatory
    if (status === 'rejected' && (!reviewNotes || reviewNotes.trim().length === 0)) {
      setActionError('Ràng buộc dữ liệu: Bạn bắt buộc phải nhập lý do/ghi chú khi từ chối hồ sơ!');
      return;
    }

    const updated = dataService.updateRequestStatus(
      reviewingReq.id,
      status,
      currentProfile.id,
      currentProfile.full_name,
      reviewNotes
    );

    if (updated) {
      setRequests(dataService.getRequests());
      setAuditLogs(dataService.getAuditLogs());
      setReviewingReq(null);
      setReviewNotes('');
      setActionError('');
    }
  };

  // Handle Create Academic Item
  const handleCreateAcademicItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcademicForm.code || !newAcademicForm.title) return;

    dataService.createAcademicItem({
      ...newAcademicForm,
      created_by: currentProfile.id
    });

    setAcademicItems(dataService.getAcademicItems());
    setAuditLogs(dataService.getAuditLogs());
    setShowAddAcademicModal(false);
    setNewAcademicForm({
      code: '',
      title: '',
      description: '',
      category: 'Chuyên môn Học vụ',
      standard_fee: 1000000,
      status: 'published'
    });
  };

  // Handle Payment Verification
  const handleVerifyPayment = (paymentId: string, status: 'successful' | 'failed') => {
    dataService.verifyPayment(paymentId, status, currentProfile.id, currentProfile.full_name);
    setPayments(dataService.getPayments());
    setOrders(dataService.getOrders());
    setAuditLogs(dataService.getAuditLogs());
  };

  const filteredRequests = requests.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch = 
      r.request_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.student_name && r.student_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.form_type_title && r.form_type_title.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Overview Metrics Cards */}
      {(activeTab === 'dashboard' || activeTab === 'overview') && (
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <span>Bảng Điều Khiển Quản Trị Hệ Thống (Manager Dashboard)</span>
            </h2>
            <p className="text-sm text-slate-400">
              Tổng hợp chỉ số vận hành hồ sơ, học vụ và tài chính thời gian thực
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Hồ sơ chờ thẩm định</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-amber-400">{pendingRequestsCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">Cần xem xét và duyệt</div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Hồ sơ đã phê duyệt</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400">{approvedRequestsCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">Đã hoàn tất quy trình</div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Giao dịch chờ đối soát</span>
                <DollarSign className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-extrabold text-indigo-400">{pendingPaymentsCount}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                Biên lai chờ duyệt ({orders.length} đơn hàng hệ thống)
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Tổng thu học vụ</span>
                <Layers className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">
                {totalRevenue.toLocaleString('vi-VN')} ₫
              </div>
              <div className="text-[11px] text-teal-400 mt-1">Giao dịch thành công</div>
            </div>
          </div>
        </section>
      )}

      {/* Tab: Approval Workbench */}
      {(activeTab === 'approval-workbench' || activeTab === 'overview') && (
        <section className="space-y-4 pt-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <FileSearch className="w-5 h-5 text-indigo-400" />
                <span>Bàn Làm Việc Thẩm Định & Phê Duyệt Hồ Sơ</span>
              </h2>
              <p className="text-sm text-slate-400">
                Xem xét, phê chuẩn hoặc phản hồi yêu cầu dịch vụ từ người học
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm mã đơn, tên sinh viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="submitted">Chờ xử lý (Submitted)</option>
                <option value="in_review">Đang thẩm định (In Review)</option>
                <option value="approved">Đã phê duyệt (Approved)</option>
                <option value="rejected">Đã từ chối (Rejected)</option>
              </select>
            </div>
          </div>

          {/* Table / List */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
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
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                            req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            req.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            req.status === 'in_review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {req.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => {
                              setReviewingReq(req);
                              setReviewNotes(req.review_notes || '');
                              setActionError('');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all shadow-sm"
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

      {/* Tab: Academic Management CRUD */}
      {(activeTab === 'academic-crud' || activeTab === 'overview') && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Quản Trị Danh Mục & Dữ Liệu Học Vụ (CRUD)</span>
              </h2>
              <p className="text-sm text-slate-400">
                Thêm, xem, sửa, phân loại và phát hành các chương trình/học phần trong hệ thống
              </p>
            </div>
            <button
              onClick={() => setShowAddAcademicModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm mục học vụ mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {academicItems.map((item) => (
              <div key={item.id} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                    {item.code}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    item.status === 'published' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.status === 'published' ? 'Đã phát hành' : 'Bản nháp (Draft)'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Mức phí: <strong className="text-emerald-400">{item.standard_fee.toLocaleString('vi-VN')} ₫</strong></span>
                  <button
                    onClick={() => {
                      const nextStatus = item.status === 'published' ? 'draft' : 'published';
                      dataService.updateAcademicItem(item.id, { status: nextStatus }, currentProfile.id, currentProfile.full_name);
                      setAcademicItems(dataService.getAcademicItems());
                      setAuditLogs(dataService.getAuditLogs());
                    }}
                    className="text-xs text-indigo-400 hover:underline"
                  >
                    {item.status === 'published' ? 'Chuyển về nháp' : 'Phát hành công khai'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tab: Orders & Payment Reconciliation */}
      {(activeTab === 'reconciliation' || activeTab === 'overview') && (
        <section className="space-y-4 pt-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-indigo-400" />
              <span>Đối Soát Giao Dịch & Quản Lý Đơn Hàng</span>
            </h2>
            <p className="text-sm text-slate-400">
              Kiểm tra mã tham chiếu ngân hàng, xác thực thanh toán và hoàn tất đơn hàng
            </p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
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
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-800/40">
                      <td className="px-5 py-4 font-mono font-bold text-indigo-400">{pay.payment_code}</td>
                      <td className="px-5 py-4 font-mono text-amber-400">{pay.order_code}</td>
                      <td className="px-5 py-4 font-mono text-slate-300">{pay.transaction_ref || 'N/A'}</td>
                      <td className="px-5 py-4 font-bold text-emerald-400">{pay.amount.toLocaleString('vi-VN')} ₫</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                          pay.status === 'successful' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          pay.status === 'failed' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {pay.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        {pay.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleVerifyPayment(pay.id, 'successful')}
                              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm"
                            >
                              Khớp lệnh hợp lệ
                            </button>
                            <button
                              onClick={() => handleVerifyPayment(pay.id, 'failed')}
                              className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium"
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

      {/* Tab: Audit Logs */}
      {(activeTab === 'audit-logs' || activeTab === 'overview') && (
        <section className="space-y-4 pt-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <History className="w-5 h-5 text-indigo-400" />
              <span>Nhật Ký Kiểm Toán Hoạt Động (Audit Trails)</span>
            </h2>
            <p className="text-sm text-slate-400">
              Ghi nhận mọi thao tác tạo, cập nhật, phê duyệt và đối soát trên toàn bộ thực thể
            </p>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 p-4 space-y-2">
            {auditLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-indigo-400">[{log.action}]</span>
                    <span className="text-slate-200 font-mono">{log.entity_name}</span>
                    <span className="text-slate-400">thực hiện bởi: <strong className="text-white">{log.performed_by_name || 'Hệ thống'}</strong></span>
                  </div>
                  <div className="text-[11px] text-slate-400">Entity ID: {log.entity_id}</div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {new Date(log.created_at).toLocaleString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODAL: Thẩm định hồ sơ */}
      {reviewingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <FileSearch className="w-5 h-5 text-indigo-400" />
                <span>Thẩm Định Hồ Sơ: {reviewingReq.request_code}</span>
              </h3>
              <button onClick={() => setReviewingReq(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400">Người nộp:</div>
                <div className="font-bold text-white text-sm">{reviewingReq.student_name}</div>
                <div className="text-slate-400">Mã SV: {reviewingReq.student_code}</div>
                <div className="text-slate-400">Email: {reviewingReq.student_email}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-slate-400">Loại biểu mẫu:</div>
                <div className="font-bold text-indigo-300 text-sm">{reviewingReq.form_type_title}</div>
                <div className="text-slate-400 mt-1">Ngày nộp: {new Date(reviewingReq.created_at).toLocaleString('vi-VN')}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <div className="font-bold text-slate-300 mb-1">Nội dung khai báo trong form:</div>
              <pre className="font-mono text-slate-300 whitespace-pre-wrap">
                {JSON.stringify(reviewingReq.form_data, null, 2)}
              </pre>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ghi chú thẩm định / Lý do phê duyệt hoặc từ chối (Bắt buộc nếu từ chối):
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Nhập ý kiến chuyên môn từ Ban Giáo vụ..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handlePerformReview('in_review')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Đánh dấu đang thụ lý (In Review)
              </button>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handlePerformReview('rejected')}
                  className="px-4 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold shadow-md shadow-rose-600/20"
                >
                  Từ chối hồ sơ
                </button>
                <button
                  type="button"
                  onClick={() => handlePerformReview('approved')}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30"
                >
                  Phê duyệt hồ sơ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Thêm mục học vụ mới */}
      {showAddAcademicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Thêm Mục Học Vụ / Học Phần Mới</span>
              </h3>
              <button onClick={() => setShowAddAcademicModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAcademicItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Mã định danh:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: EDU-SCI-302"
                  value={newAcademicForm.code}
                  onChange={(e) => setNewAcademicForm({ ...newAcademicForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Tên mục học vụ:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Kỹ năng Tranh biện & Thuyết trình Học thuật"
                  value={newAcademicForm.title}
                  onChange={(e) => setNewAcademicForm({ ...newAcademicForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Mô tả chi tiết:</label>
                <textarea
                  rows={2}
                  value={newAcademicForm.description}
                  onChange={(e) => setNewAcademicForm({ ...newAcademicForm, description: e.target.value })}
                  placeholder="Nội dung, mục tiêu của chuyên đề..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Học phí (VND):</label>
                  <input
                    type="number"
                    min="0"
                    value={newAcademicForm.standard_fee}
                    onChange={(e) => setNewAcademicForm({ ...newAcademicForm, standard_fee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Trạng thái phát hành:</label>
                  <select
                    value={newAcademicForm.status}
                    onChange={(e) => setNewAcademicForm({ ...newAcademicForm, status: e.target.value as AcademicStatus })}
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
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-md shadow-indigo-600/30"
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
