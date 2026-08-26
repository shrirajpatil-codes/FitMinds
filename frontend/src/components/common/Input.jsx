import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = true,
  className,
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-slate-300 tracking-wide"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {LeftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <LeftIcon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={cn(
            "w-full bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm px-3.5 py-2.5 transition-all duration-200 placeholder:text-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed",
            LeftIcon && "pl-10",
            RightIcon && "pr-10",
            error && "border-status-danger focus:border-status-danger focus:ring-status-danger",
            className
          )}
          {...props}
        />

        {RightIcon && (
          <div className="absolute right-3.5 text-slate-400 pointer-events-none">
            <RightIcon className="w-4 h-4" />
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-status-danger font-medium mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
