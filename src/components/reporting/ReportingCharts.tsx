import React, { useState, useMemo } from 'react';
import type { TimeSeriesDataPoint, StatusDistributionItem } from '../../types/reporting';
import { TrendingUp, PieChart as PieChartIcon, AlertCircle } from 'lucide-react';

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  title?: string;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  data,
  title = 'Xu Hướng Yêu Cầu & Doanh Thu Theo Thời Gian'
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesDataPoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-slate-900/80 rounded-2xl p-6 border border-slate-800 text-center py-12">
        <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm text-slate-400">Chưa có dữ liệu giao dịch trong khoảng thời gian này.</p>
      </div>
    );
  }

  // Calculate scales
  const maxRequests = Math.max(1, ...data.map(d => d.requestsCount));
  const maxGMV = Math.max(100000, ...data.map(d => d.confirmedGMV));

  const chartWidth = 600;
  const chartHeight = 220;
  const paddingX = 45;
  const paddingY = 30;

  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  // Coordinate mapper for GMV (Line / Area)
  const getCoordinates = (index: number, gmv: number) => {
    const x = paddingX + (index / Math.max(1, data.length - 1)) * innerWidth;
    const y = chartHeight - paddingY - (gmv / maxGMV) * innerHeight;
    return { x, y };
  };

  // Build SVG Path for GMV line and area
  const points = data.map((d, i) => getCoordinates(i, d.confirmedGMV));
  const linePath = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-sm space-y-4">
      {/* Title & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
        </div>

        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500/30 border border-blue-400" />
            <span>Yêu cầu học (Cột)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 rounded-full bg-emerald-400" />
            <span>GMV Xác nhận (Đường)</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="gmvAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingY + innerHeight * ratio;
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="#1e293b"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Bars: Requests count */}
          {data.map((d, i) => {
            const barWidth = Math.max(6, (innerWidth / data.length) * 0.45);
            const { x } = getCoordinates(i, 0);
            const barHeight = (d.requestsCount / maxRequests) * (innerHeight * 0.85);
            const y = chartHeight - paddingY - barHeight;

            return (
              <rect
                key={i}
                x={x - barWidth / 2}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={2}
                fill="#3b82f6"
                fillOpacity="0.4"
                className="hover:fill-opacity-80 transition-all cursor-pointer"
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Area Fill for GMV */}
          {areaPath && (
            <path d={areaPath} fill="url(#gmvAreaGrad)" />
          )}

          {/* Line for GMV */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points on GMV line */}
          {points.map((pt, i) => {
            const isHovered = hoveredPoint?.date === data[i].date;
            return (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 5.5 : 3.5}
                fill="#0f172a"
                stroke="#10b981"
                strokeWidth={isHovered ? '2.5' : '2'}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredPoint(data[i])}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* X Axis Labels */}
          {data.map((d, i) => {
            // Show every few labels if there are many data points
            const step = Math.ceil(data.length / 8);
            if (i % step !== 0 && i !== data.length - 1) return null;
            const { x } = getCoordinates(i, 0);
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - 10}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-medium"
              >
                {d.label}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-slate-950/95 border border-slate-700 rounded-xl p-3 shadow-xl text-xs space-y-1 animate-fadeIn pointer-events-none">
            <div className="font-bold text-white border-b border-slate-800 pb-1">
              Ngày: {hoveredPoint.label} ({hoveredPoint.date})
            </div>
            <div className="text-blue-400 flex justify-between space-x-4">
              <span>Yêu cầu học:</span>
              <span className="font-bold">{hoveredPoint.requestsCount} lớp</span>
            </div>
            <div className="text-emerald-400 flex justify-between space-x-4">
              <span>GMV đã thu:</span>
              <span className="font-bold">{hoveredPoint.confirmedGMV.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="text-teal-400 flex justify-between space-x-4">
              <span>Phí nền tảng (15%):</span>
              <span className="font-bold">{hoveredPoint.netRevenue.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface StatusDonutChartProps {
  items: StatusDistributionItem[];
  title: string;
  totalLabel?: string;
}

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({
  items,
  title,
  totalLabel = 'Tổng cộng'
}) => {
  const totalCount = items.reduce((sum, item) => sum + item.count, 0);

  // Calculate SVG stroke dashes for circle donut
  const size = 160;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Purely calculate segments and stroke offsets without in-render mutation
  const segments = useMemo(() => {
    return items.map((item, idx) => {
      if (item.count === 0 || totalCount === 0) {
        return { item, idx, strokeDash: 0, offset: 0, visible: false };
      }
      const strokeDash = (item.count / totalCount) * circumference;
      const priorCount = items.slice(0, idx).reduce((sum, prev) => sum + prev.count, 0);
      const priorOffset = (priorCount / totalCount) * circumference;
      return { item, idx, strokeDash, offset: priorOffset, visible: true };
    });
  }, [items, totalCount, circumference]);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
      {/* Title */}
      <div className="flex items-center space-x-2">
        <PieChartIcon className="w-5 h-5 text-blue-400" />
        <h3 className="text-sm font-bold text-white tracking-wide">{title}</h3>
      </div>

      {/* Donut and Legend Layout */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* SVG Donut */}
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#1e293b"
              strokeWidth={strokeWidth}
            />
            {segments.map((seg) => {
              if (!seg.visible) return null;
              return (
                <circle
                  key={seg.idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${seg.strokeDash} ${circumference - seg.strokeDash}`}
                  strokeDashoffset={-seg.offset}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* Centered Total Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="text-2xl font-black text-white">{totalCount}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{totalLabel}</span>
          </div>
        </div>

        {/* Legend list */}
        <div className="space-y-2 w-full max-w-xs text-xs">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-slate-300">
              <div className="flex items-center space-x-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center space-x-2 font-mono font-bold shrink-0">
                <span>{item.count}</span>
                <span className="text-slate-500 text-[11px]">({item.percent}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
