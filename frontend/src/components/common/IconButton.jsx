import React from 'react';
import { cn } from '../../utils/cn';

export const IconButton = React.forwardRef(({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  ariaLabel,
  className,
  disabled = false,
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-brand text-slate-950 hover:bg-cyan-300 shadow-brand-glow",
    secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700",
    outline: "bg-transparent text-slate-300 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50",
    ghost: "bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/60",
    danger: "bg-status-danger/20 text-status-danger hover:bg-status-danger hover:text-white border border-status-danger/40",
  };

  const sizes = {
    sm: "w-8 h-8 p-1.5",
    md: "w-10 h-10 p-2",
    lg: "w-12 h-12 p-2.5",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      ref={ref}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {Icon && <Icon className={iconSizes[size]} />}
    </button>
  );
});

IconButton.displayName = 'IconButton';
