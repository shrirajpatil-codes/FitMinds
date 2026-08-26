import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Zap,
  Play,
  Sliders,
  Sparkles,
  Flame,
  CheckCircle,
  Activity,
  ArrowRight,
  Clock,
  Battery,
  Calendar,
  BookOpen
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { Alert } from '../components/common/Alert';
import { PlanAdjustmentModal } from '../components/common/PlanAdjustmentModal';
import { useApp } from '../context/AppContext';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { userProfile, dailyContext, currentPlan, progress, strategyHealth, insights } = useApp();
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const readinessVariant = {
    READY: 'ready',
    MODERATE: 'reduced',
    RECOVERY: 'recovery',
  }[dailyContext.readiness] || 'ready';

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-100">Good morning, {userProfile.name}</h2>
            <Badge variant={readinessVariant} size="lg">
              {dailyContext.readiness}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Let's make today's workout fit your student schedule & energy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/daily-checkin">
            <Button variant="outline" size="sm" leftIcon={Sliders}>
              Daily Check-in
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            leftIcon={Play}
            onClick={() => navigate('/workout')}
          >
            Start Workout
          </Button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Plan & Context (2 cols on LG) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Adaptive Plan Card */}
          <Card variant="highlighted" className="relative overflow-hidden">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                  TODAY'S ADAPTIVE PLAN
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">{currentPlan.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentPlan.targetFocus}</p>
              </div>

              <Badge variant="brand" icon={Clock} size="md">
                {currentPlan.durationMinutes} MIN
              </Badge>
            </div>

            {/* Plan Metrics Row */}
            <div className="grid grid-cols-3 gap-3 my-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Duration</span>
                <p className="font-semibold text-slate-200 mt-0.5">{currentPlan.durationMinutes} Minutes</p>
              </div>
              <div>
                <span className="text-slate-400">Difficulty</span>
                <p className="font-semibold text-slate-200 mt-0.5">{currentPlan.difficulty}</p>
              </div>
              <div>
                <span className="text-slate-400">Exercises</span>
                <p className="font-semibold text-slate-200 mt-0.5">{currentPlan.exercises.length} Movements</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                leftIcon={Play}
                onClick={() => navigate('/today')}
              >
                View Full Workout
              </Button>
              <Button
                variant="secondary"
                leftIcon={Sliders}
                onClick={() => setIsAdjustModalOpen(true)}
              >
                Adjust Plan
              </Button>
            </div>
          </Card>

          {/* Today's Context Card */}
          <Card variant="default">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand" />
                Today's Student Context
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">{dailyContext.lastCheckinTime}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <Clock className="w-3.5 h-3.5 text-brand" />
                  Time Available
                </div>
                <span className="text-sm font-bold text-slate-100">{dailyContext.availableTimeMinutes} min</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  Energy Level
                </div>
                <span className="text-sm font-bold text-slate-100">{dailyContext.energyLevel}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  Preferred Window
                </div>
                <span className="text-sm font-bold text-slate-100">{dailyContext.scheduleWindow}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  Academic Load
                </div>
                <span className="text-sm font-bold text-slate-100">{dailyContext.academicLoad}</span>
              </div>
            </div>

            <Alert variant="ai" className="py-2.5">
              {dailyContext.contextSummary}
            </Alert>
          </Card>
        </div>

        {/* Right Column: AI Insight, Consistency, Strategy Health */}
        <div className="space-y-6">
          {/* FITMINDS AI Insight Card */}
          <Card variant="aiInsight" className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="ai" icon={Sparkles}>
                FITMINDS INSIGHT
              </Badge>
              <span className="text-[10px] text-purple-300">Adaptive Intelligence</span>
            </div>

            <p className="text-xs font-medium text-purple-200 leading-relaxed">
              "{insights[0].summary}"
            </p>

            <Button
              variant="outline"
              size="sm"
              fullWidth
              rightIcon={ArrowRight}
              onClick={() => navigate('/decision-history')}
            >
              Why this changed
            </Button>
          </Card>

          {/* Consistency Overview */}
          <Card variant="default" title="Consistency & Habit">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <StatCard
                label="Current Streak"
                value={`${progress.currentStreakDays} Days`}
                icon={Flame}
                change="Active"
                changeType="positive"
              />
              <StatCard
                label="Weekly Target"
                value={`${progress.weeklyCompletedSessions} / ${progress.weeklyTargetSessions}`}
                icon={CheckCircle}
                subtitle="Sessions done"
              />
            </div>
            <div className="text-[11px] text-slate-400 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              Total sessions completed: <strong className="text-slate-200">{progress.totalSessionsCompleted}</strong> | Modified: <strong className="text-slate-200">{progress.sessionsModifiedCount}</strong>
            </div>
          </Card>

          {/* Strategy Health Compact Card */}
          <Card variant="default">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                STRATEGY HEALTH
              </span>
              <Badge variant="healthy">HEALTHY</Badge>
            </div>
            <p className="text-xs text-slate-400 mb-3">{strategyHealth.headline}</p>

            <Link to="/strategy-health">
              <Button variant="ghost" size="sm" fullWidth rightIcon={ArrowRight}>
                View Strategy Health
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Plan Adjustment Modal */}
      <PlanAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
      />
    </div>
  );
};
