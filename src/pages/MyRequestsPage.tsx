import React, { useState, useEffect } from 'react';
import type { Profile, LearningRequest, LearningRequestStatus } from '../types';
import { dataService } from '../services/dataService';
import { EmptyState } from '../components/common/EmptyState';
import { 
  FileText, 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  CheckCircle2, 
  XCircle, 
  X,
  Check
} from 'lucide-react';

interface MyRequestsPageProps {
  currentUser: Profile;
  onNavigate: (page: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const MyRequestsPage: React.FC<MyRequestsPageProps> = ({
  currentUser,
  onNavigate,
  showToast,
}) => {
  const [requests, setRequests] = useState<LearningRequest[]>(() =>
    dataService.getLearningRequests(currentUser.id, currentUser.role)
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Reject Modal State (For Tutor)
  const [rejectingReq, setRejectingReq] = useState<LearningRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  // Review Modal State (For Learner on Completed Requests)
  const [reviewingReq, setReviewingReq] = useState<LearningRequest | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  const loadRequests = () => {
    setRequests(dataService.getLearningRequests(currentUser.id, currentUser.role));
  };

  useEffect(() => {
    queueMicrotask(() => {
      setRequests(dataService.getLearningRequests(currentUser.id, currentUser.role));
    });
  }, [currentUser.id, currentUser.role]);

  // Handle Learner Cancels Request (Only when pending)
  const handleCancelRequest = (req: LearningRequest) => {
    if (req.status !== 'pending') {
      showToast('error', 'Không thể hủy yêu cầu', 'Chỉ có thể hủy khi yêu cầu đang ở trạng thái Chờ xác nhận');
      return;
    }

    const confirmCancel = window.confirm(`Bạn có chắc chắn muốn hủy yêu cầu "${req.request_code}" gửi đến ${req.tutor_name}?`);
    if (!confirmCancel) return;

    try {
      dataService.updateLearningRequestStatus(
        req.id,
        'cancelled',
        currentUser.id,
        currentUser.full_name
      );
      loadRequests();
      showToast('info', 'Đã hủy yêu cầu', `Mã yêu cầu ${req.request_code} đã chuyển sang trạng thái Đã hủy`);
    } catch (err: any) {
      showToast('error', 'Lỗi hủy yêu cầu', err.message);
    }
  };

  // Handle Tutor Accepts Request
  const handleAcceptRequest = (req: LearningRequest) => {
    try {
      dataService.updateLearningRequestStatus(
        req.id,
        'accepted',
        currentUser.id,
        currentUser.full_name
      );
      loadRequests();
      showToast('success', 'Đã chấp nhận yêu cầu học!', `Bạn đã đồng ý hướng dẫn học viên ${req.student_name}. Hãy liên hệ sắp xếp buổi học đầu tiên.`);
    } catch (err: any) {
      showToast('error', 'Lỗi thao tác', err.message);
    }
  };

  // Handle Tutor Confirms Reject
  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReq) return;

    if (!rejectReason.trim()) {
      setRejectError('Vui lòng nhập lý do từ chối để học viên nắm rõ.');
      return;
    }

    try {
      dataService.updateLearningRequestStatus(
        rejectingReq.id,
        'rejected',
        currentUser.id,
        currentUser.full_name,
        rejectReason.trim()
      );
      setRejectingReq(null);
      setRejectReason('');
      loadRequests();
      showToast('info', 'Đã từ chối yêu cầu', 'Thông báo và lý do đã được lưu để phản hồi học viên.');
    } catch (err: any) {
      setRejectError(err.message || 'Lỗi thao tác');
    }
  };

  // Handle Complete Request
  const handleCompleteRequest = (req: LearningRequest) => {
    const confirm = window.confirm(`Xác nhận hoàn thành toàn bộ khóa/buổi học cho yêu cầu "${req.request_code}"?`);
    if (!confirm) return;

    try {
      dataService.updateLearningRequestStatus(
        req.id,
        'completed',
        currentUser.id,
        currentUser.full_name
      );
      loadRequests();
      showToast('success', 'Xác nhận hoàn thành thành công!', 'Buổi học đã hoàn thành. Học viên hiện có thể gửi đánh giá chất lượng.');
    } catch (err: any) {
      showToast('error', 'Lỗi thao tác', err.message);
    }
  };

  // Handle Learner Submits Review (Quy trình E)
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingReq) return;

