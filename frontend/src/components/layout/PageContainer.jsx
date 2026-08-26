import React from 'react';
import { cn } from '../../utils/cn';

export const PageContainer = ({
  children,
  className,
  maxWidth = 'max-w-7xl',
}) => {
  return (
    <main className={cn(
      "flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 mx-auto w-full space-y-6",
      maxWidth,
      className
    )}>
      {children}
    </main>
  );
};
