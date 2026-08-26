const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const { prisma } = require('../config/database');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return errorResponse(res, 'Authentication required. No token provided.', 401);
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return errorResponse(res, 'Invalid or expired token.', 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return errorResponse(res, 'User not found or account disabled.', 401);
    }

    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    return errorResponse(res, 'Authentication error.', 401);
  }
}

module.exports = {
  authenticateToken,
};
