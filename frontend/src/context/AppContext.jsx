import React, { createContext, useContext, useState } from 'react';
import {
  initialUserProfile,
  initialDailyContext,
  todayWorkoutPlan,
  progressData,
  adaptiveInsights,
  strategyHealthData,
  decisionHistoryList,
  activeExperiments,
  mockCoachResponses
} from '../data';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(initialUserProfile);
  const [dailyContext, setDailyContext] = useState(initialDailyContext);
  const [currentPlan, setCurrentPlan] = useState(todayWorkoutPlan);
  const [progress, setProgress] = useState(progressData);
  const [insights] = useState(adaptiveInsights);
  const [strategyHealth] = useState(strategyHealthData);
  const [decisions, setDecisions] = useState(decisionHistoryList);
  const [experiments] = useState(activeExperiments);
  const [completedSummary, setCompletedSummary] = useState(null);

  // Active workout state
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [activeSet, setActiveSet] = useState(1);
  const [completedExerciseIds, setCompletedExerciseIds] = useState([]);

  // Coach Messages
  const [coachMessages, setCoachMessages] = useState([
    {
      id: 'msg_1',
      sender: 'ai',
      text: 'Hello Alex! I am your FITMINDS AI Coach. How can I help you understand or adapt your fitness strategy today?',
      time: 'Just now'
    }
  ]);

  // Method to update Daily Check-in
  const updateDailyCheckin = ({ energy, readiness, availableTime, academicLoad, notes }) => {
    const timeNum = parseInt(availableTime) || 20;
    
    setDailyContext(prev => ({
      ...prev,
      energyLevel: energy || prev.energyLevel,
      readiness: readiness || prev.readiness,
      availableTimeMinutes: timeNum,
      academicLoad: academicLoad || prev.academicLoad,
      lastCheckinTime: 'Just updated',
      contextSummary: `FITMINDS adapted today's session for your ${timeNum}-min window & ${academicLoad || 'moderate'} academic load.`,
    }));

    // Adjust plan duration dynamically
    setCurrentPlan(prev => ({
      ...prev,
      durationMinutes: timeNum,
      status: 'Adapted',
    }));

    // Add entry to Decision History
    const newDecision = {
      id: `dec_${Date.now()}`,
      date: 'TODAY — Just now',
      title: `Plan Adapted to ${timeNum} Minutes`,
      badge: 'CHECK-IN ADAPTATION',
      badgeVariant: 'brand',
      reason: `User submitted check-in: ${energy} energy, ${academicLoad} workload.`,
      whatChanged: `Adjusted plan duration to ${timeNum} min and updated exercise rep target.`,
      whyItChanged: 'Adaptive check-in prioritizes realistic student completion.',
      signalsInfluenced: [`Available time: ${timeNum} min`, `Energy: ${energy}`, `Academic load: ${academicLoad}`],
      outcome: 'New plan ready for completion.',
    };

    setDecisions(prev => [newDecision, ...prev]);
  };

  // Method to manually adjust plan
  const applyPlanAdjustment = (preset) => {
    setCurrentPlan(prev => ({
      ...prev,
      durationMinutes: preset.reducedDuration,
      status: 'Manually Adjusted',
    }));

    const newDecision = {
      id: `dec_${Date.now()}`,
      date: 'TODAY — Manual Adjustment',
      title: `Workout Adjusted (${preset.reducedDuration} min)`,
      badge: 'USER PRESET',
      badgeVariant: 'reduced',
      reason: preset.label,
      whatChanged: preset.description,
      whyItChanged: 'User requested immediate workload modification.',
      signalsInfluenced: [`Manual preset: ${preset.label}`],
      outcome: 'Workout modified.',
    };

    setDecisions(prev => [newDecision, ...prev]);
  };

  // Method to complete set / exercise
  const completeCurrentSet = () => {
    const currentEx = currentPlan.exercises[activeExerciseIndex];
    if (!currentEx) return;

    if (activeSet < currentEx.sets) {
      setActiveSet(prev => prev + 1);
    } else {
      // Finished exercise
      setCompletedExerciseIds(prev => [...prev, currentEx.id]);
      if (activeExerciseIndex < currentPlan.exercises.length - 1) {
        setActiveExerciseIndex(prev => prev + 1);
        setActiveSet(1);
      }
    }
  };

  // Method to skip exercise
  const skipCurrentExercise = () => {
    if (activeExerciseIndex < currentPlan.exercises.length - 1) {
      setActiveExerciseIndex(prev => prev + 1);
      setActiveSet(1);
    }
  };

  // Method to finish workout session
  const finishWorkout = (feelRating = 'Good', notes = '') => {
    const summary = {
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: currentPlan.durationMinutes,
      exercisesCompletedCount: completedExerciseIds.length + 1,
      totalSetsCompleted: (completedExerciseIds.length + 1) * 3,
      totalRepsCount: 110,
      feelRating,
      notes,
    };

    setCompletedSummary(summary);

    // Update streak & stats
    setProgress(prev => ({
      ...prev,
      currentStreakDays: prev.currentStreakDays + 1,
      totalSessionsCompleted: prev.totalSessionsCompleted + 1,
    }));
  };

  // Method to send coach message
  const sendCoachMessage = (userText) => {
    const userMsg = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: userText,
      time: 'Just now'
    };

    const replyText = mockCoachResponses[userText] || 
      `FITMINDS analyzed your question about "${userText}". Based on your recent consistency data (4-day streak, 20-min average duration), keeping your sessions flexible around your student schedule continues to be your optimal strategy.`;

    const aiMsg = {
      id: `msg_${Date.now()}_ai`,
      sender: 'ai',
      text: replyText,
      time: 'Just now'
    };

    setCoachMessages(prev => [...prev, userMsg, aiMsg]);
  };

  // Reset workout state
  const resetWorkoutState = () => {
    setActiveExerciseIndex(0);
    setActiveSet(1);
    setCompletedExerciseIds([]);
  };

  return (
    <AppContext.Provider value={{
      userProfile,
      setUserProfile,
      dailyContext,
      updateDailyCheckin,
      currentPlan,
      applyPlanAdjustment,
      progress,
      insights,
      strategyHealth,
      decisions,
      experiments,
      completedSummary,
      activeExerciseIndex,
      activeSet,
      completedExerciseIds,
      completeCurrentSet,
      skipCurrentExercise,
      finishWorkout,
      resetWorkoutState,
      coachMessages,
      sendCoachMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
