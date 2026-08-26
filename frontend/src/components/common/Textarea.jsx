import React from 'react';
import { cn } from '../../utils/cn';

export const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  rows = 4,
  fullWidth = true,
  className,
  id,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-medium text-slate-300 tracking-wide"
        >
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          "w-full bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm p-3.5 transition-all duration-200 placeholder:text-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed resize-y",
          error && "border-status-danger focus:border-status-danger focus:ring-status-danger",
          className
        )}
        {...props}
      />

      {error ? (
        <p className="text-xs text-status-danger font-medium mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';
