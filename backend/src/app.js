const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const progressRoutes = require('./routes/progressRoutes');
const reflectionRoutes = require('./routes/reflectionRoutes');
const strategyRoutes = require('./routes/strategyRoutes');
const decisionRoutes = require('./routes/decisionRoutes');
const experimentRoutes = require('./routes/experimentRoutes');
const coachRoutes = require('./routes/coachRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// Allow all origins in development (supports localhost:3000, 3001, 5173, etc.)
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reflections', reflectionRoutes);
app.use('/api/strategy', strategyRoutes);
app.use('/api/decisions', decisionRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Fallback 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use(errorHandler);

module.exports = app;
