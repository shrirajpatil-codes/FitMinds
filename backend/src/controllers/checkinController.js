const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

async function createCheckin(req, res, next) {
  try {
    const { energyLevel, readinessLevel, availableTimeMinutes, academicLoad, note } = req.body;

    const energy = parseInt(energyLevel, 10);
    const readiness = parseInt(readinessLevel, 10);
    const timeMinutes = parseInt(availableTimeMinutes, 10) || 20;

    if (!energy || energy < 1 || energy > 5) {
      return errorResponse(res, 'Energy level must be between 1 and 5.', 400);
    }
    if (!readiness || readiness < 1 || readiness > 5) {
      return errorResponse(res, 'Readiness level must be between 1 and 5.', 400);
    }

    const load = academicLoad || 'MODERATE';

    // Start of today in UTC
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Save DailyCheckIn in DB
    const checkin = await prisma.dailyCheckIn.create({
      data: {
        userId: req.userId,
        energyLevel: energy,
        readinessLevel: readiness,
        availableTimeMinutes: timeMinutes,
        academicLoad: load,
        note: note || '',
        date: new Date(),
      },
    });

    // Check if a workout plan exists for today
    let todayPlan = await prisma.workoutPlan.findFirst({
      where: {
        userId: req.userId,
        date: { gte: startOfToday },
      },
    });

    // Adapt plan duration and log decision
    if (todayPlan) {
      const prevDuration = todayPlan.durationMinutes;
      todayPlan = await prisma.workoutPlan.update({
        where: { id: todayPlan.id },
        data: {
          durationMinutes: timeMinutes,
          status: 'MODIFIED',
          source: 'ADAPTED',
        },
      });

      // Record adaptation decision
      await prisma.decisionRecord.create({
        data: {
          userId: req.userId,
          workoutId: todayPlan.id,
          date: new Date(),
          decisionType: 'CHECKIN_ADAPTATION',
          previousValue: `${prevDuration} minutes`,
          newValue: `${timeMinutes} minutes`,
          reason: `Daily check-in submitted: Energy ${energy}/5, Workload ${load}.`,
          signals: [`Available time: ${timeMinutes} min`, `Energy: ${energy}`, `Academic load: ${load}`],
          outcome: 'Workout plan adapted to fit user schedule.',
        },
      });
    }

    return successResponse(
      res,
      {
        checkin,
        adaptedPlan: todayPlan,
      },
      'Check-in saved successfully',
      201
    );
  } catch (error) {
    next(error);
  }
}

async function getTodayCheckin(req, res, next) {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const checkin = await prisma.dailyCheckIn.findFirst({
      where: {
        userId: req.userId,
        date: { gte: startOfToday },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, checkin);
  } catch (error) {
    next(error);
  }
}

async function getCheckinHistory(req, res, next) {
  try {
    const history = await prisma.dailyCheckIn.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return successResponse(res, history);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCheckin,
  getTodayCheckin,
  getCheckinHistory,
};
