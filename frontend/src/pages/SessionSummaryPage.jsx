import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Flame, Clock, Dumbbell, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { Textarea } from '../components/common/Textarea';
import { Alert } from '../components/common/Alert';
import { useApp } from '../context/AppContext';

export const SessionSummaryPage = () => {
  const navigate = useNavigate();
  const { completedSummary, currentPlan } = useApp();
  const [feelRating, setFeelRating] = useState('Good');
  const [feedbackNotes, setFeedbackNotes] = useState('');

  const summaryData = completedSummary || {
    completedAt: 'Just now',
    durationMinutes: currentPlan.durationMinutes,
    exercisesCompletedCount: currentPlan.exercises.length,
    totalSetsCompleted: currentPlan.exercises.length * 3,
    totalRepsCount: 110,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Banner */}
      <Card variant="highlighted" className="p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400 mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Workout Complete!</h1>
          <p className="text-xs text-slate-400 mt-1">
            Great job! FITMINDS updated your consistency streak and logged session signals.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          <StatCard
            label="Duration"
            value={`${summaryData.durationMinutes} min`}
            icon={Clock}
          />
          <StatCard
            label="Exercises"
            value={`${summaryData.exercisesCompletedCount}`}
            icon={Dumbbell}
          />
          <StatCard
            label="Sets Completed"
            value={`${summaryData.totalSetsCompleted}`}
            icon={Flame}
          />
          <StatCard
            label="Total Reps"
            value={`${summaryData.totalRepsCount}`}
            icon={TrendingUp}
          />
        </div>
      </Card>

      {/* User Reflection Feedback Form */}
      <Card variant="default" className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
            How did that session feel?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Easy', 'Good', 'Challenging', 'Too difficult'].map(rating => (
              <button
                key={rating}
                type="button"
                onClick={() => setFeelRating(rating)}
                className={`p-3.5 rounded-xl text-xs font-semibold border text-center transition-all ${
                  feelRating === rating
                    ? 'border-brand bg-cyan-950/40 text-brand shadow-brand-glow'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="What affected today's session? (Optional)"
          placeholder="e.g. 20-min limit was perfect after coding lab, felt strong on squats."
          value={feedbackNotes}
          onChange={e => setFeedbackNotes(e.target.value)}
          rows={2}
        />

        <Alert variant="ai">
          This outcome feedback will be used by FITMINDS to optimize next week's session load.
        </Alert>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => navigate('/progress')}
          >
            View Progress
          </Button>

          <Button
            variant="primary"
            rightIcon={ArrowRight}
            onClick={() => navigate('/dashboard')}
          >
            Done
          </Button>
        </div>
      </Card>
    </div>
  );
};
