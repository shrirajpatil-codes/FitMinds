import React from 'react';
import { Layers } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Layers,
  title = 'No Data Available',
  description = 'There is nothing to display here yet.',
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30",
      className
    )}>
      <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-6 h-6" />
      </div>

      <h4 className="text-base font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mb-6">{description}</p>

      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
