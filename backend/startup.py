#!/usr/bin/env python
"""Script de inicio para Render: inicializa la DB y luego arranca gunicorn."""
import os
import sys

# Asegurar que estamos en el directorio del backend
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Inicializar DB y dataset
from models import init_db, SessionLocal
from models.archivo import Archivo
import json

init_db()

# Cargar dataset por defecto si existe
DATASET_PATH = os.path.join(os.path.dirname(__file__), "dataset", "encuesta_servicio_social.csv")
if os.path.exists(DATASET_PATH):
    from services.data_service import load_dataframe
    db = SessionLocal()
    existing = db.query(Archivo).filter(Archivo.nombre == "encuesta_servicio_social.csv").first()
    if not existing:
        df = load_dataframe(DATASET_PATH)
        archivo = Archivo(
            nombre="encuesta_servicio_social.csv",
            num_registros=len(df),
            num_columnas=len(df.columns),
            columnas=json.dumps(list(df.columns)),
        )
        db.add(archivo)
        db.commit()
    db.close()

print("✅ Base de datos inicializada correctamente")
