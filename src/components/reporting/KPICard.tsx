import React, { useState } from 'react';
import type { KPICardMetric } from '../../types/reporting';
import { 
  Users, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Banknote, 
  TrendingUp, 
  Wallet, 
  RotateCcw, 
  QrCode,
  Info
} from 'lucide-react';

interface KPICardProps {
  metric: KPICardMetric;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  GraduationCap,
  Award,
  BookOpen,
  Clock,
  CheckCircle2,
  XCircle,
  Banknote,
  TrendingUp,
  Wallet,
  RotateCcw,
  QrCode
};

export const KPICard: React.FC<KPICardProps> = ({ metric }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const IconComponent = ICON_MAP[metric.iconName] || BookOpen;

  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'amber':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'rose':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'blue':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getIconBgStyle = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30';
      case 'amber':
        return 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30';
      case 'rose':
        return 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30';
      case 'blue':
        return 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/30';
      default:
        return 'bg-slate-800 text-slate-300 ring-1 ring-slate-700';
    }
  };

  return (
    <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md">
      {/* Header: Title, Icon & Info Button */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl ${getIconBgStyle(metric.badgeColor)}`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {metric.title}
            </h3>
            {metric.statusBadge && (
              <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(metric.badgeColor)}`}>
                {metric.statusBadge}
              </span>
            )}
          </div>
        </div>

        {/* Info hover tooltip */}
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            aria-label={`Chi tiết công thức tính ${metric.title}`}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800/60"
          >
            <Info className="w-4 h-4" />
          </button>

          {showTooltip && (
            <div className="absolute right-0 top-6 z-30 w-64 p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs shadow-xl space-y-1 animate-fadeIn">
              <div className="font-bold text-slate-100 flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span>Nguồn & Công thức tính</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {metric.formulaExplanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Value */}
      <div className="my-3">
        <div className="flex items-baseline space-x-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {metric.value}
          </span>
          {metric.unit && (
            <span className="text-xs font-medium text-slate-400">
              {metric.unit}
            </span>
          )}
        </div>
      </div>

      {/* Subtitle / Context */}
      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <span className="truncate">{metric.subtitle}</span>
      </div>
    </div>
  );
};

