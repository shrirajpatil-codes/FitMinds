"""
FITMINDS ML Engine Configuration
Defines the Candidate Workout Library catalog, feature mappings, and model hyper-parameters.
"""

import os

# Base Directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
PROCESSED_DATA_DIR = os.path.join(DATA_DIR, "processed")
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_VERSION = "workout-recommender-v2-dynamic"
MODEL_FILE_PATH = os.path.join(MODELS_DIR, "workout_recommender.joblib")
METADATA_FILE_PATH = os.path.join(MODELS_DIR, "model_metadata.json")

# Candidate Workout Library (10 Structured Realistic Workouts)
CANDIDATE_WORKOUTS = [
    {
        "id": "W001",
        "title": "15-Min Express Full Body",
        "goal": "FITNESS",
        "difficulty": "BEGINNER",
        "durationMinutes": 15,
        "equipment": "NONE",
        "intensity": "MODERATE",
        "recoveryDemand": 2,
        "description": "Quick bodyweight circuit ideal for tight schedules between classes.",
        "exercises": [
            {"name": "Bodyweight Squats", "sets": 3, "reps": 12},
            {"name": "Incline Push-ups", "sets": 3, "reps": 10},
            {"name": "Jumping Jacks", "sets": 3, "durationSec": 30},
            {"name": "Plank Hold", "sets": 3, "durationSec": 30}
        ]
    },
    {
        "id": "W002",
        "title": "20-Min Hypertrophy Strength",
        "goal": "STRENGTH",
        "difficulty": "INTERMEDIATE",
        "durationMinutes": 20,
        "equipment": "BASIC",
        "intensity": "HIGH",
        "recoveryDemand": 4,
        "description": "Progressive dumbbell strength focus for muscle building and strength.",
        "exercises": [
            {"name": "Dumbbell Goblet Squats", "sets": 4, "reps": 10},
            {"name": "Dumbbell Floor Press", "sets": 4, "reps": 10},
            {"name": "Dumbbell Bent-over Rows", "sets": 4, "reps": 10},
            {"name": "Romanian Deadlifts", "sets": 3, "reps": 12}
        ]
    },
    {
        "id": "W003",
        "title": "15-Min Posture & Mobility",
        "goal": "ACTIVE",
        "difficulty": "BEGINNER",
        "durationMinutes": 15,
        "equipment": "NONE",
        "intensity": "LOW",
        "recoveryDemand": 1,
        "description": "Gentle joint mobility & spine decompression after long study sessions.",
        "exercises": [
            {"name": "Cat-Cow Stretch", "sets": 3, "reps": 10},
            {"name": "Thoracic Rotations", "sets": 3, "reps": 8},
            {"name": "Glute Bridges", "sets": 3, "reps": 12},
            {"name": "Child Pose Hold", "sets": 3, "durationSec": 45}
        ]
    },
    {
        "id": "W004",
        "title": "25-Min Fat Burn HIIT",
        "goal": "WEIGHT_LOSS",
        "difficulty": "INTERMEDIATE",
        "durationMinutes": 25,
        "equipment": "NONE",
        "intensity": "HIGH",
        "recoveryDemand": 4,
        "description": "High-intensity cardio intervals for maximal caloric burn.",
        "exercises": [
            {"name": "Burpees", "sets": 4, "durationSec": 30},
            {"name": "Mountain Climbers", "sets": 4, "durationSec": 40},
            {"name": "High Knees", "sets": 4, "durationSec": 30},
            {"name": "Bodyweight Squat Jumps", "sets": 4, "reps": 12}
        ]
    },
    {
        "id": "W005",
        "title": "10-Min Exam Stress Recovery",
        "goal": "CONSISTENCY",
        "difficulty": "BEGINNER",
        "durationMinutes": 10,
        "equipment": "NONE",
        "intensity": "LOW",
        "recoveryDemand": 1,
        "description": "Ultra-short low-friction session to keep streak active on exam days.",
        "exercises": [
            {"name": "Arm Circles & Shoulder Rolls", "sets": 2, "durationSec": 45},
            {"name": "Standing Knee Raises", "sets": 2, "reps": 15},
            {"name": "Wall Push-ups", "sets": 2, "reps": 12},
            {"name": "Deep Breathing Stretch", "sets": 2, "durationSec": 60}
        ]
    },
    {
        "id": "W006",
        "title": "30-Min Muscle Mass Sculpt",
        "goal": "WEIGHT_GAIN",
        "difficulty": "ADVANCED",
        "durationMinutes": 30,
        "equipment": "GYM",
        "intensity": "HIGH",
        "recoveryDemand": 5,
        "description": "Full gym resistance training for weight gain and muscle hypertrophy.",
        "exercises": [
            {"name": "Barbell Squats", "sets": 4, "reps": 8},
            {"name": "Incline Bench Press", "sets": 4, "reps": 8},
            {"name": "Lat Pulldowns", "sets": 4, "reps": 10},
            {"name": "Overhead Press", "sets": 3, "reps": 10}
        ]
    },
    {
        "id": "W007",
        "title": "20-Min Cardio & Lean Tone",
        "goal": "WEIGHT_LOSS",
        "difficulty": "INTERMEDIATE",
        "durationMinutes": 20,
        "equipment": "BASIC",
        "intensity": "MODERATE",
        "recoveryDemand": 3,
        "description": "Balanced resistance circuit to tone muscles while burning fat.",
        "exercises": [
            {"name": "Dumbbell Thrusters", "sets": 3, "reps": 12},
            {"name": "Renegade Rows", "sets": 3, "reps": 10},
            {"name": "Jumping Lunges", "sets": 3, "reps": 12},
            {"name": "Russian Twists", "sets": 3, "reps": 20}
        ]
    },
    {
        "id": "W008",
        "title": "15-Min Upper Body Pump",
        "goal": "STRENGTH",
        "difficulty": "INTERMEDIATE",
        "durationMinutes": 15,
        "equipment": "BASIC",
        "intensity": "MODERATE",
        "recoveryDemand": 3,
        "description": "Focused upper body volume session for chest, shoulders, and arms.",
        "exercises": [
            {"name": "Dumbbell Bicep Curls", "sets": 3, "reps": 12},
            {"name": "Tricep Dips on Chair", "sets": 3, "reps": 12},
            {"name": "Dumbbell Lateral Raises", "sets": 3, "reps": 15},
            {"name": "Standard Push-ups", "sets": 3, "reps": 12}
        ]
    },
    {
        "id": "W009",
        "title": "10-Min Quick Energizer",
        "goal": "CONSISTENCY",
        "difficulty": "BEGINNER",
        "durationMinutes": 10,
        "equipment": "NONE",
        "intensity": "MODERATE",
        "recoveryDemand": 2,
        "description": "Fast-paced morning blood-flow booster to wake up body and mind.",
        "exercises": [
            {"name": "Jumping Jacks", "sets": 3, "durationSec": 45},
            {"name": "Bodyweight Squats", "sets": 3, "reps": 15},
            {"name": "High Knees", "sets": 3, "durationSec": 30},
            {"name": "Plank to Push-up", "sets": 2, "reps": 8}
        ]
    },
    {
        "id": "W010",
        "title": "25-Min Functional Core & Legs",
        "goal": "FITNESS",
        "difficulty": "ADVANCED",
        "durationMinutes": 25,
        "equipment": "BASIC",
        "intensity": "HIGH",
        "recoveryDemand": 4,
        "description": "Challenging leg & core stability for overall athletic fitness.",
        "exercises": [
            {"name": "Walking Lunges", "sets": 4, "reps": 16},
            {"name": "Single-leg Glute Bridges", "sets": 3, "reps": 12},
            {"name": "Hanging Knee Raises", "sets": 3, "reps": 12},
            {"name": "Dumbbell Kettlebell Swings", "sets": 4, "reps": 15}
        ]
    }
]

