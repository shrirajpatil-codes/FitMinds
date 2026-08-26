import React from 'react';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary: "bg-brand text-slate-950 hover:bg-cyan-300 shadow-brand-glow font-semibold",
    secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700",
    outline: "bg-transparent text-slate-200 border border-slate-700 hover:border-slate-500 hover:bg-slate-800/50",
    ghost: "bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-slate-100",
    danger: "bg-status-danger text-white hover:bg-red-600 shadow-sm",
    ai: "bg-gradient-to-r from-ai-purple to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-ai-glow"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
    md: "px-4 py-2 text-sm rounded-xl gap-2",
    lg: "px-5 py-2.5 text-base rounded-xl gap-2.5"
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : LeftIcon ? (
        <LeftIcon className="w-4 h-4 shrink-0" />
      ) : null}

      <span>{children}</span>

      {!isLoading && RightIcon ? (
        <RightIcon className="w-4 h-4 shrink-0" />
      ) : null}
    </button>
  );
});

Button.displayName = 'Button';
