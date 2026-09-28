import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  isDark?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
  isDark = false,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-2 text-xs select-none',
        isDark ? 'text-slate-400' : 'text-slate-600',
        className,
      )}
    >
      {/* Items Count and Page Size Selector */}
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>{startItem}</strong> to{' '}
          <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>{endItem}</strong> of{' '}
          <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>{total}</strong> records
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="hidden sm:inline">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={cn(
                'rounded px-2 py-1 border text-xs focus:outline-none',
                isDark
                  ? 'bg-slate-900 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-200 text-slate-700',
              )}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={cn(
            'h-8 px-2.5 text-xs gap-1',
            isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : '',
          )}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === 'number' ? (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  'w-8 h-8 rounded text-xs font-medium transition-colors',
                  currentPage === p
                    ? isDark
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-blue-600 text-white font-bold'
                    : isDark
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-slate-700 hover:bg-slate-100',
                )}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-1 text-slate-400">
                ...
              </span>
            ),
          )}
        </div>

        <span className="sm:hidden text-xs px-2">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={cn(
            'h-8 px-2.5 text-xs gap-1',
            isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : '',
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
