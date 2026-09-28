import * as React from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SearchableSelectOption {
  value: string;
  label: string;
  subLabel?: string;
  badge?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  required?: boolean;
  error?: string | boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  disabled = false,
  className,
  allowClear = false,
  error,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(term)) ||
        (opt.badge && opt.badge.toLowerCase().includes(term)) ||
        opt.value.toLowerCase().includes(term),
    );
  }, [options, searchTerm]);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={cn('relative w-full min-w-0 max-w-full', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          'w-full min-w-0 max-w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-sm rounded-lg border transition-all duration-150 bg-white focus:outline-none focus:ring-2 focus:ring-offset-1 box-border',
          isOpen
            ? 'border-blue-600 ring-2 ring-blue-500/20'
            : error
              ? 'border-rose-400 focus:ring-rose-500/20'
              : 'border-slate-300 hover:border-slate-400 focus:ring-blue-500/20',
          disabled && 'opacity-60 bg-slate-50 cursor-not-allowed',
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          {selectedOption?.icon && (
            <span className="shrink-0 text-slate-500">{selectedOption.icon}</span>
          )}
          {selectedOption ? (
            <div className="flex items-center gap-2 truncate min-w-0 flex-1">
              <span className="font-medium text-slate-900 truncate shrink min-w-0">{selectedOption.label}</span>
              {selectedOption.subLabel && (
                <span className="text-xs text-slate-500 truncate hidden sm:inline shrink min-w-0">
                  • {selectedOption.subLabel}
                </span>
              )}
              {selectedOption.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded shrink-0">
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-400 truncate min-w-0">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {allowClear && selectedOption && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-0.5 hover:text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={cn('w-4 h-4 transition-transform duration-200', isOpen && 'rotate-180 text-blue-600')}
          />
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsOpen(false);
                  if (e.key === 'Enter' && filteredOptions.length > 0) {
                    e.preventDefault();
                    handleSelect(filteredOptions[0].value);
                  }
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      'w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left rounded-md transition-colors text-xs',
                      isSelected
                        ? 'bg-blue-50 text-blue-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100',
                      opt.disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent',
                    )}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      {opt.icon && <span className="shrink-0 text-slate-400">{opt.icon}</span>}
                      <div className="truncate">
                        <span className="truncate block font-medium">{opt.label}</span>
                        {opt.subLabel && (
                          <span className="text-[11px] text-slate-400 truncate block">
                            {opt.subLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span
                          className={cn(
                            'px-1.5 py-0.5 text-[10px] rounded font-medium',
                            isSelected
                              ? 'bg-blue-200 text-blue-800'
                              : 'bg-slate-100 text-slate-600',
                          )}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
