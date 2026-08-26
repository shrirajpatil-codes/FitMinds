const express = require('express');
const router = express.Router();
const { getDecisions, getDecisionById } = require('../controllers/decisionController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getDecisions);
router.get('/:id', authenticateToken, getDecisionById);

module.exports = router;
