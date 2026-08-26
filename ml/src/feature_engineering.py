"""
FITMINDS Feature Engineering Module
Transforms raw User Profile, Today's Check-in State, Historical Behaviour,
and Candidate Workout attributes into normalized numerical feature vectors for ML model training and inference.
"""

from config import (
    GOAL_MAP,
    EXPERIENCE_MAP,
    EQUIPMENT_MAP,
    ACADEMIC_LOAD_MAP,
    INTENSITY_MAP,
    DIFFICULTY_MAP,
    FEATURE_COLUMNS
)

def extract_numeric_features(user_profile, current_state, history, workout):
    """
    Constructs a single feature dictionary for a (User Context, Candidate Workout) pair.
    NO future data leakage: only uses information observable BEFORE workout recommendation.
    """
    # 1. User Profile Features
    user_age = int(user_profile.get("age", 21) or 21)
    user_exp = user_profile.get("fitnessExperience", "BEGINNER")
    user_exp_num = EXPERIENCE_MAP.get(user_exp, 1)
    
    user_goal = user_profile.get("fitnessGoal", "FITNESS")
    user_goal_num = GOAL_MAP.get(user_goal, 3)
    
    user_pref_time = int(user_profile.get("availableWorkoutTime", 20) or 20)
    user_eq = user_profile.get("equipment", "NONE")
    user_eq_num = EQUIPMENT_MAP.get(user_eq, 1)
    
    user_load = user_profile.get("lifestyleLoad", "MODERATE")
    user_load_num = ACADEMIC_LOAD_MAP.get(user_load, 2)

    # 2. Current State Features (Today's Check-in)
    energy_level = int(current_state.get("energyLevel", 3) or 3)
    readiness_level = int(current_state.get("readinessLevel", 3) or 3)
    today_avail_time = int(current_state.get("availableTimeMinutes", user_pref_time) or user_pref_time)
    
    today_load = current_state.get("academicLoad", user_load)
    today_load_num = ACADEMIC_LOAD_MAP.get(today_load, user_load_num)

    # 3. Historical Behaviour Features
    completed_7d = int(history.get("workoutsCompleted7d", 0) or 0)
    skipped_7d = int(history.get("workoutsSkipped7d", 0) or 0)
    total_7d = completed_7d + skipped_7d
    completion_rate_7d = float(completed_7d / total_7d) if total_7d > 0 else 0.5
    
    streak_days = int(history.get("currentStreakDays", 0) or 0)
    avg_completed_dur = float(history.get("avgCompletedDuration", today_avail_time) or today_avail_time)
    too_diff_freq = float(history.get("tooDifficultFrequency", 0.0) or 0.0)

    # 4. Candidate Workout Features
    workout_dur = int(workout.get("durationMinutes", 15))
    workout_diff = workout.get("difficulty", "BEGINNER")
    workout_diff_num = DIFFICULTY_MAP.get(workout_diff, 1)
    
    workout_goal = workout.get("goal", "FITNESS")
    workout_goal_num = GOAL_MAP.get(workout_goal, 3)
    
    workout_intensity = workout.get("intensity", "MODERATE")
    workout_intensity_num = INTENSITY_MAP.get(workout_intensity, 2)
    
    workout_eq = workout.get("equipment", "NONE")
    workout_eq_num = EQUIPMENT_MAP.get(workout_eq, 1)
    
    workout_rec_demand = int(workout.get("recoveryDemand", 2))

    # 5. Interaction / Alignment Features
    time_delta_mins = abs(today_avail_time - workout_dur)
    goal_matched = 1.0 if user_goal_num == workout_goal_num or (user_goal in ["STRENGTH", "WEIGHT_GAIN"] and workout_goal in ["STRENGTH", "WEIGHT_GAIN"]) or (user_goal in ["WEIGHT_LOSS", "FITNESS"] and workout_goal in ["WEIGHT_LOSS", "FITNESS"]) else 0.0
    equipment_feasible = 1.0 if workout_eq_num <= user_eq_num else 0.0
    difficulty_matched = 1.0 if workout_diff_num <= (user_exp_num + (1 if energy_level >= 4 else 0)) else 0.0

    features = {
        "user_age": user_age,
        "user_experience_num": user_exp_num,
        "user_goal_num": user_goal_num,
        "user_pref_time": user_pref_time,
        "user_equipment_num": user_eq_num,
        "user_lifestyle_load_num": user_load_num,
        "energy_level": energy_level,
        "readiness_level": readiness_level,
        "today_available_time": today_avail_time,
        "today_academic_load_num": today_load_num,
        "workouts_completed_7d": completed_7d,
        "workouts_skipped_7d": skipped_7d,
        "completion_rate_7d": completion_rate_7d,
        "current_streak_days": streak_days,
        "avg_completed_duration": avg_completed_dur,
        "too_difficult_freq": too_diff_freq,
        "workout_duration": workout_dur,
        "workout_difficulty_num": workout_diff_num,
        "workout_goal_num": workout_goal_num,
        "workout_intensity_num": workout_intensity_num,
        "workout_equipment_num": workout_eq_num,
        "workout_recovery_demand": workout_rec_demand,
        "time_delta_mins": time_delta_mins,
        "goal_matched": goal_matched,
        "equipment_feasible": equipment_feasible,
        "difficulty_matched": difficulty_matched
    }

    return features

def get_feature_list(feature_dict):
    """Returns vector aligned with FEATURE_COLUMNS"""
    return [feature_dict[col] for col in FEATURE_COLUMNS]
