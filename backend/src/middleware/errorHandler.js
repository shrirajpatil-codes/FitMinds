const { errorResponse } = require('../utils/response');

function errorHandler(err, req, res, next) {
  console.error('🔥 Central Error Handler caught error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return errorResponse(res, message, statusCode);
}

module.exports = {
  errorHandler,
};
