/**
 * EDUMATE HUẾ — DỊCH VỤ THỐNG KÊ & BÁO CÁO TOÀN DIỆN (REPORTING SERVICE)
 * Tách biệt hoàn toàn tầng logic tính toán, tổng hợp chỉ số KPI, lọc theo thời gian và xuất báo cáo CSV an toàn.
 */

import type {
  DateRangeFilter,
  PlatformReportingMetrics,
  TimeSeriesDataPoint,
  StatusDistributionItem,
  KPICardMetric
} from '../types/reporting';
import { dataService } from './dataService';
import type { Profile, LearningRequest, PaymentIntent, RefundRequest } from '../types';

export class ReportingService {
  /**
   * Tính toán khoảng thời gian giới hạn (Start & End Date) dựa trên bộ lọc
   */
  public getDateBounds(filter: DateRangeFilter): { start: Date; end: Date } {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    let start: Date;

    switch (filter.preset) {
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        break;
      case 'last7days':
        start = new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000);
        start.setHours(0, 0, 0, 0);
        break;
      case 'last30days':
        start = new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
        start.setHours(0, 0, 0, 0);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        break;
      case 'custom':
        if (filter.startDate) {
          start = new Date(filter.startDate);
          start.setHours(0, 0, 0, 0);
        } else {
          start = new Date(0);
        }
        if (filter.endDate) {
          const customEnd = new Date(filter.endDate);
          customEnd.setHours(23, 59, 59, 999);
          return { start, end: customEnd };
        }
        break;
      case 'all':
      default:
        start = new Date(0);
        break;
    }

