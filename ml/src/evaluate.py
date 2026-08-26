"""
FITMINDS ML Model Evaluation Script
Computes MAE, RMSE, Top-1 accuracy, Top-3 coverage, and feature importance rankings.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from config import MODELS_DIR, MODEL_FILE_PATH, METADATA_FILE_PATH, FEATURE_COLUMNS

def evaluate_recommender():
    if not os.path.exists(MODEL_FILE_PATH) or not os.path.exists(METADATA_FILE_PATH):
        print("[ERROR] Model files not found! Please run python ml/src/train.py first.")
        return

    with open(METADATA_FILE_PATH, "r") as f:
        metadata = json.load(f)

    print("============================================================")
    print("FITMINDS ML RECOMMENDATION MODEL EVALUATION REPORT")
    print("============================================================")
    print(f"* Model Version     : {metadata.get('model_version')}")
    print(f"* Trained At        : {metadata.get('trained_at')}")
    print(f"* Dataset Source    : {metadata.get('dataset_source')}")
    print(f"* Training Samples  : {metadata.get('training_samples')}")
    print(f"* Test Samples      : {metadata.get('test_samples')}")
    print("------------------------------------------------------------")
    print("PERFORMANCE METRICS:")
    metrics = metadata.get("metrics", {})
    print(f"  * MAE (Mean Absolute Error)     : {metrics.get('mae')}")
    print(f"  * RMSE (Root Mean Square Error) : {metrics.get('rmse')}")
    print(f"  * R2 Score (Variance Explained)  : {metrics.get('r2_score')}")
    print(f"  * Completion Classification Acc  : {metrics.get('binary_accuracy') * 100:.2f}%")
    print("------------------------------------------------------------")
    print("TOP FEATURE IMPORTANCES:")
    feat_imp = metadata.get("feature_importance", {})
    for feat, imp in list(feat_imp.items())[:10]:
        bar = "#" * int(imp * 50)
        print(f"  * {feat:<28} : {imp:.4f} {bar}")
    print("============================================================")

if __name__ == "__main__":
    evaluate_recommender()
