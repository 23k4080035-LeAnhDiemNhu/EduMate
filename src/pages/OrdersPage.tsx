import React, { useState } from 'react';
import type { Profile, Order } from '../types';
import { dataService } from '../services/dataService';
import { OrderBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Upload, 
  Info,
  Building,
  Loader2
} from 'lucide-react';


interface OrdersPageProps {
  currentUser: Profile;
  onNavigate: (page: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  currentUser,
  onNavigate,
  showToast,
}) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    return dataService.getOrders().filter(o => o.student_id === currentUser.id);
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [transactionRef, setTransactionRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const reloadOrders = () => {
    setOrders(dataService.getOrders().filter(o => o.student_id === currentUser.id));
  };

  const handleOpenPayModal = (order: Order) => {
    setSelectedOrder(order);
    setTransactionRef('');
    setErrorMsg('');
  };

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    if (!transactionRef.trim()) {
      setErrorMsg('Vui lòng nhập mã tham chiếu giao dịch ngân hàng');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      dataService.createPayment({
        order_id: selectedOrder.id,
        order_code: selectedOrder.order_code,
        payment_method: 'bank_transfer',
        transaction_ref: transactionRef.trim(),
        amount: selectedOrder.total_amount,
        proof_attachment_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=400',
        status: 'pending',
      });

      setLoading(false);
      setSelectedOrder(null);
      reloadOrders();
      showToast(
        'success',
        'Đã gửi xác nhận nộp phí!',
        `Giao dịch cho đơn ${selectedOrder.order_code} đã vào hàng đợi đối soát của Ban Quản lý`
      );
    }, 500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
          <CreditCard className="w-6 h-6 text-indigo-400" />
          <span>Đơn Hàng & Nghĩa Vụ Thanh Toán Học Vụ</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Theo dõi các khoản thu phát sinh từ biểu mẫu yêu cầu, học phí và nộp xác nhận chuyển khoản ngân hàng
        </p>
      </div>

      {/* Scope Disclaimer Banner */}
      <div className="p-4 rounded-2xl glass-panel border border-amber-500/30 bg-amber-950/20 flex items-start space-x-3 text-xs text-amber-200">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed">
          <p>
            <strong>Cơ chế thanh toán giai đoạn MVP (Chương 4.4 PDF Đồ án):</strong> Theo định hướng đồ án, hệ thống cổng thanh toán trực tuyến tự động (VNPay/MoMo/Banking Gateway) là tính năng phát triển ở giai đoạn sau.
          </p>
          <p className="text-amber-300/80 text-[11px]">
            Trong giai đoạn hiện tại, nền tảng áp dụng hình thức chuyển khoản ngân hàng trực tiếp. Sau khi gửi mã tham chiếu, giao dịch sẽ ở trạng thái <strong>"Chờ đối soát"</strong> cho đến khi Quản trị viên EduMate xác thực chứng từ hợp lệ.
          </p>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="Không có đơn hàng nào cần thanh toán"
          description="Hiện tại bạn không có nghĩa vụ tài chính hoặc hóa đơn học vụ nào đang chờ xử lý."
          actionText="Xem danh mục chương trình học"
          onAction={() => onNavigate('academic')}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 transition-all hover:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                      {ord.order_code}
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      {ord.items?.[0]?.item_name || 'Khoản thu dịch vụ học vụ'}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ngày lập hóa đơn: {new Date(ord.created_at).toLocaleDateString('vi-VN')}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-start sm:self-auto">
                  <OrderBadge status={ord.status} />

                  {ord.status === 'pending' && (
                    <button
                      onClick={() => handleOpenPayModal(ord)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Xác nhận nộp tiền</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Order Items Table Snapshot */}
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs">
                <div className="flex items-center justify-between font-medium text-slate-300">
                  <span>Chi tiết mục: {ord.items?.[0]?.item_name || 'Dịch vụ học vụ EduMate'}</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {ord.total_amount.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Building className="w-5 h-5 text-emerald-400" />
                <span>Nộp Thông Tin Chuyển Khoản Ngân Hàng</span>
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmTransfer} className="space-y-4 text-xs">
              {/* Bank Transfer Guide Box */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Tài khoản nhận học phí & lệ phí:
                </div>
                <div className="text-sm font-bold text-white">Ngân hàng TMCP Quân Đội (MB Bank)</div>
                <div className="text-xs text-slate-300">
                  Số tài khoản: <code className="font-mono text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded">0988-EDUMATE-2026</code>
                </div>
                <div className="text-xs text-slate-300">
                  Chủ tài khoản: <strong>BAN QUẢN TRỊ DỊCH VỤ HỌC VỤ EDUMATE</strong>
                </div>
                <div className="text-xs text-slate-300">
                  Số tiền cần đóng: <strong className="text-emerald-400 text-sm">{selectedOrder.total_amount.toLocaleString('vi-VN')} ₫</strong>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  Nội dung CK đề xuất: <code className="text-indigo-300 font-mono font-bold">{selectedOrder.order_code} {currentUser.student_code}</code>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Mã tham chiếu chuyển khoản (FT Code / Mã giao dịch): <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="VD: FT2608129381 hoặc MB981245"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="p-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-center text-[11px] text-slate-400">
                <Upload className="w-4 h-4 mx-auto mb-1 text-slate-500" />
                <span>Minh chứng biên lai (Mô phỏng đính kèm tự động lưu vào hệ thống)</span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác nhận đã nộp tiền</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
