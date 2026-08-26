import React from 'react';
import { Bell, Search, Sparkles, LogOut } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const TopBar = ({ title = 'Dashboard' }) => {
  const { currentUser, userProfile, logoutUser } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const displayName = currentUser?.name || userProfile?.name || 'Alex Rivers';

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Status */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
        <Badge variant="ready" size="sm" icon={Sparkles}>
          Adaptive Plan Active
        </Badge>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search plans, strategy..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 pl-9 pr-3 py-2 focus:outline-none focus:border-brand"
          />
        </div>

        <button
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 bg-brand rounded-full absolute top-2 right-2 ring-2 ring-slate-900" />
        </button>

        <div className="h-6 w-px bg-slate-800 mx-1" />

        <div className="flex items-center gap-2.5 p-1 rounded-xl">
          <Avatar name={displayName} size="sm" />
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-medium text-slate-200">{displayName}</span>
            <span className="text-[10px] text-brand">{currentUser?.email || 'alex@fitminds.app'}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 ml-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
