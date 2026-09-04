import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Pause, Play, CheckCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { CameraViewfinder } from '../components/common/CameraViewfinder';
import { useApp } from '../context/AppContext';

export const LiveCounterPage = () => {
  const navigate = useNavigate();
  const { currentPlan, activeExerciseIndex, finishWorkout } = useApp();
  
  const currentExercise = currentPlan.exercises[activeExerciseIndex] || currentPlan.exercises[0];
  const [selectedExerciseName, setSelectedExerciseName] = useState(currentExercise?.name || 'Bicep Curl');
  const [repCount, setRepCount] = useState(0);
  const [isCounting, setIsCounting] = useState(true);
  const [lastCvMetrics, setLastCvMetrics] = useState(null);

  const targetReps = typeof currentExercise.targetReps === 'number' ? currentExercise.targetReps : 12;

  const handleRepDetected = (cvResult) => {
    if (!isCounting) return;
    if (cvResult && typeof cvResult.reps === 'number') {
      setRepCount(cvResult.reps);
      setLastCvMetrics(cvResult);
    } else {
      setRepCount(prev => prev + 1);
    }
  };

  const handleSimulateRep = () => {
    setRepCount(prev => prev + 1);
  };

  const handleFinish = () => {
    const summaryData = {
      completedExercisesCount: 1,
      totalDurationMinutes: 5,
      totalRepsCount: repCount,
      exerciseName: selectedExerciseName,
      formScore: lastCvMetrics?.formScore || 96,
      depthRating: lastCvMetrics?.depth || 'Good',
      rom: lastCvMetrics?.rom || 125,
      feedback: `Completed ${repCount} reps of ${selectedExerciseName} with AI CV Form Tracker`
    };

    finishWorkout('Good', summaryData);
    navigate('/session-summary');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          leftIcon={ArrowLeft}
          onClick={() => navigate('/workout')}
        >
          Back to Manual Workout
        </Button>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold">Select Exercise:</span>
            <select
              value={selectedExerciseName}
              onChange={(e) => {
                setSelectedExerciseName(e.target.value);
                setRepCount(0);
              }}
              className="bg-slate-950 text-slate-100 text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-brand"
            >
              <option value="Push-up">Push-ups</option>
              <option value="Squat">Squats</option>
              <option value="Bicep Curl">Bicep Curl</option>
              <option value="Dumbbell Rows">Dumbbell Rows</option>
              <option value="Lunge">Lunges</option>
              <option value="Plank">Plank</option>
              <option value="Shoulder Press">Shoulder Press</option>
              <option value="Jumping Jacks">Jumping Jacks</option>
            </select>
          </div>

          <Badge variant="brand" icon={Camera}>
            LIVE AI CAMERA COUNTER
          </Badge>
        </div>
      </div>

      {/* Scope Reminder Banner */}
      <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Privacy Note:</strong> Camera processing happens locally in your browser. No video recordings are stored or uploaded to any server.
        </span>
      </div>

      {/* Main Grid — Stacked vertically on Mobile, 2-cols on Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Camera Feed Container (2 cols) */}
        <div className="md:col-span-2">
          <CameraViewfinder
            activeExerciseName={selectedExerciseName}
            targetReps={targetReps}
            onRepDetected={handleRepDetected}
          />
        </div>

        {/* Rep Counter Details Sidebar (1 col) */}
        <div className="space-y-4">
          <Card variant="highlighted" className="p-6 text-center space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SELECTED MOVEMENT</span>
              <h3 className="text-lg font-bold text-slate-100 mt-0.5">{selectedExerciseName}</h3>
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
                Finish Workout & Get Summary
              </Button>
            </div>
          </Card>

          {/* Posture Correction Coaching Guidelines */}
          <Card variant="default" className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">POSTURE COACH</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                CV ENGINE ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              Keep full body in frame for real-time biomechanical feedback & form HUD.
            </p>
            <div className="space-y-1.5 text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Green line = Perfect posture range</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Amber line = Spine / Knee form warning</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Red line = Injury risk fault detected</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