    if (!ratingComment.trim() || ratingComment.trim().length < 5) {
      setReviewError('Vui lòng nhập nhận xét chi tiết tối thiểu 5 ký tự.');
      return;
    }

    try {
      dataService.addReview({
        request_id: reviewingReq.id,
        student_id: currentUser.id,
        student_name: currentUser.full_name,
        tutor_id: reviewingReq.tutor_id,
        rating: ratingScore,
        comment: ratingComment.trim()
      });

      setReviewingReq(null);
      setRatingComment('');
      loadRequests();
      showToast('success', 'Đánh giá thành công!', `Cảm ơn bạn đã gửi đánh giá ${ratingScore} sao cho người dạy ${reviewingReq.tutor_name}.`);
    } catch (err: any) {
      setReviewError(err.message || 'Không thể gửi đánh giá');
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      r.request_code.toLowerCase().includes(term) ||
      r.subject_name.toLowerCase().includes(term) ||
      r.tutor_name.toLowerCase().includes(term) ||
      r.student_name.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: LearningRequestStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Chờ xác nhận</span>;
      case 'accepted':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Đã chấp nhận</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Bị từ chối</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">Đã hoàn thành</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">Đã hủy</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            <span>
              {currentUser.role === 'tutor' ? 'Quản Lý Yêu Cầu Học Được Gửi Đến' : 'Theo Dõi Yêu Cầu & Lịch Học Của Tôi'}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {currentUser.role === 'tutor'
              ? 'Xem xét yêu cầu học từ sinh viên tại Huế, chấp thuận lịch và cập nhật trạng thái buổi học'
              : 'Theo dõi phản hồi từ người dạy, xác nhận lịch học và gửi đánh giá sau khi hoàn thành'}
          </p>
        </div>

        {currentUser.role === 'student' && (
          <button
            onClick={() => onNavigate('academic')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            + Gửi thêm yêu cầu học
          </button>
        )}
      </div>

      {/* Filter toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã yêu cầu, tên, môn..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'pending', label: 'Chờ xác nhận' },
            { id: 'accepted', label: 'Đã chấp nhận' },
            { id: 'completed', label: 'Đã hoàn thành' },
            { id: 'rejected', label: 'Bị từ chối' },
            { id: 'cancelled', label: 'Đã hủy' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Request list */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          title="Chưa có yêu cầu học nào"
          description="Hiện tại không có bản ghi nào khớp với điều kiện lọc."
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-4"
            >
              {/* Row 1: Code, Status, Time */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                    {req.request_code}
                  </span>
                  {getStatusBadge(req.status)}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Khởi tạo lúc: {new Date(req.created_at).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              {/* Row 2: Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                
                {/* Counterpart info */}
                <div className="space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">
                    {currentUser.role === 'tutor' ? 'Học viên (Khóa dưới) gửi yêu cầu:' : 'Anh/Chị khóa trước được chọn:'}
                  </div>
                  <div className="text-sm font-bold text-white">
                    {currentUser.role === 'tutor' ? req.student_name : req.tutor_name}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {currentUser.role === 'tutor' ? (req.student_phone || req.student_email) : 'Anh/Chị khóa trước tại Huế'}
                  </div>
                </div>

                {/* Subject & Schedule */}
                <div className="space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Môn học & Thời gian:</div>
                  <div className="font-bold text-emerald-400">{req.subject_name}</div>
                  <div className="text-slate-300 text-[11px] flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>{req.preferred_schedule}</span>
                  </div>
                </div>

                {/* Mode & Address */}
                <div className="space-y-1">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">Hình thức học:</div>
                  <div className="text-slate-200 font-medium">
                    {req.teaching_mode === 'offline' ? 'Học trực tiếp tại Huế' : 'Trực tuyến qua Google Meet'}
                  </div>
                  {req.address && (
                    <div className="text-slate-400 text-[11px] flex items-center space-x-1 truncate">
                      <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="truncate">{req.address}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Row 3: Learning Goals text */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-slate-400 text-[10px]">Mục tiêu / Nội dung cần học:</div>
                <p className="leading-relaxed">{req.learning_goals}</p>
                {req.notes && (
                  <div className="text-[11px] text-slate-400 italic pt-1">
                    Ghi chú thêm: "{req.notes}"
                  </div>
                )}
              </div>

              {/* Rejected reason warning if applicable */}
              {req.status === 'rejected' && req.rejected_reason && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 space-y-0.5">
                  <div className="font-bold flex items-center space-x-1 text-[11px]">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Lý do từ chối từ người dạy:</span>
                  </div>
                  <p className="text-[11px] pl-4">{req.rejected_reason}</p>
                </div>
              )}

              {/* Row 4: Actions toolbar */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                
                <div className="text-[11px] text-slate-500">
                  {req.status === 'completed' && req.reviewed && (
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã gửi đánh giá chất lượng</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  
                  {/* Tutor Actions: Accept / Reject / Complete */}
                  {currentUser.role === 'tutor' && req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          setRejectError('');
                          setRejectReason('');
                          setRejectingReq(req);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/60 transition-all cursor-pointer"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleAcceptRequest(req)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Chấp nhận yêu cầu</span>
                      </button>
                    </>
                  )}

                  {currentUser.role === 'tutor' && req.status === 'accepted' && (
                    <button
                      onClick={() => handleCompleteRequest(req)}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 cursor-pointer flex items-center space-x-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Xác nhận hoàn thành khóa học</span>
                    </button>
                  )}

                  {/* Learner Actions: Cancel (if pending) */}
                  {currentUser.role === 'student' && req.status === 'pending' && (
                    <button
                      onClick={() => handleCancelRequest(req)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-all border border-slate-700 cursor-pointer"
                    >
                      Hủy yêu cầu
                    </button>
                  )}

                  {/* Learner Actions: Review (if completed and not reviewed) */}
                  {currentUser.role === 'student' && req.status === 'completed' && !req.reviewed && (
                    <button
                      onClick={() => {
                        setReviewError('');
                        setRatingComment('');
                        setRatingScore(5);
                        setReviewingReq(req);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center space-x-1.5"
                    >
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>Đánh giá người dạy</span>
                    </button>
                  )}

                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* Reject Modal (For Tutor) */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Từ chối yêu cầu học</h3>
              <button onClick={() => setRejectingReq(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {rejectError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
                {rejectError}
              </div>
            )}

            <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Lý do từ chối (bắt buộc) *
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="VD: Trùng lịch dạy lớp khác, khu vực quá xa..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRejectingReq(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Xác nhận từ chối
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal (For Learner - Quy trình E) */}
      {reviewingReq && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white">Đánh giá Người dạy</h3>
                <p className="text-[11px] text-slate-400">Đánh giá cho {reviewingReq.tutor_name} sau khóa học {reviewingReq.subject_name}</p>
              </div>
              <button onClick={() => setReviewingReq(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Điểm chất lượng (1 đến 5 sao):</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingScore(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= ratingScore
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-amber-400 pl-2">
                    {ratingScore} / 5 sao
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nhận xét thực tế sau buổi học (tối thiểu 5 ký tự) *
                </label>
                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Chia sẻ về độ tận tâm, phương pháp giảng dạy, khả năng truyền đạt của người dạy..."
                  className="w-full px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReviewingReq(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30"
                >
                  Gửi đánh giá công khai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
