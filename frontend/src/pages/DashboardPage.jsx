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
  BookOpen,
  Brain,
  Check,
  TrendingUp,
  RotateCcw
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
  const {
    userProfile,
    dailyContext,
    currentPlan,
    setCurrentPlan,
    progress,
    strategyHealth,
    insights,
    mlRecommendation,
    isLoadingMlRec,
    fetchMlRecommendation,
    startWorkoutSession
  } = useApp();

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const readinessVariant = {
    READY: 'ready',
    MODERATE: 'reduced',
    RECOVERY: 'recovery',
  }[dailyContext.readiness] || 'ready';

  const recData = mlRecommendation?.recommendedWorkout;
  const recScore = mlRecommendation?.score ? Math.round(mlRecommendation.score * 100) : 85;
  const recFactors = mlRecommendation?.factors || [
    `Fits your ${dailyContext.availableTimeMinutes || 20}-min available window`,
    `Matches reported energy level ${dailyContext.energyLevel || 3}`
  ];

  const handleAdoptMlRecommendation = (workoutObj) => {
    const target = workoutObj || recData;
    if (!target) return;

    setCurrentPlan({
      id: target.id || 'W001',
      title: target.title,
      durationMinutes: target.durationMinutes,
      difficulty: target.difficulty,
      goal: target.goal,
      status: 'PLANNED',
      source: 'ML_RECOMMENDED',
      exercises: target.exercises || [
        { name: "Bodyweight Squats", sets: 3, reps: 12 },
        { name: "Incline Push-ups", sets: 3, reps: 10 },
        { name: "Jumping Jacks", sets: 3, durationSec: 30 }
      ]
    });
  };

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
            FITMINDS adaptive ML engine personalized today's fitness plan for your student schedule.
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
            onClick={() => {
              startWorkoutSession();
              navigate('/workout');
            }}
          >
            Start Workout
          </Button>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: ML Recommendation & Context (2 cols on LG) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 5: FITMINDS Real ML-Based Workout Recommendation Card */}
          <div className="relative rounded-2xl p-6 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-purple-950/70 border border-indigo-500/30 shadow-xl shadow-indigo-950/20">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
                  <Brain className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      FITMINDS ML ENGINE
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                      {mlRecommendation?.modelVersion || 'workout-recommender-v1'}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-100 mt-0.5">
                    {recData ? recData.title : "15-Min Express Full Body"}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {recScore}% Match Score
                </div>
                <button
                  onClick={fetchMlRecommendation}
                  disabled={isLoadingMlRec}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Re-run ML Inference Engine"
                >
                  <RotateCcw className={`w-4 h-4 ${isLoadingMlRec ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Recommendation Factors */}
            <div className="mb-4">
              <span className="text-[11px] font-medium text-slate-400 block mb-2">
                Why ML selected this workout for you today:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workout Details Row */}
            <div className="grid grid-cols-3 gap-3 my-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-400">Duration</span>
                <p className="font-semibold text-slate-100 mt-0.5">{recData?.durationMinutes || 15} Minutes</p>
              </div>
              <div>
                <span className="text-slate-400">Difficulty</span>
                <p className="font-semibold text-slate-100 mt-0.5">{recData?.difficulty || 'BEGINNER'}</p>
              </div>
              <div>
                <span className="text-slate-400">Equipment</span>
                <p className="font-semibold text-slate-100 mt-0.5">{recData?.equipment || 'NONE'}</p>
              </div>
            </div>

            {/* Candidate Alternatives */}
            {mlRecommendation?.alternatives?.length > 0 && (
              <div className="mb-5 pt-3 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-2">Alternative ML Ranked Choices:</span>
                <div className="flex flex-wrap gap-2">
                  {mlRecommendation.alternatives.map((alt) => (
                    <button
                      key={alt.id}
                      onClick={() => handleAdoptMlRecommendation(alt)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-950/60 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 transition-all flex items-center gap-2"
                    >
                      <span>{alt.title} ({alt.durationMinutes}m)</span>
                      <span className="text-[10px] text-indigo-400 font-bold">{Math.round(alt.score * 100)}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                leftIcon={Play}
                onClick={() => {
                  handleAdoptMlRecommendation();
                  startWorkoutSession();
                  navigate('/workout');
                }}
              >
                Start ML Recommended Workout
              </Button>

              <Button
                variant="secondary"
                leftIcon={Sliders}
                onClick={() => setIsAdjustModalOpen(true)}
              >
                Manual Adjustments
              </Button>
            </div>
          </div>

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
                <span className="text-sm font-bold text-slate-100">{dailyContext.energyLevel} / 5</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  Body BMI
                </div>
                <span className="text-sm font-bold text-slate-100">{userProfile.bmi || 22.8} <span className="text-[10px] font-normal text-indigo-300">({userProfile.bmiCategory || 'Normal'})</span></span>
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
                FITMINDS AI COACH
              </Badge>
              <span className="text-[10px] text-purple-300">Gemini Explanation</span>
            </div>

            <p className="text-xs font-medium text-purple-200 leading-relaxed">
              "{insights[0]?.summary || 'ML model scored today workout options for highest completion probability. Focus on maintaining consistency!'}"
            </p>

            <Button
              variant="outline"
              size="sm"
              fullWidth
              rightIcon={ArrowRight}
              onClick={() => navigate('/coach')}
            >
              Ask AI Coach
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
