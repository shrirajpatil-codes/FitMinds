import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  className,
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full tracking-wide uppercase";

  const variants = {
    default: "bg-slate-800 text-slate-300 border border-slate-700",
    ready: "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60",
    reduced: "bg-amber-950/80 text-amber-400 border border-amber-800/60",
    recovery: "bg-sky-950/80 text-sky-400 border border-sky-800/60",
    
    lowRisk: "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60",
    mediumRisk: "bg-amber-950/80 text-amber-400 border border-amber-800/60",
    highRisk: "bg-rose-950/80 text-rose-400 border border-rose-800/60",

    healthy: "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60",
    needsAttention: "bg-amber-950/80 text-amber-400 border border-amber-800/60",
    atRisk: "bg-rose-950/80 text-rose-400 border border-rose-800/60",

    ai: "bg-purple-950/80 text-purple-300 border border-purple-800/60",
    brand: "bg-cyan-950/80 text-brand border border-cyan-800/60",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-0.5 text-xs gap-1.5",
    lg: "px-3 py-1 text-xs gap-1.5",
  };

  return (
    <span
      className={cn(
        baseStyles,
        variants[variant] || variants.default,
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{children}</span>
    </span>
  );
};
