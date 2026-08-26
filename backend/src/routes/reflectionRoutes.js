const express = require('express');
const router = express.Router();
const { createReflection, getReflections, getLatestReflection } = require('../controllers/reflectionController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/weekly', authenticateToken, createReflection);
router.get('/', authenticateToken, getReflections);
router.get('/latest', authenticateToken, getLatestReflection);

module.exports = router;
