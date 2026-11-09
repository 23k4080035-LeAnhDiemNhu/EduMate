/**
 * EDUMATE HUẾ — KIỂU DỮ LIỆU BÁO CÁO & THỐNG KÊ (REPORTING & ANALYTICS)
 * Chuẩn hóa phục vụ phân tích dữ liệu quản trị giáo vụ & tài chính VietQR.
 */

export type DateRangePreset = 'today' | 'last7days' | 'last30days' | 'thisMonth' | 'all' | 'custom';

export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate?: string; // ISO String (YYYY-MM-DD)
  endDate?: string;   // ISO String (YYYY-MM-DD)
}

export interface KPICardMetric {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  subtitle: string;
  changePercent?: number;
  trend?: 'up' | 'down' | 'neutral';
  category: 'users' | 'requests' | 'financial' | 'reconciliation';
  formulaExplanation: string;
  iconName: string;
  statusBadge?: string;
  badgeColor?: 'emerald' | 'blue' | 'amber' | 'rose' | 'slate';
}

export interface PlatformReportingMetrics {
  // 1. Nhóm Người dùng (Users)
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalManagers: number;

  // 2. Nhóm Yêu cầu học vụ & Kết nối (Requests)
  totalLearningRequests: number;
  pendingRequests: number;
  acceptedRequests: number;
  completedRequests: number;
  rejectedRequests: number;
  cancelledRequests: number;
  requestConversionRate: number; // Tỷ lệ hoàn thành %

  // 3. Nhóm Tài chính & Doanh thu (Financials)
  totalDemandGMV: number;          // Tổng giá trị yêu cầu phát sinh (VNĐ)
  confirmedGMV: number;            // Tổng giá trị đã thanh toán thành công (VNĐ)
  totalRefundedAmount: number;     // Tổng tiền đã hoàn trả thực tế (VNĐ)
  netPlatformRevenue: number;      // Doanh thu nền tảng thực nhận (15% sau hoàn tiền)
  tutorEarningsPayable: number;    // Khoản phải trả gia sư (85% sau hoàn tiền)
  
  // 4. Nhóm Đối soát & Rủi ro (Reconciliation & Risk)
  awaitingVerificationCount: number;  // Số giao dịch người học đã báo chuyển khoản
  awaitingVerificationVolume: number; // Tổng tiền chờ đối soát (VNĐ)
  pendingRefundCount: number;         // Số yêu cầu hoàn tiền đang chờ phê duyệt
  pendingRefundVolume: number;        // Tổng tiền hoàn đang chờ duyệt (VNĐ)
}

export interface TimeSeriesDataPoint {
  date: string;       // YYYY-MM-DD
  label: string;      // DD/MM
  requestsCount: number;
  confirmedGMV: number;
  netRevenue: number;
}

export interface StatusDistributionItem {
  status: string;
  label: string;
  count: number;
  percent: number;
  color: string;
}

export interface ExportableReportRow {
  [key: string]: string | number | boolean | null | undefined;
}

