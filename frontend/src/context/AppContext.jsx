import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
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
  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('FITMINDS_TOKEN') || null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Application Data State
  const [userProfile, setUserProfile] = useState(initialUserProfile);
  const [dailyContext, setDailyContext] = useState(initialDailyContext);
  const [currentPlan, setCurrentPlan] = useState(todayWorkoutPlan);
  const [progress, setProgress] = useState(progressData);
  const [insights, setInsights] = useState(adaptiveInsights);
  const [strategyHealth, setStrategyHealth] = useState(strategyHealthData);
  const [decisions, setDecisions] = useState(decisionHistoryList);
  const [experiments, setExperiments] = useState(activeExperiments);
  const [reflections, setReflections] = useState([]);
  const [completedSummary, setCompletedSummary] = useState(null);

  // Active workout execution state
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [activeSet, setActiveSet] = useState(1);
  const [completedExerciseIds, setCompletedExerciseIds] = useState([]);

  // Coach Messages
  const [coachMessages, setCoachMessages] = useState([
    {
      id: 'msg_1',
      sender: 'ai',
      text: 'Hello! I am your FITMINDS AI Coach. How can I help you understand or adapt your fitness strategy today?',
      time: 'Just now'
    }
  ]);

  // Load all user data from backend APIs
  const refreshUserData = useCallback(async () => {
    if (!localStorage.getItem('FITMINDS_TOKEN')) return;
    try {
      // 1. Me & Profile
      const meRes = await api.auth.me();
      if (meRes.success && meRes.data) {
        setCurrentUser(meRes.data);
        if (meRes.data.profile) {
          const p = meRes.data.profile;
          setUserProfile(prev => ({
            ...prev,
            name: meRes.data.name || prev.name,
            email: meRes.data.email || prev.email,
            age: p.age || prev.age,
            fitnessLevel: p.fitnessExperience || prev.fitnessLevel,
            goal: p.fitnessGoal || prev.goal,
            availableTimeMinutes: p.availableWorkoutTime || prev.availableTimeMinutes,
            workoutWindow: p.preferredWorkoutWindow || prev.workoutWindow,
            equipment: p.equipment || prev.equipment,
            lifestyleLoad: p.lifestyleLoad || prev.lifestyleLoad,
            onboardingCompleted: p.onboardingCompleted,
          }));
        }
      }

      // 2. Today's Workout Plan
      try {
        const planRes = await api.workouts.today();
        if (planRes.success && planRes.data) {
          const planData = planRes.data;
          let parsedExercises = planData.exercises;
          if (typeof parsedExercises === 'string') {
            try { parsedExercises = JSON.parse(parsedExercises); } catch (e) {}
          }
          setCurrentPlan({
            id: planData.id,
            title: planData.title,
            durationMinutes: planData.durationMinutes,
            difficulty: planData.difficulty,
            goal: planData.goal,
            status: planData.status,
            source: planData.source,
            exercises: Array.isArray(parsedExercises) ? parsedExercises : todayWorkoutPlan.exercises,
          });
        }
      } catch (e) {
        console.warn('Workout fetch error:', e.message);
      }

      // 3. Today's Checkin
      try {
        const checkinRes = await api.checkins.today();
        if (checkinRes.success && checkinRes.data) {
          const c = checkinRes.data;
          setDailyContext(prev => ({
            ...prev,
            energyLevel: c.energyLevel,
            readiness: c.readinessLevel,
            availableTimeMinutes: c.availableTimeMinutes,
            academicLoad: c.academicLoad,
            lastCheckinTime: 'Today',
            contextSummary: `FITMINDS adapted today's session for your ${c.availableTimeMinutes}-min window & ${c.academicLoad.toLowerCase()} academic load.`,
          }));
        }
      } catch (e) {
        console.warn('Checkin fetch error:', e.message);
      }

      // 4. Progress Summary
      try {
        const progRes = await api.progress.summary();
        if (progRes.success && progRes.data) {
          const p = progRes.data;
          setProgress(prev => ({
            ...prev,
            workoutsPlanned: p.workoutsPlanned,
            workoutsCompleted: p.workoutsCompleted,
            workoutsSkipped: p.workoutsSkipped,
            modifiedSessions: p.modifiedSessions,
            completionPercentage: p.completionPercentage,
            averageDurationMinutes: p.averageDurationMinutes,
            currentStreakDays: p.currentStreakDays,
            totalSessionsCompleted: p.totalSessionsCompleted,
          }));
        }
      } catch (e) {
        console.warn('Progress fetch error:', e.message);
      }

      // 5. Strategy Health
      try {
        const stratRes = await api.strategy.health();
        if (stratRes.success && stratRes.data) {
          const s = stratRes.data;
          setStrategyHealth(prev => ({
            ...prev,
            healthStatus: s.status,
            sustainabilityScore: s.sustainabilityScore,
            metrics: {
              completionRate: s.completionRate,
              modificationRate: s.modificationRate,
              skipRate: s.skipRate,
              avgDuration: s.averageDurationMinutes,
            },
            notes: s.recommendation,
          }));
        }
      } catch (e) {
        console.warn('Strategy fetch error:', e.message);
      }

      // 6. Decision History
      try {
        const decRes = await api.decisions.list();
        if (decRes.success && Array.isArray(decRes.data) && decRes.data.length > 0) {
          setDecisions(decRes.data.map(d => ({
            id: d.id,
            date: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            title: d.decisionType.replace(/_/g, ' '),
            badge: d.decisionType,
            badgeVariant: 'brand',
            reason: d.reason || 'Automated adaptation',
            whatChanged: `Changed from ${d.previousValue || 'N/A'} to ${d.newValue || 'N/A'}`,
            whyItChanged: d.reason || 'Optimized for student schedule',
            signalsInfluenced: Array.isArray(d.signals) ? d.signals : [d.reason || 'Check-in signal'],
            outcome: d.outcome || 'Updated plan',
          })));
        }
      } catch (e) {
        console.warn('Decisions fetch error:', e.message);
      }

      // 7. Experiments
      try {
        const expRes = await api.experiments.list();
        if (expRes.success && Array.isArray(expRes.data) && expRes.data.length > 0) {
          setExperiments(expRes.data.map(e => ({
            id: e.id,
            title: e.name,
            status: e.status,
            hypothesis: e.hypothesis,
            baseline: e.baselineStrategy,
            variant: e.testStrategy,
            metrics: e.metrics || { completionRate: 90 },
            outcome: e.outcome || 'Ongoing',
          })));
        }
      } catch (e) {
        console.warn('Experiments fetch error:', e.message);
      }

      // 8. Reflections
      try {
        const refRes = await api.reflections.list();
        if (refRes.success && Array.isArray(refRes.data)) {
          setReflections(refRes.data);
        }
      } catch (e) {
        console.warn('Reflections fetch error:', e.message);
      }
    } catch (err) {
      console.error('Failed to load user data:', err);
    }
  }, []);

  // Check auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('FITMINDS_TOKEN');
      if (storedToken) {
        try {
          const res = await api.auth.me();
          if (res.success && res.data) {
            setCurrentUser(res.data);
            setToken(storedToken);
            await refreshUserData();
          } else {
            localStorage.removeItem('FITMINDS_TOKEN');
            setToken(null);
            setCurrentUser(null);
          }
        } catch (err) {
          localStorage.removeItem('FITMINDS_TOKEN');
          setToken(null);
          setCurrentUser(null);
        }
      }
      setIsLoadingAuth(false);
    };
    initAuth();
  }, [refreshUserData]);

  // Auth Methods
  const registerUser = async (name, email, password) => {
    setAuthError(null);
    try {
      const res = await api.auth.register(name, email, password);
      if (res.success && res.data) {
        const { token: newToken, user } = res.data;
        localStorage.setItem('FITMINDS_TOKEN', newToken);
        setToken(newToken);
        setCurrentUser(user);
        await refreshUserData();
        return { success: true, user };
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
      return { success: false, error: err.message };
    }
  };

  const loginUser = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.auth.login(email, password);
      if (res.success && res.data) {
        const { token: newToken, user } = res.data;
        localStorage.setItem('FITMINDS_TOKEN', newToken);
        setToken(newToken);
        setCurrentUser(user);
        await refreshUserData();
        return { success: true, user };
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid email or password.');
      return { success: false, error: err.message };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('FITMINDS_TOKEN');
    setToken(null);
    setCurrentUser(null);
  };

  // Update Profile Data in Backend
  const updateProfileData = async (profileFields) => {
    try {
      const res = await api.profile.update(profileFields);
      if (res.success && res.data) {
        const p = res.data;
        setUserProfile(prev => ({
          ...prev,
          age: p.age !== null ? p.age : prev.age,
          fitnessLevel: p.fitnessExperience || prev.fitnessLevel,
          goal: p.fitnessGoal || prev.goal,
          availableTimeMinutes: p.availableWorkoutTime || prev.availableTimeMinutes,
          workoutWindow: p.preferredWorkoutWindow || prev.workoutWindow,
          equipment: p.equipment || prev.equipment,
          lifestyleLoad: p.lifestyleLoad || prev.lifestyleLoad,
          onboardingCompleted: p.onboardingCompleted,
        }));
        if (currentUser) {
          setCurrentUser(prev => ({
            ...prev,
            onboardingCompleted: p.onboardingCompleted,
          }));
        }
        return { success: true };
      }
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, error: err.message };
    }
  };

  // Onboarding Complete
  const saveOnboardingProfile = async (onboardingData) => {
    return await updateProfileData({
      ...onboardingData,
      onboardingCompleted: true,
    });
  };

  // Method to update Daily Check-in
  const updateDailyCheckin = async ({ energy, readiness, availableTime, academicLoad, notes }) => {
    const timeNum = parseInt(availableTime, 10) || 20;
    
    // UI optimistic update
    setDailyContext(prev => ({
      ...prev,
      energyLevel: energy || prev.energyLevel,
      readiness: readiness || prev.readiness,
      availableTimeMinutes: timeNum,
      academicLoad: academicLoad || prev.academicLoad,
      lastCheckinTime: 'Just updated',
      contextSummary: `FITMINDS adapted today's session for your ${timeNum}-min window & ${academicLoad || 'moderate'} academic load.`,
    }));

    setCurrentPlan(prev => ({
      ...prev,
      durationMinutes: timeNum,
      status: 'Adapted',
    }));

    // API Call
    try {
      await api.checkins.create({
        energyLevel: energy || 3,
        readinessLevel: readiness || 3,
        availableTimeMinutes: timeNum,
        academicLoad: academicLoad ? academicLoad.toUpperCase() : 'MODERATE',
        note: notes || '',
      });
      await refreshUserData();
    } catch (err) {
      console.error('Checkin API error:', err);
    }
  };

  // Method to manually adjust plan
  const applyPlanAdjustment = async (preset) => {
    const reducedDuration = preset.reducedDuration || 15;
    
    setCurrentPlan(prev => ({
      ...prev,
      durationMinutes: reducedDuration,
      status: 'Manually Adjusted',
    }));

    if (currentPlan?.id) {
      try {
        await api.workouts.modify(currentPlan.id, {
          durationMinutes: reducedDuration,
          label: preset.label || 'Manual preset',
          reason: preset.description || 'User applied workout modification preset.',
        });
        await refreshUserData();
      } catch (err) {
        console.error('Modify workout API error:', err);
      }
    }
  };

  // Start workout
  const startWorkoutSession = async () => {
    if (currentPlan?.id) {
      try {
        const res = await api.workouts.start(currentPlan.id);
        if (res.success && res.data?.session) {
          setActiveSessionId(res.data.session.id);
        }
      } catch (err) {
        console.warn('Start workout session API warning:', err);
      }
    }
  };

  // Method to complete set / exercise
  const completeCurrentSet = () => {
    const currentEx = currentPlan.exercises[activeExerciseIndex];
    if (!currentEx) return;

    if (activeSet < currentEx.sets) {
      setActiveSet(prev => prev + 1);
    } else {
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
  const finishWorkout = async (feelRating = 'Good', notes = '') => {
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

    // Call API if session exists or complete current plan
    if (activeSessionId) {
      try {
        const feedbackEnumMap = {
          'Easy': 'EASY',
          'Good': 'GOOD',
          'Challenging': 'CHALLENGING',
          'Too Difficult': 'TOO_DIFFICULT',
        };
        await api.sessions.complete(activeSessionId, {
          actualDurationMinutes: currentPlan.durationMinutes,
          exercisesCompleted: completedExerciseIds.length + 1,
          setsCompleted: (completedExerciseIds.length + 1) * 3,
          repsCompleted: 110,
          completionPercentage: 100,
          notes,
        });
        await api.sessions.feedback(activeSessionId, {
          feedback: feedbackEnumMap[feelRating] || 'GOOD',
          notes,
        });
      } catch (err) {
        console.error('Session complete API error:', err);
      }
    } else if (currentPlan?.id) {
      try {
        await api.workouts.complete(currentPlan.id);
      } catch (err) {
        console.error('Workout complete API error:', err);
      }
    }

    await refreshUserData();
  };

  // Method to submit weekly reflection
  const submitReflection = async ({ rating, easier, difficulty, desiredChange, note }) => {
    try {
      await api.reflections.create({
        consistencyRating: rating || 4,
        easierFactors: easier || '',
        difficultyFactors: difficulty || '',
        desiredStrategyChange: desiredChange || '',
        note: note || '',
      });
      await refreshUserData();
    } catch (err) {
      console.error('Submit reflection API error:', err);
    }
  };

  // Method to submit experiment
  const createExperiment = async (expData) => {
    try {
      await api.experiments.create(expData);
      await refreshUserData();
    } catch (err) {
      console.error('Create experiment API error:', err);
    }
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
      `FITMINDS analyzed your question about "${userText}". Based on your recent consistency data (${progress.currentStreakDays}-day streak, ${progress.averageDurationMinutes}-min average duration), keeping your sessions flexible around your student schedule continues to be your optimal strategy.`;

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
    setActiveSessionId(null);
    setActiveExerciseIndex(0);
    setActiveSet(1);
    setCompletedExerciseIds([]);
  };

  return (
    <AppContext.Provider value={{
      token,
      currentUser,
      isAuthenticated: !!token && !!currentUser,
      isLoadingAuth,
      authError,
      loginUser,
      registerUser,
      logoutUser,
      updateProfileData,
      saveOnboardingProfile,
      userProfile,
      setUserProfile,
      dailyContext,
      updateDailyCheckin,
      currentPlan,
      applyPlanAdjustment,
      startWorkoutSession,
      progress,
      insights,
      strategyHealth,
      decisions,
      experiments,
      reflections,
      submitReflection,
      createExperiment,
      completedSummary,
      activeExerciseIndex,
      activeSet,
      completedExerciseIds,
      completeCurrentSet,
      skipCurrentExercise,
      finishWorkout,
      resetWorkoutState,
      coachMessages,
      sendCoachMessage,
      refreshUserData,
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
