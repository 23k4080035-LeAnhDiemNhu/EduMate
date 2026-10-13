import React, { useState } from 'react';
import type { Profile, ServiceForm } from '../types';
import { dataService } from '../services/dataService';
import { 
  FileText, 
  Send, 
  FileEdit, 
  Loader2,
  Info
} from 'lucide-react';


interface SubmitRequestPageProps {
  currentUser: Profile;
  onNavigate: (page: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const SubmitRequestPage: React.FC<SubmitRequestPageProps> = ({
  currentUser,
  onNavigate,
  showToast,
}) => {
  const forms: ServiceForm[] = dataService.getServiceForms();
  const [selectedFormId, setSelectedFormId] = useState<string>(forms[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Dynamic payload inputs
  const [reason, setReason] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [copiesCount, setCopiesCount] = useState('1');
  const [deliveryMethod, setDeliveryMethod] = useState('Nhan truc tiep tai phong Giao vu');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const currentForm = forms.find(f => f.id === selectedFormId) || forms[0];

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!reason.trim()) {
      newErrors.reason = 'Vui lòng nêu rõ lý do hoặc nội dung yêu cầu cụ thể';
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'Nội dung lý do quá ngắn (tối thiểu 10 ký tự để ban giáo vụ thẩm định)';
    }

    if (currentForm.code === 'FORM-HOAN-THI' && !targetDate) {
      newErrors.targetDate = 'Vui lòng chọn ngày mong muốn chuyển dời';
    }

    if (currentForm.code === 'FORM-CAP-BANG-DIEM') {
      const count = parseInt(copiesCount, 10);
      if (isNaN(count) || count < 1 || count > 10) {
        newErrors.copiesCount = 'Số lượng bản sao phải từ 1 đến 10 bản';
      }
      if (deliveryMethod === 'Chuyen phat nhanh buu dien' && !deliveryAddress.trim()) {
        newErrors.deliveryAddress = 'Vui lòng nhập địa chỉ nhận bưu điện';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (status: 'draft' | 'submitted') => {
    if (status === 'submitted' && !validate()) return;

    setLoading(true);

    const formDataPayload: Record<string, any> = {
      ly_do_noi_dung: reason.trim(),
      ghi_chu_them: additionalNotes.trim() || undefined,
    };

    if (currentForm.code === 'FORM-HOAN-THI') {
      formDataPayload.ngay_mong_muon = targetDate;
    } else if (currentForm.code === 'FORM-CAP-BANG-DIEM') {
      formDataPayload.so_ban = parseInt(copiesCount, 10) || 1;
      formDataPayload.hinh_thuc_nhan = deliveryMethod;
      formDataPayload.dia_chi_gui = deliveryAddress.trim() || undefined;
    } else if (currentForm.code === 'FORM-DANG-KY-HO-TRO') {
      formDataPayload.khung_gio_ranh = targetDate || 'Linh hoạt theo trợ giảng';
    }

    setTimeout(() => {
      const created = dataService.createRequest({
        student_id: currentUser.id,
        form_type_id: currentForm.id,
        form_type_title: currentForm.title,
        student_name: currentUser.full_name,
        student_email: currentUser.email,
        student_code: currentUser.student_code,
        form_data: formDataPayload,
        status: status,
      });

      setLoading(false);
      const actionText = status === 'submitted' ? 'Đã nộp chính thức' : 'Đã lưu bản nháp';
      showToast('success', `${actionText} thành công!`, `Mã yêu cầu: ${created.request_code}`);
      
      // Navigate to my-requests page
      onNavigate('my-requests');
    }, 500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
          <FileText className="w-6 h-6 text-indigo-400" />
          <span>Khởi Tạo & Nộp Biểu Mẫu Dịch Vụ Học Vụ</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Điền đầy đủ thông tin để gửi tới Ban Quản lý Giáo vụ xem xét và thẩm định hồ sơ
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-700 shadow-xl space-y-6">
        
        {/* Step 1: Select Form Type */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
            1. Chọn loại biểu mẫu dịch vụ:
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {forms.map((f) => (
              <div
                key={f.id}
                onClick={() => { setSelectedFormId(f.id); setErrors({}); }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                  selectedFormId === f.id
                    ? 'border-indigo-500 bg-indigo-950/30 text-white ring-1 ring-indigo-500/50'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedFormId === f.id ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'
                }`}>
                  {selectedFormId === f.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold flex items-center space-x-2">
                    <span>{f.title}</span>
                    <span className="text-[10px] font-mono font-normal text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/50">
                      {f.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Details Area */}
        <div className="space-y-4 pt-4 border-t border-slate-800 text-xs">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            2. Khai báo thông tin chi tiết:
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Lý do hoặc nội dung chi tiết: <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Trình bày rõ hoàn cảnh, căn cứ và mong muốn đề đạt tới ban giáo vụ..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
            {errors.reason && <p className="text-rose-400 mt-1">{errors.reason}</p>}
          </div>

          {currentForm.code === 'FORM-HOAN-THI' && (
            <div>
              <label className="block text-slate-300 font-medium mb-1">
                Ngày mong muốn tổ chức thi / đánh giá lại: <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              {errors.targetDate && <p className="text-rose-400 mt-1">{errors.targetDate}</p>}
            </div>
          )}

          {currentForm.code === 'FORM-CAP-BANG-DIEM' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Số lượng bản sao cần cấp: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={copiesCount}
                  onChange={(e) => setCopiesCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                {errors.copiesCount && <p className="text-rose-400 mt-1">{errors.copiesCount}</p>}
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Hình thức nhận kết quả:
                </label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Nhan truc tiep tai phong Giao vu">Nhận trực tiếp tại phòng Giáo vụ</option>
                  <option value="Chuyen phat nhanh buu dien">Chuyển phát nhanh bưu điện</option>
                  <option value="Ban ky so qua Email">Bản ký số qua Email</option>
                </select>
              </div>

              {deliveryMethod === 'Chuyen phat nhanh buu dien' && (
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    Địa chỉ nhận hồ sơ cụ thể: <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  {errors.deliveryAddress && <p className="text-rose-400 mt-1">{errors.deliveryAddress}</p>}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Ghi chú thêm hoặc liên kết minh chứng (Ảnh/PDF online):
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="VD: https://drive.google.com/... hoặc giấy xác nhận đính kèm"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-slate-400 flex items-start space-x-2 text-[11px]">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Hồ sơ khi nộp chính thức sẽ được chuyển sang trạng thái <strong>Chờ xử lý (Submitted)</strong> và gán vào hàng đợi thẩm định của Người quản lý. Bạn có thể lưu bản nháp nếu chưa hoàn thiện minh chứng.
            </p>
          </div>

        </div>

        {/* Actions Button */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleFormSubmit('draft')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Lưu bản nháp (Draft)</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleFormSubmit('submitted')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý nộp đơn...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Nộp yêu cầu chính thức</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
