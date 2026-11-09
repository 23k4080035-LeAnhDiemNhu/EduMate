import React, { useState } from 'react';
import type { 
  Profile, 
  PaymentIntent, 
  RefundRequest, 
  BankConfig 
} from '../types';
import { dataService } from '../services/dataService';
import { Forbidden403 } from '../components/common/Forbidden403';
import { 
  QrCode, 
  Copy, 
  Check, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  ArrowLeft, 
  Sparkles,
  Banknote,
  Send,
  Building,
  CreditCard,
  UserCheck
} from 'lucide-react';

interface PaymentPageProps {
  currentUser: Profile;
  onNavigate: (page: string, params?: any) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  initialParams?: { requestId?: string; paymentIntentId?: string };
}

export const PaymentPage: React.FC<PaymentPageProps> = ({
  currentUser,
  onNavigate,
  showToast,
  initialParams
}) => {
  const bankConfig: BankConfig = dataService.getBankConfig();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Load payment intents for this student
  const [userIntents, setUserIntents] = useState<PaymentIntent[]>(() => 
    dataService.getPaymentIntents({ student_id: currentUser.id })
  );

  const targetIntentId = initialParams?.paymentIntentId || 
    (initialParams?.requestId ? dataService.getPaymentIntentByRequestId(initialParams.requestId)?.id : undefined);

  // Selected intent
  const [selectedIntentId, setSelectedIntentId] = useState<string>(() => {
    if (targetIntentId) return targetIntentId;
    const intents = dataService.getPaymentIntents({ student_id: currentUser.id });
    return intents[0]?.id || '';
  });

  const [prevTargetId, setPrevTargetId] = useState(targetIntentId);
  if (targetIntentId && targetIntentId !== prevTargetId) {
    setPrevTargetId(targetIntentId);
    setSelectedIntentId(targetIntentId);
  }

  // Transfer confirmation form state
  const [transactionRef, setTransactionRef] = useState('');
  const [studentNote, setStudentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refund bank account form state
  const [refundBankName, setRefundBankName] = useState('VietinBank (Ngân hàng TMCP Công thương Việt Nam)');
  const [refundAccountNo, setRefundAccountNo] = useState('');
  const [refundAccountHolder, setRefundAccountHolder] = useState(currentUser.full_name.toUpperCase());
  const [isUpdatingBank, setIsUpdatingBank] = useState(false);

  const reloadData = () => {
    const list = dataService.getPaymentIntents({ student_id: currentUser.id });
    setUserIntents(list);
  };

  const activeIntent: PaymentIntent | undefined = userIntents.find(i => i.id === selectedIntentId) || userIntents[0];
  const activeRefund: RefundRequest | null = activeIntent ? dataService.getRefundRequestByRequestId(activeIntent.learning_request_id) : null;

  // STRICT ACCESS CONTROL: Only the student owner (or Manager) can view/pay this intent
  if (activeIntent && activeIntent.student_id !== currentUser.id && !['manager', 'admin'].includes(currentUser.role)) {
    return (
      <Forbidden403
        requiredRole="Người học sở hữu yêu cầu học"
        currentRole={currentUser.role}
        resourceName="Giao dịch thanh toán học phí"
        onNavigate={onNavigate}
      />
    );
  }

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast('info', 'Đã sao chép vào bộ nhớ tạm', text);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  // Submit transfer reference (Status -> awaiting_verification)
  const handleSubmitTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIntent) return;

    if (!transactionRef.trim()) {
      showToast('error', 'Thiếu mã giao dịch', 'Vui lòng nhập mã giao dịch từ ứng dụng ngân hàng hoặc số tham chiếu chuyển khoản.');
      return;
    }

    setIsSubmitting(true);
    try {
      dataService.submitPaymentTransfer(
        activeIntent.id,
        transactionRef.trim(),
        undefined,
        studentNote.trim() || undefined,
        currentUser.id
      );
      reloadData();
      showToast('success', 'Đã gửi thông báo chuyển khoản!', 'Hệ thống đã chuyển trạng thái sang "Chờ đối soát". Quản trị viên EduMate Huế sẽ kiểm tra và kích hoạt yêu cầu học.');
      setTransactionRef('');
      setStudentNote('');
    } catch (err: any) {
      showToast('error', 'Lỗi xử lý', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save / Update Student Refund Bank Account
  const handleSaveRefundBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRefund) return;

    if (!refundBankName.trim() || !refundAccountNo.trim() || !refundAccountHolder.trim()) {
      showToast('error', 'Chưa đầy đủ thông tin', 'Vui lòng cung cấp đầy đủ tên ngân hàng, số tài khoản và họ tên chủ tài khoản.');
      return;
    }

    setIsUpdatingBank(true);
    try {
      const updated = dataService.updateStudentRefundAccount(
        activeRefund.id,
        currentUser.id,
        {
          bank_name: refundBankName.trim(),
          account_number: refundAccountNo.trim(),
          account_holder: refundAccountHolder.trim()
        }
      );
      showToast('success', 'Đã cập nhật tài khoản nhận hoàn tiền', `Ngân hàng: ${updated.student_bank_account?.bank_name} - Số TK: ${updated.student_bank_account?.account_number}`);
    } catch (err: any) {
      showToast('error', 'Lỗi cập nhật tài khoản hoàn tiền', err.message);
    } finally {
      setIsUpdatingBank(false);
    }
  };

  // VietQR standard image URL
  const vietQrUrl = activeIntent ? 
    `https://img.vietqr.io/image/${bankConfig.bank_id}-${bankConfig.account_number}-compact.png?amount=${activeIntent.amount_vnd}&addInfo=${encodeURIComponent(activeIntent.transfer_memo)}&accountName=${encodeURIComponent(bankConfig.account_holder)}` 
    : '';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-16">
      
      {/* DEMO WATERMARK BANNER */}
      {bankConfig.is_demo && (
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-extrabold tracking-wide uppercase">Cảnh Báo Môi Trường Demo:</span>{' '}
              <span>MÔ PHỎNG – KHÔNG CHUYỂN TIỀN THẬT. Mọi thông tin thanh toán dưới đây phục vụ kiểm thử luồng đối soát và hoàn tiền P2P EduMate Huế.</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-200 text-[11px] font-mono font-bold uppercase shrink-0">
            Sandbox Demo
          </span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <button
            onClick={() => onNavigate('my-requests')}
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Quản lý Yêu cầu học</span>
          </button>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <QrCode className="w-6 h-6 text-emerald-400" />
            <span>Cổng Thanh Toán VietQR EduMate Huế</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Thanh toán học phí gói học chuẩn hóa qua ngân hàng, đối soát minh bạch và bảo đảm quyền lợi hoàn tiền 100%
          </p>
        </div>

        {/* Intent Selector if multiple */}
        {userIntents.length > 1 && (
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Chọn yêu cầu:</span>
            <select
              value={selectedIntentId}
              onChange={(e) => setSelectedIntentId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {userIntents.map(i => (
                <option key={i.id} value={i.id}>
                  {i.request_code} - {i.package_name} ({i.amount_vnd.toLocaleString('vi-VN')} ₫)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!activeIntent ? (
        <div className="p-12 text-center glass-panel rounded-3xl border border-slate-800 space-y-3">
          <Banknote className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Chưa có giao dịch thanh toán nào</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Bạn chưa có yêu cầu học nào cần thanh toán. Hãy chọn anh/chị khóa trước và gửi yêu cầu học theo gói.
          </p>
          <button
            onClick={() => onNavigate('submit-request')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Gửi yêu cầu học ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: VietQR & Recipient Bank Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* VietQR Code Card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    QR
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Quét Mã VietQR Chuyển Khoản Nhanh 24/7</h3>
                    <p className="text-[11px] text-slate-400">Tự động điền số tiền và nội dung chuyển khoản chính xác</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono text-[11px]">
                  Napas 247
                </span>
              </div>

              {/* VietQR Image Container with DEMO overlay watermark */}
              <div className="relative mx-auto max-w-xs bg-white p-4 rounded-2xl shadow-xl border-4 border-emerald-500/20 flex flex-col items-center">
                <img
                  src={vietQrUrl}
                  alt={`VietQR thanh toán ${activeIntent.amount_vnd.toLocaleString('vi-VN')} đ`}
                  className="w-full h-auto object-contain rounded-lg"
                  onError={(e) => {
                    // Fallback visual if offline
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                
                {/* Visual Watermark text overlay for demo compliance */}
                {bankConfig.is_demo && (
                  <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                    MÔ PHỎNG – KHÔNG CHUYỂN TIỀN THẬT
                  </div>
                )}
              </div>

              {/* Bank Account Info Breakdown */}
              <div className="space-y-3 pt-2">
                
                {/* Bank Name */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <Building className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[11px] text-slate-400">Ngân hàng thụ hưởng:</div>
                      <div className="font-bold text-white">{bankConfig.bank_name} ({bankConfig.bank_id})</div>
                    </div>
                  </div>
                </div>

                {/* Account Number */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[11px] text-slate-400">Số tài khoản:</div>
                      <div className="font-mono font-extrabold text-white text-base tracking-wider">{bankConfig.account_number}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankConfig.account_number, 'account_no')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    {copiedField === 'account_no' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'account_no' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>

                {/* Account Holder */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[11px] text-slate-400">Tên người thụ hưởng:</div>
                      <div className="font-bold text-white uppercase">{bankConfig.account_holder}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(bankConfig.account_holder, 'account_holder')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
                  >
                    {copiedField === 'account_holder' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'account_holder' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>

                {/* Exact Amount */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[11px] text-emerald-300">Số tiền cần chuyển chính xác:</div>
                    <div className="font-extrabold text-emerald-400 text-lg">
                      {activeIntent.amount_vnd.toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(String(activeIntent.amount_vnd), 'amount')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-md"
                  >
                    {copiedField === 'amount' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'amount' ? 'Đã chép' : 'Sao chép số tiền'}</span>
                  </button>
                </div>

                {/* Transfer Memo */}
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[11px] text-indigo-300">Nội dung chuyển khoản (bắt buộc đúng để tự động đối soát):</div>
                    <div className="font-mono font-extrabold text-indigo-400 text-base tracking-wider">
                      {activeIntent.transfer_memo}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeIntent.transfer_memo, 'memo')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer shadow-md"
                  >
                    {copiedField === 'memo' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'memo' ? 'Đã chép' : 'Sao chép nội dung'}</span>
                  </button>
                </div>

              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Order Details, Payment State, Action Form & Refund Tracking (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Package Summary Card */}
            <div className="glass-panel p-5 rounded-3xl border border-slate-700 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Thông Tin Gói Học & Đơn Hàng</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Mã yêu cầu:</span>
                  <span className="font-mono font-bold text-white">{activeIntent.request_code}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Gói học:</span>
                  <span className="font-semibold text-emerald-400">{activeIntent.package_name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Người dạy kèm (Khóa trước):</span>
                  <span className="font-bold text-white">{activeIntent.tutor_name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Người học:</span>
                  <span className="text-slate-200">{activeIntent.student_name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 border-t border-slate-800 pt-2 font-bold">
                  <span className="text-white">Tổng học phí trọn gói:</span>
                  <span className="text-emerald-400 text-sm">{activeIntent.amount_vnd.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              {/* Status Banner */}
              <div className="pt-2">
                {activeIntent.status === 'pending' && (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
                    <Clock className="w-4 h-4 shrink-0 text-amber-400 animate-pulse" />
                    <span><strong>Trạng thái:</strong> Chờ chuyển khoản qua ngân hàng.</span>
                  </div>
                )}
                {activeIntent.status === 'awaiting_verification' && (
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center space-x-2">
                    <Clock className="w-4 h-4 shrink-0 text-blue-400 animate-spin" />
                    <span><strong>Trạng thái:</strong> Đã gửi xác nhận. Quản trị viên đang đối soát với tài khoản ngân hàng.</span>
                  </div>
                )}
                {activeIntent.status === 'paid' && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span><strong>Trạng thái:</strong> Thanh toán đã được xác minh thành công!</span>
                  </div>
                )}
                {activeIntent.status === 'needs_review' && (
                  <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-orange-400" />
                    <span><strong>Trạng thái:</strong> Giao dịch cần kiểm tra. Vui lòng liên hệ Admin.</span>
                  </div>
                )}
                {activeIntent.status === 'refund_pending' && (
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-purple-400" />
                    <span><strong>Trạng thái:</strong> Chờ hoàn tiền 100% do người dạy từ chối yêu cầu.</span>
                  </div>
                )}
                {activeIntent.status === 'refunded' && (
                  <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-400" />
                    <span><strong>Trạng thái:</strong> Đã hoàn trả 100% học phí thành công.</span>
                  </div>
                )}
                {activeIntent.status === 'cancelled' && (
                  <div className="p-3 rounded-2xl bg-slate-800 text-slate-400 text-xs flex items-center space-x-2">
                    <XCircle className="w-4 h-4 shrink-0 text-slate-500" />
                    <span><strong>Trạng thái:</strong> Giao dịch thanh toán đã bị hủy.</span>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION FORM: "Tôi đã chuyển khoản" */}
            {activeIntent.status === 'pending' && (
              <form onSubmit={handleSubmitTransfer} className="glass-panel p-5 rounded-3xl border border-slate-700 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-2">
                  <Send className="w-4 h-4 text-emerald-400" />
                  <span>Xác Nhận Sau Khi Chuyển Khoản</span>
                </h3>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Sau khi hoàn tất chuyển khoản trên ứng dụng ngân hàng của bạn, hãy nhập mã giao dịch để thông báo cho Quản trị viên đối soát:
                </p>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Mã giao dịch / Mã tham chiếu ngân hàng <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Ví dụ: FT2608194829 hoặc 107879627729"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Ghi chú thêm (không bắt buộc)
                  </label>
                  <textarea
                    rows={2}
                    value={studentNote}
                    onChange={(e) => setStudentNote(e.target.value)}
                    placeholder="Ví dụ: Em chuyển từ tài khoản Vietcombank của em..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang gửi thông báo...' : 'Tôi Đã Chuyển Khoản Thành Công'}</span>
                </button>

                <p className="text-[10px] text-slate-500 text-center">
                  Lưu ý: Nút bấm chỉ gửi thông báo đối soát. Giao dịch chỉ hợp lệ khi Quản trị viên EduMate xác nhận đã nhận tiền thực tế.
                </p>
              </form>
            )}

            {/* AWAITING VERIFICATION STATE INFO */}
            {activeIntent.status === 'awaiting_verification' && (
              <div className="glass-panel p-5 rounded-3xl border border-blue-500/30 bg-blue-950/20 shadow-xl space-y-3 text-xs">
                <div className="flex items-center space-x-2 text-blue-300 font-bold">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Đang Trong Quá Trình Đối Soát Thủ Công</span>
                </div>
                <div className="text-slate-300 space-y-1 text-[11px] leading-relaxed">
                  <div>• Mã giao dịch bạn đã gửi: <strong className="font-mono text-white">{activeIntent.transfer_reference}</strong></div>
                  <div>• Thời gian gửi: {new Date(activeIntent.updated_at).toLocaleString('vi-VN')}</div>
                  <div>• Quản trị viên EduMate Huế đối soát sao kê định kỳ trong khung giờ 08:00 – 21:00 hằng ngày.</div>
                </div>
              </div>
            )}

            {/* REFUND TRACKING CARD IF REFUND REQUEST EXISTS */}
            {activeRefund && (
              <div className="glass-panel p-5 rounded-3xl border border-purple-500/30 bg-purple-950/20 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-purple-800/40 pb-2">
                  <h3 className="text-sm font-bold text-purple-300 flex items-center space-x-2">
                    <Banknote className="w-4 h-4 text-purple-400" />
                    <span>Tiến Trình Hoàn Tiền 100%</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase">
                    {activeRefund.status}
                  </span>
                </div>

                <div className="text-xs space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số tiền hoàn trả:</span>
                    <strong className="text-emerald-400 text-sm font-bold">
                      {activeRefund.refund_amount_vnd.toLocaleString('vi-VN')} ₫
                    </strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Lý do: <span className="text-slate-200">{activeRefund.reason}</span>
                  </div>
                </div>

                {/* Stepper */}
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-300">Vòng đời hoàn tiền:</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className={activeRefund.status !== 'rejected' ? 'text-purple-400 font-bold' : ''}>1. Tạo yêu cầu</span>
                    <span>→</span>
                    <span className={['under_review', 'approved', 'processing', 'refunded'].includes(activeRefund.status) ? 'text-purple-400 font-bold' : ''}>2. Thẩm định</span>
                    <span>→</span>
                    <span className={['approved', 'processing', 'refunded'].includes(activeRefund.status) ? 'text-purple-400 font-bold' : ''}>3. Duyệt lệnh</span>
                    <span>→</span>
                    <span className={activeRefund.status === 'refunded' ? 'text-emerald-400 font-bold' : ''}>4. Đã hoàn tiền</span>
                  </div>
                </div>

                {/* Form to submit / update student refund bank account */}
                <form onSubmit={handleSaveRefundBank} className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                    <span>Tài khoản ngân hàng của bạn nhận tiền hoàn:</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <input
                      type="text"
                      required
                      value={refundBankName}
                      onChange={(e) => setRefundBankName(e.target.value)}
                      placeholder="Tên ngân hàng (VD: Vietcombank, MBBank...)"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      required
                      value={refundAccountNo}
                      onChange={(e) => setRefundAccountNo(e.target.value)}
                      placeholder="Số tài khoản ngân hàng của bạn"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                    <input
                      type="text"
                      required
                      value={refundAccountHolder}
                      onChange={(e) => setRefundAccountHolder(e.target.value.toUpperCase())}
                      placeholder="Họ và tên chủ tài khoản"
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingBank}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingBank ? 'Đang lưu...' : 'Lưu thông tin tài khoản nhận tiền'}
                  </button>
                </form>

                {activeRefund.bank_refund_reference && (
                  <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/40 text-teal-300 text-xs">
                    Mã chuyển tiền hoàn trả ngân hàng: <strong className="font-mono text-white">{activeRefund.bank_refund_reference}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Platform Guarantee Info */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs space-y-2">
              <div className="flex items-center space-x-2 text-slate-200 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Chính Sách Bảo Vệ Học Viên EduMate Huế</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                <li>Học phí đã bao gồm trọn gói dịch vụ kết nối, cam kết không phát sinh phụ phí ẩn.</li>
                <li>Học phí được giữ an toàn tại nền tảng cho đến khi buổi học hoàn thành tốt đẹp.</li>
                <li>Nếu người dạy từ chối hoặc bận lịch trước buổi học đầu tiên, bạn được hoàn tiền 100% học phí không trừ bất kỳ khoản phí nào.</li>
              </ul>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
