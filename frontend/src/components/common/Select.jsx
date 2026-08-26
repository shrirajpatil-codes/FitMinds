import React from 'react';
import { cn } from '../../utils/cn';

export const Select = React.forwardRef(({
  label,
  error,
  helperText,
  options = [],
  fullWidth = true,
  className,
  id,
  placeholder = 'Select an option',
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn("flex flex-col gap-1.5", fullWidth && "w-full")}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-medium text-slate-300 tracking-wide"
        >
          {label}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        className={cn(
          "w-full bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm px-3.5 py-2.5 transition-all duration-200 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-status-danger focus:border-status-danger focus:ring-status-danger",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-slate-900 text-slate-500">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-slate-900 text-slate-100"
          >
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="text-xs text-status-danger font-medium mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-slate-400 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
