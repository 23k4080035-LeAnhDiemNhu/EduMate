import React from 'react';
import type { RequestStatus, OrderStatus, PaymentStatus, AcademicStatus } from '../../types';
import { CheckCircle2, Clock, XCircle, Send, FileEdit, Ban } from 'lucide-react';

interface RequestBadgeProps {
  status: RequestStatus;
}

export const RequestBadge: React.FC<RequestBadgeProps> = ({ status }) => {
  switch (status) {
    case 'approved':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Đã phê duyệt</span>
        </span>
      );
    case 'in_review':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock className="w-3.5 h-3.5" />
          <span>Đang thẩm định</span>
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3.5 h-3.5" />
          <span>Đã từ chối</span>
        </span>
      );
    case 'submitted':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Send className="w-3.5 h-3.5" />
          <span>Chờ xử lý</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          <Ban className="w-3.5 h-3.5" />
          <span>Đã hủy</span>
        </span>
      );
    case 'draft':
    default:
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/30">
          <FileEdit className="w-3.5 h-3.5" />
          <span>Bản nháp (Draft)</span>
        </span>
      );
  }
};

interface PaymentBadgeProps {
  status: PaymentStatus;
}

export const PaymentBadge: React.FC<PaymentBadgeProps> = ({ status }) => {
  switch (status) {
    case 'successful':
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" />
          <span>Thành công</span>
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle className="w-3 h-3" />
          <span>Từ chối</span>
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock className="w-3 h-3" />
          <span>Chờ đối soát</span>
        </span>
      );
  }
};

interface OrderBadgeProps {
  status: OrderStatus;
}

export const OrderBadge: React.FC<OrderBadgeProps> = ({ status }) => {
  switch (status) {
    case 'paid':
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" />
          <span>ĐÃ THANH TOÁN</span>
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
          <span>ĐÃ HỦY</span>
        </span>
      );
    case 'pending':
    default:
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <span>CHƯA THANH TOÁN</span>
        </span>
      );
  }
};

interface AcademicBadgeProps {
  status: AcademicStatus;
}

export const AcademicBadge: React.FC<AcademicBadgeProps> = ({ status }) => {
  return status === 'published' ? (
    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      Đã công khai
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
      Bản nháp
    </span>
  );
};
