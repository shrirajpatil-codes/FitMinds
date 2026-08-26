const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { prisma } = require('../config/database');

const ML_RECOMMEND_SCRIPT = path.join(__dirname, '../../../ml/src/recommend.py');

// Candidate Workout Library Catalog (10 Structured Realistic Workouts)
const CANDIDATE_WORKOUTS = [
  {
    id: "W001",
    title: "15-Min Express Full Body",
    goal: "FITNESS",
    difficulty: "BEGINNER",
    durationMinutes: 15,
    equipment: "NONE",
    intensity: "MODERATE",
    recoveryDemand: 2,
    description: "Quick bodyweight circuit ideal for tight schedules between classes.",
    exercises: [
      { name: "Bodyweight Squats", sets: 3, reps: 12 },
      { name: "Incline Push-ups", sets: 3, reps: 10 },
      { name: "Jumping Jacks", sets: 3, durationSec: 30 },
      { name: "Plank Hold", sets: 3, durationSec: 30 }
    ]
  },
  {
    id: "W002",
    title: "20-Min Hypertrophy Strength",
    goal: "STRENGTH",
    difficulty: "INTERMEDIATE",
    durationMinutes: 20,
    equipment: "BASIC",
    intensity: "HIGH",
    recoveryDemand: 4,
    description: "Progressive dumbbell strength focus for muscle building and strength.",
    exercises: [
      { name: "Dumbbell Goblet Squats", sets: 4, reps: 10 },
      { name: "Dumbbell Floor Press", sets: 4, reps: 10 },
      { name: "Dumbbell Bent-over Rows", sets: 4, reps: 10 },
      { name: "Romanian Deadlifts", sets: 3, reps: 12 }
    ]
  },
  {
    id: "W003",
    title: "15-Min Posture & Mobility",
    goal: "ACTIVE",
    difficulty: "BEGINNER",
    durationMinutes: 15,
    equipment: "NONE",
    intensity: "LOW",
    recoveryDemand: 1,
    description: "Gentle joint mobility & spine decompression after long study sessions.",
    exercises: [
      { name: "Cat-Cow Stretch", sets: 3, reps: 10 },
      { name: "Thoracic Rotations", sets: 3, reps: 8 },
      { name: "Glute Bridges", sets: 3, reps: 12 },
      { name: "Child Pose Hold", sets: 3, durationSec: 45 }
    ]
  },
  {
    id: "W004",
    title: "25-Min Fat Burn HIIT",
    goal: "WEIGHT_LOSS",
    difficulty: "INTERMEDIATE",
    durationMinutes: 25,
    equipment: "NONE",
    intensity: "HIGH",
    recoveryDemand: 4,
    description: "High-intensity cardio intervals for maximal caloric burn.",
    exercises: [
      { name: "Burpees", sets: 4, durationSec: 30 },
      { name: "Mountain Climbers", sets: 4, durationSec: 40 },
      { name: "High Knees", sets: 4, durationSec: 30 },
      { name: "Bodyweight Squat Jumps", sets: 4, reps: 12 }
    ]
  },
  {
    id: "W005",
    title: "10-Min Exam Stress Recovery",
    goal: "CONSISTENCY",
    difficulty: "BEGINNER",
    durationMinutes: 10,
    equipment: "NONE",
    intensity: "LOW",
    recoveryDemand: 1,
    description: "Ultra-short low-friction session to keep streak active on exam days.",
    exercises: [
      { name: "Arm Circles & Shoulder Rolls", sets: 2, durationSec: 45 },
      { name: "Standing Knee Raises", sets: 2, reps: 15 },
      { name: "Wall Push-ups", sets: 2, reps: 12 },
      { name: "Deep Breathing Stretch", sets: 2, durationSec: 60 }
    ]
  },
  {
    id: "W006",
    title: "30-Min Muscle Mass Sculpt",
    goal: "WEIGHT_GAIN",
    difficulty: "ADVANCED",
    durationMinutes: 30,
    equipment: "GYM",
    intensity: "HIGH",
    recoveryDemand: 5,
    description: "Full gym resistance training for weight gain and muscle hypertrophy.",
    exercises: [
      { name: "Barbell Squats", sets: 4, reps: 8 },
      { name: "Incline Bench Press", sets: 4, reps: 8 },
      { name: "Lat Pulldowns", sets: 4, reps: 10 },
      { name: "Overhead Press", sets: 3, reps: 10 }
    ]
  },
  {
    id: "W007",
    title: "20-Min Cardio & Lean Tone",
    goal: "WEIGHT_LOSS",
    difficulty: "INTERMEDIATE",
    durationMinutes: 20,
    equipment: "BASIC",
    intensity: "MODERATE",
    recoveryDemand: 3,
    description: "Balanced resistance circuit to tone muscles while burning fat.",
    exercises: [
      { name: "Dumbbell Thrusters", sets: 3, reps: 12 },
      { name: "Renegade Rows", sets: 3, reps: 10 },
      { name: "Jumping Lunges", sets: 3, reps: 12 },
      { name: "Russian Twists", sets: 3, reps: 20 }
    ]
  },
  {
    id: "W008",
    title: "15-Min Upper Body Pump",
    goal: "STRENGTH",
    difficulty: "INTERMEDIATE",
    durationMinutes: 15,
    equipment: "BASIC",
    intensity: "MODERATE",
    recoveryDemand: 3,
    description: "Focused upper body volume session for chest, shoulders, and arms.",
    exercises: [
      { name: "Dumbbell Bicep Curls", sets: 3, reps: 12 },
      { name: "Tricep Dips on Chair", sets: 3, reps: 12 },
      { name: "Dumbbell Lateral Raises", sets: 3, reps: 15 },
      { name: "Standard Push-ups", sets: 3, reps: 12 }
    ]
  },
  {
    id: "W009",
    title: "10-Min Quick Energizer",
    goal: "CONSISTENCY",
    difficulty: "BEGINNER",
    durationMinutes: 10,
    equipment: "NONE",
    intensity: "MODERATE",
    recoveryDemand: 2,
    description: "Fast-paced morning blood-flow booster to wake up body and mind.",
    exercises: [
      { name: "Jumping Jacks", sets: 3, durationSec: 45 },
      { name: "Bodyweight Squats", sets: 3, reps: 15 },
      { name: "High Knees", sets: 3, durationSec: 30 },
      { name: "Plank to Push-up", sets: 2, reps: 8 }
    ]
  },
  {
    id: "W010",
    title: "25-Min Functional Core & Legs",
    goal: "FITNESS",
    difficulty: "ADVANCED",
    durationMinutes: 25,
    equipment: "BASIC",
    intensity: "HIGH",
    recoveryDemand: 4,
    description: "Challenging leg & core stability for overall athletic fitness.",
    exercises: [
      { name: "Walking Lunges", sets: 4, reps: 16 },
      { name: "Single-leg Glute Bridges", sets: 3, reps: 12 },
      { name: "Hanging Knee Raises", sets: 3, reps: 12 },
      { name: "Dumbbell Kettlebell Swings", sets: 4, reps: 15 }
    ]
  }
];

