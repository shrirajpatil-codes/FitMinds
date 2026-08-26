const express = require('express');
const router = express.Router();
const { getCoachContext } = require('../controllers/coachController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/context', authenticateToken, getCoachContext);

module.exports = router;