# Numeric Mappings for Categorical Data
GOAL_MAP = {
    "CONSISTENCY": 1,
    "ACTIVE": 2,
    "FITNESS": 3,
    "WEIGHT_LOSS": 4,
    "STRENGTH": 5,
    "WEIGHT_GAIN": 6,
    "GENERAL": 3
}

EXPERIENCE_MAP = {
    "BEGINNER": 1,
    "INTERMEDIATE": 2,
    "ADVANCED": 3
}

EQUIPMENT_MAP = {
    "NONE": 1,
    "BASIC": 2,
    "GYM": 3
}

ACADEMIC_LOAD_MAP = {
    "LOW": 1,
    "MODERATE": 2,
    "HIGH": 3
}

INTENSITY_MAP = {
    "LOW": 1,
    "MODERATE": 2,
    "HIGH": 3
}

DIFFICULTY_MAP = {
    "BEGINNER": 1,
    "INTERMEDIATE": 2,
    "ADVANCED": 3
}

BMI_CATEGORY_MAP = {
    "Underweight": 1,
    "Normal weight": 2,
    "Overweight": 3,
    "Obese": 4
}

FEATURE_COLUMNS = [
    # User Profile Features
    "user_age",
    "user_bmi",
    "user_bmi_category_num",
    "user_experience_num",
    "user_goal_num",
    "user_pref_time",
    "user_equipment_num",
    "user_lifestyle_load_num",
    
    # Current State Features
    "energy_level",
    "readiness_level",
    "today_available_time",
    "today_academic_load_num",
    
    # Historical Behaviour Features
    "workouts_completed_7d",
    "workouts_skipped_7d",
    "completion_rate_7d",
    "current_streak_days",
    "avg_completed_duration",
    "too_difficult_freq",
    
    # Candidate Workout Features
    "workout_duration",
    "workout_difficulty_num",
    "workout_goal_num",
    "workout_intensity_num",
    "workout_equipment_num",
    "workout_recovery_demand",
    
    # Interaction / Alignment Features
    "time_delta_mins",         # abs(today_available_time - workout_duration)
    "goal_matched",            # 1 if user_goal == workout_goal else 0
    "equipment_feasible",      # 1 if workout_equipment <= user_equipment else 0
    "difficulty_matched"       # 1 if workout_difficulty <= user_experience else 0
]