/**
 * Gathers user profile, today's check-in, and recent historical sessions from Prisma DB.
 */
async function getUserMLContext(userId) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  
  const todayCheckin = await prisma.dailyCheckIn.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentSessions = await prisma.workoutSession.findMany({
    where: {
      userId,
      startedAt: { gte: sevenDaysAgo }
    }
  });

  const recentPlans = await prisma.workoutPlan.findMany({
    where: {
      userId,
      createdAt: { gte: sevenDaysAgo }
    }
  });

  const completedCount = recentSessions.filter(s => s.status === 'COMPLETED').length;
  const skippedCount = recentPlans.filter(p => p.status === 'SKIPPED').length;

  let totalDuration = 0;
  recentSessions.forEach(s => {
    if (s.actualDurationMinutes) totalDuration += s.actualDurationMinutes;
  });
  const avgCompletedDur = completedCount > 0 ? (totalDuration / completedCount) : (profile?.availableWorkoutTime || 20);

  const history = {
    workoutsCompleted7d: completedCount,
    workoutsSkipped7d: skippedCount,
    currentStreakDays: completedCount > 0 ? completedCount : 0,
    avgCompletedDuration: avgCompletedDur,
    tooDifficultFrequency: 0.1
  };

  const user_profile = {
    age: profile?.age || 21,
    fitnessExperience: profile?.fitnessExperience || 'BEGINNER',
    fitnessGoal: profile?.fitnessGoal || 'FITNESS',
    availableWorkoutTime: profile?.availableWorkoutTime || 20,
    equipment: profile?.equipment || 'NONE',
    lifestyleLoad: profile?.lifestyleLoad || 'MODERATE'
  };

  const current_state = {
    energyLevel: todayCheckin?.energyLevel || 3,
    readinessLevel: todayCheckin?.readinessLevel || 3,
    availableTimeMinutes: todayCheckin?.availableTimeMinutes || user_profile.availableWorkoutTime,
    academicLoad: todayCheckin?.academicLoad || user_profile.lifestyleLoad
  };

  return { user_profile, current_state, history };
}

