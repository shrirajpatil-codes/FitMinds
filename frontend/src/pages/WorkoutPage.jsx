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
  Clock,
  Save,
  Sparkles
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

  const [cameraReps, setCameraReps] = useState(0);
  const [lastCvMetrics, setLastCvMetrics] = useState(null);
  const [lastLoggedCameraSummary, setLastLoggedCameraSummary] = useState(null);

  const handleCameraRepDetected = (cvResult) => {
    if (cvResult && typeof cvResult.reps === 'number') {
      setCameraReps(cvResult.reps);
      setLastCvMetrics(cvResult);
    } else {
      setCameraReps(prev => prev + 1);
    }
  };

  // Save Camera Reps & Close Modal
  const handleSaveCameraReps = () => {
    const loggedReps = cameraReps > 0 ? cameraReps : (typeof currentExercise.reps === 'number' ? currentExercise.reps : 12);
    const summary = {
      reps: loggedReps,
      exerciseName: currentExercise.name,
      formScore: lastCvMetrics?.formScore || 96,
      depth: lastCvMetrics?.depth || 'Optimal',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLastLoggedCameraSummary(summary);
    setIsCameraModalOpen(false);

    // Auto advance/complete set
    if (isLastExercise || (activeExerciseIndex >= totalExercises - 1 && activeSet >= currentExercise.sets)) {
      const summaryData = {
        totalRepsCount: loggedReps,
        cameraRepsCount: loggedReps,
        exerciseName: currentExercise.name,
        formScore: summary.formScore,
        depthRating: summary.depth,
        rom: lastCvMetrics?.rom || 125,
      };
      finishWorkout('Good', summaryData);
      navigate('/session-summary');
    } else {
      completeCurrentSet(currentExercise.sets);
    }
  };

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
      const summaryData = {
        totalRepsCount: cameraReps > 0 ? cameraReps : (totalExercises * 10),
        cameraRepsCount: cameraReps > 0 ? cameraReps : (totalExercises * 10),
        exerciseName: currentExercise.name,
        formScore: lastCvMetrics?.formScore || 96,
        depthRating: lastCvMetrics?.depth || 'Optimal',
        rom: lastCvMetrics?.rom || 125,
      };
      finishWorkout('Good', summaryData);
      navigate('/session-summary');
    } else {
      completeCurrentSet(currentExercise.sets);
    }
  };

  const handleFinishEarly = () => {
    const summaryData = {
      totalRepsCount: cameraReps > 0 ? cameraReps : (activeExerciseIndex + 1) * 8,
      cameraRepsCount: cameraReps > 0 ? cameraReps : (activeExerciseIndex + 1) * 8,
      exerciseName: currentExercise.name,
      formScore: lastCvMetrics?.formScore || 94,
      depthRating: lastCvMetrics?.depth || 'Optimal',
      rom: lastCvMetrics?.rom || 120,
    };
    finishWorkout('Good', summaryData);
    navigate('/session-summary');
  };

  const formattedRestTime = `00:${restSeconds < 10 ? '0' : ''}${restSeconds}`;
  const overallProgress = Math.round(((activeExerciseIndex + (activeSet / currentExercise.sets)) / totalExercises) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Session Status Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold text-brand uppercase tracking-wider">ACTIVE WORKOUT</span>
          <h2 className="text-lg font-bold text-slate-100">{currentPlan.title}</h2>
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

      {/* Camera Logged Short Summary Notification */}
      {lastLoggedCameraSummary && (
        <div className="p-4 rounded-2xl bg-cyan-950/40 border border-brand/40 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-brand">
              <Sparkles className="w-4 h-4 text-brand animate-pulse" />
              <span>Camera Logged Result ({lastLoggedCameraSummary.exerciseName})</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Saved {lastLoggedCameraSummary.timestamp}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-200 gap-2 font-medium">
            <span>Counted Reps: <strong className="text-brand text-sm">{lastLoggedCameraSummary.reps} Reps</strong></span>
            <span>Form Accuracy: <strong className="text-emerald-400">{lastLoggedCameraSummary.formScore}%</strong></span>
            <span>Pose Depth: <strong className="text-cyan-300">{lastLoggedCameraSummary.depth}</strong></span>
          </div>
        </div>
      )}

      {/* Main Focus Card */}
      <Card variant="highlighted" className="p-6 md:p-8 space-y-6 text-center">
        {/* Exercise Header */}
        <div className="space-y-2">
          <Badge variant="brand" size="md">
            EXERCISE {activeExerciseIndex + 1} OF {totalExercises}
          </Badge>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
            {currentExercise.name}
          </h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {currentExercise.instructions}
          </p>
        </div>

        {/* Set & Rep Focus Display */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">SET</span>
            <div className="text-2xl font-black text-brand mt-1">
              {activeSet} <span className="text-sm font-normal text-slate-400">/ {currentExercise.sets}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">TARGET REPS</span>
            <div className="text-2xl font-black text-slate-100 mt-1">
              {currentExercise.reps}
            </div>
          </div>
        </div>

        {/* Rest Timer Card */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 max-w-xs mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-brand" />
            <span>Rest Interval</span>
          </div>
          <span className="font-mono text-lg font-bold text-slate-200">{formattedRestTime}</span>
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
        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming Exercises</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {currentPlan.exercises.slice(activeExerciseIndex + 1).map(ex => (
            <div key={ex.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
              <span className="font-medium text-slate-300">{ex.name}</span>
              <span className="text-slate-500">{ex.sets} × {ex.reps}</span>
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
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2">
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
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsCameraModalOpen(false)}
              >
                Close Camera
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={Save}
                onClick={handleSaveCameraReps}
              >
                Save & Log Reps ({cameraReps || currentExercise.reps || 12})
              </Button>
            </div>
          </div>
        }
      >
        <CameraViewfinder
          activeExerciseName={currentExercise.name}
          targetReps={currentExercise.reps}
          onRepDetected={handleCameraRepDetected}
          autoStart={true}
        />
      </Modal>
    </div>
  );
};


