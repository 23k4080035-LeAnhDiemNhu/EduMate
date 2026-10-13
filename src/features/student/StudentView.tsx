import React, { useState } from 'react';
import type { 
  Profile, 
  ServiceForm, 
  ServiceRequest, 
  AcademicItem, 
  Order, 
  Enrollment 
} from '../../types';
import { dataService } from '../../services/dataService';
import { 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  BookOpen, 
  CreditCard, 
  Send,
  Upload,
  Calendar,
  Check
} from 'lucide-react';

interface StudentViewProps {
  currentProfile: Profile;
  activeTab: string;
}

export const StudentView: React.FC<StudentViewProps> = ({ currentProfile, activeTab }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>(() => 
    dataService.getRequests().filter(r => r.student_id === currentProfile.id)
  );
  const [forms] = useState<ServiceForm[]>(() => dataService.getServiceForms());
  const [academicItems] = useState<AcademicItem[]>(() => 
    dataService.getAcademicItems().filter(a => a.status === 'published')
  );
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => 
    dataService.getEnrollments().filter(e => e.student_id === currentProfile.id)
  );
  const [orders, setOrders] = useState<Order[]>(() => 
    dataService.getOrders().filter(o => o.student_id === currentProfile.id)
  );


  // Modal State for New Request
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(forms[0]?.id || '');
  const [formDataInput, setFormDataInput] = useState<{ [key: string]: string }>({
    noi_dung: '',
    ngay_mong_muon: '',
    ghi_chu: ''
  });

  // Modal State for Payment
  const [selectedOrderForPay, setSelectedOrderForPay] = useState<Order | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  // Handle Create Request
  const handleCreateRequest = (status: 'draft' | 'submitted') => {
    const chosenForm = forms.find(f => f.id === selectedFormId);
    if (!chosenForm) return;

    const newReq = dataService.createRequest({
      student_id: currentProfile.id,
      form_type_id: chosenForm.id,
      form_type_title: chosenForm.title,
      student_name: currentProfile.full_name,
      student_email: currentProfile.email,
      student_code: currentProfile.student_code,
      form_data: formDataInput,
      status: status
    });

    setRequests([newReq, ...requests]);
    setShowNewRequestModal(false);
    setFormDataInput({ noi_dung: '', ngay_mong_muon: '', ghi_chu: '' });
  };

  // Handle Course Enrollment
  const handleEnroll = (item: AcademicItem) => {
    const isAlready = enrollments.some(e => e.academic_item_id === item.id);
    if (isAlready) {
      alert('Bạn đã ghi danh vào mục học tập này rồi!');
      return;
    }
    const newEnr = dataService.enrollStudent(currentProfile.id, item.id, item.title);
    setEnrollments([newEnr, ...enrollments]);
    alert(`Ghi danh thành công vào: "${item.title}"!`);
  };

  // Handle Submit Payment Proof
  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForPay) return;

    dataService.createPayment({
      order_id: selectedOrderForPay.id,
      order_code: selectedOrderForPay.order_code,
      payment_method: 'bank_transfer',
      transaction_ref: transactionRef || `FT${Date.now().toString().slice(-6)}`,
      amount: selectedOrderForPay.total_amount,
      proof_attachment_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400',
      status: 'pending'
    });

    setPaymentSuccessMsg('Đã gửi thông tin thanh toán! Ban quản lý sẽ đối soát và duyệt trong vòng 24h.');
    setOrders(dataService.getOrders().filter(o => o.student_id === currentProfile.id));
    setTimeout(() => {
      setSelectedOrderForPay(null);
      setPaymentSuccessMsg('');
      setTransactionRef('');
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã phê duyệt</span>
          </span>
        );
      case 'in_review':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Đang thẩm định</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" />
            <span>Đã từ chối</span>
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Send className="w-3.5 h-3.5" />
            <span>Đã gửi (Chờ xử lý)</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/30">
            <span>Bản nháp (Draft)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Tab: My Requests */}
      {(activeTab === 'my-requests' || activeTab === 'overview') && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Biểu mẫu đăng ký & Yêu cầu dịch vụ của tôi</span>
              </h2>
              <p className="text-sm text-slate-400">
                Theo dõi tiến độ xử lý hồ sơ và phản hồi từ Ban Giáo vụ / Quản lý
              </p>
            </div>
            <button
              onClick={() => setShowNewRequestModal(true)}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium shadow-lg shadow-indigo-600/25 hover:from-indigo-500 hover:to-violet-500 transition-all text-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nộp yêu cầu mới</span>
            </button>
          </div>

          {/* List of Requests */}
          <div className="grid grid-cols-1 gap-4">
            {requests.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-slate-400">
                Bạn chưa có yêu cầu nào. Nhấn "Nộp yêu cầu mới" để khởi tạo biểu mẫu đầu tiên!
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                          {req.request_code}
                        </span>
                        <h3 className="text-base font-semibold text-slate-100">
                          {req.form_type_title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Khởi tạo lúc: {new Date(req.created_at).toLocaleString('vi-VN')}</span>
                      </p>
                    </div>

                    <div>
                      {getStatusBadge(req.status)}
                    </div>
                  </div>

                  {/* Form Details Payload */}
                  <div className="mt-4 pt-4 border-t border-slate-800/60 bg-slate-900/40 rounded-xl p-3 text-xs text-slate-300">
                    <div className="font-medium text-slate-400 mb-1">Dữ liệu biểu mẫu đã khai báo:</div>
                    <pre className="font-mono text-xs whitespace-pre-wrap text-slate-300">
                      {JSON.stringify(req.form_data, null, 2)}
                    </pre>
                  </div>

                  {/* Review Notes from Manager */}
                  {req.review_notes && (
                    <div className={`mt-3 p-3.5 rounded-xl text-xs border ${
                      req.status === 'approved' 
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' 
                        : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                    }`}>
                      <div className="font-semibold flex items-center space-x-1.5 mb-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Phản hồi từ Quản lý ({req.reviewer_name || 'Ban Giáo vụ'}):</span>
                      </div>
                      <p className="leading-relaxed">{req.review_notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Tab: Academic Catalog */}
      {(activeTab === 'academic-catalog' || activeTab === 'overview') && (
        <section className="space-y-4 pt-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Chương trình & Mục Học vụ Khả dụng</span>
            </h2>
            <p className="text-sm text-slate-400">
              Các chuyên đề, học phần và dịch vụ hỗ trợ học tập đã được ban quản lý phê duyệt công khai
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {academicItems.map((item) => {
              const isEnrolled = enrollments.some(e => e.academic_item_id === item.id);
              return (
                <div key={item.id} className="glass-card rounded-2xl p-5 flex flex-col justify-between border border-slate-800">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-semibold">
                        {item.code}
                      </span>
                      <span className="text-xs text-slate-400">{item.category}</span>
                    </div>
                    <h3 className="text-base font-semibold text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">Mức học phí/phí:</div>
                      <div className="text-sm font-bold text-emerald-400">
                        {item.standard_fee.toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                    {isEnrolled ? (
                      <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã ghi danh</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEnroll(item)}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all"
                      >
                        Ghi danh ngay
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Tab: Orders & Payments */}
      {(activeTab === 'my-orders' || activeTab === 'overview') && (
        <section className="space-y-4 pt-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              <span>Đơn hàng & Lịch sử Thanh toán</span>
            </h2>
            <p className="text-sm text-slate-400">
              Quản lý nghĩa vụ tài chính học vụ, hóa đơn và gửi xác nhận chuyển khoản
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {orders.map((ord) => (
              <div key={ord.id} className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                      {ord.order_code}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {ord.items?.[0]?.item_name || 'Khoản thu học vụ'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Số tiền: <strong className="text-emerald-400 text-sm">{ord.total_amount.toLocaleString('vi-VN')} ₫</strong>
                    <span className="mx-2">•</span>
                    Ngày lập: {new Date(ord.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {ord.status === 'paid' ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã thanh toán</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedOrderForPay(ord)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Thanh toán ngay</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODAL: Tạo yêu cầu mới */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-xl rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Nộp Biểu Mẫu / Yêu Cầu Học Vụ Mới</span>
              </h3>
              <button
                onClick={() => setShowNewRequestModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Chọn loại biểu mẫu yêu cầu:
                </label>
                <select
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                >
                  {forms.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Lý do / Nội dung chi tiết:
                </label>
                <textarea
                  rows={3}
                  value={formDataInput.noi_dung}
                  onChange={(e) => setFormDataInput({ ...formDataInput, noi_dung: e.target.value })}
                  placeholder="Nhập lý do hoặc nội dung cụ thể bạn muốn gửi tới Ban Giáo vụ..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ngày mong muốn hiệu lực:
                  </label>
                  <input
                    type="date"
                    value={formDataInput.ngay_mong_muon}
                    onChange={(e) => setFormDataInput({ ...formDataInput, ngay_mong_muon: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Ghi chú bổ sung:
                  </label>
                  <input
                    type="text"
                    value={formDataInput.ghi_chu}
                    onChange={(e) => setFormDataInput({ ...formDataInput, ghi_chu: e.target.value })}
                    placeholder="Link tài liệu đính kèm..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleCreateRequest('draft')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
              >
                Lưu bản nháp
              </button>
              <button
                type="button"
                onClick={() => handleCreateRequest('submitted')}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-violet-500 transition-all"
              >
                Gửi yêu cầu chính thức
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Thanh toán & Gửi biên lai */}
      {selectedOrderForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 border border-slate-700 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <span>Thanh Toán Đơn Hàng {selectedOrderForPay.order_code}</span>
              </h3>
              <button
                onClick={() => setSelectedOrderForPay(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {paymentSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="font-semibold text-sm">{paymentSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="text-xs text-slate-400">Thông tin chuyển khoản Ngân hàng (Ví dụ Demo):</div>
                  <div className="text-sm font-bold text-white">Ngân hàng TMCP Quân Đội (MB Bank)</div>
                  <div className="text-xs text-slate-300">Số tài khoản: <code className="font-mono text-emerald-400 font-bold">0988-EDUMATE-2026</code></div>
                  <div className="text-xs text-slate-300">Chủ tài khoản: <strong>TRUNG TAM DICH VU HOC VU EDUMATE</strong></div>
                  <div className="text-xs text-slate-300">
                    Số tiền cần nộp: <strong className="text-emerald-400 text-base">{selectedOrderForPay.total_amount.toLocaleString('vi-VN')} ₫</strong>
                  </div>
                  <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
                    Nội dung CK: <code className="text-indigo-400 font-mono">{selectedOrderForPay.order_code} {currentProfile.student_code}</code>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mã giao dịch ngân hàng / Tham chiếu chuyển khoản:
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="VD: FT2608129381 hoặc MB123456"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-center text-xs text-slate-400">
                  <Upload className="w-5 h-5 mx-auto mb-1 text-slate-500" />
                  <span>Ảnh biên lai chuyển khoản (Hệ thống tự động liên kết bằng chứng mô phỏng)</span>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForPay(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition-all"
                  >
                    Xác nhận đã chuyển khoản
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
