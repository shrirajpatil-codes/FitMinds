import React, { useState } from 'react';
import { cn } from '../../utils/cn';

export const Tooltip = ({
  text,
  position = 'top',
  children,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && text && (
        <div
          className={cn(
            "absolute z-50 px-2.5 py-1 text-xs font-medium text-slate-100 bg-slate-800 border border-slate-700 rounded-lg shadow-lg whitespace-nowrap pointer-events-none transition-opacity duration-150 animate-in fade-in-0",
            positions[position],
            className
          )}
        >
          {text}
        </div>
      )}
    </div>
  );
};
