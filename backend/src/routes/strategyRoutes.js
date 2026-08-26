const express = require('express');
const router = express.Router();
const { getStrategyHealth } = require('../controllers/strategyController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/health', authenticateToken, getStrategyHealth);

module.exports = router;
