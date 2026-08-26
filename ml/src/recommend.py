"""
FITMINDS ML Recommendation Inference Engine (v2 Dynamic)
Accepts User Context JSON via CLI/stdin, scores candidate workouts using trained model,
applies recency rotation penalties to ensure non-repetitive workouts across logins,
ranks workouts, builds decision factor explanations, and outputs JSON response.
"""

import sys
import os
import json
import joblib
import pandas as pd
import numpy as np

# Adjust python import path to include ml/src
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import (
    CANDIDATE_WORKOUTS,
    MODEL_FILE_PATH,
    METADATA_FILE_PATH,
    MODEL_VERSION,
    FEATURE_COLUMNS
)
from feature_engineering import extract_numeric_features

def build_recommendation_factors(user_profile, current_state, recommended_workout, score):
    """Generates human-readable factors based on feature & BMI alignment."""
    factors = []
    
    today_time = current_state.get("availableTimeMinutes") or user_profile.get("availableWorkoutTime", 20)
    workout_dur = recommended_workout.get("durationMinutes")
    energy = current_state.get("energyLevel", 3)
    user_goal = user_profile.get("fitnessGoal", "FITNESS")
    
    bmi = user_profile.get("bmi")
    bmi_cat = user_profile.get("bmiCategory", "Normal weight")

    if abs(today_time - workout_dur) <= 5:
        factors.append(f"Fits your available time window ({today_time} mins)")

    if bmi:
        if user_goal == "WEIGHT_LOSS" and (bmi >= 25.0 or bmi_cat in ["Overweight", "Obese"]):
            factors.append(f"Calorie-dense circuit tailored for BMI {bmi} ({bmi_cat}) weight loss goal")
        elif user_goal == "WEIGHT_GAIN" and (bmi < 18.5 or bmi_cat == "Underweight"):
            factors.append(f"Hypertrophy stimulus optimized for BMI {bmi} ({bmi_cat}) weight gain goal")

    if energy <= 2 and recommended_workout.get("intensity") == "LOW":
        factors.append("Low-intensity recovery matches your reported low energy today")
    elif energy >= 4 and recommended_workout.get("intensity") in ["MODERATE", "HIGH"]:
        factors.append("Matches your high readiness & energy state today")

    if user_goal == recommended_workout.get("goal") or (user_goal in ["STRENGTH", "WEIGHT_GAIN"] and recommended_workout.get("goal") in ["STRENGTH", "WEIGHT_GAIN"]):
        factors.append(f"Aligned with your primary fitness goal ({user_goal.replace('_', ' ')})")

    if recommended_workout.get("equipment") == user_profile.get("equipment"):
        factors.append(f"Requires equipment you have available ({recommended_workout.get('equipment')})")

    if len(factors) < 2:
        factors.append("Optimized by ML for dynamic routine variation and completion probability")

    return factors

