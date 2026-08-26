import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Card } from './Card';

export const StatCard = ({
  label,
  value,
  change,
  changeType = 'neutral', // 'positive' | 'negative' | 'neutral'
  icon: Icon,
  subtitle,
  className,
  variant = 'default',
}) => {
  const changeColors = {
    positive: "text-emerald-400 bg-emerald-950/60 border-emerald-800/40",
    negative: "text-rose-400 bg-rose-950/60 border-rose-800/40",
    neutral: "text-slate-400 bg-slate-800/60 border-slate-700/40",
  };

  const ChangeIcon = changeType === 'positive' ? ArrowUpRight : changeType === 'negative' ? ArrowDownRight : Minus;

  return (
    <Card variant={variant} className={cn("relative overflow-hidden", className)}>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 tracking-wide uppercase">{label}</span>
          <div className="text-2xl font-bold text-slate-100 mt-1 tracking-tight">{value}</div>
        </div>

        {Icon && (
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-brand">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(change || subtitle) && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/60 text-xs">
          {change && (
            <span className={cn("inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md border font-medium", changeColors[changeType])}>
              <ChangeIcon className="w-3.5 h-3.5" />
              {change}
            </span>
          )}
          {subtitle && <span className="text-slate-400 truncate">{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};
