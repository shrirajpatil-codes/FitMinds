const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

async function getExperiments(req, res, next) {
  try {
    const experiments = await prisma.experiment.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, experiments);
  } catch (error) {
    next(error);
  }
}

async function getExperimentById(req, res, next) {
  try {
    const { id } = req.params;
    const experiment = await prisma.experiment.findFirst({
      where: { id, userId: req.userId },
    });

    if (!experiment) {
      return errorResponse(res, 'Experiment not found', 404);
    }

    return successResponse(res, experiment);
  } catch (error) {
    next(error);
  }
}

async function createExperiment(req, res, next) {
  try {
    const { name, description, hypothesis, baselineStrategy, testStrategy, durationDays } = req.body;

    if (!name || !hypothesis) {
      return errorResponse(res, 'Experiment name and hypothesis are required.', 400);
    }

    const days = parseInt(durationDays, 10) || 14;
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);

    const experiment = await prisma.experiment.create({
      data: {
        userId: req.userId,
        name: name.trim(),
        description: description || '',
        hypothesis: hypothesis.trim(),
        baselineStrategy: baselineStrategy || 'Standard 30-min workouts',
        testStrategy: testStrategy || 'Adaptive 15-20 min micro-sessions',
        status: 'ACTIVE',
        startDate,
        endDate,
        metrics: {
          initialCompletionRate: 85,
          targetCompletionRate: 95,
        },
      },
    });

    return successResponse(res, experiment, 'Experiment created successfully', 201);
  } catch (error) {
    next(error);
  }
}

async function endExperiment(req, res, next) {
  try {
    const { id } = req.params;
    const { outcome, status } = req.body;

    const experiment = await prisma.experiment.findFirst({
      where: { id, userId: req.userId },
    });

    if (!experiment) {
      return errorResponse(res, 'Experiment not found', 404);
    }

    const updatedExperiment = await prisma.experiment.update({
      where: { id },
      data: {
        status: status || 'COMPLETED',
        endDate: new Date(),
        outcome: outcome || 'Experiment completed successfully with improved overall consistency.',
      },
    });

    return successResponse(res, updatedExperiment, 'Experiment ended');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getExperiments,
  getExperimentById,
  createExperiment,
  endExperiment,
};
