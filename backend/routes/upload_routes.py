import os
import json
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from models import SessionLocal
from models.archivo import Archivo
from services.data_service import load_dataframe

upload_bp = Blueprint("upload", __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
ALLOWED_EXTENSIONS = {"csv", "xlsx", "xls"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@upload_bp.route("/api/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No se envió ningún archivo"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Nombre de archivo vacío"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Formato no soportado. Use CSV o XLSX"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        df = load_dataframe(filepath)
        db = SessionLocal()
        archivo = Archivo(
            nombre=filename,
            num_registros=len(df),
            num_columnas=len(df.columns),
            columnas=json.dumps(list(df.columns)),
        )
        db.add(archivo)
        db.commit()
        result = archivo.to_dict()
        db.close()

        return jsonify({
            "message": "Archivo subido exitosamente",
            "archivo": result,
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@upload_bp.route("/api/archivos", methods=["GET"])
def get_archivos():
    db = SessionLocal()
    archivos = db.query(Archivo).order_by(Archivo.fecha_subida.desc()).all()
    result = [a.to_dict() for a in archivos]
    db.close()
    return jsonify(result)


@upload_bp.route("/api/archivos/<int:archivo_id>", methods=["DELETE"])
def delete_archivo(archivo_id):
    db = SessionLocal()
    archivo = db.query(Archivo).filter(Archivo.id == archivo_id).first()
    if not archivo:
        db.close()
        return jsonify({"error": "Archivo no encontrado"}), 404

    filepath = os.path.join(UPLOAD_FOLDER, archivo.nombre)
    if os.path.exists(filepath):
        os.remove(filepath)

    db.delete(archivo)
    db.commit()
    db.close()
    return jsonify({"message": "Archivo eliminado"})


@upload_bp.route("/api/archivos/<int:archivo_id>/preview", methods=["GET"])
def preview_archivo(archivo_id):
    db = SessionLocal()
    archivo = db.query(Archivo).filter(Archivo.id == archivo_id).first()
    db.close()

    if not archivo:
        return jsonify({"error": "Archivo no encontrado"}), 404

    filepath = os.path.join(UPLOAD_FOLDER, archivo.nombre)
    if not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado en disco"}), 404

    try:
        from services.data_service import get_preview
        df = load_dataframe(filepath)
        preview = get_preview(df)
        return jsonify(preview)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
