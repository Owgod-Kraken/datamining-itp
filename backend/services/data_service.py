import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, MinMaxScaler, StandardScaler


def load_dataframe(filepath):
    if filepath.endswith(".csv"):
        return pd.read_csv(filepath)
    elif filepath.endswith((".xlsx", ".xls")):
        return pd.read_excel(filepath)
    raise ValueError("Formato no soportado. Use CSV o XLSX.")


def get_data_summary(df):
    return {
        "total_registros": len(df),
        "total_variables": len(df.columns),
        "columnas": list(df.columns),
        "tipos": {col: str(dtype) for col, dtype in df.dtypes.items()},
        "nulos_por_columna": df.isnull().sum().to_dict(),
        "duplicados": int(df.duplicated().sum()),
    }


def get_preview(df, n=50):
    preview = df.head(n).copy()
    for col in preview.columns:
        preview[col] = preview[col].apply(
            lambda x: None if pd.isna(x) else x
        )
    return {
        "columns": list(preview.columns),
        "data": preview.values.tolist(),
    }


def clean_duplicates(df):
    before = len(df)
    df = df.drop_duplicates()
    after = len(df)
    return df, f"Eliminados {before - after} duplicados."


def detect_nulls(df):
    null_info = df.isnull().sum().to_dict()
    total = int(df.isnull().sum().sum())
    return {
        "nulos_por_columna": null_info,
        "total_nulos": total,
    }


def fill_nulls(df, strategy="mode"):
    for col in df.columns:
        if df[col].isnull().sum() > 0:
            if strategy == "mean" and pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].mean())
            elif strategy == "median" and pd.api.types.is_numeric_dtype(df[col]):
                df[col] = df[col].fillna(df[col].median())
            else:
                mode_val = df[col].mode()
                if len(mode_val) > 0:
                    df[col] = df[col].fillna(mode_val[0])
                else:
                    df[col] = df[col].fillna("Sin datos")
    return df, "Nulos rellenados correctamente."


def remove_empty_columns(df, threshold=0.8):
    before = len(df.columns)
    limit = int(len(df) * threshold)
    df = df.dropna(axis=1, thresh=len(df) - limit)
    after = len(df.columns)
    return df, f"Eliminadas {before - after} columnas vacías."


def one_hot_encoding(df, columns=None):
    if columns is None:
        columns = df.select_dtypes(include=["object"]).columns.tolist()
    df = pd.get_dummies(df, columns=columns, drop_first=False)
    for col in df.columns:
        if df[col].dtype == bool:
            df[col] = df[col].astype(int)
    return df, f"One Hot Encoding aplicado a {len(columns)} columnas."


def label_encoding(df, columns=None):
    if columns is None:
        columns = df.select_dtypes(include=["object"]).columns.tolist()
    le = LabelEncoder()
    mappings = {}
    for col in columns:
        if col in df.columns:
            df[col] = df[col].astype(str)
            df[col] = le.fit_transform(df[col])
            mappings[col] = dict(
                zip(le.classes_.tolist(), le.transform(le.classes_).tolist())
            )
    return df, mappings


def normalize_data(df, columns=None):
    if columns is None:
        columns = df.select_dtypes(include=[np.number]).columns.tolist()
    scaler = MinMaxScaler()
    if columns:
        df[columns] = scaler.fit_transform(df[columns])
    return df, f"Normalización aplicada a {len(columns)} columnas."


def scale_data(df, columns=None):
    if columns is None:
        columns = df.select_dtypes(include=[np.number]).columns.tolist()
    scaler = StandardScaler()
    if columns:
        df[columns] = scaler.fit_transform(df[columns])
    return df, f"Escalamiento aplicado a {len(columns)} columnas."


def get_descriptive_stats(df):
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.empty:
        return {"error": "No hay columnas numéricas."}
    stats = {}
    for col in numeric_df.columns:
        col_data = numeric_df[col].dropna()
        mode_val = col_data.mode()
        stats[col] = {
            "media": round(float(col_data.mean()), 4),
            "mediana": round(float(col_data.median()), 4),
            "moda": round(float(mode_val.iloc[0]), 4) if len(mode_val) > 0 else None,
            "maximo": round(float(col_data.max()), 4),
            "minimo": round(float(col_data.min()), 4),
            "varianza": round(float(col_data.var()), 4),
            "desviacion_estandar": round(float(col_data.std()), 4),
            "count": int(col_data.count()),
        }
    return stats


def get_correlation_matrix(df):
    numeric_df = df.select_dtypes(include=[np.number])
    if numeric_df.empty:
        return None
    corr = numeric_df.corr()
    return {
        "columns": corr.columns.tolist(),
        "data": corr.round(4).values.tolist(),
    }


def get_frequency_analysis(df):
    results = {}
    categorical = df.select_dtypes(include=["object"]).columns.tolist()
    for col in categorical:
        counts = df[col].value_counts().head(20)
        results[col] = {
            "labels": counts.index.tolist(),
            "values": counts.values.tolist(),
        }
    return results
