import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, Sparkles, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Alert = ({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}) => {
  const icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    danger: AlertCircle,
    ai: Sparkles,
  };

  const variants = {
    info: "bg-sky-950/40 border-sky-800/60 text-sky-200",
    success: "bg-emerald-950/40 border-emerald-800/60 text-emerald-200",
    warning: "bg-amber-950/40 border-amber-800/60 text-amber-200",
    danger: "bg-rose-950/40 border-rose-800/60 text-rose-200",
    ai: "bg-purple-950/40 border-purple-800/60 text-purple-200 shadow-ai-glow",
  };

  const iconColors = {
    info: "text-sky-400",
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-rose-400",
    ai: "text-purple-400",
  };

  const IconComponent = icons[variant] || Info;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border transition-all text-xs",
        variants[variant],
        className
      )}
      role="alert"
    >
      <IconComponent className={cn("w-5 h-5 shrink-0 mt-0.5", iconColors[variant])} />

      <div className="flex-1">
        {title && <h5 className="font-semibold text-sm mb-0.5">{title}</h5>}
        <div className="text-slate-300 leading-relaxed">{children}</div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-100 p-1 rounded-lg hover:bg-slate-800/60 transition-colors shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