    return { start, end };
  }

  /**
   * Kiểm tra một mốc thời gian ISO có nằm trong khoảng lọc hay không
   */
  private isWithinBounds(isoDateStr: string | undefined | null, bounds: { start: Date; end: Date }): boolean {
    if (!isoDateStr) return false;
    const d = new Date(isoDateStr);
    if (isNaN(d.getTime())) return false;
    return d >= bounds.start && d <= bounds.end;
  }

  /**
   * Lấy toàn bộ chỉ số KPI tổng quan với độ chính xác cao
   */
  public getMetrics(filter: DateRangeFilter): PlatformReportingMetrics {
    const bounds = this.getDateBounds(filter);

    const allProfiles: Profile[] = dataService.getUsers();
    const allRequests: LearningRequest[] = dataService.getLearningRequests();
    const allIntents: PaymentIntent[] = dataService.getPaymentIntents();
    const allRefunds: RefundRequest[] = dataService.getRefundRequests();

    // 1. Phân loại người dùng
    const filteredProfiles = filter.preset === 'all'
      ? allProfiles
      : allProfiles.filter(p => this.isWithinBounds(p.created_at, bounds));

    const totalUsers = filteredProfiles.length;
    const totalStudents = filteredProfiles.filter(p => p.role === 'student').length;
    const totalTutors = filteredProfiles.filter(p => p.role === 'tutor').length;
    const totalManagers = filteredProfiles.filter(p => p.role === 'manager' || p.role === 'admin').length;

    // 2. Yêu cầu học vụ
    const filteredRequests = filter.preset === 'all'
      ? allRequests
      : allRequests.filter(r => this.isWithinBounds(r.created_at, bounds));

    const totalLearningRequests = filteredRequests.length;
    const pendingRequests = filteredRequests.filter(r => r.status === 'pending').length;
    const acceptedRequests = filteredRequests.filter(r => r.status === 'accepted').length;
    const completedRequests = filteredRequests.filter(r => r.status === 'completed').length;
    const rejectedRequests = filteredRequests.filter(r => r.status === 'rejected').length;
    const cancelledRequests = filteredRequests.filter(r => r.status === 'cancelled').length;

    const completedOrAccepted = acceptedRequests + completedRequests;
    const requestConversionRate = totalLearningRequests > 0
      ? Math.round((completedOrAccepted / totalLearningRequests) * 100)
      : 0;

    // Tổng nhu cầu ban đầu (Demand GMV)
    const totalDemandGMV = filteredRequests.reduce((sum, r) => sum + (r.total_price || 0), 0);

    // 3. Giao dịch thanh toán VietQR
    const filteredIntents = filter.preset === 'all'
      ? allIntents
      : allIntents.filter(i => {
          const dateToTest = i.paid_at || i.created_at;
          return this.isWithinBounds(dateToTest, bounds);
        });

    // Chỉ tính giao dịch đã xác nhận (status: 'paid')
    const paidIntents = filteredIntents.filter(i => i.status === 'paid');
    const confirmedGMV = paidIntents.reduce((sum, i) => sum + (i.amount_vnd || 0), 0);

    // Giao dịch đang chờ đối soát (status: 'awaiting_verification')
    const awaitingIntents = filteredIntents.filter(i => i.status === 'awaiting_verification');
    const awaitingVerificationCount = awaitingIntents.length;
    const awaitingVerificationVolume = awaitingIntents.reduce((sum, i) => sum + (i.amount_vnd || 0), 0);

    // 4. Hoàn tiền (Refunds)
    const filteredRefunds = filter.preset === 'all'
      ? allRefunds
      : allRefunds.filter(ref => {
          const dateToTest = ref.refunded_at || ref.requested_at;
          return this.isWithinBounds(dateToTest, bounds);
        });

    const completedRefunds = filteredRefunds.filter(ref => ref.status === 'refunded');
    const totalRefundedAmount = completedRefunds.reduce((sum, ref) => sum + (ref.refund_amount_vnd || 0), 0);

    const pendingRefunds = filteredRefunds.filter(ref => ref.status === 'requested' || ref.status === 'under_review');
    const pendingRefundCount = pendingRefunds.length;
    const pendingRefundVolume = pendingRefunds.reduce((sum, ref) => sum + (ref.refund_amount_vnd || 0), 0);

    // Doanh thu thực nhận sau hoàn tiền: 15% của GMV ròng
    // Khoản phải trả gia sư sau hoàn tiền: 85% của GMV ròng
    const netRealizedGMV = Math.max(0, confirmedGMV - totalRefundedAmount);
    const netPlatformRevenue = Math.round(netRealizedGMV * 0.15);
    const tutorEarningsPayable = Math.round(netRealizedGMV * 0.85);

    return {
      totalUsers,
      totalStudents,
      totalTutors,
      totalManagers,
      totalLearningRequests,
      pendingRequests,
      acceptedRequests,
      completedRequests,
      rejectedRequests,
      cancelledRequests,
      requestConversionRate,
      totalDemandGMV,
      confirmedGMV,
      totalRefundedAmount,
      netPlatformRevenue,
      tutorEarningsPayable,
      awaitingVerificationCount,
      awaitingVerificationVolume,
      pendingRefundCount,
      pendingRefundVolume
    };
  }

  /**
   * Định dạng danh sách 12 thẻ KPI Cards tiêu chuẩn kèm công thức nghiệp vụ
   */
  public getKPICards(metrics: PlatformReportingMetrics): KPICardMetric[] {
    return [
      {
        id: 'kpi-users-total',
        title: 'Tổng Người Dùng',
        value: metrics.totalUsers,
        unit: 'tài khoản',
        subtitle: `Học viên: ${metrics.totalStudents} | Gia sư: ${metrics.totalTutors}`,
        category: 'users',
        formulaExplanation: 'Tổng số tài khoản đã đăng ký trên hệ thống trong khoảng thời gian lọc.',
        iconName: 'Users',
        statusBadge: 'Tài khoản hoạt động',
        badgeColor: 'blue'
      },
      {
        id: 'kpi-students',
        title: 'Tổng Học Viên',
        value: metrics.totalStudents,
        unit: 'người',
        subtitle: 'Sinh viên các trường ĐH Huế',
        category: 'users',
        formulaExplanation: 'Số tài khoản có vai trò "student" được quản lý qua Supabase Auth.',
        iconName: 'GraduationCap',
        badgeColor: 'blue'
      },
      {
        id: 'kpi-tutors',
        title: 'Tổng Gia Sư Khóa Trước',
        value: metrics.totalTutors,
        unit: 'người',
        subtitle: 'Sinh viên giỏi & xuất sắc',
        category: 'users',
        formulaExplanation: 'Số tài khoản có vai trò "tutor" đã tham gia nền tảng EduMate.',
        iconName: 'Award',
        badgeColor: 'emerald'
      },
      {
        id: 'kpi-requests-total',
        title: 'Tổng Yêu Cầu Học',
        value: metrics.totalLearningRequests,
        unit: 'hồ sơ',
        subtitle: `Tỷ lệ chốt lớp: ${metrics.requestConversionRate}%`,
        category: 'requests',
        formulaExplanation: 'Tổng số yêu cầu kết nối học tập giữa học viên và gia sư được khởi tạo.',
        iconName: 'BookOpen',
        badgeColor: 'blue'
      },
      {
        id: 'kpi-requests-pending',
        title: 'Yêu Cầu Chờ Gia Sư Nhận',
        value: metrics.pendingRequests,
        unit: 'lớp',
        subtitle: 'Cần gia sư phản hồi',
        category: 'requests',
        formulaExplanation: 'Các yêu cầu học vụ đang ở trạng thái "pending", chờ gia sư xác nhận.',
        iconName: 'Clock',
        badgeColor: 'amber'
      },
      {
        id: 'kpi-requests-accepted',
        title: 'Yêu Cầu Đã Chấp Nhận',
        value: metrics.acceptedRequests + metrics.completedRequests,
        unit: 'lớp',
        subtitle: `Hoàn thành: ${metrics.completedRequests} lớp`,
        category: 'requests',
        formulaExplanation: 'Số lớp học gia sư đã đồng ý hướng dẫn (trạng thái "accepted" hoặc "completed").',
        iconName: 'CheckCircle2',
        badgeColor: 'emerald'
      },
      {
        id: 'kpi-requests-rejected',
        title: 'Yêu Cầu Từ Chối / Hủy',
        value: metrics.rejectedRequests + metrics.cancelledRequests,
        unit: 'lớp',
        subtitle: `Từ chối: ${metrics.rejectedRequests} | Hủy: ${metrics.cancelledRequests}`,
        category: 'requests',
        formulaExplanation: 'Các yêu cầu bị gia sư từ chối hoặc do học viên chủ động hủy trước khi thanh toán.',
        iconName: 'XCircle',
        badgeColor: 'rose'
      },
      {
        id: 'kpi-gmv-confirmed',
        title: 'Giao Dịch Đã Xác Nhận (GMV)',
        value: metrics.confirmedGMV.toLocaleString('vi-VN'),
        unit: 'đ',
        subtitle: 'Đã đối soát vào tài khoản VietinBank',
        category: 'financial',
        formulaExplanation: 'Tổng số tiền từ các giao dịch VietQR đã được Quản lý đối soát và chuyển trạng thái "paid".',
        iconName: 'Banknote',
        statusBadge: 'Đã thực thu',
        badgeColor: 'emerald'
      },
      {
        id: 'kpi-net-revenue',
        title: 'Doanh Thu Nền Tảng (15%)',
        value: metrics.netPlatformRevenue.toLocaleString('vi-VN'),
        unit: 'đ',
        subtitle: '15% phí dịch vụ EduMate thực nhận',
        category: 'financial',
        formulaExplanation: 'Công thức: (Tổng tiền đã thanh toán - Tiền hoàn trả thực tế) × 15%.',
        iconName: 'TrendingUp',
        statusBadge: 'Lợi nhuận gộp',
        badgeColor: 'emerald'
      },
      {
        id: 'kpi-tutor-payable',
        title: 'Khoản Phải Trả Gia Sư (85%)',
        value: metrics.tutorEarningsPayable.toLocaleString('vi-VN'),
        unit: 'đ',
        subtitle: 'Nghĩa vụ chi trả sau buổi học',
        category: 'financial',
        formulaExplanation: 'Công thức: (Tổng tiền đã thanh toán - Tiền hoàn trả thực tế) × 85%. Đây là khoản phải trả, chưa chi trả thực tế.',
        iconName: 'Wallet',
        statusBadge: 'Nợ phải trả gia sư',
        badgeColor: 'blue'
      },
      {
        id: 'kpi-refunds-total',
        title: 'Tổng Tiền Đã Hoàn Trả 100%',
        value: metrics.totalRefundedAmount.toLocaleString('vi-VN'),
        unit: 'đ',
        subtitle: 'Hoàn trả khi gia sư từ chối sau thanh toán',
        category: 'financial',
        formulaExplanation: 'Tổng số tiền đã chuyển khoản hoàn trả thành công (trạng thái "refunded") kèm mã giao dịch ngân hàng.',
        iconName: 'RotateCcw',
        badgeColor: 'rose'
      },
      {
        id: 'kpi-awaiting-verification',
        title: 'Giao Dịch Chờ Đối Soát',
        value: metrics.awaitingVerificationCount,
        unit: 'giao dịch',
        subtitle: `Tương đương: ${metrics.awaitingVerificationVolume.toLocaleString('vi-VN')} đ`,
        category: 'reconciliation',
        formulaExplanation: 'Học viên đã xác nhận chuyển khoản VietQR, đang chờ Quản lý kiểm tra sao kê ngân hàng.',
        iconName: 'QrCode',
        statusBadge: metrics.awaitingVerificationCount > 0 ? 'Cần xử lý' : 'Đã đối soát hết',
        badgeColor: metrics.awaitingVerificationCount > 0 ? 'amber' : 'slate'
      }
    ];
  }

  /**
   * Tạo chuỗi dữ liệu biểu đồ theo thời gian (Time-series)
   */
  public getTimeSeries(filter: DateRangeFilter): TimeSeriesDataPoint[] {
    const bounds = this.getDateBounds(filter);
    const allRequests = dataService.getLearningRequests();
    const allIntents = dataService.getPaymentIntents();

    // Xác định số ngày cần chia bucket (tối đa 30 điểm hiển thị)
    const diffTime = Math.abs(bounds.end.getTime() - bounds.start.getTime());
    const diffDays = Math.min(30, Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));

    const points: TimeSeriesDataPoint[] = [];

    for (let i = diffDays - 1; i >= 0; i--) {
      const bucketDate = new Date(bounds.end.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = bucketDate.toISOString().split('T')[0];
      const label = `${bucketDate.getDate()}/${bucketDate.getMonth() + 1}`;

      const dayStart = new Date(bucketDate.getFullYear(), bucketDate.getMonth(), bucketDate.getDate(), 0, 0, 0, 0);
      const dayEnd = new Date(bucketDate.getFullYear(), bucketDate.getMonth(), bucketDate.getDate(), 23, 59, 59, 999);

      // Yêu cầu phát sinh trong ngày
      const dayRequests = allRequests.filter(r => {
        const d = new Date(r.created_at);
        return d >= dayStart && d <= dayEnd;
      });

      // Giao dịch thanh toán trong ngày
      const dayPaidIntents = allIntents.filter(i => {
        if (i.status !== 'paid') return false;
        const d = new Date(i.paid_at || i.created_at);
        return d >= dayStart && d <= dayEnd;
      });

      const dayGMV = dayPaidIntents.reduce((sum, i) => sum + (i.amount_vnd || 0), 0);
      const dayNetRevenue = Math.round(dayGMV * 0.15);

      points.push({
        date: dateStr,
        label,
        requestsCount: dayRequests.length,
        confirmedGMV: dayGMV,
        netRevenue: dayNetRevenue
      });
    }

    return points;
  }

  /**
   * Biểu đồ phân bổ trạng thái yêu cầu học vụ
   */
  public getRequestStatusDistribution(filter: DateRangeFilter): StatusDistributionItem[] {
    const metrics = this.getMetrics(filter);
    const total = metrics.totalLearningRequests || 1;

    return [
      {
        status: 'pending',
        label: 'Chờ xác nhận',
        count: metrics.pendingRequests,
        percent: Math.round((metrics.pendingRequests / total) * 100),
        color: '#f59e0b' // Amber
      },
      {
        status: 'accepted',
        label: 'Đã chấp nhận',
        count: metrics.acceptedRequests,
        percent: Math.round((metrics.acceptedRequests / total) * 100),
        color: '#3b82f6' // Blue
      },
      {
        status: 'completed',
        label: 'Hoàn thành',
        count: metrics.completedRequests,
        percent: Math.round((metrics.completedRequests / total) * 100),
        color: '#10b981' // Emerald
      },
      {
        status: 'rejected',
        label: 'Gia sư từ chối',
        count: metrics.rejectedRequests,
        percent: Math.round((metrics.rejectedRequests / total) * 100),
        color: '#f43f5e' // Rose
      },
      {
        status: 'cancelled',
        label: 'Đã hủy',
        count: metrics.cancelledRequests,
        percent: Math.round((metrics.cancelledRequests / total) * 100),
        color: '#64748b' // Slate
      }
    ];
  }

  /**
   * Biểu đồ phân bổ cơ cấu người dùng
   */
  public getUserRoleDistribution(): StatusDistributionItem[] {
    const users = dataService.getUsers();
    const total = users.length || 1;

    const students = users.filter(u => u.role === 'student').length;
    const tutors = users.filter(u => u.role === 'tutor').length;
    const managers = users.filter(u => u.role === 'manager' || u.role === 'admin').length;

    return [
      {
        status: 'student',
        label: 'Học viên (Student)',
        count: students,
        percent: Math.round((students / total) * 100),
        color: '#38bdf8' // Sky blue
      },
      {
        status: 'tutor',
        label: 'Gia sư (Tutor)',
        count: tutors,
        percent: Math.round((tutors / total) * 100),
        color: '#34d399' // Emerald
      },
      {
        status: 'manager',
        label: 'Quản lý Giáo vụ',
        count: managers,
        percent: Math.round((managers / total) * 100),
        color: '#a78bfa' // Purple
      }
    ];
  }

  /**
   * Xử lý chuỗi dữ liệu chống lỗ hổng CSV Formula Injection (CWE-1236)
   * Các ký tự bắt đầu bằng =, +, -, @, Tab (\t), Carriage Return (\r)
   * sẽ bị chèn thêm dấu nháy đơn ' ở đầu để các phần mềm bảng tính (Excel/Sheets) không thực thi mã.
   */
  public sanitizeForCSV(val: any): string {
    if (val === null || val === undefined) return '';
    let str = String(val);
    // Formula injection mitigation (CWE-1236):
    // Check both raw string and trimmed string for dangerous formula triggers (=, +, -, @, \t, \r)
    if (/^[=+\-@\t\r]/.test(str) || /^[=+\-@\t\r]/.test(str.trim())) {
      str = "'" + str;
    }
    // Escape double quotes inside cell
    return `"${str.replace(/"/g, '""')}"`;
  }

  /**
   * Xuất báo cáo ra định dạng CSV chuẩn UTF-8 kèm BOM
   */
  public generateCSVBlob(headers: { key: string; label: string }[], data: any[]): Blob {
    const headerRow = headers.map(h => this.sanitizeForCSV(h.label)).join(',');
    const dataRows = data.map(item => {
      return headers.map(h => this.sanitizeForCSV(item[h.key])).join(',');
    });

    const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * Tải tệp CSV an toàn về trình duyệt
   */
  public downloadCSV(filename: string, headers: { key: string; label: string }[], data: any[]): void {
    const blob = this.generateCSVBlob(headers, data);
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const reportingService = new ReportingService();
