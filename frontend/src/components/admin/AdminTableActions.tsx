'use client';

import { MoreHorizontal, Eye, Edit, Ban, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ActionItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface AdminTableActionsProps {
  actions: ActionItem[];
}

export function AdminTableActions({ actions }: AdminTableActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-1.5 rounded-md hover:bg-neutral-100 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-neutral-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-neutral-200 rounded-md shadow-lg z-50">
          <ul className="py-1">
            {actions.map((action, idx) => (
              <li key={idx}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                    action.variant === 'danger'
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {action.icon}
                  {action.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Export commonly used icons for convenience
export { Eye, Edit, Ban, Trash2 };
