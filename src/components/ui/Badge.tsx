import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'slate' | 'emerald' | 'amber' | 'coral' | 'sky' | 'indigo' | 'outline' | 'teal';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'slate',
  size = 'md',
  children,
  ...props
}) => {
  const variantStyles = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200/80',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/90',
    coral: 'bg-rose-50 text-rose-800 border-rose-200/90',
    sky: 'bg-sky-50 text-sky-800 border-sky-200/90',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200/90',
    outline: 'bg-transparent text-slate-600 border-slate-300',
    teal: 'bg-teal-50 text-teal-800 border-teal-200/90',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-1.5 py-0.5 rounded',
    md: 'text-xs px-2 py-0.5 rounded-md',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border whitespace-nowrap tabular-nums',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
