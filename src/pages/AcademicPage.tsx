import React, { useState } from 'react';
import type { Profile, AcademicItem, Enrollment, UserRole } from '../types';
import { dataService } from '../services/dataService';
import { EmptyState } from '../components/common/EmptyState';
import { 
  BookOpen, 
  Search, 
  Check, 
  Plus,
  Filter
} from 'lucide-react';


interface AcademicPageProps {
  currentUser: Profile | null;
  currentRole: UserRole;
  onNavigate: (page: string) => void;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AcademicPage: React.FC<AcademicPageProps> = ({
  currentUser,
  currentRole,
  onNavigate,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'enrolled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load items from dataService
  const allItems: AcademicItem[] = dataService.getAcademicItems();
  const visibleItems = currentRole === 'manager' 
    ? allItems 
    : allItems.filter(i => i.status === 'published');

  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    return currentUser ? dataService.getEnrollments().filter(e => e.student_id === currentUser.id) : [];
  });

  const categories = Array.from(new Set(visibleItems.map(i => i.category)));

  const handleEnroll = (item: AcademicItem) => {
    if (!currentUser) {
      showToast('info', 'Yêu cầu đăng nhập', 'Vui lòng đăng nhập để ghi danh tham gia học phần');
      onNavigate('auth');
      return;
    }

    const isAlready = enrollments.some(e => e.academic_item_id === item.id);
    if (isAlready) {
      showToast('info', 'Đã ghi danh trước đó', `Bạn đã nằm trong danh sách học tập của "${item.title}"`);
      return;
    }

    const newEnr = dataService.enrollStudent(currentUser.id, item.id, item.title);
    setEnrollments([newEnr, ...enrollments]);
    showToast('success', 'Ghi danh thành công!', `Bạn đã tham gia: ${item.title}`);
  };

  const displayedItems = visibleItems.filter(item => {
    const isEnrolled = enrollments.some(e => e.academic_item_id === item.id);
    if (activeTab === 'enrolled' && !isEnrolled) return false;

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSearch = 
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span>Thông Tin Học Tập & Danh Mục Học Phần</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Danh mục các chuyên đề học vụ, chương trình bổ trợ và học phần chính khóa đã được phê chuẩn
          </p>
        </div>

        {currentRole === 'manager' && (
          <button
            onClick={() => onNavigate('admin')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm mục học vụ (CRUD)</span>
          </button>
        )}
      </div>

      {/* Tabs Switcher for Student */}
      {currentUser && currentRole === 'student' && (
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Tất cả chương trình ({visibleItems.length})
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'enrolled'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Học phần tôi đã ghi danh ({enrollments.length})
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo mã học phần, tên chuyên đề..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-400 hidden sm:inline">Phân loại:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs w-full md:w-auto"
          >
            <option value="all">Tất cả phân loại</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Academic Items */}
      {displayedItems.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={activeTab === 'enrolled' ? 'Chưa ghi danh học phần nào' : 'Không tìm thấy mục học tập phù hợp'}
          description={
            activeTab === 'enrolled'
              ? 'Bạn chưa tham gia học phần nào. Hãy chuyển sang tab "Tất cả chương trình" để đăng ký ghi danh!'
              : 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc phân loại.'
          }
          actionText={activeTab === 'enrolled' ? 'Xem tất cả chương trình' : undefined}
          onAction={() => setActiveTab('all')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedItems.map((item) => {
            const isEnrolled = enrollments.some(e => e.academic_item_id === item.id);
            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4 transition-all hover:border-slate-700"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                      {item.code}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.category}</span>
                  </div>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Định mức học phí:</div>
                    <div className="text-sm font-extrabold text-emerald-400">
                      {item.standard_fee.toLocaleString('vi-VN')} ₫
                    </div>
                  </div>

                  {isEnrolled ? (
                    <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã ghi danh</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEnroll(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Ghi danh học tập
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
