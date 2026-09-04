import React from 'react';
import { cn } from '../../utils/cn';

export const Card = ({
  children,
  variant = 'default',
  className,
  title,
  subtitle,
  headerAction,
  footer,
  ...props
}) => {
  const baseStyles = "rounded-2xl border backdrop-blur-xl transition-all duration-300 p-5 bg-[#101221]/70";

  const variants = {
    default: "border-slate-800/80 text-slate-100 hover:border-slate-700/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
    highlighted: "border-[#00f2ff]/40 bg-gradient-to-br from-[#101221]/90 via-[#13172a]/80 to-[#1e1b4b]/50 shadow-[0_0_30px_rgba(0,242,255,0.15)] text-slate-100",
    interactive: "border-slate-800/80 hover:border-[#00f2ff]/40 hover:bg-[#16192e]/80 cursor-pointer active:scale-[0.99] shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_0_20px_rgba(0,242,255,0.12)]",
    aiInsight: "border-purple-500/40 bg-gradient-to-br from-purple-950/40 via-[#101221]/90 to-indigo-950/40 shadow-[0_0_25px_rgba(168,85,247,0.15)] text-purple-100",
    warning: "border-amber-500/40 bg-amber-950/20 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
    success: "border-emerald-500/40 bg-emerald-950/20 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-100">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}

      <div>{children}</div>

      {footer && (
        <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
};
