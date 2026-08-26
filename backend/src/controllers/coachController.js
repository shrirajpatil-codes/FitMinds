const { prisma } = require('../config/database');
const { successResponse } = require('../utils/response');

async function getCoachContext(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true },
    });

    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
    });

    const recentCheckins = await prisma.dailyCheckIn.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentWorkouts = await prisma.workoutPlan.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const recentSessions = await prisma.workoutSession.findMany({
      where: { userId: req.userId },
      orderBy: { startedAt: 'desc' },
      take: 5,
    });

    const recentDecisions = await prisma.decisionRecord.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return successResponse(res, {
      user,
      profile,
      recentCheckins,
      recentWorkouts,
      recentSessions,
      recentDecisions,
      coachStatus: "AI Coach context prepared. Ready for AI service integration.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCoachContext,
};
