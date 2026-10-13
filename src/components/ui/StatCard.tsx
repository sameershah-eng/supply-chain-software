import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  formatAsCompact?: boolean;
  trend?: {
    value: number; // e.g. +4.2 or -1.5
    isPositiveGood?: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  subtext?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  suffix = '',
  prefix = '',
  formatAsCompact = false,
  trend,
  icon,
  subtext,
  className,
}) => {
  // Animate counter on mount or change
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 650;
    const steps = 24;
    const stepTime = duration / steps;
    const increment = value / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  const formattedDisplay = formatAsCompact
    ? new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(displayValue)
    : displayValue.toLocaleString();

  const isPositiveTrend = trend ? trend.value >= 0 : false;
  const isGood = trend ? (trend.isPositiveGood !== false ? isPositiveTrend : !isPositiveTrend) : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'bg-white rounded-xl border border-[#ECECEA] p-5 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <span>{label}</span>
        {icon && <span className="text-slate-400 p-1 bg-slate-50 rounded-lg">{icon}</span>}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
          {prefix}
          {formattedDisplay}
          {suffix}
        </span>
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs">
        {trend && (
          <div
            className={cn(
              'inline-flex items-center gap-1 font-medium tabular-nums',
              isGood ? 'text-emerald-700' : 'text-rose-700'
            )}
          >
            {isPositiveTrend ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {isPositiveTrend ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-slate-500 font-normal ml-0.5">{trend.label || 'vs last month'}</span>
          </div>
        )}
        {subtext && !trend && <span className="text-slate-500">{subtext}</span>}
      </div>
    </motion.div>
  );
};
