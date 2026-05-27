import os
from flask import Blueprint, request, jsonify
from models import SessionLocal
from models.archivo import Archivo
from services.data_service import load_dataframe
from services.mining_service import run_decision_tree, run_random_forest, run_kmeans

mining_bp = Blueprint("mining", __name__)

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
    if archivo.nombre == "encuesta_servicio_social.csv":
        return os.path.join(DATASET_FOLDER, archivo.nombre)
    return os.path.join(UPLOAD_FOLDER, archivo.nombre)


@mining_bp.route("/api/mining/<int:archivo_id>/classify", methods=["POST"])
def classify(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404

    df = load_dataframe(filepath)
    body = request.get_json() or {}
    target = body.get("target_column")
    algorithm = body.get("algorithm", "decision_tree")
    test_size = body.get("test_size", 0.3)

    if not target:
        return jsonify({"error": "Debe especificar target_column"}), 400

    if target not in df.columns:
        return jsonify({"error": f"Columna '{target}' no encontrada"}), 400

    try:
        if algorithm == "random_forest":
            result = run_random_forest(df, target, test_size)
        else:
            result = run_decision_tree(df, target, test_size)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@mining_bp.route("/api/mining/<int:archivo_id>/cluster", methods=["POST"])
def cluster(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404

    df = load_dataframe(filepath)
    body = request.get_json() or {}
    n_clusters = body.get("n_clusters", 3)
    columns = body.get("columns", None)

    try:
        result = run_kmeans(df, n_clusters, columns)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
