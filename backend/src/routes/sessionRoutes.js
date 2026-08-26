const express = require('express');
const router = express.Router();
const { startSession, completeSession, submitFeedback, getSessionHistory } = require('../controllers/sessionController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/start', authenticateToken, startSession);
router.post('/:id/complete', authenticateToken, completeSession);
router.post('/:id/feedback', authenticateToken, submitFeedback);
router.get('/history', authenticateToken, getSessionHistory);

module.exports = router;
