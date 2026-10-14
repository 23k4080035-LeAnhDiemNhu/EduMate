import React, { useState, useEffect } from 'react';
import type { Profile, ServiceRequest } from '../types';
import { dataService } from '../services/dataService';
import { isSupabaseConfigured, supabaseFetchRequests, supabaseCancelRequest } from '../lib/supabase';
import { RequestBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { 
  FileText, 
  Search, 
  PlusCircle, 
  Calendar, 
  AlertCircle, 
  Ban, 
  Filter,
  Loader2
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
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadRequests = async () => {
    try {
      if (isSupabaseConfigured) {
        const list = await supabaseFetchRequests();
        setRequests(list);
      } else {
        const list = dataService.getRequests(currentUser.id, currentUser.role);
        setRequests(list);
      }
    } catch (err: any) {
      showToast('error', 'Lỗi tải danh sách yêu cầu', err?.message);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [currentUser.id]);

  const handleCancelRequest = async (req: ServiceRequest) => {
    if (!['draft', 'submitted'].includes(req.status)) {
      showToast('error', 'Không thể hủy hồ sơ', 'Chỉ có thể hủy hồ sơ khi đang ở trạng thái Nháp hoặc Chờ xử lý');
      return;
    }

    const confirmCancel = window.confirm(`Bạn có chắc chắn muốn hủy yêu cầu "${req.request_code}"?`);
    if (!confirmCancel) return;

    setCancellingId(req.id);
    try {
      if (isSupabaseConfigured) {
        await supabaseCancelRequest(req.id);
      } else {
        dataService.cancelRequest(req.id, currentUser.id);
      }
      await loadRequests();
      showToast('info', 'Đã hủy yêu cầu!', `Mã hồ sơ ${req.request_code} đã được chuyển sang trạng thái Đã hủy`);
    } catch (err: any) {
      showToast('error', 'Lỗi thao tác hủy', err?.message || 'Không thể hủy yêu cầu vào lúc này');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchesSearch = 
      r.request_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.form_type_title && r.form_type_title.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            <span>Theo Dõi Yêu Cầu & Biểu Mẫu Đã Gửi</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Xem lịch sử hồ sơ, trạng thái xử lý và phản hồi trực tiếp từ Ban Quản trị Giáo vụ
          </p>
        </div>

        <button
          onClick={() => onNavigate('submit-request')}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Gửi yêu cầu mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn hoặc tên biểu mẫu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-400 hidden sm:inline">Lọc trạng thái:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs w-full md:w-auto"
          >
            <option value="all">Tất cả trạng thái ({requests.length})</option>
            <option value="submitted">Chờ xử lý (Submitted)</option>
            <option value="in_review">Đang thẩm định (In Review)</option>
            <option value="approved">Đã phê duyệt (Approved)</option>
            <option value="rejected">Đã từ chối (Rejected)</option>
            <option value="draft">Bản nháp (Draft)</option>
            <option value="cancelled">Đã hủy (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Không tìm thấy yêu cầu nào"
          description={
            requests.length === 0
              ? 'Bạn chưa khởi tạo bất kỳ yêu cầu học vụ nào. Hãy gửi yêu cầu đầu tiên ngay bây giờ!'
              : 'Không có yêu cầu nào phù hợp với điều kiện tìm kiếm hoặc bộ lọc trạng thái đã chọn.'
          }
          actionText={requests.length === 0 ? 'Tạo yêu cầu mới ngay' : undefined}
          onAction={() => onNavigate('submit-request')}
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 transition-all hover:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                      {req.request_code}
                    </span>
                    <h3 className="text-sm font-bold text-white">{req.form_type_title}</h3>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ngày nộp: {new Date(req.created_at).toLocaleString('vi-VN')}</span>
                    </span>
                    {req.reviewed_at && (
                      <span>• Duyệt lúc: {new Date(req.reviewed_at).toLocaleDateString('vi-VN')}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-start sm:self-auto">
                  <RequestBadge status={req.status} />

                  {/* Cancel Button only for draft or submitted */}
                  {['draft', 'submitted'].includes(req.status) && (
                    <button
                      onClick={() => handleCancelRequest(req)}
                      disabled={cancellingId === req.id}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800/50 text-[11px] font-medium transition-all cursor-pointer flex items-center space-x-1 disabled:opacity-50"
                      title="Hủy bỏ yêu cầu này"
                    >
                      {cancellingId === req.id ? (
                        <Loader2 className="w-3 h-3 animate-spin text-rose-400" />
                      ) : (
                        <Ban className="w-3 h-3" />
                      )}
                      <span>{cancellingId === req.id ? 'Đang hủy...' : 'Hủy'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Form Data Snapshot */}
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs">
                <div className="text-[11px] font-semibold text-slate-400 mb-1">
                  Nội dung đã khai báo:
                </div>
                <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {req.form_data.ly_do_noi_dung || JSON.stringify(req.form_data, null, 2)}
                </div>
                {req.form_data.ngay_mong_muon && (
                  <div className="mt-2 text-[11px] text-slate-400">
                    Ngày mong muốn: <strong className="text-white">{req.form_data.ngay_mong_muon}</strong>
                  </div>
                )}
                {req.form_data.ghi_chu_them && (
                  <div className="mt-1 text-[11px] text-slate-400">
                    Ghi chú đính kèm: <span className="text-indigo-300">{req.form_data.ghi_chu_them}</span>
                  </div>
                )}
              </div>

              {/* Manager Feedback Section */}
              {req.review_notes && (
                <div
                  className={`p-3.5 rounded-xl text-xs border ${
                    req.status === 'approved'
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
                  }`}
                >
                  <div className="font-semibold flex items-center space-x-1.5 mb-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Ý kiến phản hồi từ Ban Quản lý ({req.reviewer_name || 'Ban Giáo vụ'}):</span>
                  </div>
                  <p className="leading-relaxed text-slate-200">{req.review_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
