import React from 'react';
import { cn } from '../../utils/cn';

export const ProgressBar = ({
  value = 0,
  max = 100,
  variant = 'brand',
  size = 'md',
  showValue = false,
  label,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const variants = {
    brand: "bg-brand",
    success: "bg-status-success",
    warning: "bg-status-warning",
    danger: "bg-status-danger",
    ai: "bg-gradient-to-r from-ai-purple to-indigo-500",
    sky: "bg-sky-400",
  };

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs text-slate-300">
          {label && <span className="font-medium">{label}</span>}
          {showValue && <span className="font-semibold text-slate-400">{percentage}%</span>}
        </div>
      )}
      <div className={cn("w-full bg-slate-800 rounded-full overflow-hidden", sizes[size])}>
        <div
          className={cn("h-full transition-all duration-300 rounded-full", variants[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
