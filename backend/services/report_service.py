import os
import io
import pandas as pd
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
    PageBreak,
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from services.data_service import get_descriptive_stats


REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)


def generate_excel_report(df, filename="reporte.xlsx"):
    filepath = os.path.join(REPORTS_DIR, filename)
    with pd.ExcelWriter(filepath, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Datos", index=False)

        stats = get_descriptive_stats(df)
        if "error" not in stats:
            stats_df = pd.DataFrame(stats).T
            stats_df.to_excel(writer, sheet_name="Estadísticas")

        info_data = {
            "Métrica": [
                "Total Registros",
                "Total Variables",
                "Total Nulos",
                "Duplicados",
            ],
            "Valor": [
                len(df),
                len(df.columns),
                int(df.isnull().sum().sum()),
                int(df.duplicated().sum()),
            ],
        }
        pd.DataFrame(info_data).to_excel(writer, sheet_name="Resumen", index=False)
    return filepath


def generate_pdf_report(df, filename="reporte.pdf", title="DataMining ITP - Reporte"):
    filepath = os.path.join(REPORTS_DIR, filename)
    doc = SimpleDocTemplate(filepath, pagesize=landscape(letter))
    elements = []
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "CustomTitle",
        parent=styles["Title"],
        fontSize=20,
        spaceAfter=20,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1a237e"),
    )
    elements.append(Paragraph(title, title_style))
    elements.append(Spacer(1, 0.3 * inch))

    subtitle = ParagraphStyle(
        "Subtitle",
        parent=styles["Normal"],
        fontSize=12,
        alignment=TA_CENTER,
        textColor=colors.gray,
    )
    elements.append(
        Paragraph("Sistema de Minería y Manipulación de Datos", subtitle)
    )
    elements.append(Spacer(1, 0.5 * inch))

    info_header = ParagraphStyle(
        "InfoHeader",
        parent=styles["Heading2"],
        textColor=colors.HexColor("#1a237e"),
    )
    elements.append(Paragraph("Resumen General", info_header))
    elements.append(Spacer(1, 0.2 * inch))

    info_data = [
        ["Métrica", "Valor"],
        ["Total de Registros", str(len(df))],
        ["Total de Variables", str(len(df.columns))],
        ["Total de Nulos", str(int(df.isnull().sum().sum()))],
        ["Registros Duplicados", str(int(df.duplicated().sum()))],
    ]
    info_table = Table(info_data, colWidths=[3 * inch, 3 * inch])
    info_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a237e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 11),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 10),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f5f5f5")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#e8eaf6")]),
            ]
        )
    )
    elements.append(info_table)
    elements.append(Spacer(1, 0.5 * inch))

    stats = get_descriptive_stats(df)
    if "error" not in stats:
        elements.append(Paragraph("Estadística Descriptiva", info_header))
        elements.append(Spacer(1, 0.2 * inch))

        headers = [
            "Variable",
            "Media",
            "Mediana",
            "Moda",
            "Máx",
            "Mín",
            "Varianza",
            "Desv. Est.",
        ]
        stats_data = [headers]
        for col_name, col_stats in stats.items():
            short_name = col_name[:25] + "..." if len(col_name) > 25 else col_name
            row = [
                short_name,
                str(col_stats.get("media", "")),
                str(col_stats.get("mediana", "")),
                str(col_stats.get("moda", "")),
                str(col_stats.get("maximo", "")),
                str(col_stats.get("minimo", "")),
                str(col_stats.get("varianza", "")),
                str(col_stats.get("desviacion_estandar", "")),
            ]
            stats_data.append(row)

        col_widths = [1.5 * inch] + [1.1 * inch] * 7
        stats_table = Table(stats_data, colWidths=col_widths)
        stats_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a237e")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#e8eaf6")]),
                ]
            )
        )
        elements.append(stats_table)

    elements.append(PageBreak())

    elements.append(Paragraph("Vista Previa de Datos", info_header))
    elements.append(Spacer(1, 0.2 * inch))

    preview_df = df.head(15)
    short_cols = [c[:15] + ".." if len(c) > 15 else c for c in preview_df.columns]
    table_data = [short_cols]
    for _, row in preview_df.iterrows():
        str_row = []
        for v in row.values:
            s = str(v) if pd.notna(v) else ""
            str_row.append(s[:20] + ".." if len(s) > 20 else s)
        table_data.append(str_row)

    n_cols = len(short_cols)
    col_w = min(1.2 * inch, 9.5 * inch / max(n_cols, 1))
    data_table = Table(table_data, colWidths=[col_w] * n_cols)
    data_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1a237e")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 6),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#e8eaf6")]),
            ]
        )
    )
    elements.append(data_table)

    doc.build(elements)
    return filepath
