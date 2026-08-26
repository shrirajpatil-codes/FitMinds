const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const DEFAULT_EXERCISES = [
  {
    id: "ex_pushups",
    name: "Push-ups",
    sets: 3,
    reps: 15,
    targetMuscle: "Chest & Triceps",
    restSeconds: 45,
    videoDemoUrl: "https://www.youtube.com/embed/IODxDxX7oi4"
  },
  {
    id: "ex_rows",
    name: "Dumbbell Rows",
    sets: 3,
    reps: 12,
    targetMuscle: "Upper Back",
    restSeconds: 45,
    videoDemoUrl: "https://www.youtube.com/embed/roCP6wCXPqo"
  },
  {
    id: "ex_plank",
    name: "Plank Hold",
    sets: 3,
    reps: 45,
    targetMuscle: "Core",
    restSeconds: 30,
    videoDemoUrl: "https://www.youtube.com/embed/pSHjTRCQxIw"
  }
];

async function getTodayWorkout(req, res, next) {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let plan = await prisma.workoutPlan.findFirst({
      where: {
        userId: req.userId,
        date: { gte: startOfToday },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!plan) {
      const userProfile = await prisma.profile.findUnique({
        where: { userId: req.userId },
      });

      const defaultTime = userProfile?.availableWorkoutTime || 20;

      plan = await prisma.workoutPlan.create({
        data: {
          userId: req.userId,
          date: new Date(),
          title: "FITMINDS Adaptive Daily Session",
          durationMinutes: defaultTime,
          difficulty: "Moderate",
          goal: userProfile?.fitnessGoal || "Strength & Consistency",
          status: "PLANNED",
          source: "DEFAULT",
          exercises: DEFAULT_EXERCISES,
        },
      });
    }

    return successResponse(res, plan);
  } catch (error) {
    next(error);
  }
}

async function getWorkouts(req, res, next) {
  try {
    const workouts = await prisma.workoutPlan.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return successResponse(res, workouts);
  } catch (error) {
    next(error);
  }
}

async function getWorkoutById(req, res, next) {
  try {
    const { id } = req.params;
    const workout = await prisma.workoutPlan.findFirst({
      where: { id, userId: req.userId },
    });

    if (!workout) {
      return errorResponse(res, 'Workout plan not found', 404);
    }

    return successResponse(res, workout);
  } catch (error) {
    next(error);
  }
}

async function startWorkout(req, res, next) {
  try {
    const { id } = req.params;
    const plan = await prisma.workoutPlan.findFirst({
      where: { id, userId: req.userId },
    });

    if (!plan) {
      return errorResponse(res, 'Workout plan not found', 404);
    }

    const updatedPlan = await prisma.workoutPlan.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
    });

    const session = await prisma.workoutSession.create({
      data: {
        userId: req.userId,
        workoutId: plan.id,
        startedAt: new Date(),
        status: 'STARTED',
      },
    });

    return successResponse(res, { plan: updatedPlan, session }, 'Workout session started');
  } catch (error) {
    next(error);
  }
}

async function completeWorkout(req, res, next) {
  try {
    const { id } = req.params;
    const plan = await prisma.workoutPlan.findFirst({
      where: { id, userId: req.userId },
    });

    if (!plan) {
      return errorResponse(res, 'Workout plan not found', 404);
    }

    const updatedPlan = await prisma.workoutPlan.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    return successResponse(res, updatedPlan, 'Workout plan completed');
  } catch (error) {
    next(error);
  }
}

async function skipWorkout(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const plan = await prisma.workoutPlan.findFirst({
      where: { id, userId: req.userId },
    });

    if (!plan) {
      return errorResponse(res, 'Workout plan not found', 404);
    }

    const updatedPlan = await prisma.workoutPlan.update({
      where: { id },
      data: { status: 'SKIPPED' },
    });

    await prisma.decisionRecord.create({
      data: {
        userId: req.userId,
        workoutId: plan.id,
        date: new Date(),
        decisionType: 'WORKOUT_SKIPPED',
        previousValue: 'PLANNED',
        newValue: 'SKIPPED',
        reason: reason || 'User requested to skip session due to high load or constraint.',
        outcome: 'Session marked skipped. System will recalculate recovery load for tomorrow.',
      },
    });

    return successResponse(res, updatedPlan, 'Workout skipped');
  } catch (error) {
    next(error);
  }
}

async function modifyWorkout(req, res, next) {
  try {
    const { id } = req.params;
    const { durationMinutes, label, reason } = req.body;

    const plan = await prisma.workoutPlan.findFirst({
      where: { id, userId: req.userId },
    });

    if (!plan) {
      return errorResponse(res, 'Workout plan not found', 404);
    }

    const prevDuration = plan.durationMinutes;
    const newDuration = parseInt(durationMinutes, 10) || prevDuration;

    const updatedPlan = await prisma.workoutPlan.update({
      where: { id },
      data: {
        durationMinutes: newDuration,
        status: 'MODIFIED',
        source: 'USER_MODIFIED',
      },
    });

    await prisma.decisionRecord.create({
      data: {
        userId: req.userId,
        workoutId: plan.id,
        date: new Date(),
        decisionType: 'MANUAL_PLAN_ADJUSTMENT',
        previousValue: `${prevDuration} minutes`,
        newValue: `${newDuration} minutes`,
        reason: label || reason || 'User applied manual workout adjustment preset.',
        outcome: 'Workout modified to user preferences.',
      },
    });

    return successResponse(res, updatedPlan, 'Workout plan updated');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTodayWorkout,
  getWorkouts,
  getWorkoutById,
  startWorkout,
  completeWorkout,
  skipWorkout,
  modifyWorkout,
};
