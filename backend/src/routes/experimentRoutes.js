const express = require('express');
const router = express.Router();
const {
  getExperiments,
  getExperimentById,
  createExperiment,
  endExperiment,
} = require('../controllers/experimentController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getExperiments);
router.get('/:id', authenticateToken, getExperimentById);
router.post('/', authenticateToken, createExperiment);
router.post('/:id/end', authenticateToken, endExperiment);

module.exports = router;
