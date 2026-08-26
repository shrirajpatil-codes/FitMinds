import React from 'react';
import { cn } from '../../utils/cn';

export const Skeleton = ({
  variant = 'text',
  width,
  height,
  className,
}) => {
  const baseStyles = "animate-pulse bg-slate-800/80 rounded-lg";

  const variants = {
    text: "h-4 w-full rounded",
    circular: "rounded-full shrink-0",
    rectangular: "w-full h-32 rounded-xl",
    card: "w-full h-48 rounded-2xl border border-slate-800",
  };

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
      }}
    />
  );
};
