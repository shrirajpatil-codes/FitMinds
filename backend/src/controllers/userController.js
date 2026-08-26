const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');
const { calculateBMI, getBMICategory } = require('../utils/bmi');

async function getProfile(req, res, next) {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
      },
    });

    if (!profile) {
      return errorResponse(res, 'Profile not found.', 404);
    }

    return successResponse(res, profile);
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const {
      age,
      heightCm,
      weightKg,
      targetWeightKg,
      fitnessExperience,
      fitnessGoal,
      availableWorkoutTime,
      preferredWorkoutWindow,
      equipment,
      lifestyleLoad,
      onboardingCompleted,
      name,
    } = req.body;

    if (name) {
      await prisma.user.update({
        where: { id: req.userId },
        data: { name: name.trim() },
      });
    }

    // Fetch existing profile to get current height/weight if only one is passed
    const existingProfile = await prisma.profile.findUnique({ where: { userId: req.userId } });

    const newHeight = heightCm !== undefined ? parseFloat(heightCm) : existingProfile?.heightCm;
    const newWeight = weightKg !== undefined ? parseFloat(weightKg) : existingProfile?.weightKg;
    const newTargetWeight = targetWeightKg !== undefined ? parseFloat(targetWeightKg) : existingProfile?.targetWeightKg;

    const bmi = calculateBMI(newWeight, newHeight);
    const bmiCategory = bmi ? getBMICategory(bmi) : existingProfile?.bmiCategory;

    const updateData = {};
    if (age !== undefined) updateData.age = parseInt(age, 10) || null;
    if (newHeight !== undefined) updateData.heightCm = newHeight;
    if (newWeight !== undefined) updateData.weightKg = newWeight;
    if (newTargetWeight !== undefined) updateData.targetWeightKg = newTargetWeight;
    if (bmi !== null) updateData.bmi = bmi;
    if (bmiCategory !== undefined) updateData.bmiCategory = bmiCategory;
    if (fitnessExperience) updateData.fitnessExperience = fitnessExperience;
    if (fitnessGoal) updateData.fitnessGoal = fitnessGoal;
    if (availableWorkoutTime !== undefined) updateData.availableWorkoutTime = parseInt(availableWorkoutTime, 10) || 20;
    if (preferredWorkoutWindow) updateData.preferredWorkoutWindow = preferredWorkoutWindow;
    if (equipment) updateData.equipment = equipment;
    if (lifestyleLoad) updateData.lifestyleLoad = lifestyleLoad;
    if (onboardingCompleted !== undefined) updateData.onboardingCompleted = Boolean(onboardingCompleted);

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: req.userId },
      update: updateData,
      create: {
        userId: req.userId,
        ...updateData,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return successResponse(res, updatedProfile, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

async function getActivityHeatmap(req, res, next) {
  try {
    const userId = req.userId;
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    // Fetch completed workout sessions
    const completedSessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        startedAt: { gte: oneYearAgo }
      },
      select: { startedAt: true }
    });

    // Fetch daily check-ins
    const checkins = await prisma.dailyCheckIn.findMany({
      where: {
        userId,
        createdAt: { gte: oneYearAgo }
      },
      select: { createdAt: true }
    });

    // Count submissions per YYYY-MM-DD
    const heatmapData = {};
    let totalSubmissions = 0;

    const addDateCount = (dateObj) => {
      if (!dateObj) return;
      const dateStr = new Date(dateObj).toISOString().split('T')[0];
      heatmapData[dateStr] = (heatmapData[dateStr] || 0) + 1;
      totalSubmissions += 1;
    };

    completedSessions.forEach(s => addDateCount(s.startedAt));
    checkins.forEach(c => addDateCount(c.createdAt));

    const activeDates = Object.keys(heatmapData).sort();
    const totalActiveDays = activeDates.length;

    // Calculate streaks
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    const todayObj = new Date();
    const todayStr = todayObj.toISOString().split('T')[0];
    const yesterdayObj = new Date();
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

    let prevDate = null;
    for (const dStr of activeDates) {
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((new Date(dStr) - new Date(prevDate)) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > maxStreak) {
        maxStreak = tempStreak;
      }
      prevDate = dStr;
    }

    if (heatmapData[todayStr] || heatmapData[yesterdayStr]) {
      let checkDate = new Date();
      if (!heatmapData[todayStr] && heatmapData[yesterdayStr]) {
        checkDate = yesterdayObj;
      }
      while (true) {
        const cStr = checkDate.toISOString().split('T')[0];
        if (heatmapData[cStr]) {
          currentStreak += 1;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return successResponse(res, {
      heatmapData,
      totalSubmissions,
      totalActiveDays,
      currentStreak,
      maxStreak
    }, 'Activity heatmap fetched successfully');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getActivityHeatmap,
};