/**
 * Invokes Python ML Inference Engine.
 */
async function predictWorkoutRecommendation(userId) {
  const userContext = await getUserMLContext(userId);
  const isColdStart = (userContext.history.workoutsCompleted7d === 0 && userContext.history.workoutsSkipped7d === 0);

  // Write temporary payload JSON file
  const tempFilePath = path.join(os.tmpdir(), `fitminds_ml_input_${userId}_${Date.now()}.json`);
  
  return new Promise((resolve) => {
    try {
      fs.writeFileSync(tempFilePath, JSON.stringify(userContext));

      execFile('python', [ML_RECOMMEND_SCRIPT, tempFilePath], { timeout: 8000 }, (error, stdout, stderr) => {
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
          try { fs.unlinkSync(tempFilePath); } catch (e) {}
        }

        if (error || !stdout) {
          console.warn('[ML SERVICE] Python inference warning/fallback:', error?.message || stderr);
          return resolve(getFallbackRecommendation(userContext, isColdStart));
        }

        try {
          const result = JSON.parse(stdout);
          if (result && result.success) {
            return resolve(result);
          }
        } catch (parseErr) {
          console.warn('[ML SERVICE] Failed to parse Python JSON output:', parseErr.message);
        }

        resolve(getFallbackRecommendation(userContext, isColdStart));
      });
    } catch (err) {
      if (fs.existsSync(tempFilePath)) {
        try { fs.unlinkSync(tempFilePath); } catch (e) {}
      }
      resolve(getFallbackRecommendation(userContext, isColdStart));
    }
  });
}

/**
 * JavaScript Fallback Recommender if Python execution is unavailable.
 */
function getFallbackRecommendation(userContext, isColdStart) {
  const { user_profile, current_state } = userContext;
  const targetTime = current_state.availableTimeMinutes || user_profile.availableWorkoutTime || 20;
  const energy = current_state.energyLevel || 3;
  const userGoal = user_profile.fitnessGoal || 'FITNESS';

  let scored = CANDIDATE_WORKOUTS.map(w => {
    let score = 0.5;
    const timeDelta = Math.abs(w.durationMinutes - targetTime);

    if (timeDelta === 0) score += 0.25;
    else if (timeDelta <= 5) score += 0.15;
    else if (timeDelta <= 10) score += 0.05;
    else score -= 0.30;

    if (energy <= 2 && w.intensity === 'LOW') score += 0.20;
    if (energy <= 2 && w.intensity === 'HIGH') score -= 0.30;

    if (w.goal === userGoal) score += 0.15;

    score = Math.max(0.1, Math.min(0.98, score));
    return { workout: w, score: Number(score.toFixed(3)) };
  });

  scored.sort((a, b) => b.score - a.score);

  const best = scored[0].workout;
  const bestScore = scored[0].score;

  const alternatives = scored.slice(1, 4).map(item => ({
    id: item.workout.id,
    title: item.workout.title,
    durationMinutes: item.workout.durationMinutes,
    difficulty: item.workout.difficulty,
    score: item.score
  }));

  const factors = [
    `Fits your current time availability (${targetTime} mins)`,
    energy <= 2 ? "Selected low-intensity option for low energy state" : `Aligned with your target goal (${userGoal.replace('_', ' ')})`
  ];

  return {
    success: true,
    data: {
      recommendedWorkout: best,
      score: bestScore,
      alternatives,
      factors,
      isColdStart,
      modelVersion: "fallback-js-heuristic-v1"
    }
  };
}

module.exports = {
  getUserMLContext,
  predictWorkoutRecommendation,
  CANDIDATE_WORKOUTS
};
