import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-2.5 py-1.5 text-xs font-medium gap-1.5 rounded-lg',
      md: 'px-3.5 py-2 text-sm font-medium gap-2 rounded-lg',
      lg: 'px-4.5 py-2.5 text-base font-medium gap-2.5 rounded-xl',
    };

    const variantClasses = {
      primary:
        'bg-[#0F172A] text-white hover:bg-[#1E293B] active:bg-[#020617] shadow-xs border border-transparent',
      gradient:
        'bg-gradient-to-r from-[#0EA5A4] to-[#4F46E5] text-white hover:opacity-95 shadow-xs border border-transparent active:scale-[0.99] transition-transform',
      secondary:
        'bg-white text-slate-800 hover:bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-slate-300',
      outline:
        'bg-transparent text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300',
      ghost:
        'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent',
      danger:
        'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 active:bg-rose-200',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5A4]/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span className="truncate">{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
