import React, { useState, useMemo } from 'react';
import type { DateRangeFilter } from '../../types/reporting';
import { reportingService } from '../../services/reportingService';
import { dataService } from '../../services/dataService';
import { KPICard } from './KPICard';
import { DateRangePicker } from './DateRangePicker';
import { TimeSeriesChart, StatusDonutChart } from './ReportingCharts';
import { ReportTable, type ColumnDef } from './ReportTable';
import type { LearningRequest, PaymentIntent, RefundRequest, Profile } from '../../types';
import { 
  BarChart3, 
  DollarSign, 
  BookOpen, 
  QrCode, 
  RotateCcw, 
  Users, 
  ShieldCheck 
} from 'lucide-react';

export const StatisticsTab: React.FC = () => {
  const [filter, setFilter] = useState<DateRangeFilter>({ preset: 'all' });
  const [detailTab, setDetailTab] = useState<'requests' | 'payments' | 'refunds' | 'users'>('requests');

  // Compute metrics, time-series, and distributions reactively based on filter
  const metrics = useMemo(() => reportingService.getMetrics(filter), [filter]);
  const kpiCards = useMemo(() => reportingService.getKPICards(metrics), [metrics]);
  const timeSeries = useMemo(() => reportingService.getTimeSeries(filter), [filter]);
  const requestDistribution = useMemo(() => reportingService.getRequestStatusDistribution(filter), [filter]);
  const userDistribution = useMemo(() => reportingService.getUserRoleDistribution(), []);

  // Raw datasets for table reports
  const allRequests = useMemo(() => dataService.getLearningRequests(), []);
  const allPayments = useMemo(() => dataService.getPaymentIntents(), []);
  const allRefunds = useMemo(() => dataService.getRefundRequests(), []);
  const allUsers = useMemo(() => dataService.getUsers(), []);

  // 1. Column Definitions for Learning Requests Table
  const requestColumns: ColumnDef<LearningRequest>[] = [
    { key: 'request_code', label: 'Mã Lớp', sortable: true },
    { key: 'student_name', label: 'Người Học', sortable: true },
    { key: 'tutor_name', label: 'Người Dạy', sortable: true },
    { key: 'subject_name', label: 'Môn Học', sortable: true },
    { key: 'sessions', label: 'Số Buổi', sortable: true },
    {
      key: 'total_price',
      label: 'Học Phí (VNĐ)',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-emerald-400">{(r.total_price || 0).toLocaleString('vi-VN')} đ</span>,
      exportValue: (r) => r.total_price || 0
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      sortable: true,
      render: (r) => {
        const badgeMap: Record<string, { label: string; style: string }> = {
          pending: { label: 'Chờ nhận', style: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
          accepted: { label: 'Đã nhận', style: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
          completed: { label: 'Hoàn thành', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
          rejected: { label: 'Từ chối', style: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
          cancelled: { label: 'Đã hủy', style: 'bg-slate-800 text-slate-400 border-slate-700' },
        };
        const b = badgeMap[r.status] || { label: r.status, style: 'bg-slate-800 text-slate-300' };
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.style}`}>{b.label}</span>;
      }
    },
    {
      key: 'created_at',
      label: 'Ngày Tạo',
      sortable: true,
      render: (r) => <span className="text-slate-400 text-[11px]">{new Date(r.created_at).toLocaleDateString('vi-VN')}</span>,
      exportValue: (r) => r.created_at
    }
  ];

  // 2. Column Definitions for VietQR Payments Table
  const paymentColumns: ColumnDef<PaymentIntent>[] = [
    { key: 'request_code', label: 'Mã GD', sortable: true },
    { key: 'student_name', label: 'Người Chuyển', sortable: true },
    { key: 'tutor_name', label: 'Người Dạy', sortable: true },
    { key: 'package_name', label: 'Gói Học', sortable: true },
    {
      key: 'amount_vnd',
      label: 'Số Tiền (VNĐ)',
      sortable: true,
      render: (p) => <span className="font-mono font-bold text-emerald-400">{(p.amount_vnd || 0).toLocaleString('vi-VN')} đ</span>,
      exportValue: (p) => p.amount_vnd
    },
    {
      key: 'platform_fee_vnd',
      label: 'Phí Sàn (15%)',
      sortable: true,
      render: (p) => <span className="font-mono text-teal-400 text-[11px]">{Math.round((p.amount_vnd || 0) * 0.15).toLocaleString('vi-VN')} đ</span>,
      exportValue: (p) => Math.round((p.amount_vnd || 0) * 0.15)
    },
    {
      key: 'tutor_share_vnd',
      label: 'Phần Gia Sư (85%)',
      sortable: true,
      render: (p) => <span className="font-mono text-blue-400 text-[11px]">{Math.round((p.amount_vnd || 0) * 0.85).toLocaleString('vi-VN')} đ</span>,
      exportValue: (p) => Math.round((p.amount_vnd || 0) * 0.85)
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      sortable: true,
      render: (p) => {
        const badgeMap: Record<string, { label: string; style: string }> = {
          pending: { label: 'Chờ quét QR', style: 'bg-slate-800 text-slate-400 border-slate-700' },
          awaiting_verification: { label: 'Chờ đối soát', style: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
          paid: { label: 'Đã xác nhận', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
          needs_review: { label: 'Cần tra soát', style: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
          refund_pending: { label: 'Chờ hoàn tiền', style: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
          refunded: { label: 'Đã hoàn tiền', style: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
          cancelled: { label: 'Đã hủy', style: 'bg-slate-800 text-slate-500 border-slate-700' },
        };
        const b = badgeMap[p.status] || { label: p.status, style: 'bg-slate-800 text-slate-300' };
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.style}`}>{b.label}</span>;
      }
    },
    {
      key: 'created_at',
      label: 'Thời Gian',
      sortable: true,
      render: (p) => <span className="text-slate-400 text-[11px]">{new Date(p.created_at).toLocaleDateString('vi-VN')}</span>,
      exportValue: (p) => p.created_at
    }
  ];

  // 3. Column Definitions for Refunds Table
  const refundColumns: ColumnDef<RefundRequest>[] = [
    { key: 'request_code', label: 'Mã Lớp', sortable: true },
    { key: 'student_name', label: 'Học Viên', sortable: true },
    {
      key: 'refund_amount_vnd',
      label: 'Số Tiền Hoàn',
      sortable: true,
      render: (rf) => <span className="font-mono font-bold text-rose-400">{(rf.refund_amount_vnd || 0).toLocaleString('vi-VN')} đ</span>,
      exportValue: (rf) => rf.refund_amount_vnd
    },
    {
      key: 'reason',
      label: 'Lý Do Hoàn',
      render: (rf) => <span className="truncate max-w-xs block text-slate-300">{rf.reason}</span>
    },
    {
      key: 'student_bank_account',
      label: 'Ngân Hàng Nhận',
      render: (rf) => (
        <span className="text-slate-300 text-[11px]">
          {rf.student_bank_account?.bank_name ? `${rf.student_bank_account.bank_name} (${rf.student_bank_account.account_number})` : 'Chưa nhập'}
        </span>
      ),
      exportValue: (rf) => rf.student_bank_account?.bank_name ? `${rf.student_bank_account.bank_name} - ${rf.student_bank_account.account_number}` : 'N/A'
    },
    {
      key: 'bank_refund_reference',
      label: 'Mã GD Hoàn Tiền',
      render: (rf) => <span className="font-mono text-emerald-400 text-[11px]">{rf.bank_refund_reference || '-'}</span>
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      sortable: true,
      render: (rf) => {
        const badgeMap: Record<string, { label: string; style: string }> = {
          requested: { label: 'Mới yêu cầu', style: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
          under_review: { label: 'Đang xem xét', style: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
          approved: { label: 'Đã duyệt', style: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
          processing: { label: 'Đang chuyển tiền', style: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
          refunded: { label: 'Đã hoàn tiền', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
          rejected: { label: 'Từ chối hoàn', style: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
        };
        const b = badgeMap[rf.status] || { label: rf.status, style: 'bg-slate-800 text-slate-300' };
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${b.style}`}>{b.label}</span>;
      }
    }
  ];

  // 4. Column Definitions for Users Table
  const userColumns: ColumnDef<Profile>[] = [
    { key: 'email', label: 'Email Tài Khoản', sortable: true },
    { key: 'full_name', label: 'Họ và Tên', sortable: true },
    { key: 'student_code', label: 'Mã SV', sortable: true, render: (u) => <span className="font-mono text-slate-300">{u.student_code || '-'}</span> },
    {
      key: 'role',
      label: 'Vai Trò',
      sortable: true,
      render: (u) => {
        const roleLabels: Record<string, { label: string; color: string }> = {
          student: { label: 'Học viên', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
          tutor: { label: 'Người dạy', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
          manager: { label: 'Quản lý', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
          admin: { label: 'Admin', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
        };
        const r = roleLabels[u.role] || { label: u.role, color: 'bg-slate-800 text-slate-400' };
        return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${r.color}`}>{r.label}</span>;
      }
    },
    {
      key: 'created_at',
      label: 'Ngày Tham Gia',
      sortable: true,
      render: (u) => <span className="text-slate-400 text-[11px]">{new Date(u.created_at).toLocaleDateString('vi-VN')}</span>,
      exportValue: (u) => u.created_at
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls: Date Range Picker */}
      <DateRangePicker value={filter} onChange={setFilter} />

      {/* 12 Standard KPI Cards Grid */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Chỉ Số Hiệu Suất Cốt Lõi (12 KPI Cards)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kpiCards.map(metric => (
            <KPICard key={metric.id} metric={metric} />
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Time-series trend chart (2 cols on desktop) */}
        <div className="lg:col-span-2">
          <TimeSeriesChart data={timeSeries} />
        </div>

        {/* Donut distributions (1 col on desktop) */}
        <div className="space-y-6">
          <StatusDonutChart
            items={requestDistribution}
            title="Phân Bổ Trạng Thái Yêu Cầu Học"
            totalLabel="Tổng lớp"
          />
          <StatusDonutChart
            items={userDistribution}
            title="Cơ Cấu Tài Khoản Người Dùng"
            totalLabel="Thành viên"
          />
        </div>
      </div>

      {/* Transparent Financial Model & Pricing Callout */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-emerald-900/40 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <DollarSign className="w-5 h-5" />
            <span>Chính Sách Tài Chính & Phí Nền Tảng Minh Bạch EduMate Huế</span>
          </div>
          <span className="text-xs font-medium text-slate-400">Áp dụng tài khoản VietinBank: 107879627729</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="font-bold text-white flex justify-between">
              <span>Gói Học Thử (3 buổi)</span>
              <span className="text-emerald-400">90.000 đ</span>
            </div>
            <p className="text-slate-400 text-[11px]">30.000 đ/buổi</p>
            <div className="pt-2 text-[11px] text-slate-300 space-y-0.5 border-t border-slate-800/60">
              <div className="flex justify-between"><span>Gia sư nhận (85%):</span><span className="text-blue-400 font-mono font-bold">76.500 đ</span></div>
              <div className="flex justify-between"><span>Phí nền tảng (15%):</span><span className="text-teal-400 font-mono font-bold">13.500 đ</span></div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/30 space-y-1 relative">
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500 text-slate-950">PHỔ BIẾN</div>
            <div className="font-bold text-white flex justify-between pr-14">
              <span>Gói Cấp Tốc (15 buổi)</span>
              <span className="text-emerald-400">450.000 đ</span>
            </div>
            <p className="text-slate-400 text-[11px]">30.000 đ/buổi - Ôn thi học kỳ</p>
            <div className="pt-2 text-[11px] text-slate-300 space-y-0.5 border-t border-slate-800/60">
              <div className="flex justify-between"><span>Gia sư nhận (85%):</span><span className="text-blue-400 font-mono font-bold">382.500 đ</span></div>
              <div className="flex justify-between"><span>Phí nền tảng (15%):</span><span className="text-teal-400 font-mono font-bold">67.500 đ</span></div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <div className="font-bold text-white flex justify-between">
              <span>Gói Dài Hạn (12 buổi)</span>
              <span className="text-emerald-400">360.000 đ</span>
            </div>
            <p className="text-slate-400 text-[11px]">30.000 đ/buổi - Suốt học kỳ</p>
            <div className="pt-2 text-[11px] text-slate-300 space-y-0.5 border-t border-slate-800/60">
              <div className="flex justify-between"><span>Gia sư nhận (85%):</span><span className="text-blue-400 font-mono font-bold">306.000 đ</span></div>
              <div className="flex justify-between"><span>Phí nền tảng (15%):</span><span className="text-teal-400 font-mono font-bold">54.000 đ</span></div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Quy định hoàn tiền 100%: Khi gia sư từ chối lớp học sau khi học viên đã thanh toán, học viên được hoàn trả 100% tiền học phí (không khấu trừ 15% phí nền tảng).</span>
        </div>
      </div>

      {/* Detailed Report Tables Section */}
      <div className="space-y-4">
        {/* Table Selector Subtabs */}
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setDetailTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              detailTab === 'requests'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Báo Cáo Yêu Cầu Học ({allRequests.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setDetailTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              detailTab === 'payments'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Báo Cáo Giao Dịch VietQR ({allPayments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setDetailTab('refunds')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              detailTab === 'refunds'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Báo Cáo Hoàn Tiền ({allRefunds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setDetailTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              detailTab === 'users'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Báo Cáo Người Dùng ({allUsers.length})</span>
          </button>
        </div>

        {/* Dynamic Table Rendering */}
        {detailTab === 'requests' && (
          <ReportTable
            title="Danh Sách Chi Tiết Yêu Cầu Học Vụ & Kết Nối Lớp"
            description="Tìm kiếm theo mã lớp, học viên, gia sư, môn học; sắp xếp theo ngày hoặc học phí; xuất file CSV an toàn."
            columns={requestColumns}
            data={allRequests}
            exportFilename="edumate_bao_cao_yeu_cau_hoc"
            searchPlaceholder="Tìm theo mã lớp, tên học viên, gia sư, môn học..."
            searchFilter={(r, q) =>
              r.request_code.toLowerCase().includes(q) ||
              r.student_name.toLowerCase().includes(q) ||
              r.tutor_name.toLowerCase().includes(q) ||
              r.subject_name.toLowerCase().includes(q)
            }
            categoryFilter={{
              label: 'Trạng thái',
              options: [
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'pending', label: 'Chờ xác nhận' },
                { value: 'accepted', label: 'Đã chấp nhận' },
                { value: 'completed', label: 'Đã hoàn thành' },
                { value: 'rejected', label: 'Gia sư từ chối' },
                { value: 'cancelled', label: 'Đã hủy' }
              ],
              filterFn: (r, cat) => r.status === cat
            }}
          />
        )}

        {detailTab === 'payments' && (
          <ReportTable
            title="Danh Sách Chi Tiết Giao Dịch Chuyển Khoản VietQR"
            description="Lịch sử đối soát VietinBank 107879627729; phân tách rõ ràng 15% doanh thu nền tảng và 85% khoản phải trả gia sư."
            columns={paymentColumns}
            data={allPayments}
            exportFilename="edumate_bao_cao_giao_dich_vietqr"
            searchPlaceholder="Tìm theo mã GD, tên người chuyển, gia sư, gói học..."
            searchFilter={(p, q) =>
              p.request_code.toLowerCase().includes(q) ||
              p.student_name.toLowerCase().includes(q) ||
              p.tutor_name.toLowerCase().includes(q) ||
              p.package_name.toLowerCase().includes(q)
            }
            categoryFilter={{
              label: 'Trạng thái thanh toán',
              options: [
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'awaiting_verification', label: 'Chờ đối soát' },
                { value: 'paid', label: 'Đã xác nhận thanh toán' },
                { value: 'pending', label: 'Chờ quét QR' },
                { value: 'refund_pending', label: 'Chờ hoàn tiền' },
                { value: 'refunded', label: 'Đã hoàn tiền' },
                { value: 'needs_review', label: 'Cần tra soát' }
              ],
              filterFn: (p, cat) => p.status === cat
            }}
          />
        )}

        {detailTab === 'refunds' && (
          <ReportTable
            title="Danh Sách Chi Tiết Yêu Cầu Hoàn Tiền 100%"
            description="Quản lý phê duyệt và lệnh chuyển tiền hoàn trả khi gia sư từ chối lớp; bắt buộc lưu vết mã ngân hàng khi hoàn tất."
            columns={refundColumns}
            data={allRefunds}
            exportFilename="edumate_bao_cao_hoan_tien"
            searchPlaceholder="Tìm theo mã lớp, tên học viên, lý do..."
            searchFilter={(rf, q) =>
              rf.request_code.toLowerCase().includes(q) ||
              rf.student_name.toLowerCase().includes(q) ||
              rf.reason.toLowerCase().includes(q)
            }
            categoryFilter={{
              label: 'Trạng thái hoàn',
              options: [
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'requested', label: 'Mới yêu cầu' },
                { value: 'under_review', label: 'Đang xem xét' },
                { value: 'approved', label: 'Đã duyệt' },
                { value: 'refunded', label: 'Đã chuyển tiền hoàn' },
                { value: 'rejected', label: 'Bị từ chối' }
              ],
              filterFn: (rf, cat) => rf.status === cat
            }}
          />
        )}

        {detailTab === 'users' && (
          <ReportTable
            title="Danh Sách Chi Tiết Tài Khoản Thành Viên EduMate Huế"
            description="Phân định rõ vai trò Học viên (student), Người dạy (tutor) và Quản trị viên (manager); kiểm soát an toàn bảo mật."
            columns={userColumns}
            data={allUsers}
            exportFilename="edumate_bao_cao_nguoi_dung"
            searchPlaceholder="Tìm theo email, họ tên, mã sinh viên..."
            searchFilter={(u, q) =>
              u.email.toLowerCase().includes(q) ||
              u.full_name.toLowerCase().includes(q) ||
              Boolean(u.student_code && u.student_code.toLowerCase().includes(q))
            }
            categoryFilter={{
              label: 'Phân loại vai trò',
              options: [
                { value: 'all', label: 'Tất cả vai trò' },
                { value: 'student', label: 'Học viên (student)' },
                { value: 'tutor', label: 'Gia sư khóa trước (tutor)' },
                { value: 'manager', label: 'Quản lý giáo vụ (manager)' }
              ],
              filterFn: (u, cat) => u.role === cat
            }}
          />
        )}
      </div>
    </div>
  );
};
