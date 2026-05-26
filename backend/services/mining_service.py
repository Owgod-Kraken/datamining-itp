import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)
from sklearn.preprocessing import LabelEncoder, StandardScaler


def prepare_classification_data(df, target_column):
    df_clean = df.dropna()
    le_dict = {}
    df_encoded = df_clean.copy()

    for col in df_encoded.select_dtypes(include=["object"]).columns:
        le = LabelEncoder()
        df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
        le_dict[col] = le

    X = df_encoded.drop(columns=[target_column])
    y = df_encoded[target_column]
    return X, y, le_dict


def run_decision_tree(df, target_column, test_size=0.3):
    X, y, le_dict = prepare_classification_data(df, target_column)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42
    )
    model = DecisionTreeClassifier(random_state=42, max_depth=5)
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    avg = "weighted" if len(set(y)) > 2 else "binary"
    cm = confusion_matrix(y_test, y_pred)

    target_le = le_dict.get(target_column)
    if target_le:
        labels = target_le.classes_.tolist()
    else:
        labels = sorted(y.unique().tolist())

    return {
        "algorithm": "Árbol de Decisión",
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred, average=avg, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred, average=avg, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred, average=avg, zero_division=0)), 4),
        "confusion_matrix": cm.tolist(),
        "labels": labels,
        "feature_importance": dict(
            zip(X.columns.tolist(), model.feature_importances_.round(4).tolist())
        ),
    }


def run_random_forest(df, target_column, test_size=0.3, n_estimators=100):
    X, y, le_dict = prepare_classification_data(df, target_column)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=42
    )
    model = RandomForestClassifier(
        n_estimators=n_estimators, random_state=42, max_depth=5
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    avg = "weighted" if len(set(y)) > 2 else "binary"
    cm = confusion_matrix(y_test, y_pred)

    target_le = le_dict.get(target_column)
    if target_le:
        labels = target_le.classes_.tolist()
    else:
        labels = sorted(y.unique().tolist())

    return {
        "algorithm": "Random Forest",
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(float(precision_score(y_test, y_pred, average=avg, zero_division=0)), 4),
        "recall": round(float(recall_score(y_test, y_pred, average=avg, zero_division=0)), 4),
        "f1_score": round(float(f1_score(y_test, y_pred, average=avg, zero_division=0)), 4),
        "confusion_matrix": cm.tolist(),
        "labels": labels,
        "feature_importance": dict(
            zip(X.columns.tolist(), model.feature_importances_.round(4).tolist())
        ),
    }


def run_kmeans(df, n_clusters=3, columns=None):
    df_clean = df.copy()

    for col in df_clean.select_dtypes(include=["object"]).columns:
        le = LabelEncoder()
        df_clean[col] = le.fit_transform(df_clean[col].astype(str))

    df_clean = df_clean.fillna(df_clean.mean(numeric_only=True))

    if columns:
        valid_cols = [c for c in columns if c in df_clean.columns]
        if valid_cols:
            df_clean = df_clean[valid_cols]

    numeric_cols = df_clean.select_dtypes(include=[np.number]).columns.tolist()
    if len(numeric_cols) < 2:
        return {"error": "Se necesitan al menos 2 columnas numéricas."}

    df_numeric = df_clean[numeric_cols]
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(df_numeric)

    n_clusters = min(n_clusters, len(df_numeric))
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(X_scaled)

    profiles = []
    df_numeric_with_labels = df_numeric.copy()
    df_numeric_with_labels["cluster"] = labels

    for i in range(n_clusters):
        cluster_data = df_numeric_with_labels[
            df_numeric_with_labels["cluster"] == i
        ].drop(columns=["cluster"])
        profile = {
            "cluster": i,
            "size": int(len(cluster_data)),
            "percentage": round(float(len(cluster_data) / len(df_numeric) * 100), 2),
            "means": cluster_data.mean().round(4).to_dict(),
        }
        profiles.append(profile)

    col_x = numeric_cols[0]
    col_y = numeric_cols[1] if len(numeric_cols) > 1 else numeric_cols[0]

    scatter_data = []
    for i in range(n_clusters):
        mask = labels == i
        scatter_data.append({
            "cluster": i,
            "x": df_numeric.loc[mask, col_x].tolist(),
            "y": df_numeric.loc[mask, col_y].tolist(),
        })

    return {
        "algorithm": "K-Means",
        "n_clusters": n_clusters,
        "inertia": round(float(kmeans.inertia_), 4),
        "profiles": profiles,
        "scatter": scatter_data,
        "axis_labels": {"x": col_x, "y": col_y},
        "labels": labels.tolist(),
    }
