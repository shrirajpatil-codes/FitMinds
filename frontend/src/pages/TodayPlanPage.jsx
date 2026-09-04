import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sliders, Clock, Dumbbell, Sparkles, ChevronRight, Camera } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Alert } from '../components/common/Alert';
import { PlanAdjustmentModal } from '../components/common/PlanAdjustmentModal';
import { useApp } from '../context/AppContext';

export const TodayPlanPage = () => {
  const navigate = useNavigate();
  const { currentPlan, dailyContext, startWorkoutSession } = useApp();
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <Card variant="highlighted" className="p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="brand" icon={Sparkles}>
                ADAPTED FOR TODAY
              </Badge>
              <Badge variant="ready">{dailyContext.readiness}</Badge>
            </div>
            <h2 className="text-2xl font-black text-slate-100 tracking-tight">{currentPlan.title}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Target focus: {currentPlan.targetFocus} • {currentPlan.difficulty}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              leftIcon={Sliders}
              onClick={() => setIsAdjustModalOpen(true)}
            >
              Adjust
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={Play}
              onClick={() => {
                if (startWorkoutSession) startWorkoutSession();
                navigate('/workout');
              }}
            >
              Start Workout
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-[#00f2ff]" />
            <span>Duration: <strong className="text-slate-100">{currentPlan.durationMinutes} min</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Dumbbell className="w-4 h-4 text-purple-400" />
            <span>Movements: <strong className="text-slate-100">{currentPlan.exercises.length}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Friction Level: <strong className="text-emerald-400">Optimal</strong></span>
          </div>
        </div>
      </Card>

      {/* AI Context Alert */}
      <Alert variant="ai">
        {dailyContext.contextSummary}
      </Alert>

      {/* Exercise Schedule List */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest px-1">
          Workout Structure ({currentPlan.exercises.length} Exercises)
        </h3>

        {currentPlan.exercises.map((ex, idx) => (
          <Card key={ex.id} variant="default" className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#00f2ff]/40 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#0a0c1a]/80 border border-slate-800 flex items-center justify-center font-extrabold text-[#00f2ff] text-xs shrink-0 mt-0.5 shadow-[0_0_10px_rgba(0,242,255,0.15)]">
                {idx + 1}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">{ex.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{ex.instructions}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                  <span className="bg-[#0a0c1a]/80 px-2 py-0.5 rounded-lg border border-slate-800/80 text-slate-300 font-semibold">
                    {ex.sets} Sets
                  </span>
                  <span className="bg-[#0a0c1a]/80 px-2 py-0.5 rounded-lg border border-slate-800/80 text-slate-300 font-semibold">
                    {ex.reps}
                  </span>
                  <span>Rest: {ex.restSeconds}s</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-400 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/80">
              <span className="font-bold text-slate-300">{ex.duration}</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Start Action */}
      <div className="p-5 rounded-2xl bg-[#101221]/80 backdrop-blur-xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="text-xs text-slate-400">
          Ready to begin? Choose your session mode: <span className="text-slate-200 font-semibold">Standard Guided</span> or <span className="text-[#00f2ff] font-semibold">Live AI Camera Counter</span>.
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" leftIcon={Camera} onClick={() => {
            if (startWorkoutSession) startWorkoutSession();
            navigate('/live-counter');
          }}>
            Live AI Camera Workout
          </Button>
          <Button variant="primary" size="sm" leftIcon={Play} onClick={() => {
            if (startWorkoutSession) startWorkoutSession();
            navigate('/workout');
          }}>
            Start Workout
          </Button>
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
