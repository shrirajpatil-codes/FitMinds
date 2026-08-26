import React from 'react';
import { cn } from '../../utils/cn';

export const Divider = ({
  orientation = 'horizontal',
  label,
  className,
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn("w-px h-full bg-slate-800 self-stretch shrink-0", className)}
        role="separator"
      />
    );
  }

  return (
    <div className={cn("w-full flex items-center gap-3 my-4", className)} role="separator">
      <div className="flex-1 h-px bg-slate-800" />
      {label && <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</span>}
      {label && <div className="flex-1 h-px bg-slate-800" />}
    </div>
  );
};
