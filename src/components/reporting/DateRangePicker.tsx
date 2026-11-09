import React, { useState } from 'react';
import type { DateRangeFilter, DateRangePreset } from '../../types/reporting';
import { Calendar, Filter, RotateCcw } from 'lucide-react';

interface DateRangePickerProps {
  value: DateRangeFilter;
  onChange: (filter: DateRangeFilter) => void;
}

const PRESET_OPTIONS: { id: DateRangePreset; label: string }[] = [
  { id: 'today', label: 'Hôm nay' },
  { id: 'last7days', label: '7 ngày qua' },
  { id: 'last30days', label: '30 ngày qua' },
  { id: 'thisMonth', label: 'Tháng này' },
  { id: 'all', label: 'Toàn bộ' },
  { id: 'custom', label: 'Tùy chọn ngày' },
];

function getInitialCustomDates(currentStart?: string): { startStr: string; todayStr: string } {
  const now = Date.now();
  const todayStr = new Date(now).toISOString().slice(0, 10);
  const startStr = currentStart || new Date(now - 7 * 86400000).toISOString().slice(0, 10);
  return { startStr, todayStr };
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const [customStart, setCustomStart] = useState(value.startDate || '');
  const [customEnd, setCustomEnd] = useState(value.endDate || '');

  const handleSelectPreset = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      const { startStr, todayStr } = getInitialCustomDates(customStart);
      setCustomStart(startStr);
      setCustomEnd(todayStr);
      onChange({ preset: 'custom', startDate: startStr, endDate: todayStr });
    } else {
      onChange({ preset });
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      onChange({
        preset: 'custom',
        startDate: customStart,
        endDate: customEnd
      });
    }
  };

  const handleReset = () => {
    onChange({ preset: 'all' });
    setCustomStart('');
    setCustomEnd('');
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-slate-800 space-y-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Title & Presets */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Phạm vi thời gian:
          </span>
        </div>

        {/* Reset button */}
        {value.preset !== 'all' && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span>Mặc định (Toàn bộ)</span>
          </button>
        )}
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {PRESET_OPTIONS.map(opt => {
          const isActive = value.preset === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelectPreset(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/30'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Inputs */}
      {value.preset === 'custom' && (
        <form onSubmit={handleApplyCustom} className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3 animate-fadeIn">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Từ:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              required
            />
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Đến:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
              required
            />
          </div>

          <button
            type="submit"
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
          >
            <Filter className="w-3 h-3" />
            <span>Áp dụng</span>
          </button>
        </form>
      )}
    </div>
  );
};
