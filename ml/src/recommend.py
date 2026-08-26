"""
FITMINDS ML Recommendation Inference Engine
Accepts User Context JSON via CLI/stdin, scores candidate workouts using trained model,
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
    """Generates human-readable factors based on feature alignment."""
    factors = []
    
    today_time = current_state.get("availableTimeMinutes") or user_profile.get("availableWorkoutTime", 20)
    workout_dur = recommended_workout.get("durationMinutes")
    energy = current_state.get("energyLevel", 3)
    user_goal = user_profile.get("fitnessGoal", "FITNESS")

    if abs(today_time - workout_dur) <= 5:
        factors.append(f"Fits your available time window ({today_time} mins)")

    if energy <= 2 and recommended_workout.get("intensity") == "LOW":
        factors.append("Low-intensity recovery matches your reported low energy today")
    elif energy >= 4 and recommended_workout.get("intensity") in ["MODERATE", "HIGH"]:
        factors.append("Matches your high readiness & energy state today")

    if user_goal == recommended_workout.get("goal") or (user_goal in ["STRENGTH", "WEIGHT_GAIN"] and recommended_workout.get("goal") in ["STRENGTH", "WEIGHT_GAIN"]):
        factors.append(f"Aligned with your primary fitness goal ({user_goal.replace('_', ' ')})")

    if recommended_workout.get("equipment") == user_profile.get("equipment"):
        factors.append(f"Requires equipment you have available ({recommended_workout.get('equipment')})")

    if len(factors) < 2:
        factors.append("Optimized for consistent completion probability")

    return factors

def recommend_workout_for_user(user_context):
    """
    Core Inference Function.
    user_context = {
      "user_profile": {...},
      "current_state": {...},
      "history": {...}
    }
    """
    user_profile = user_context.get("user_profile", {})
    current_state = user_context.get("current_state", {})
    history = user_context.get("history", {})

    # Detect cold start user (no workout history)
    is_cold_start = not history or (history.get("workoutsCompleted7d", 0) == 0 and history.get("workoutsSkipped7d", 0) == 0)

    # 1. Load Model Bundle
    if not os.path.exists(MODEL_FILE_PATH):
        return get_fallback_recommendation(user_profile, current_state, is_cold_start)

    try:
        bundle = joblib.load(MODEL_FILE_PATH)
        regressor = bundle["regressor"]
    except Exception as e:
        return get_fallback_recommendation(user_profile, current_state, is_cold_start)

    # 2. Score Candidate Workouts
    scored_workouts = []
    
    for workout in CANDIDATE_WORKOUTS:
        feat_dict = extract_numeric_features(user_profile, current_state, history, workout)
        X_vec = pd.DataFrame([feat_dict])[FEATURE_COLUMNS]
        
        # ML Model Predict Suitability Score
        score = float(regressor.predict(X_vec)[0])
        score = round(float(np.clip(score, 0.05, 0.99)), 3)
        
        scored_workouts.append({
            "workout": workout,
            "score": score
        })

    # 3. Sort by score descending
    scored_workouts.sort(key=lambda x: x["score"], reverse=True)

    top_item = scored_workouts[0]
    rec_workout = top_item["workout"]
    rec_score = top_item["score"]

    # 4. Alternatives (Top 2 and Top 3)
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

def get_fallback_recommendation(user_profile, current_state, is_cold_start=True):
    """Safely handles fallback if model file is unavailable."""
    avail_time = current_state.get("availableTimeMinutes") or user_profile.get("availableWorkoutTime", 20)
    
    best_w = CANDIDATE_WORKOUTS[0]
    min_delta = 999
    for w in CANDIDATE_WORKOUTS:
        delta = abs(w["durationMinutes"] - avail_time)
        if delta < min_delta:
            min_delta = delta
            best_w = w

    return {
        "success": True,
        "data": {
            "recommendedWorkout": best_w,
            "score": 0.75,
            "alternatives": [
                {"id": CANDIDATE_WORKOUTS[1]["id"], "title": CANDIDATE_WORKOUTS[1]["title"], "durationMinutes": CANDIDATE_WORKOUTS[1]["durationMinutes"], "difficulty": CANDIDATE_WORKOUTS[1]["difficulty"], "score": 0.70}
            ],
            "factors": [
                f"Matched to your current available time ({avail_time} mins)",
                "Fallback heuristic recommendation active"
            ],
            "isColdStart": is_cold_start,
            "modelVersion": "fallback-heuristic-v1"
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
            input_data = json.loads(raw_arg)

    if not input_data:
        # Check stdin if available without blocking indefinitely
        if not sys.stdin.isatty():
            try:
                stdin_content = sys.stdin.read().strip()
                if stdin_content:
                    input_data = json.loads(stdin_content)
            except Exception:
                pass

    if not input_data:
        # Default test sample payload
        input_data = {
            "user_profile": {"age": 22, "fitnessGoal": "STRENGTH", "fitnessExperience": "INTERMEDIATE", "availableWorkoutTime": 20, "equipment": "BASIC", "lifestyleLoad": "MODERATE"},
            "current_state": {"energyLevel": 4, "readinessLevel": 4, "availableTimeMinutes": 20, "academicLoad": "MODERATE"},
            "history": {"workoutsCompleted7d": 4, "workoutsSkipped7d": 1, "currentStreakDays": 3, "avgCompletedDuration": 20.0, "tooDifficultFrequency": 0.1}
        }

    result = recommend_workout_for_user(input_data)
    print(json.dumps(result, indent=2))
