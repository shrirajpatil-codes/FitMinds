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
  const [token, setToken] = useState(() => localStorage.getItem('FITMIRROR_TOKEN') || localStorage.getItem('FITMINDS_TOKEN') || null);
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

  // ML Workout Recommendation State
  const [mlRecommendation, setMlRecommendation] = useState(null);
  const [isLoadingMlRec, setIsLoadingMlRec] = useState(false);

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
      text: 'Hello! I am your FitMirror AI Coach. How can I help you understand or adapt your fitness strategy today?',
      time: 'Just now'
    }
  ]);

  // Method to fetch ML Recommendation
  const fetchMlRecommendation = useCallback(async () => {
    if (!localStorage.getItem('FITMIRROR_TOKEN') && !localStorage.getItem('FITMINDS_TOKEN')) return;
    setIsLoadingMlRec(true);
    try {
      const res = await api.recommendations.getWorkout();
      if (res.success && res.data) {
        setMlRecommendation(res.data);
      }
    } catch (err) {
      console.warn('ML recommendation fetch error:', err.message);
    } finally {
      setIsLoadingMlRec(false);
    }
  }, []);

  // Load all user data from backend APIs
  const refreshUserData = useCallback(async () => {
    if (!localStorage.getItem('FITMIRROR_TOKEN') && !localStorage.getItem('FITMINDS_TOKEN')) return;
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
            heightCm: p.heightCm || prev.heightCm || 175,
            weightKg: p.weightKg || prev.weightKg || 70,
            targetWeightKg: p.targetWeightKg || prev.targetWeightKg || 65,
            bmi: p.bmi || prev.bmi || 22.86,
            bmiCategory: p.bmiCategory || prev.bmiCategory || 'Normal weight',
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
            contextSummary: `FitMirror AI adapted today's session for your ${c.availableTimeMinutes}-min window & ${c.academicLoad.toLowerCase()} academic load.`,
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

      // 5. ML Workout Recommendation
      fetchMlRecommendation();

    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  }, [fetchMlRecommendation]);

  // Initial Auth check
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('FITMIRROR_TOKEN') || localStorage.getItem('FITMINDS_TOKEN');
      if (!storedToken) {
        setIsLoadingAuth(false);
        return;
      }
      try {
        await refreshUserData();
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('FITMIRROR_TOKEN');
        localStorage.removeItem('FITMINDS_TOKEN');
        setToken(null);
        setCurrentUser(null);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initAuth();
  }, [refreshUserData]);

  // Authentication Handlers
  const loginUser = async (email, password) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const res = await api.auth.login(email, password);
      if (res.success && res.data?.token) {
        localStorage.setItem('FITMIRROR_TOKEN', res.data.token);
        setToken(res.data.token);
        setCurrentUser(res.data.user);
        await refreshUserData();
        return { success: true };
      } else {
        throw new Error(res.message || 'Login failed');
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid credentials');
      return { success: false, message: err.message };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const registerUser = async (name, email, password, extraProfileData = {}) => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const res = await api.auth.register(name, email, password, extraProfileData);
      if (res.success && res.data?.token) {
        localStorage.setItem('FITMIRROR_TOKEN', res.data.token);
        setToken(res.data.token);
        setCurrentUser(res.data.user);
        await refreshUserData();
        return { success: true };
      } else {
        throw new Error(res.message || 'Registration failed');
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      return { success: false, message: err.message };
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('FITMIRROR_TOKEN');
    localStorage.removeItem('FITMINDS_TOKEN');
    setToken(null);
    setCurrentUser(null);
  };

  // Method to update user profile
  const updateProfileData = async (updatedFields) => {
    setUserProfile(prev => ({ ...prev, ...updatedFields }));
    try {
      const res = await api.profile.update({
        fitnessGoal: updatedFields.goal || userProfile.goal,
        fitnessExperience: updatedFields.fitnessLevel || userProfile.fitnessLevel,
        availableWorkoutTime: parseInt(updatedFields.availableTimeMinutes || userProfile.availableTimeMinutes, 10),
        preferredWorkoutWindow: updatedFields.workoutWindow || userProfile.workoutWindow,
        equipment: updatedFields.equipment || userProfile.equipment,
        lifestyleLoad: updatedFields.lifestyleLoad || userProfile.lifestyleLoad,
        age: parseInt(updatedFields.age || userProfile.age, 10),
        heightCm: updatedFields.heightCm !== undefined ? parseFloat(updatedFields.heightCm) : userProfile.heightCm,
        weightKg: updatedFields.weightKg !== undefined ? parseFloat(updatedFields.weightKg) : userProfile.weightKg,
        targetWeightKg: updatedFields.targetWeightKg !== undefined ? parseFloat(updatedFields.targetWeightKg) : userProfile.targetWeightKg,
      });

      if (res.success && res.data) {
        setUserProfile(prev => ({
          ...prev,
          heightCm: res.data.heightCm,
          weightKg: res.data.weightKg,
          targetWeightKg: res.data.targetWeightKg,
          bmi: res.data.bmi,
          bmiCategory: res.data.bmiCategory,
        }));
      }

      fetchMlRecommendation();
    } catch (e) {
      console.warn('Backend profile update failed:', e.message);
    }
  };

  // Method to save onboarding data
  const saveOnboardingProfile = async (onboardingData) => {
    const formatted = {
      goal: onboardingData.fitnessGoal,
      fitnessLevel: onboardingData.fitnessExperience,
      availableTimeMinutes: onboardingData.availableWorkoutTime,
      workoutWindow: onboardingData.preferredWorkoutWindow,
      equipment: onboardingData.equipment || 'NONE',
      lifestyleLoad: onboardingData.lifestyleLoad || 'MODERATE',
      onboardingCompleted: true,
    };
    await updateProfileData(formatted);
  };

  // Method to handle Daily Check-in submission
  const updateDailyCheckin = async (checkinData) => {
    setDailyContext(prev => ({
      ...prev,
      availableTimeMinutes: checkinData.timeAvailable,
      energyLevel: checkinData.energyLevel,
      readiness: checkinData.energyLevel >= 4 ? 'READY' : checkinData.energyLevel === 3 ? 'MODERATE' : 'RECOVERY',
      lastCheckinTime: 'Just now',
      contextSummary: `FitMirror AI adapted today's session for your ${checkinData.timeAvailable}-min window & ${dailyContext.academicLoad.toLowerCase()} academic load.`,
    }));

    try {
      await api.checkins.create({
        energyLevel: parseInt(checkinData.energyLevel, 10),
        readinessLevel: checkinData.energyLevel >= 4 ? 4 : checkinData.energyLevel === 3 ? 3 : 2,
        availableTimeMinutes: parseInt(checkinData.timeAvailable, 10),
        academicLoad: dailyContext.academicLoad || 'MODERATE',
        note: checkinData.note || '',
      });
    } catch (e) {
      console.warn('Backend checkin create error:', e.message);
    }

    // Adapt current plan duration
    if (checkinData.timeAvailable < currentPlan.durationMinutes) {
      setCurrentPlan(prev => ({
        ...prev,
        title: `Express ${checkinData.timeAvailable}-Min Session`,
        durationMinutes: checkinData.timeAvailable,
        source: 'ADAPTED',
      }));
    }

    // Refresh ML Recommendation & Activity Heatmap
    fetchMlRecommendation();
    window.dispatchEvent(new Event('fitminds_activity_updated'));
  };

  // Method to adjust plan manually
  const applyPlanAdjustment = (presetParam) => {
    let preset = presetParam;
    if (typeof presetParam === 'string') {
      const presetMap = {
        'less_time': 'adj_time',
        'lower_intensity': 'adj_energy',
        'change_focus': 'adj_academic'
      };
      const presetId = presetMap[presetParam] || presetParam;
      preset = workoutAdjustmentPresets.find(p => p.id === presetId) || workoutAdjustmentPresets[0];
    }

    if (preset) {
      setCurrentPlan(prev => ({
        ...prev,
        title: preset.title || prev.title,
        durationMinutes: preset.reducedDuration || prev.durationMinutes,
        targetFocus: preset.targetFocus || prev.targetFocus,
        exercises: preset.exercises && preset.exercises.length > 0 ? preset.exercises : prev.exercises,
        source: 'ADAPTED'
      }));
      setActiveExerciseIndex(0);
      setActiveSet(1);
      setCompletedExerciseIds([]);
    }
  };

  // Start workout session
  const startWorkoutSession = async (workoutId = null) => {
    resetWorkoutState();
    try {
      const targetId = workoutId || currentPlan.id;
      const res = await api.sessions.start(targetId);
      if (res.success && res.data) {
        setActiveSessionId(res.data.id);
        window.dispatchEvent(new Event('fitminds_activity_updated'));
      }
    } catch (e) {
      console.warn('Session start API error:', e.message);
      setActiveSessionId(`session_${Date.now()}`);
    }
  };

  // Submit Reflection
  const submitReflection = async (refData) => {
    try {
      await api.reflections.create(refData);
      setReflections(prev => [refData, ...prev]);
      window.dispatchEvent(new Event('fitminds_activity_updated'));
    } catch (e) {
      console.warn('Reflection API error:', e.message);
    }
  };

  // Create Experiment
  const createExperiment = async (expData) => {
    try {
      const res = await api.experiments.create(expData);
      if (res.success) {
        setExperiments(prev => [res.data, ...prev]);
        window.dispatchEvent(new Event('fitminds_activity_updated'));
      }
    } catch (e) {
      console.warn('Experiment API error:', e.message);
    }
  };

  // Workout Execution state setters
  const completeCurrentSet = (totalSetsParam) => {
    const exerciseList = currentPlan?.exercises || todayWorkoutPlan.exercises;
    const currentEx = exerciseList[activeExerciseIndex] || exerciseList[0];
    const totalSets = totalSetsParam || currentEx?.sets || 3;

    if (activeSet < totalSets) {
      setActiveSet(prev => prev + 1);
    } else {
      setCompletedExerciseIds(prev => [...prev, activeExerciseIndex]);
      setActiveSet(1);
      setActiveExerciseIndex(prev => Math.min(prev + 1, exerciseList.length - 1));
    }
  };

  const skipCurrentExercise = () => {
    const exerciseList = currentPlan?.exercises || todayWorkoutPlan.exercises;
    setCompletedExerciseIds(prev => [...prev, activeExerciseIndex]);
    setActiveSet(1);
    setActiveExerciseIndex(prev => Math.min(prev + 1, exerciseList.length - 1));
  };

  const finishWorkout = async (feedback = 'GOOD', extraDetails = {}) => {
    const totalPlanExercises = currentPlan?.exercises?.length || 3;
    const completedCount = Math.min(completedExerciseIds.length + 1, totalPlanExercises);
    const summary = {
      completedAt: 'Just now',
      durationMinutes: currentPlan.durationMinutes,
      exercisesCompletedCount: completedCount,
      totalSetsCompleted: completedCount * 3,
      totalRepsCount: completedCount * 30,
      streakUpdated: progress.currentStreakDays + 1,
      feedback,
      ...(typeof extraDetails === 'object' ? extraDetails : {})
    };
    setCompletedSummary(summary);

    if (activeSessionId) {
      try {
        await api.sessions.complete(activeSessionId, {
          actualDurationMinutes: currentPlan.durationMinutes,
          exercisesCompleted: summary.exercisesCompletedCount,
          setsCompleted: summary.totalSetsCompleted,
          repsCompleted: summary.totalRepsCount,
          completionPercentage: 100.0
        });

        await api.sessions.feedback(activeSessionId, { userFeedback: feedback });
      } catch (e) {
        console.warn('Session completion API error:', e.message);
      }
    }

    setProgress(prev => ({
      ...prev,
      currentStreakDays: prev.currentStreakDays + 1,
      workoutsCompleted: prev.workoutsCompleted + 1,
      totalSessionsCompleted: prev.totalSessionsCompleted + 1,
      weeklyCompletedSessions: Math.min(prev.weeklyTargetSessions, prev.weeklyCompletedSessions + 1)
    }));

    window.dispatchEvent(new Event('fitminds_activity_updated'));

    resetWorkoutState();
    fetchMlRecommendation();
  };

  // Method to send coach message
  const sendCoachMessage = async (userText) => {
    const userMsg = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: userText,
      time: 'Just now'
    };

    setCoachMessages(prev => [...prev, userMsg]);

    try {
      const res = await api.coach.ask(userText);
      const replyText = res.data?.reply || `FitMirror AI Coach: Great question! Focus on your ${userProfile.availableTimeMinutes}-minute window with consistent effort.`;
      
      const aiMsg = {
        id: `msg_${Date.now()}_ai`,
        sender: 'ai',
        text: replyText,
        time: 'Just now'
      };
      setCoachMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Coach API call error:', err);
      const fallbackMsg = {
        id: `msg_${Date.now()}_ai`,
        sender: 'ai',
        text: `FitMirror AI Coach: Based on your current goals (${userProfile?.goal || 'Fitness'}), focus on consistency and managing your workout length around your student schedule!`,
        time: 'Just now'
      };
      setCoachMessages(prev => [...prev, fallbackMsg]);
    }
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
      setCurrentPlan,
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
      mlRecommendation,
      isLoadingMlRec,
      fetchMlRecommendation,
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
