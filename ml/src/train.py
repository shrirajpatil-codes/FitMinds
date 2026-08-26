"""
FITMINDS ML Model Training Pipeline
Loads synthetic training dataset, validates features, splits train/test set,
trains Scikit-Learn Random Forest Regressor & Classifier, evaluates metrics,
and saves model artifacts to ml/models/workout_recommender.joblib and model_metadata.json.
"""

import os
import json
import time
import joblib
import numpy as np
import pandas as pd
from datetime import datetime

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score

from config import (
    PROCESSED_DATA_DIR,
    MODELS_DIR,
    MODEL_FILE_PATH,
    METADATA_FILE_PATH,
    MODEL_VERSION,
    FEATURE_COLUMNS
)
from data_loader import generate_synthetic_dataset

def train_recommender_model():
    print("[FITMINDS ML] Starting Workout Recommender Model Training...")

    csv_path = os.path.join(PROCESSED_DATA_DIR, "workout_synthetic_dataset.csv")
    if not os.path.exists(csv_path):
        print("[DATA] Dataset not found. Generating 1,500 synthetic development samples...")
        df = generate_synthetic_dataset(num_samples=1500, output_csv_path=csv_path)
    else:
        df = pd.read_csv(csv_path)

    print(f"[DATA] Loaded dataset: {len(df)} rows across {len(FEATURE_COLUMNS)} input features.")

    X = df[FEATURE_COLUMNS]
    y_reg = df["suitability_score"]
    y_cls = df["successful_completion"]

    # 80/20 Train Test Split
    X_train, X_test, y_train_reg, y_test_reg, y_train_cls, y_test_cls = train_test_split(
        X, y_reg, y_cls, test_size=0.20, random_state=42
    )

    print(f"[DATA] Train set: {len(X_train)} samples | Test set: {len(X_test)} samples")

    # 1. Train Random Forest Regressor
    t0 = time.time()
    regressor = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    regressor.fit(X_train, y_train_reg)
    train_time = round(time.time() - t0, 3)

    # 2. Evaluate Regressor
    y_pred_reg = regressor.predict(X_test)
    mae = float(mean_absolute_error(y_test_reg, y_pred_reg))
    rmse = float(np.sqrt(mean_squared_error(y_test_reg, y_pred_reg)))
    r2 = float(r2_score(y_test_reg, y_pred_reg))

    # 3. Train Classifier for binary completion prediction
    classifier = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    classifier.fit(X_train, y_train_cls)
    y_pred_cls = classifier.predict(X_test)
    cls_acc = float(accuracy_score(y_test_cls, y_pred_cls))

    # Feature Importances
    importances = regressor.feature_importances_
    feat_imp = {feat: round(float(imp), 4) for feat, imp in sorted(zip(FEATURE_COLUMNS, importances), key=lambda x: x[1], reverse=True)}

    print(f"[TRAIN] Training completed in {train_time} seconds!")
    print(f"[METRICS] Performance Summary:")
    print(f"   * MAE: {mae:.4f}")
    print(f"   * RMSE: {rmse:.4f}")
    print(f"   * R2 Score: {r2:.4f}")
    print(f"   * Binary Completion Accuracy: {cls_acc*100:.2f}%")

    # Save Model Bundle
    os.makedirs(MODELS_DIR, exist_ok=True)
    model_bundle = {
        "regressor": regressor,
        "classifier": classifier,
        "feature_columns": FEATURE_COLUMNS,
        "model_version": MODEL_VERSION
    }
    joblib.dump(model_bundle, MODEL_FILE_PATH)
    print(f"[SAVE] Model saved to: {MODEL_FILE_PATH}")

    # Save Metadata JSON
    metadata = {
        "model_version": MODEL_VERSION,
        "trained_at": datetime.now().isoformat(),
        "training_samples": len(X_train),
        "test_samples": len(X_test),
        "dataset_source": "DEVELOPMENT_SYNTHETIC",
        "metrics": {
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2_score": round(r2, 4),
            "binary_accuracy": round(cls_acc, 4)
        },
        "feature_importance": feat_imp,
        "features_used": FEATURE_COLUMNS
    }

    with open(METADATA_FILE_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"[SAVE] Metadata saved to: {METADATA_FILE_PATH}")
    return metadata

if __name__ == "__main__":
    train_recommender_model()
