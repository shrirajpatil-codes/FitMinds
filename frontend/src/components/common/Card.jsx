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
  const baseStyles = "rounded-2xl border transition-all duration-200 p-5 bg-background-surface";

  const variants = {
    default: "border-slate-800 text-slate-100",
    highlighted: "border-brand/40 bg-slate-900/90 shadow-brand-glow",
    interactive: "border-slate-800 hover:border-slate-700 hover:bg-background-hover cursor-pointer active:scale-[0.99]",
    aiInsight: "border-ai-border/60 bg-gradient-to-b from-ai-bg/40 to-slate-900 shadow-ai-glow",
    warning: "border-status-warning/40 bg-amber-950/20 text-amber-100",
    success: "border-status-success/40 bg-emerald-950/20 text-emerald-100",
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
