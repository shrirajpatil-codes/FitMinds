const express = require('express');
const router = express.Router();
const { createCheckin, getTodayCheckin, getCheckinHistory } = require('../controllers/checkinController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createCheckin);
router.get('/today', authenticateToken, getTodayCheckin);
router.get('/history', authenticateToken, getCheckinHistory);

module.exports = router;
