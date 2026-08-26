import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  TrendingUp,
  Bot,
  User
} from 'lucide-react';
import { cn } from '../../utils/cn';

const mobileNavItems = [
  { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Today', path: '/today', icon: CalendarCheck },
  { name: 'Progress', path: '/progress', icon: TrendingUp },
  { name: 'Coach', path: '/coach', icon: Bot },
  { name: 'Profile', path: '/profile', icon: User },
];

export const MobileNavigation = ({ className }) => {
  return (
    <nav className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 flex items-center justify-around z-40 shadow-2xl",
      className
    )}>
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all duration-150 text-slate-400 active:scale-95",
              isActive && "text-brand font-semibold"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-[10px] tracking-tight">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
