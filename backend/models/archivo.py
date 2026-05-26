from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from models import Base


class Archivo(Base):
    __tablename__ = "archivos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(255), nullable=False)
    fecha_subida = Column(DateTime, default=datetime.utcnow)
    num_registros = Column(Integer, default=0)
    num_columnas = Column(Integer, default=0)
    columnas = Column(Text, default="")

    def to_dict(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "fecha_subida": self.fecha_subida.isoformat() if self.fecha_subida else None,
            "num_registros": self.num_registros,
            "num_columnas": self.num_columnas,
            "columnas": self.columnas,
        }
