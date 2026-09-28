import React from 'react';
import { cn } from '../../lib/utils';

export interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  title?: string;
  subtitle?: string;
  theme?: 'light' | 'dark';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  title = 'Receivables',
  subtitle = 'Management Platform',
  theme = 'light',
  className,
}) => {
  const sizeMap = {
    xs: { icon: 'w-6 h-6', title: 'text-xs', sub: 'text-[9px]' },
    sm: { icon: 'w-8 h-8', title: 'text-sm', sub: 'text-[10px]' },
    md: { icon: 'w-10 h-10', title: 'text-base', sub: 'text-[11px]' },
    lg: { icon: 'w-12 h-12', title: 'text-lg', sub: 'text-xs' },
    xl: { icon: 'w-16 h-16', title: 'text-2xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      {/* SVG Vector Insignia */}
      <div
        className={cn(
          'relative shrink-0 rounded-xl overflow-hidden shadow-md transition-transform duration-200 hover:scale-105',
          currentSize.icon,
        )}
      >
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={theme === 'dark' ? '#0F172A' : '#1E293B'} />
              <stop offset="100%" stopColor={theme === 'dark' ? '#020617' : '#0F172A'} />
            </linearGradient>
            <linearGradient id="flowGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="45%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Background Squircle */}
          <rect width="64" height="64" rx="14" fill="url(#logoBgGrad)" />

          {/* Infinity Flow Loop */}
          <path
            d="M17 38 C11 34, 11 25, 18 20 C25 15, 33 21, 37 26 L46 36 C50 41, 56 41, 58 37 C60 33, 58 26, 52 24"
            stroke="url(#flowGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Arrow Head */}
          <path
            d="M32 46 L47 22 M47 22 L38 21 M47 22 L48 30"
            stroke="url(#arrowGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Ledger Bars */}
          <rect x="22" y="28" width="9" height="2.2" rx="1.1" fill="#38BDF8" opacity="0.9" />
          <rect x="22" y="33" width="13" height="2.2" rx="1.1" fill="#34D399" opacity="0.9" />
        </svg>
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'font-extrabold tracking-tight leading-none truncate',
                currentSize.title,
                theme === 'dark' ? 'text-white' : 'text-slate-900',
              )}
            >
              {title}
            </span>
          </div>
          {subtitle && (
            <span
              className={cn(
                'font-medium tracking-normal mt-0.5 truncate',
                currentSize.sub,
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500',
              )}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
