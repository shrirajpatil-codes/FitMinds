import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNavigation } from './MobileNavigation';
import { PageContainer } from './PageContainer';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/today': "Today's Plan",
  '/workout': 'Active Session',
  '/daily-checkin': 'Daily Check-in',
  '/live-counter': 'Live Rep Counter',
  '/session-summary': 'Session Summary',
  '/progress': 'Progress & Analytics',
  '/weekly-reflection': 'Weekly Reflection',
  '/experiments': 'Fitness Experiments',
  '/strategy-health': 'Strategy Health',
  '/decision-history': 'AI Decision History',
  '/coach': 'FitMirror AI Coach',
  '/profile': 'Student Profile',
  '/settings': 'Application Settings',
  '/onboarding': 'Onboarding Setup',
};

export const AppShell = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'FitMirror AI';

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={title} />
        <PageContainer>
          <Outlet />
        </PageContainer>
      </div>

      {/* Touch Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};
