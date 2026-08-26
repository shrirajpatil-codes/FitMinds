const { prisma, pool } = require('../config/database');
const { successResponse } = require('../utils/response');

async function getHealth(req, res, next) {
  try {
    let dbStatus = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (e) {
      dbStatus = 'error';
    }

    return successResponse(res, {
      server: 'ok',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      service: 'FITMINDS Backend API',
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHealth,
};
