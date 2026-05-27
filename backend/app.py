import os
import json
from flask import Flask, jsonify
from flask_cors import CORS
from models import init_db, SessionLocal
from models.archivo import Archivo
from routes.upload_routes import upload_bp
from routes.data_routes import data_bp
from routes.mining_routes import mining_bp
from routes.report_routes import report_bp
from routes.quality_routes import quality_bp
from services.data_service import load_dataframe

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization"], "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}})

app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50MB

app.register_blueprint(upload_bp)
app.register_blueprint(data_bp)
app.register_blueprint(mining_bp)
app.register_blueprint(report_bp)
app.register_blueprint(quality_bp)

DATASET_PATH = os.path.join(os.path.dirname(__file__), "dataset", "encuesta_servicio_social.csv")


def load_default_dataset():
    if os.path.exists(DATASET_PATH):
        db = SessionLocal()
        existing = db.query(Archivo).filter(
            Archivo.nombre == "encuesta_servicio_social.csv"
        ).first()
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


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "DataMining ITP API running"})


@app.route("/api/dashboard", methods=["GET"])
def dashboard():
    db = SessionLocal()
    archivos = db.query(Archivo).all()
    total_archivos = len(archivos)
    total_registros = sum(a.num_registros for a in archivos)
    total_variables = sum(a.num_columnas for a in archivos)
    ultimo = archivos[-1].fecha_subida.isoformat() if archivos else None
    db.close()

    return jsonify({
        "total_registros": total_registros,
        "total_variables": total_variables,
        "archivos_cargados": total_archivos,
        "fecha_analisis": ultimo,
    })


if __name__ == "__main__":
    init_db()
    load_default_dataset()
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "true").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
