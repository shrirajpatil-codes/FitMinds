const express = require('express');
const router = express.Router();
const { getWorkoutRecommendation } = require('../controllers/recommendationController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/workout', authenticateToken, getWorkoutRecommendation);

module.exports = router;
