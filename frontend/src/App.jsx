import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DailyCheckinPage } from './pages/DailyCheckinPage';
import { TodayPlanPage } from './pages/TodayPlanPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { LiveCounterPage } from './pages/LiveCounterPage';
import { SessionSummaryPage } from './pages/SessionSummaryPage';
import { ProgressPage } from './pages/ProgressPage';
import { WeeklyReflectionPage } from './pages/WeeklyReflectionPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { StrategyHealthPage } from './pages/StrategyHealthPage';
import { DecisionHistoryPage } from './pages/DecisionHistoryPage';
import { CoachPage } from './pages/CoachPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AppShell } from './components/layout/AppShell';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* App Shell Routes */}
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/daily-checkin" element={<DailyCheckinPage />} />
            <Route path="/today" element={<TodayPlanPage />} />
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/live-counter" element={<LiveCounterPage />} />
            <Route path="/session-summary" element={<SessionSummaryPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/weekly-reflection" element={<WeeklyReflectionPage />} />
            <Route path="/experiments" element={<ExperimentsPage />} />
            <Route path="/strategy-health" element={<StrategyHealthPage />} />
            <Route path="/decision-history" element={<DecisionHistoryPage />} />
            <Route path="/coach" element={<CoachPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
