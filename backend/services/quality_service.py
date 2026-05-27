import pandas as pd
import numpy as np
from scipy import stats as scipy_stats


def analyze_nulls(df):
    results = []
    total_cells = len(df) * len(df.columns)
    total_nulls = 0

    for col in df.columns:
        null_count = int(df[col].isnull().sum())
        if null_count > 0:
            pct = round(null_count / len(df) * 100, 2)
            total_nulls += null_count
            results.append({
                "tipo": "Nulo",
                "columna": col,
                "registros_afectados": null_count,
                "porcentaje": pct,
                "descripcion": f"Campo vacío ({null_count} registros, {pct}%)",
            })

    return results, total_nulls, total_cells


def analyze_duplicates(df):
    dup_mask = df.duplicated(keep="first")
    dup_count = int(dup_mask.sum())
    dup_indices = df.index[dup_mask].tolist()

    results = []
    for idx in dup_indices[:50]:
        results.append({
            "tipo": "Duplicado",
            "columna": "Registro completo",
            "registro": int(idx),
            "descripcion": "Registro repetido",
        })

    return results, dup_count


def analyze_type_errors(df):
    results = []
    error_count = 0

    for col in df.columns:
        col_data = df[col].dropna()
        if col_data.empty:
            continue

        if df[col].dtype == "object":
            numeric_count = 0
            for val in col_data:
                try:
                    float(str(val))
                    numeric_count += 1
                except (ValueError, TypeError):
                    pass

            ratio = numeric_count / len(col_data) if len(col_data) > 0 else 0

            if 0.3 < ratio < 0.95:
                for i, val in enumerate(col_data):
                    try:
                        float(str(val))
                    except (ValueError, TypeError):
                        error_count += 1
                        if len(results) < 100:
                            results.append({
                                "tipo": "Tipo incorrecto",
                                "columna": col,
                                "registro": int(col_data.index[i]),
                                "valor": str(val),
                                "tipo_esperado": "Numérico",
                                "descripcion": f"Se esperaba número, se encontró: '{val}'",
                            })

        elif pd.api.types.is_numeric_dtype(df[col]):
            for i, val in enumerate(col_data):
                val_str = str(val)
                if val_str.lower() in ("nan", "inf", "-inf"):
                    error_count += 1
                    if len(results) < 100:
                        results.append({
                            "tipo": "Tipo incorrecto",
                            "columna": col,
                            "registro": int(col_data.index[i]),
                            "valor": val_str,
                            "tipo_esperado": "Número válido",
                            "descripcion": f"Valor numérico inválido: '{val_str}'",
                        })

    return results, error_count


def analyze_outliers(df):
    results = []
    outlier_count = 0
    boxplot_data = {}
    scatter_data = {}

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    for col in numeric_cols:
        col_data = df[col].dropna()
        if len(col_data) < 4:
            continue

        q1 = float(col_data.quantile(0.25))
        q3 = float(col_data.quantile(0.75))
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        median_val = float(col_data.median())
        min_val = float(col_data.min())
        max_val = float(col_data.max())

        boxplot_data[col] = {
            "min": min_val,
            "q1": q1,
            "median": median_val,
            "q3": q3,
            "max": max_val,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
        }

        iqr_outliers = col_data[(col_data < lower_bound) | (col_data > upper_bound)]

        z_scores = np.abs(scipy_stats.zscore(col_data, nan_policy="omit"))
        z_outlier_mask = z_scores > 3
        z_outlier_indices = col_data.index[z_outlier_mask]

        all_outlier_indices = set(iqr_outliers.index.tolist()) | set(z_outlier_indices.tolist())
        outlier_count += len(all_outlier_indices)

        values = col_data.values.tolist()
        indices = col_data.index.tolist()
        is_outlier = [idx in all_outlier_indices for idx in indices]
        scatter_data[col] = {
            "values": values,
            "indices": indices,
            "is_outlier": is_outlier,
        }

        for idx in list(all_outlier_indices)[:30]:
            val = float(df.loc[idx, col])
            z_val = float(z_scores[col_data.index.get_loc(idx)]) if idx in col_data.index else 0
            level = "Alto" if z_val > 3 else "Medio"
            method = []
            if idx in iqr_outliers.index:
                method.append("IQR")
            if idx in z_outlier_indices:
                method.append("Z-Score")

            results.append({
                "tipo": "Outlier",
                "columna": col,
                "registro": int(idx),
                "valor": val,
                "z_score": round(z_val, 2),
                "nivel": level,
                "metodo": ", ".join(method),
                "descripcion": f"Valor fuera de rango ({', '.join(method)}): {val}",
            })

    return results, outlier_count, boxplot_data, scatter_data


