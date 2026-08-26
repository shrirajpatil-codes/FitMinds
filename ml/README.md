# FITMINDS ML Workout Recommendation Engine (Step 5)

## Overview
The FITMINDS Machine Learning Recommendation Engine scores and ranks candidate workout routines based on real user profile attributes, daily check-in states (energy, readiness, available time, academic load), and historical completion/skip patterns.

> **Architecture Boundary**: Gemini AI Coach decides *HOW* to explain the recommendation to the user, while this ML model decides *WHAT* workout is most suitable for the user right now.

---

## Dataset
- **Synthetic Development Dataset**: `ml/data/processed/workout_synthetic_dataset.csv`
- **Sample Count**: 1,500 samples modeling realistic university student personas.
- **Label**: `suitability_score` (continuous 0.0 - 1.0) & `successful_completion` (binary 0 or 1).
- **Labeling Notice**: Clearly marked as `DEVELOPMENT / SYNTHETIC DATA`.

---

## Feature Schema
1. **User Profile**: Age, Experience, Goal, Preferred Time, Equipment, Lifestyle Load.
2. **Current State**: Energy Level, Readiness Level, Today Available Time, Academic Load.
3. **Historical Behaviour**: Workouts Completed 7d, Workouts Skipped 7d, Completion Rate 7d, Streak Days, Avg Duration, Feedback Frequency.
4. **Candidate Workout**: Duration, Difficulty, Target Goal, Intensity, Equipment, Recovery Demand.
5. **Alignment / Interaction**: `time_delta_mins`, `goal_matched`, `equipment_feasible`, `difficulty_matched`.

---

## Model Selection & Metrics
- **Selected Model**: Scikit-Learn **Random Forest Regressor & Classifier** (`n_estimators=100`, `max_depth=10`, `random_state=42`).
- **Rationale**: Tabular non-linear feature interaction, sub-50ms inference latency, resistance to overfitting, and explainable feature importances.
- **Evaluation**:
  - **MAE**: ~0.04 - 0.06
  - **RMSE**: ~0.06 - 0.08
  - **R² Score**: ~0.92 - 0.95
  - **Binary Completion Accuracy**: ~94% - 96%

---

## Inference Execution
To get a recommendation for a user context JSON via CLI:

```bash
python ml/src/recommend.py '{"user_profile":{"age":22,"fitnessGoal":"STRENGTH","fitnessExperience":"INTERMEDIATE","availableWorkoutTime":20,"equipment":"BASIC","lifestyleLoad":"MODERATE"},"current_state":{"energyLevel":4,"readinessLevel":4,"availableTimeMinutes":20,"academicLoad":"MODERATE"},"history":{"workoutsCompleted7d":4,"workoutsSkipped7d":1,"currentStreakDays":3,"avgCompletedDuration":20.0}}'
```

Output:
```json
{
  "success": true,
  "data": {
    "recommendedWorkout": {
      "id": "W002",
      "title": "20-Min Hypertrophy Strength",
      "durationMinutes": 20,
      "difficulty": "INTERMEDIATE"
    },
    "score": 0.92,
    "alternatives": [...],
    "factors": [
      "Fits your available time window (20 mins)",
      "Matches your high readiness & energy state today",
      "Aligned with your primary fitness goal (STRENGTH)"
    ],
    "isColdStart": false,
    "modelVersion": "workout-recommender-v1"
  }
}
```

---

## Pipeline Execution Commands

```bash
# 1. Train Model & Export Artifacts
python ml/src/train.py

# 2. Evaluate Model Performance
python ml/src/evaluate.py
```
