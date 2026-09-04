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
  const baseStyles = "inline-flex items-center font-bold rounded-full tracking-wider uppercase backdrop-blur-md shadow-sm";

  const variants = {
    default: "bg-slate-900/80 text-slate-300 border border-slate-700/80",
    ready: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
    reduced: "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
    recovery: "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-[0_0_12px_rgba(56,189,248,0.2)]",
    
    lowRisk: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    mediumRisk: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    highRisk: "bg-rose-500/15 text-rose-400 border border-rose-500/30",

    healthy: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
    needsAttention: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    atRisk: "bg-rose-500/15 text-rose-400 border border-rose-500/30",

    ai: "bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]",
    brand: "bg-[#00f2ff]/15 text-[#00f2ff] border border-[#00f2ff]/30 shadow-[0_0_15px_rgba(0,242,255,0.2)]",
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
