"""
FITMINDS Data Loader & Synthetic Dataset Generator
Generates realistic 1,500-sample synthetic development data clearly marked as DEVELOPMENT / SYNTHETIC DATA.
"""

import os
import random
import pandas as pd
import numpy as np
from config import CANDIDATE_WORKOUTS, PROCESSED_DATA_DIR, FEATURE_COLUMNS
from feature_engineering import extract_numeric_features

def generate_synthetic_dataset(num_samples=1500, output_csv_path=None):
    """
    Generates synthetic workout recommendation & outcome dataset.
    Target label: 'suitability_score' (float 0.0 - 1.0) and 'successful_completion' (int 0 or 1).
    """
    random.seed(42)
    np.random.seed(42)

    goals = ["STRENGTH", "FITNESS", "CONSISTENCY", "ACTIVE", "WEIGHT_GAIN", "WEIGHT_LOSS"]
    experiences = ["BEGINNER", "INTERMEDIATE", "ADVANCED"]
    equipments = ["NONE", "BASIC", "GYM"]
    loads = ["LOW", "MODERATE", "HIGH"]

    rows = []

    for idx in range(num_samples):
        # 1. Random User Profile
        user_goal = random.choice(goals)
        user_exp = random.choice(experiences)
        user_eq = random.choice(equipments)
        user_load = random.choice(loads)
        user_pref_time = random.choice([10, 15, 20, 30, 45])
        user_age = random.randint(18, 26)

        user_profile = {
            "age": user_age,
            "fitnessExperience": user_exp,
            "fitnessGoal": user_goal,
            "availableWorkoutTime": user_pref_time,
            "equipment": user_eq,
            "lifestyleLoad": user_load
        }

        # 2. Random Today Check-in
        energy_level = random.randint(1, 5)
        readiness_level = random.randint(1, 5)
        
        if user_load == "HIGH" or energy_level <= 2:
            today_avail_time = random.choice([10, 15, 20])
        else:
            today_avail_time = random.choice([15, 20, 30, 45])

        current_state = {
            "energyLevel": energy_level,
            "readinessLevel": readiness_level,
            "availableTimeMinutes": today_avail_time,
            "academicLoad": user_load
        }

        # 3. Random History
        completed_7d = random.randint(0, 6)
        skipped_7d = random.randint(0, 4)
        streak = random.randint(0, 12)
        avg_duration = random.choice([12.0, 15.0, 20.0, 25.0])
        too_diff_freq = random.choice([0.0, 0.1, 0.25, 0.4])

        history = {
            "workoutsCompleted7d": completed_7d,
            "workoutsSkipped7d": skipped_7d,
            "currentStreakDays": streak,
            "avgCompletedDuration": avg_duration,
            "tooDifficultFrequency": too_diff_freq
        }

        # 4. Pick candidate workout
        workout = random.choice(CANDIDATE_WORKOUTS)

        # 5. Extract Feature Dictionary
        feat_dict = extract_numeric_features(user_profile, current_state, history, workout)

        # 6. Calculate Ground-Truth Suitability Score & Outcome Label
        time_diff = feat_dict["time_delta_mins"]
        is_feasible_eq = feat_dict["equipment_feasible"]
        is_matched_diff = feat_dict["difficulty_matched"]
        is_matched_goal = feat_dict["goal_matched"]
        
        base_score = 0.5
        
        if time_diff == 0:
            base_score += 0.25
        elif time_diff <= 5:
            base_score += 0.15
        elif time_diff <= 10:
            base_score += 0.05
        else:
            base_score -= 0.30

        if energy_level <= 2 and feat_dict["workout_intensity_num"] >= 3:
            base_score -= 0.30
        elif energy_level <= 2 and feat_dict["workout_intensity_num"] == 1:
            base_score += 0.20

        if is_feasible_eq == 0:
            base_score -= 0.40

        if is_matched_goal == 1:
            base_score += 0.15

        if user_load == "HIGH" and feat_dict["workout_duration"] > 20:
            base_score -= 0.25

        suitability_score = float(np.clip(base_score + np.random.normal(0, 0.05), 0.05, 0.98))
        successful_completion = 1 if suitability_score >= 0.60 else 0

        feat_dict["suitability_score"] = round(suitability_score, 4)
        feat_dict["successful_completion"] = successful_completion
        feat_dict["workout_id"] = workout["id"]
        feat_dict["dataset_type"] = "DEVELOPMENT_SYNTHETIC"

        rows.append(feat_dict)

    df = pd.DataFrame(rows)
    
    if output_csv_path:
        os.makedirs(os.path.dirname(output_csv_path), exist_ok=True)
        df.to_csv(output_csv_path, index=False)
        print(f"[DATA] Generated {len(df)} synthetic samples at: {output_csv_path}")

    return df

if __name__ == "__main__":
    out_path = os.path.join(PROCESSED_DATA_DIR, "workout_synthetic_dataset.csv")
    df = generate_synthetic_dataset(num_samples=1500, output_csv_path=out_path)
    print(df.head())
