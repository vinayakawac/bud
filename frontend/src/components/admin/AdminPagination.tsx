'use client';

import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface AdminPaginationProps {
  page: number;
  pageCount: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function AdminPagination({
  page,
  pageCount,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: AdminPaginationProps) {
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const limitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (limitRef.current && !limitRef.current.contains(e.target as Node)) {
        setIsLimitOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const limitOptions = [10, 25, 50, 100];
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 bg-white">
      {/* Rows per page */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600">Rows per page</span>
        <div ref={limitRef} className="relative">
          <button
            onClick={() => setIsLimitOpen(!isLimitOpen)}
            className="flex items-center gap-1 px-2 py-1 text-sm border border-neutral-200 rounded hover:border-neutral-300"
          >
            {limit}
            <ChevronDown className="w-4 h-4 text-neutral-400" />
          </button>

          {isLimitOpen && (
            <div className="absolute bottom-full left-0 mb-1 bg-white border border-neutral-200 rounded shadow-lg z-50">
              {limitOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onLimitChange(opt);
                    setIsLimitOpen(false);
                  }}
                  className={`block w-full px-4 py-1.5 text-sm text-left hover:bg-neutral-50 ${
                    limit === opt ? 'text-orange-600 font-medium' : 'text-neutral-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Page info and navigation */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-600">
          {total > 0 ? `${start}–${end} of ${total}` : '0 results'}
        </span>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-600" />
          </button>
          
          <span className="px-2 text-sm text-neutral-600">
            Page {page}
          </span>
          
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            className="p-1 rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
