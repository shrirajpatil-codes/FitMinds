import React from 'react';
import { cn } from '../../utils/cn';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className,
  variant = 'default',
}) => {
  return (
    <div className={cn(
      "flex items-center gap-1 border-b border-slate-800 p-1 bg-slate-900/60 rounded-xl",
      className
    )}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all duration-200 focus:outline-none",
              isActive
                ? "bg-slate-800 text-brand shadow-sm border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
            )}
          >
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-slate-700 text-slate-300 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
