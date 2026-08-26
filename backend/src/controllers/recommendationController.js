const { predictWorkoutRecommendation } = require('../services/mlRecommendationService');
const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

async function getWorkoutRecommendation(req, res, next) {
  try {
    const userId = req.userId;
    if (!userId) {
      return errorResponse(res, 'Authentication required', 401);
    }

    const recResult = await predictWorkoutRecommendation(userId);

    if (!recResult || !recResult.success) {
      return errorResponse(res, 'Failed to generate recommendation', 500);
    }

    const recData = recResult.data;
    const recWorkout = recData.recommendedWorkout;

    // Persist Recommendation in DecisionRecord table
    try {
      await prisma.decisionRecord.create({
        data: {
          userId,
          workoutId: recWorkout.id,
          decisionType: 'ML_WORKOUT_RECOMMENDATION',
          newValue: recWorkout.title,
          reason: recData.factors.join(' | '),
          signals: {
            score: recData.score,
            isColdStart: recData.isColdStart,
            modelVersion: recData.modelVersion,
            alternativesCount: recData.alternatives?.length || 0
          },
          outcome: 'RECOMMENDED'
        }
      });
    } catch (dbErr) {
      console.warn('[DECISION LOG] Failed to log decision record:', dbErr.message);
    }

    return successResponse(res, recData);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWorkoutRecommendation,
};
