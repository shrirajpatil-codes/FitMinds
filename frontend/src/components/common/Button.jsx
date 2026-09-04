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
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]";

  const variants = {
    primary: "bg-[#00f2ff] text-slate-950 hover:bg-[#33f4ff] shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_25px_rgba(0,242,255,0.5)] font-extrabold border border-[#00f2ff]/50",
    secondary: "bg-slate-900/80 backdrop-blur-md text-slate-100 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500",
    outline: "bg-slate-950/50 backdrop-blur-md text-slate-200 border border-slate-700/80 hover:border-[#00f2ff]/60 hover:text-[#00f2ff] hover:bg-[#00f2ff]/10 hover:shadow-[0_0_15px_rgba(0,242,255,0.15)]",
    ghost: "bg-transparent text-slate-300 hover:bg-slate-800/60 hover:text-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-500 shadow-sm border border-rose-500/50",
    ai: "bg-gradient-to-r from-purple-600 via-indigo-600 to-brand text-slate-950 hover:from-purple-500 hover:to-brand shadow-[0_0_20px_rgba(168,85,247,0.3)] font-extrabold"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-xl gap-1.5",
    md: "px-4 py-2 text-sm rounded-xl gap-2",
    lg: "px-5 py-2.5 text-base rounded-2xl gap-2.5"
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
