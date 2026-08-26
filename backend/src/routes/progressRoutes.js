const express = require('express');
const router = express.Router();
const { getProgressSummary, getWeeklyProgress, getMonthlyProgress } = require('../controllers/progressController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/summary', authenticateToken, getProgressSummary);
router.get('/weekly', authenticateToken, getWeeklyProgress);
router.get('/monthly', authenticateToken, getMonthlyProgress);

module.exports = router;
