import os
import io
import json
from flask import Blueprint, request, jsonify, send_file
from models import SessionLocal
from models.archivo import Archivo
from services.data_service import load_dataframe, get_preview
from services.quality_service import full_quality_analysis, auto_correct, generate_quality_pdf_data
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

quality_bp = Blueprint("quality", __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
DATASET_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "dataset")
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)


def get_filepath(archivo_id):
    if archivo_id == 0:
        return os.path.join(DATASET_FOLDER, "encuesta_servicio_social.csv")
    db = SessionLocal()
    archivo = db.query(Archivo).filter(Archivo.id == archivo_id).first()
    db.close()
    if not archivo:
        return None
    return os.path.join(UPLOAD_FOLDER, archivo.nombre)


@quality_bp.route("/api/quality/<int:archivo_id>/analyze", methods=["GET"])
def quality_analysis(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404

    df = load_dataframe(filepath)
    analysis = full_quality_analysis(df)
    return jsonify(analysis)


@quality_bp.route("/api/quality/<int:archivo_id>/correct", methods=["POST"])
def quality_correct(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404

    df = load_dataframe(filepath)
    body = request.get_json() or {}
    operations = body.get("operations", ["duplicates", "nulls", "types", "normalize"])

    df_corrected, messages, changes = auto_correct(df, operations)

    if filepath.endswith(".csv"):
        df_corrected.to_csv(filepath, index=False)
    else:
        df_corrected.to_excel(filepath, index=False)

    db = SessionLocal()
    archivo = db.query(Archivo).filter(Archivo.id == archivo_id).first()
    if archivo:
        archivo.num_registros = len(df_corrected)
        archivo.num_columnas = len(df_corrected.columns)
        archivo.columnas = json.dumps(list(df_corrected.columns))
        db.commit()
    db.close()

    new_analysis = full_quality_analysis(df_corrected)

    return jsonify({
        "messages": messages,
        "changes": changes,
        "preview": get_preview(df_corrected),
        "analysis": new_analysis,
    })


@quality_bp.route("/api/quality/<int:archivo_id>/pdf", methods=["GET"])
def quality_pdf(archivo_id):
    filepath = get_filepath(archivo_id)
    if not filepath or not os.path.exists(filepath):
        return jsonify({"error": "Archivo no encontrado"}), 404

    df = load_dataframe(filepath)
    analysis = full_quality_analysis(df)
    pdf_data = generate_quality_pdf_data(df, analysis)

    pdf_path = os.path.join(REPORTS_DIR, f"quality_report_{archivo_id}.pdf")
    doc = SimpleDocTemplate(pdf_path, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "QualityTitle",
        parent=styles["Title"],
        fontSize=22,
        spaceAfter=20,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1a237e"),
    )
    elements.append(Paragraph("Reporte de Calidad de Datos", title_style))
    elements.append(Spacer(1, 0.2 * inch))

    subtitle_style = ParagraphStyle(
        "QualitySubtitle",
        parent=styles["Normal"],
        fontSize=12,
        alignment=TA_CENTER,
        textColor=colors.gray,
    )
    elements.append(Paragraph("DataMining ITP - Sistema de Minería de Datos", subtitle_style))
    elements.append(Spacer(1, 0.4 * inch))

    score = pdf_data["quality_score"]
    level = pdf_data["quality_level"]["level"]
    score_color = colors.HexColor(pdf_data["quality_level"]["color"])

    score_style = ParagraphStyle(
        "ScoreStyle",
        parent=styles["Title"],
        fontSize=36,
        alignment=TA_CENTER,
        textColor=score_color,
    )
    elements.append(Paragraph(f"{score}%", score_style))

    level_style = ParagraphStyle(
        "LevelStyle",
        parent=styles["Normal"],
        fontSize=14,
        alignment=TA_CENTER,
        textColor=score_color,
        spaceAfter=20,
    )
    elements.append(Paragraph(f"Calidad: {level}", level_style))
    elements.append(Spacer(1, 0.3 * inch))

    header_style = ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        textColor=colors.HexColor("#1a237e"),
    )
    elements.append(Paragraph("Resumen de Errores", header_style))
    elements.append(Spacer(1, 0.15 * inch))

    kpis = pdf_data["kpis"]
    summary_data = [
        ["Métrica", "Valor"],
        ["Total de Registros", str(kpis["total_registros"])],
        ["Total de Columnas", str(kpis["total_columnas"])],
        ["Total de Errores", str(kpis["total_errores"])],
        ["Valores Nulos", str(kpis["valores_nulos"])],
        ["Duplicados", str(kpis["duplicados"])],
        ["Outliers", str(kpis["outliers"])],
        ["Tipos Incorrectos", str(kpis["tipo_errores"])],
        ["Inconsistencias", str(kpis["inconsistencias"])],
        ["Columnas Problemáticas", str(kpis["columnas_problematicas"])],
    ]
    summary_table = Table(summary_data, colWidths=[3 * inch, 2 * inch])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a237e")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 11),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#e8eaf6")]),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.4 * inch))

    if pdf_data["recommendations"]:
        elements.append(Paragraph("Recomendaciones", header_style))
        elements.append(Spacer(1, 0.15 * inch))

        rec_style = ParagraphStyle(
            "RecStyle",
            parent=styles["Normal"],
            fontSize=10,
            spaceAfter=8,
            leftIndent=15,
        )
        for rec in pdf_data["recommendations"][:15]:
            priority_color = "#ef4444" if rec["prioridad"] == "Alta" else "#f59e0b"
            elements.append(Paragraph(
                f'<font color="{priority_color}"><b>[{rec["prioridad"]}]</b></font> '
                f'<b>{rec["tipo"]}:</b> {rec["mensaje"]}',
                rec_style,
            ))

    doc.build(elements)
    return send_file(pdf_path, as_attachment=True, download_name=f"reporte_calidad_{archivo_id}.pdf")
