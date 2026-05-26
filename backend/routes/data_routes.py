import os
import json
from flask import Blueprint, request, jsonify
from models import SessionLocal
from models.archivo import Archivo
from services.data_service import (
    load_dataframe,
    get_data_summary,
    get_preview,
    clean_duplicates,
    detect_nulls,
    fill_nulls,
    remove_empty_columns,
    one_hot_encoding,
    label_encoding,
    normalize_data,
    scale_data,
    get_descriptive_stats,
    get_correlation_matrix,
    get_frequency_analysis,
)

data_bp = Blueprint("data", __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
DATASET_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dataset")


def get_filepath(archivo_id):
    if archivo_id == 0:
        return os.path.join(DATASET_FOLDER, "encuesta_servicio_social.csv")
    db = SessionLocal()
    archivo = db.query(Archivo).filter(Archivo.id == archivo_id).first()
    db.close()
    if not archivo:
        return None
    return os.path.join(UPLOAD_FOLDER, archivo.nombre)


@data_bp.route("/api/data/<int:archivo_id>/summary", methods=["GET"])
def data_summary(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404
    df = load_dataframe(filepath)
    return jsonify(get_data_summary(df))


@data_bp.route("/api/data/<int:archivo_id>/preview", methods=["GET"])
def data_preview(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404
    df = load_dataframe(filepath)
    n = request.args.get("n", 50, type=int)
    return jsonify(get_preview(df, n))


@data_bp.route("/api/data/<int:archivo_id>/clean", methods=["POST"])
def clean_data(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404

    df = load_dataframe(filepath)
    body = request.get_json() or {}
    operations = body.get("operations", ["duplicates", "nulls", "empty_columns"])
    fill_strategy = body.get("fill_strategy", "mode")
    messages = []

    original_preview = get_preview(df)

    if "duplicates" in operations:
        df, msg = clean_duplicates(df)
        messages.append(msg)

    if "nulls" in operations:
        df, msg = fill_nulls(df, strategy=fill_strategy)
        messages.append(msg)

    if "empty_columns" in operations:
        df, msg = remove_empty_columns(df)
        messages.append(msg)

    processed_preview = get_preview(df)

    return jsonify({
        "messages": messages,
        "original": original_preview,
        "processed": processed_preview,
        "summary": get_data_summary(df),
    })


@data_bp.route("/api/data/<int:archivo_id>/transform", methods=["POST"])
def transform_data(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404

    df = load_dataframe(filepath)
    body = request.get_json() or {}
    operation = body.get("operation", "label_encoding")
    columns = body.get("columns", None)
    messages = []
    mappings = None

    original_preview = get_preview(df)

    if operation == "one_hot":
        df, msg = one_hot_encoding(df, columns)
        messages.append(msg)
    elif operation == "label_encoding":
        df, mappings = label_encoding(df, columns)
        messages.append("Label Encoding aplicado.")
    elif operation == "normalize":
        df, msg = normalize_data(df, columns)
        messages.append(msg)
    elif operation == "scale":
        df, msg = scale_data(df, columns)
        messages.append(msg)

    processed_preview = get_preview(df)

    result = {
        "messages": messages,
        "original": original_preview,
        "processed": processed_preview,
        "summary": get_data_summary(df),
    }
    if mappings:
        result["mappings"] = mappings
    return jsonify(result)


@data_bp.route("/api/data/<int:archivo_id>/stats", methods=["GET"])
def descriptive_stats(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404
    df = load_dataframe(filepath)
    return jsonify(get_descriptive_stats(df))


@data_bp.route("/api/data/<int:archivo_id>/correlation", methods=["GET"])
def correlation(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404
    df = load_dataframe(filepath)
    result = get_correlation_matrix(df)
    if result is None:
        return jsonify({"error": "No hay columnas numéricas"}), 400
    return jsonify(result)


@data_bp.route("/api/data/<int:archivo_id>/frequencies", methods=["GET"])
def frequencies(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404
    df = load_dataframe(filepath)
    return jsonify(get_frequency_analysis(df))


@data_bp.route("/api/data/<int:archivo_id>/nulls", methods=["GET"])
def null_analysis(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404
    df = load_dataframe(filepath)
    return jsonify(detect_nulls(df))


@data_bp.route("/api/data/<int:archivo_id>/columns", methods=["GET"])
def get_columns(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404
    df = load_dataframe(filepath)
    columns = []
    for col in df.columns:
        columns.append({
            "name": col,
            "dtype": str(df[col].dtype),
            "nulls": int(df[col].isnull().sum()),
            "unique": int(df[col].nunique()),
        })
    return jsonify(columns)
