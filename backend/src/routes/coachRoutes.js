const express = require('express');
const router = express.Router();
const { getCoachContext, askCoach } = require('../controllers/coachController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/context', authenticateToken, getCoachContext);
router.post('/ask', authenticateToken, askCoach);

module.exports = router;
