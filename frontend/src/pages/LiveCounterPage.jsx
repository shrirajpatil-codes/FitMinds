import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Pause, Play, CheckCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useApp } from '../context/AppContext';

export const LiveCounterPage = () => {
  const navigate = useNavigate();
  const { currentPlan, activeExerciseIndex, finishWorkout } = useApp();
  const [repCount, setRepCount] = useState(12);
  const [isCounting, setIsCounting] = useState(true);

  const currentExercise = currentPlan.exercises[activeExerciseIndex] || currentPlan.exercises[0];
  const targetReps = typeof currentExercise.targetReps === 'number' ? currentExercise.targetReps : 15;

  const handleSimulateRep = () => {
    setRepCount(prev => prev + 1);
  };

  const handleFinish = () => {
    finishWorkout('Good', 'Completed with live rep counter');
    navigate('/session-summary');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          leftIcon={ArrowLeft}
          onClick={() => navigate('/workout')}
        >
          Back to Manual Workout
        </Button>
        <Badge variant="brand" icon={Camera}>
          FUTURE CAMERA FEATURE PLACEHOLDER
        </Badge>
      </div>

      {/* Scope Reminder Banner */}
      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Scope Reminder:</strong> Live camera is for rep counting ONLY. No video recording, posture analysis, or cloud storage.
        </span>
      </div>

      {/* Main Grid — Stacked vertically on Mobile, 2-cols on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Camera Placeholder Area (2 cols) */}
        <div className="md:col-span-2">
          <Card variant="default" className="p-0 overflow-hidden relative aspect-video bg-slate-950 border border-slate-800 flex flex-col items-center justify-center">
            {/* Live Camera Viewfinder Overlay */}
            <div className="absolute inset-4 border-2 border-dashed border-brand/40 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-[10px] font-bold text-brand uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Live Camera — Rep Counting Only
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1080p Viewfinder Mockup</span>
              </div>
              <div className="text-center text-slate-500 text-xs font-mono">
                Pose Tracking Bounding Mesh Placeholder
              </div>
            </div>

            {/* Central Camera Graphic */}
            <div className="text-center space-y-2 z-10 p-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-brand mx-auto shadow-brand-glow">
                <Camera className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-300">Live Camera Overlay</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Position your device 5-8 feet away with full body visible in the frame.
              </p>
            </div>
          </Card>
        </div>

        {/* Rep Counter Details Sidebar (1 col) */}
        <div className="space-y-4">
          <Card variant="highlighted" className="p-6 text-center space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CURRENT MOVEMENT</span>
              <h3 className="text-lg font-bold text-slate-100 mt-0.5">{currentExercise.name}</h3>
            </div>

            {/* Rep Counter Box */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] font-bold text-brand uppercase tracking-wider">REPS DETECTED</span>
              <div className="text-5xl font-black text-brand my-1 tracking-tight">
                {repCount}
              </div>
              <span className="text-xs text-slate-400">Target: {targetReps} Reps</span>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Status: {isCounting ? 'Counting Live' : 'Paused'}</span>
            </div>

            {/* Controls */}
            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={handleSimulateRep}
              >
                Simulate Rep (+1)
              </Button>
              <Button
                variant="secondary"
                fullWidth
                leftIcon={isCounting ? Pause : Play}
                onClick={() => setIsCounting(!isCounting)}
              >
                {isCounting ? 'Pause Counter' : 'Resume Counter'}
              </Button>
              <Button
                variant="primary"
                fullWidth
                leftIcon={CheckCircle}
                onClick={handleFinish}
              >
                Finish Workout
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
