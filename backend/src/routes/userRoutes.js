const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getActivityHeatmap } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/activity-heatmap', authenticateToken, getActivityHeatmap);

module.exports = router;
