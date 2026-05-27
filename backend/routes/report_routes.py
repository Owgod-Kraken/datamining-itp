import os
from flask import Blueprint, request, jsonify, send_file
from models import SessionLocal
from models.archivo import Archivo
from services.data_service import load_dataframe
from services.report_service import generate_excel_report, generate_pdf_report

report_bp = Blueprint("report", __name__)

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


@report_bp.route("/api/report/<int:archivo_id>/excel", methods=["GET"])
def export_excel(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404

    df = load_dataframe(filepath)
    report_path = generate_excel_report(df, f"reporte_{archivo_id}.xlsx")
    return send_file(
        report_path,
        as_attachment=True,
        download_name=f"reporte_{archivo_id}.xlsx",
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


@report_bp.route("/api/report/<int:archivo_id>/pdf", methods=["GET"])
def export_pdf(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404

    df = load_dataframe(filepath)
    report_path = generate_pdf_report(df, f"reporte_{archivo_id}.pdf")
    return send_file(
        report_path,
        as_attachment=True,
        download_name=f"reporte_{archivo_id}.pdf",
        mimetype="application/pdf",
    )
