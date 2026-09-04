import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Flame, Calendar, CheckCircle2, Clock, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { useApp } from '../context/AppContext';

export const ProgressPage = () => {
  const navigate = useNavigate();
  const { progress } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2.5 tracking-tight">
            <TrendingUp className="w-6 h-6 text-[#00f2ff]" />
            Progress & Consistency Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            FitMirror AI tracks your habit retention and workload adaptability over time.
          </p>
        </div>

        <Badge variant="brand" icon={Sparkles}>
          DEMO DATA PREVIEW
        </Badge>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Current Streak"
          value={`${progress.currentStreakDays} Days`}
          icon={Flame}
          change="+1 Day Today"
          changeType="positive"
        />
        <StatCard
          label="Weekly Completion"
          value={`${progress.weeklyCompletedSessions} / ${progress.weeklyTargetSessions}`}
          icon={CheckCircle2}
          subtitle="80% of target"
        />
        <StatCard
          label="Total Sessions"
          value={`${progress.totalSessionsCompleted}`}
          icon={Calendar}
          subtitle="Lifetime workouts"
        />
        <StatCard
          label="Modified Sessions"
          value={`${progress.sessionsModifiedCount}`}
          icon={Clock}
          subtitle="Friction reduction"
        />
      </div>

      {/* Main Weekly Trend Visual Representation */}
      <Card variant="default" className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-widest">Weekly Workout Timeline</h3>
          <span className="text-xs text-[#00f2ff] font-semibold">This Week</span>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {progress.weeklyTrend.map((day) => (
            <div
              key={day.day}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                day.completed
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'border-slate-800/80 bg-[#0a0c1a]/60 text-slate-500'
              }`}
            >
              <span className="text-xs font-extrabold uppercase">{day.day}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${
                day.completed ? 'bg-emerald-400 text-slate-950 shadow-[0_0_10px_#10b981]' : 'bg-slate-800 text-slate-500'
              }`}>
                {day.completed ? '✓' : '-'}
              </div>
              <span className="text-[10px] font-mono font-semibold">{day.duration ? `${day.duration}m` : '0m'}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* "What's Changing?" Intelligence Section */}
      <Card variant="aiInsight" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="ai" icon={Sparkles}>
            WHAT'S CHANGING?
          </Badge>
          <span className="text-xs text-cyan-300 font-semibold">Habit Pattern Learning</span>
        </div>

        <p className="text-sm font-bold text-slate-100 leading-relaxed">
          "{progress.insightNote}"
        </p>

        <Alert variant="ai">
          FitMirror AI uses these findings to prevent future dropouts during high stress/exam periods.
        </Alert>

        <div className="flex items-center justify-end pt-2">
          <Button
            variant="primary"
            size="sm"
            rightIcon={ArrowRight}
            onClick={() => navigate('/weekly-reflection')}
          >
            Start Weekly Reflection
          </Button>
        </div>
      </Card>
    </div>
  );
};