def analyze_inconsistencies(df):
    results = []
    inconsistency_count = 0

    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()

    for col in numeric_cols:
        col_data = df[col].dropna()
        if col_data.empty:
            continue

        col_lower = col.lower()

        if any(k in col_lower for k in ["edad", "age"]):
            invalid = col_data[(col_data < 0) | (col_data > 120)]
            for idx in invalid.index[:20]:
                inconsistency_count += 1
                results.append({
                    "tipo": "Inconsistencia",
                    "columna": col,
                    "registro": int(idx),
                    "valor": float(df.loc[idx, col]),
                    "descripcion": f"Edad fuera de rango válido (0-120): {df.loc[idx, col]}",
                })

        elif any(k in col_lower for k in ["semestre", "semester"]):
            invalid = col_data[(col_data < 1) | (col_data > 15)]
            for idx in invalid.index[:20]:
                inconsistency_count += 1
                results.append({
                    "tipo": "Inconsistencia",
                    "columna": col,
                    "registro": int(idx),
                    "valor": float(df.loc[idx, col]),
                    "descripcion": f"Semestre fuera de rango válido (1-15): {df.loc[idx, col]}",
                })

        elif any(k in col_lower for k in ["calificacion", "nota", "grade", "score"]):
            invalid = col_data[(col_data < 0) | (col_data > 100)]
            for idx in invalid.index[:20]:
                inconsistency_count += 1
                results.append({
                    "tipo": "Inconsistencia",
                    "columna": col,
                    "registro": int(idx),
                    "valor": float(df.loc[idx, col]),
                    "descripcion": f"Calificación fuera de rango (0-100): {df.loc[idx, col]}",
                })

        if col_data.min() < 0 and not any(k in col_lower for k in [
            "temperatura", "temp", "balance", "diferencia", "cambio",
            "latitud", "longitud", "lat", "lon", "lng",
        ]):
            negative = col_data[col_data < 0]
            for idx in negative.index[:10]:
                inconsistency_count += 1
                results.append({
                    "tipo": "Inconsistencia",
                    "columna": col,
                    "registro": int(idx),
                    "valor": float(df.loc[idx, col]),
                    "descripcion": f"Valor negativo inesperado: {df.loc[idx, col]}",
                })

    return results, inconsistency_count


def analyze_empty_columns(df):
    results = []
    problematic_count = 0

    for col in df.columns:
        null_pct = df[col].isnull().sum() / len(df) * 100

        if null_pct == 100:
            problematic_count += 1
            results.append({
                "tipo": "Columna vacía",
                "columna": col,
                "porcentaje_vacio": 100.0,
                "descripcion": "Columna completamente vacía. Se recomienda eliminarla.",
                "recomendacion": "Eliminar columna",
            })
        elif null_pct >= 80:
            problematic_count += 1
            results.append({
                "tipo": "Columna casi vacía",
                "columna": col,
                "porcentaje_vacio": round(null_pct, 2),
                "descripcion": f"Columna con {round(null_pct, 1)}% de datos faltantes.",
                "recomendacion": "Considerar eliminar o completar datos",
            })

    return results, problematic_count


