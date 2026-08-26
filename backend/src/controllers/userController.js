const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

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

    const updateData = {};
    if (age !== undefined) updateData.age = parseInt(age, 10) || null;
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

module.exports = {
  getProfile,
  updateProfile,
};
