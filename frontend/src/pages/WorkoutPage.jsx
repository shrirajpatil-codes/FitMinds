import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  SkipForward,
  Pause,
  Play,
  Camera,
  CheckCheck,
  Flame,
  Clock
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { CameraViewfinder } from '../components/common/CameraViewfinder';
import { useApp } from '../context/AppContext';

export const WorkoutPage = () => {
  const navigate = useNavigate();
  const {
    currentPlan,
    activeExerciseIndex,
    activeSet,
    completedExerciseIds,
    completeCurrentSet,
    skipCurrentExercise,
    finishWorkout
  } = useApp();

  const [isPaused, setIsPaused] = useState(false);
  const [restSeconds, setRestSeconds] = useState(28);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const currentExercise = currentPlan.exercises[activeExerciseIndex] || currentPlan.exercises[0];
  const totalExercises = currentPlan.exercises.length;
  const isLastExercise = activeExerciseIndex === totalExercises - 1 && activeSet === currentExercise.sets;

  // Rest Timer Countdown Simulation
  useEffect(() => {
    let interval = null;
    if (!isPaused && restSeconds > 0) {
      interval = setInterval(() => {
        setRestSeconds(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, restSeconds]);

  const handleCompleteSet = () => {
    setRestSeconds(currentExercise.restSeconds || 30);
    if (isLastExercise || (activeExerciseIndex >= totalExercises - 1 && activeSet >= currentExercise.sets)) {
      finishWorkout('Good', 'Completed smoothly');
      navigate('/session-summary');
    } else {
      completeCurrentSet(currentExercise.sets);
    }
  };

  const handleFinishEarly = () => {
    finishWorkout('Good', 'Ended early');
    navigate('/session-summary');
  };

  const formattedRestTime = `00:${restSeconds < 10 ? '0' : ''}${restSeconds}`;
  const overallProgress = Math.round(((activeExerciseIndex + (activeSet / currentExercise.sets)) / totalExercises) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Session Status Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div>
          <span className="text-[10px] font-extrabold text-[#00f2ff] uppercase tracking-widest">ACTIVE WORKOUT</span>
          <h2 className="text-lg font-black text-slate-100 tracking-tight">{currentPlan.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={Camera}
            onClick={() => setIsCameraModalOpen(true)}
          >
            Live Camera Mode
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFinishEarly}
          >
            Finish Early
          </Button>
        </div>
      </div>

      <ProgressBar value={overallProgress} variant="brand" showValue label={`Workout Progress (${activeExerciseIndex + 1} of ${totalExercises})`} />

      {/* Main Focus Card */}
      <Card variant="highlighted" className="p-6 md:p-8 space-y-6 text-center">
        {/* Exercise Header */}
        <div className="space-y-2">
          <Badge variant="brand" size="md">
            EXERCISE {activeExerciseIndex + 1} OF {totalExercises}
          </Badge>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight">
            {currentExercise.name}
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {currentExercise.instructions}
          </p>
        </div>

        {/* Set & Rep Focus Display */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="p-4 rounded-2xl bg-[#0a0c1a]/90 border border-slate-800/80 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">SET</span>
            <div className="text-3xl font-black text-[#00f2ff] mt-1 tracking-tight drop-shadow-[0_0_10px_rgba(0,242,255,0.3)]">
              {activeSet} <span className="text-sm font-normal text-slate-400">/ {currentExercise.sets}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0c1a]/90 border border-slate-800/80 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">TARGET REPS</span>
            <div className="text-3xl font-black text-slate-100 mt-1 tracking-tight">
              {currentExercise.reps}
            </div>
          </div>
        </div>

        {/* Rest Timer Card */}
        <div className="p-4 rounded-2xl bg-[#0a0c1a]/60 border border-slate-800/80 max-w-xs mx-auto flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
            <Clock className="w-4 h-4 text-[#00f2ff]" />
            <span>Rest Interval</span>
          </div>
          <span className="font-mono text-lg font-extrabold text-slate-100">{formattedRestTime}</span>
        </div>

        {/* Primary Workout Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="secondary"
            leftIcon={isPaused ? Play : Pause}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>

          <Button
            variant="primary"
            size="lg"
            leftIcon={isLastExercise ? CheckCheck : CheckCircle}
            onClick={handleCompleteSet}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {isLastExercise ? 'Complete Workout' : `Complete Set ${activeSet}`}
          </Button>

          <Button
            variant="ghost"
            leftIcon={SkipForward}
            onClick={skipCurrentExercise}
          >
            Skip
          </Button>
        </div>
      </Card>

      {/* Remaining Exercises List Preview */}
      <div className="space-y-2">
        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Upcoming Exercises</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {currentPlan.exercises.slice(activeExerciseIndex + 1).map(ex => (
            <div key={ex.id} className="p-3.5 rounded-xl bg-[#101221]/70 border border-slate-800/80 text-xs flex items-center justify-between hover:border-[#00f2ff]/30 transition-colors">
              <span className="font-bold text-slate-200">{ex.name}</span>
              <span className="text-slate-400 font-medium">{ex.sets} × {ex.reps}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Camera Viewfinder Modal */}
      <Modal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        title="Live Workout Camera Feed"
        description={`AI Pose Tracker for ${currentExercise.name}`}
        maxWidth="max-w-3xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCameraModalOpen(false);
                navigate('/live-counter');
              }}
            >
              Open Fullscreen Counter Page
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCameraModalOpen(false)}
            >
              Close Camera
            </Button>
          </div>
        }
      >
        <CameraViewfinder
          activeExerciseName={currentExercise.name}
          targetReps={currentExercise.reps}
        />
      </Modal>
    </div>
  );
};