def calculate_quality_score(df, null_count, dup_count, type_errors, outlier_count, inconsistencies, empty_cols):
    total_cells = len(df) * len(df.columns)
    if total_cells == 0:
        return 100

    error_weight = (
        null_count * 1.0
        + dup_count * 2.0
        + type_errors * 1.5
        + outlier_count * 0.5
        + inconsistencies * 1.5
        + empty_cols * 3.0
    )

    max_penalty = total_cells * 1.5
    score = max(0, 100 - (error_weight / max_penalty * 100))
    return round(score, 1)


def get_quality_level(score):
    if score >= 90:
        return {"level": "Excelente", "color": "#10b981", "emoji": "green"}
    elif score >= 70:
        return {"level": "Aceptable", "color": "#f59e0b", "emoji": "yellow"}
    else:
        return {"level": "Deficiente", "color": "#ef4444", "emoji": "red"}


def generate_recommendations(df, null_results, dup_count, type_results, outlier_results, inconsistency_results, empty_col_results):
    recommendations = []

    for col_name in set(r["columna"] for r in null_results):
        col_nulls = [r for r in null_results if r["columna"] == col_name]
        if col_nulls:
            pct = col_nulls[0]["porcentaje"]
            recommendations.append({
                "tipo": "Valores Nulos",
                "mensaje": f"La columna '{col_name}' presenta un {pct}% de datos faltantes. "
                           f"Considere completar la información antes de aplicar modelos predictivos.",
                "prioridad": "Alta" if pct > 30 else "Media",
            })

    if dup_count > 0:
        recommendations.append({
            "tipo": "Duplicados",
            "mensaje": f"Se detectaron {dup_count} registros duplicados. "
                       f"Se recomienda eliminarlos para evitar sesgo en el análisis.",
            "prioridad": "Alta",
        })

    outlier_cols = set(r["columna"] for r in outlier_results)
    for col_name in outlier_cols:
        col_outliers = [r for r in outlier_results if r["columna"] == col_name]
        recommendations.append({
            "tipo": "Valores Atípicos",
            "mensaje": f"Se detectó que la columna '{col_name}' contiene {len(col_outliers)} valores fuera del rango esperado. "
                       f"Se recomienda revisar los registros {', '.join(str(r['registro']) for r in col_outliers[:5])}.",
            "prioridad": "Media",
        })

    for r in inconsistency_results:
        recommendations.append({
            "tipo": "Inconsistencia",
            "mensaje": r["descripcion"],
            "prioridad": "Alta",
        })

    for r in empty_col_results:
        recommendations.append({
            "tipo": "Columna Problemática",
            "mensaje": f"La columna '{r['columna']}' tiene {r['porcentaje_vacio']}% de datos faltantes. {r['recomendacion']}.",
            "prioridad": "Alta" if r["porcentaje_vacio"] == 100 else "Media",
        })

    if type_results:
        affected_cols = set(r["columna"] for r in type_results)
        recommendations.append({
            "tipo": "Tipos de Datos",
            "mensaje": f"Se encontraron tipos de datos incorrectos en las columnas: {', '.join(affected_cols)}. "
                       f"Revise y corrija antes de aplicar algoritmos.",
            "prioridad": "Alta",
        })

    return recommendations


