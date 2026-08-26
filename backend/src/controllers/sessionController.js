const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

async function startSession(req, res, next) {
  try {
    const { workoutId } = req.body;

    const session = await prisma.workoutSession.create({
      data: {
        userId: req.userId,
        workoutId: workoutId || null,
        startedAt: new Date(),
        status: 'STARTED',
      },
    });

    return successResponse(res, session, 'Workout session started', 201);
  } catch (error) {
    next(error);
  }
}

async function completeSession(req, res, next) {
  try {
    const { id } = req.params;
    const { actualDurationMinutes, exercisesCompleted, setsCompleted, repsCompleted, completionPercentage, notes } = req.body;

    const session = await prisma.workoutSession.findFirst({
      where: { id, userId: req.userId },
    });

    if (!session) {
      return errorResponse(res, 'Workout session not found', 404);
    }

    const updatedSession = await prisma.workoutSession.update({
      where: { id },
      data: {
        completedAt: new Date(),
        actualDurationMinutes: parseInt(actualDurationMinutes, 10) || 20,
        exercisesCompleted: parseInt(exercisesCompleted, 10) || 3,
        setsCompleted: parseInt(setsCompleted, 10) || 9,
        repsCompleted: parseInt(repsCompleted, 10) || 120,
        completionPercentage: parseFloat(completionPercentage) || 100.0,
        status: 'COMPLETED',
        notes: notes || '',
      },
    });

    // Mark associated workout plan as completed if applicable
    if (session.workoutId) {
      await prisma.workoutPlan.update({
        where: { id: session.workoutId },
        data: { status: 'COMPLETED' },
      }).catch(() => {});
    }

    return successResponse(res, updatedSession, 'Workout session completed');
  } catch (error) {
    next(error);
  }
}

async function submitFeedback(req, res, next) {
  try {
    const { id } = req.params;
    const { feedback, notes } = req.body;

    const validFeedback = ['EASY', 'GOOD', 'CHALLENGING', 'TOO_DIFFICULT'];
    const feedbackEnum = validFeedback.includes(feedback) ? feedback : 'GOOD';

    const session = await prisma.workoutSession.findFirst({
      where: { id, userId: req.userId },
    });

    if (!session) {
      return errorResponse(res, 'Workout session not found', 404);
    }

    const updatedSession = await prisma.workoutSession.update({
      where: { id },
      data: {
        userFeedback: feedbackEnum,
        notes: notes || session.notes || '',
      },
    });

    return successResponse(res, updatedSession, 'Feedback submitted successfully');
  } catch (error) {
    next(error);
  }
}

async function getSessionHistory(req, res, next) {
  try {
    const history = await prisma.workoutSession.findMany({
      where: { userId: req.userId },
      orderBy: { startedAt: 'desc' },
      take: 30,
    });

    return successResponse(res, history);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  startSession,
  completeSession,
  submitFeedback,
  getSessionHistory,
};
