const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

async function getDecisions(req, res, next) {
  try {
    const decisions = await prisma.decisionRecord.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return successResponse(res, decisions);
  } catch (error) {
    next(error);
  }
}

async function getDecisionById(req, res, next) {
  try {
    const { id } = req.params;
    const decision = await prisma.decisionRecord.findFirst({
      where: { id, userId: req.userId },
    });

    if (!decision) {
      return errorResponse(res, 'Decision record not found', 404);
    }

    return successResponse(res, decision);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDecisions,
  getDecisionById,
};
