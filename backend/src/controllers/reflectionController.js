const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

async function createReflection(req, res, next) {
  try {
    const { consistencyRating, easierFactors, difficultyFactors, desiredStrategyChange, note } = req.body;

    const rating = parseInt(consistencyRating, 10);
    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, 'Consistency rating must be between 1 and 5.', 400);
    }

    const reflection = await prisma.weeklyReflection.create({
      data: {
        userId: req.userId,
        weekStart: new Date(),
        consistencyRating: rating,
        easierFactors: easierFactors || '',
        difficultyFactors: difficultyFactors || '',
        desiredStrategyChange: desiredStrategyChange || '',
        note: note || '',
      },
    });

    return successResponse(res, reflection, 'Weekly reflection saved successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function getReflections(req, res, next) {
  try {
    const reflections = await prisma.weeklyReflection.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, reflections);
  } catch (error) {
    next(error);
  }
}

async function getLatestReflection(req, res, next) {
  try {
    const reflection = await prisma.weeklyReflection.findFirst({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, reflection);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createReflection,
  getReflections,
  getLatestReflection,
};
