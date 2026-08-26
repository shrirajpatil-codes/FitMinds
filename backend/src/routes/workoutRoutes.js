const express = require('express');
const router = express.Router();
const {
  getTodayWorkout,
  getWorkouts,
  getWorkoutById,
  startWorkout,
  completeWorkout,
  skipWorkout,
  modifyWorkout,
} = require('../controllers/workoutController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/today', authenticateToken, getTodayWorkout);
router.get('/', authenticateToken, getWorkouts);
router.get('/:id', authenticateToken, getWorkoutById);
router.post('/:id/start', authenticateToken, startWorkout);
router.post('/:id/complete', authenticateToken, completeWorkout);
router.post('/:id/skip', authenticateToken, skipWorkout);
router.post('/:id/modify', authenticateToken, modifyWorkout);

module.exports = router;
