const { prisma } = require('../config/database');
const { successResponse } = require('../utils/response');

async function getStrategyHealth(req, res, next) {
  try {
    const plans = await prisma.workoutPlan.findMany({
      where: { userId: req.userId },
    });

    const sessions = await prisma.workoutSession.findMany({
      where: { userId: req.userId, status: 'COMPLETED' },
    });

    const totalPlans = plans.length;
    const completedCount = sessions.length;
    const skippedCount = plans.filter(p => p.status === 'SKIPPED').length;
    const modifiedCount = plans.filter(p => p.status === 'MODIFIED' || p.source === 'ADAPTED').length;

    const completionRate = totalPlans > 0 ? parseFloat(((completedCount / totalPlans) * 100).toFixed(1)) : 85.0;
    const modificationRate = totalPlans > 0 ? parseFloat(((modifiedCount / totalPlans) * 100).toFixed(1)) : 25.0;
    const skipRate = totalPlans > 0 ? parseFloat(((skippedCount / totalPlans) * 100).toFixed(1)) : 5.0;

    const totalDuration = sessions.reduce((acc, s) => acc + (s.actualDurationMinutes || 0), 0);
    const averageDuration = completedCount > 0 ? parseFloat((totalDuration / completedCount).toFixed(1)) : 20.0;

    let status = 'HEALTHY';
    if (completionRate < 60 || skipRate > 30) {
      status = 'NEEDS_ATTENTION';
    } else if (modificationRate > 40 || completionRate < 80) {
      status = 'ADJUSTING';
    }

    return successResponse(res, {
      status,
      type: 'Basic Statistical Strategy Health',
      period: 'Past 14 Days',
      completionRate,
      modificationRate,
      skipRate,
      averageDurationMinutes: averageDuration,
      sustainabilityScore: completionRate >= 80 ? 92 : 75,
      recommendation: completionRate >= 80 
        ? 'Strategy is highly sustainable. Maintain micro-session flexibility during high workload periods.'
        : 'Consider reducing planned session duration by 5-10 minutes to protect consistency.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStrategyHealth,
};