def full_quality_analysis(df):
    null_results, total_nulls, total_cells = analyze_nulls(df)
    dup_results, dup_count = analyze_duplicates(df)
    type_results, type_error_count = analyze_type_errors(df)
    outlier_results, outlier_count, boxplot_data, scatter_data = analyze_outliers(df)
    inconsistency_results, inconsistency_count = analyze_inconsistencies(df)
    empty_col_results, empty_col_count = analyze_empty_columns(df)

    total_errors = total_nulls + dup_count + type_error_count + outlier_count + inconsistency_count

    quality_score = calculate_quality_score(
        df, total_nulls, dup_count, type_error_count,
        outlier_count, inconsistency_count, empty_col_count
    )
    quality_level = get_quality_level(quality_score)

    all_errors = null_results + dup_results + type_results + outlier_results + inconsistency_results + empty_col_results

    recommendations = generate_recommendations(
        df, null_results, dup_count, type_results,
        outlier_results, inconsistency_results, empty_col_results
    )

    return {
        "quality_score": quality_score,
        "quality_level": quality_level,
        "kpis": {
            "total_errores": total_errors,
            "valores_nulos": total_nulls,
            "duplicados": dup_count,
            "outliers": outlier_count,
            "tipo_errores": type_error_count,
            "inconsistencias": inconsistency_count,
            "columnas_problematicas": empty_col_count,
            "total_registros": len(df),
            "total_columnas": len(df.columns),
            "total_celdas": total_cells,
        },
        "errores": all_errors[:500],
        "boxplot_data": boxplot_data,
        "scatter_data": {
            col: {
                "values": data["values"][:200],
                "indices": data["indices"][:200],
                "is_outlier": data["is_outlier"][:200],
            } for col, data in scatter_data.items()
        },
        "recommendations": recommendations,
    }


def auto_correct(df, operations):
    messages = []
    changes = {
        "duplicados_eliminados": 0,
        "nulos_corregidos": 0,
        "tipos_convertidos": 0,
        "columnas_normalizadas": 0,
    }

    if "duplicates" in operations:
        before = len(df)
        df = df.drop_duplicates()
        removed = before - len(df)
        changes["duplicados_eliminados"] = removed
        messages.append(f"Eliminados {removed} registros duplicados.")

    if "nulls" in operations:
        null_count_before = int(df.isnull().sum().sum())
        for col in df.columns:
            if df[col].isnull().sum() > 0:
                if pd.api.types.is_numeric_dtype(df[col]):
                    df[col] = df[col].fillna(df[col].median())
                else:
                    mode_val = df[col].mode()
                    if len(mode_val) > 0:
                        df[col] = df[col].fillna(mode_val[0])
                    else:
                        df[col] = df[col].fillna("Sin datos")
        null_count_after = int(df.isnull().sum().sum())
        changes["nulos_corregidos"] = null_count_before - null_count_after
        messages.append(f"Corregidos {null_count_before - null_count_after} valores nulos.")

    if "types" in operations:
        converted = 0
        for col in df.columns:
            if df[col].dtype == "object":
                try:
                    df[col] = pd.to_numeric(df[col], errors="coerce")
                    if df[col].notna().sum() > 0:
                        converted += 1
                except (ValueError, TypeError):
                    pass
        changes["tipos_convertidos"] = converted
        messages.append(f"Convertidos {converted} columnas a tipo numérico.")

    if "normalize" in operations:
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        for col in numeric_cols:
            col_range = df[col].max() - df[col].min()
            if col_range > 0:
                df[col] = (df[col] - df[col].min()) / col_range
        changes["columnas_normalizadas"] = len(numeric_cols)
        messages.append(f"Normalizadas {len(numeric_cols)} columnas numéricas.")

    return df, messages, changes


def generate_quality_pdf_data(df, analysis):
    return {
        "title": "Reporte de Calidad de Datos",
        "quality_score": analysis["quality_score"],
        "quality_level": analysis["quality_level"],
        "kpis": analysis["kpis"],
        "recommendations": analysis["recommendations"],
        "error_summary": {
            "Valores Nulos": analysis["kpis"]["valores_nulos"],
            "Duplicados": analysis["kpis"]["duplicados"],
            "Outliers": analysis["kpis"]["outliers"],
            "Tipos Incorrectos": analysis["kpis"]["tipo_errores"],
            "Inconsistencias": analysis["kpis"]["inconsistencias"],
            "Columnas Problemáticas": analysis["kpis"]["columnas_problematicas"],
        },
        "total_registros": len(df),
        "total_columnas": len(df.columns),
    }
