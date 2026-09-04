import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  TrendingUp,
  BookOpen,
  FlaskConical,
  Activity,
  History,
  Bot,
  User,
  Settings,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navGroups = [
  {
    title: 'HOME',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: "Today's Plan", path: '/today', icon: CalendarCheck },
    ]
  },
  {
    title: 'PROGRESS',
    items: [
      { name: 'Progress', path: '/progress', icon: TrendingUp },
      { name: 'Reflection', path: '/weekly-reflection', icon: BookOpen },
      { name: 'Experiments', path: '/experiments', icon: FlaskConical },
    ]
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { name: 'Strategy Health', path: '/strategy-health', icon: Activity },
      { name: 'Decision History', path: '/decision-history', icon: History },
      { name: 'AI Coach', path: '/coach', icon: Bot, badge: 'AI' },
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { name: 'Profile', path: '/profile', icon: User },
      { name: 'Settings', path: '/settings', icon: Settings },
    ]
  }
];

export const Sidebar = ({ className }) => {
  return (
    <aside className={cn(
      "w-64 bg-[#0a0c1a]/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 select-none z-30 shrink-0 shadow-[10px_0_30px_rgba(0,0,0,0.5)]",
      className
    )}>
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-blue via-[#00f2ff] to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_20px_rgba(0,242,255,0.4)]">
            <Zap className="w-5 h-5 fill-slate-950 stroke-none" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-wider text-slate-100">FITMIRROR</span>
              <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-[#00f2ff]/20 text-[#00f2ff] rounded border border-[#00f2ff]/40 shadow-[0_0_10px_rgba(0,242,255,0.3)]">
                AI
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Adaptive Fitness Vision AI</span>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <h4 className="px-3 text-[10px] font-extrabold text-slate-500 tracking-widest uppercase">
                {group.title}
              </h4>
              <nav className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) => cn(
                        "flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-all duration-200 group",
                        isActive
                          ? "bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff]/30 shadow-[0_0_15px_rgba(0,242,255,0.15)]"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/40"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full flex items-center gap-0.5 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                          <Sparkles className="w-2.5 h-2.5" />
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Footer AI Insight Indicator */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 backdrop-blur-md flex items-start gap-2.5 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5 animate-pulse" />
          <div className="text-[11px]">
            <p className="font-bold text-purple-200">Adaptive Engine</p>
            <p className="text-slate-400 mt-0.5 text-[10px]">Monitoring workload & consistency</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