def recommend_workout_for_user(user_context):
    """
    Core Inference Function with Dynamic Rotation.
    user_context = {
      "user_profile": {...},
      "current_state": {...},
      "history": {...}
    }
    """
    user_profile = user_context.get("user_profile", {})
    current_state = user_context.get("current_state", {})
    history = user_context.get("history", {})

    recent_workout_ids = history.get("recentWorkoutIds", [])

    is_cold_start = not history or (history.get("workoutsCompleted7d", 0) == 0 and history.get("workoutsSkipped7d", 0) == 0)

    # 1. Load Model Bundle
    if not os.path.exists(MODEL_FILE_PATH):
        return get_fallback_recommendation(user_profile, current_state, recent_workout_ids, is_cold_start)

    try:
        bundle = joblib.load(MODEL_FILE_PATH)
        regressor = bundle["regressor"]
    except Exception as e:
        return get_fallback_recommendation(user_profile, current_state, recent_workout_ids, is_cold_start)

    # 2. Score Candidate Workouts & Apply Recency Rotation Penalty
    scored_workouts = []
    
    for workout in CANDIDATE_WORKOUTS:
        feat_dict = extract_numeric_features(user_profile, current_state, history, workout)
        X_vec = pd.DataFrame([feat_dict])[FEATURE_COLUMNS]
        
        # Raw ML Model Predict Score
        raw_score = float(regressor.predict(X_vec)[0])
        
        # Dynamic Recency Penalty (Prevents repeating the same workout)
        recency_penalty = 0.0
        if recent_workout_ids:
            if workout["id"] == recent_workout_ids[0]:
                recency_penalty = 0.35 # Heavy penalty for most recent workout
            elif len(recent_workout_ids) > 1 and workout["id"] == recent_workout_ids[1]:
                recency_penalty = 0.20 # Moderate penalty for 2nd recent workout

        final_score = raw_score - recency_penalty
        final_score = round(float(np.clip(final_score, 0.05, 0.99)), 3)
        
        scored_workouts.append({
            "workout": workout,
            "score": final_score,
            "raw_score": round(raw_score, 3)
        })

    # 3. Sort by final score descending
    scored_workouts.sort(key=lambda x: x["score"], reverse=True)

    top_item = scored_workouts[0]
    rec_workout = top_item["workout"]
    rec_score = top_item["score"]

    # 4. Alternatives (Top 2, Top 3, Top 4)
    alternatives = []
    for item in scored_workouts[1:4]:
        w = item["workout"]
        alternatives.append({
            "id": w["id"],
            "title": w["title"],
            "durationMinutes": w["durationMinutes"],
            "difficulty": w["difficulty"],
            "score": item["score"]
        })

    # 5. Build Decision Factors
    factors = build_recommendation_factors(user_profile, current_state, rec_workout, rec_score)

    return {
        "success": True,
        "data": {
            "recommendedWorkout": rec_workout,
            "score": rec_score,
            "alternatives": alternatives,
            "factors": factors,
            "isColdStart": is_cold_start,
            "modelVersion": MODEL_VERSION
        }
    }

def get_fallback_recommendation(user_profile, current_state, recent_workout_ids=None, is_cold_start=True):
    """Safely handles fallback with rotation if model file is unavailable."""
    avail_time = current_state.get("availableTimeMinutes") or user_profile.get("availableWorkoutTime", 20)
    recent_ids = recent_workout_ids or []

    # Pick candidate that matches time best and wasn't done recently
    candidates = [w for w in CANDIDATE_WORKOUTS if w["id"] not in recent_ids]
    if not candidates:
        candidates = CANDIDATE_WORKOUTS

    best_w = candidates[0]
    min_delta = 999
    for w in candidates:
        delta = abs(w["durationMinutes"] - avail_time)
        if delta < min_delta:
            min_delta = delta
            best_w = w

    return {
        "success": True,
        "data": {
            "recommendedWorkout": best_w,
            "score": 0.80,
            "alternatives": [
                {"id": CANDIDATE_WORKOUTS[1]["id"], "title": CANDIDATE_WORKOUTS[1]["title"], "durationMinutes": CANDIDATE_WORKOUTS[1]["durationMinutes"], "difficulty": CANDIDATE_WORKOUTS[1]["difficulty"], "score": 0.75}
            ],
            "factors": [
                f"Matched to your current available time ({avail_time} mins)",
                "Rotated routine based on recent session history"
            ],
            "isColdStart": is_cold_start,
            "modelVersion": "fallback-heuristic-v2"
        }
    }

if __name__ == "__main__":
    input_data = None
    if len(sys.argv) > 1:
        raw_arg = sys.argv[1]
        if os.path.exists(raw_arg):
            with open(raw_arg, "r") as f:
                input_data = json.load(f)
        else:
            try:
                input_data = json.loads(raw_arg)
            except Exception:
                pass

    if not input_data:
        # Default test sample payload
        input_data = {
            "user_profile": {"age": 22, "heightCm": 175, "weightKg": 75, "bmi": 24.49, "bmiCategory": "Normal weight", "fitnessGoal": "WEIGHT_LOSS", "fitnessExperience": "INTERMEDIATE", "availableWorkoutTime": 20, "equipment": "BASIC", "lifestyleLoad": "MODERATE"},
            "current_state": {"energyLevel": 4, "readinessLevel": 4, "availableTimeMinutes": 20, "academicLoad": "MODERATE"},
            "history": {"recentWorkoutIds": ["W007"], "workoutsCompleted7d": 4, "workoutsSkipped7d": 1, "currentStreakDays": 3, "avgCompletedDuration": 20.0}
        }

    result = recommend_workout_for_user(input_data)
    print(json.dumps(result, indent=2))
