# DataMining ITP

Sistema de Minería y Manipulación de Datos para Encuestas del Servicio Social.

Plataforma web moderna para cargar archivos Excel/CSV, visualizar datos, limpiarlos, transformarlos y aplicar técnicas de minería de datos.

## Stack Tecnológico

### Frontend
- React 19 + Vite
- React Router DOM
- Axios
- Bootstrap 5
- Chart.js + React ChartJS 2
- React Icons
- React Toastify

### Backend
- Python + Flask
- Flask-CORS
- Pandas + NumPy
- Scikit-Learn
- SQLAlchemy
- ReportLab (PDF)
- OpenPyXL (Excel)

### Base de Datos
- PostgreSQL (Neon DB)

## Instalación y Ejecución

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend se ejecutará en `http://localhost:3000`

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

El backend se ejecutará en `http://localhost:5000`

## Credenciales de Acceso

- **Usuario:** `admin`
- **Contraseña:** `admin123`

## Módulos

| Módulo | Descripción |
|--------|-------------|
| Dashboard | KPIs, gráficas y resumen general del sistema |
| Gestión de Archivos | Upload drag & drop de CSV/XLSX |
| Análisis de Datos | Limpieza, transformación, visualización y estadística descriptiva |
| Minería de Datos | Clasificación (Árbol de Decisión, Random Forest) y Clustering (K-Means) |
| Reportes | Exportación a PDF y Excel |

## Características

- Landing page profesional
- Modo oscuro / claro
- Diseño responsive inspirado en Power BI / Tableau
- Drag & drop para subir archivos
- Filtros dinámicos por carrera y semestre
- Gráficas interactivas (Histogramas, Barras, Pastel, Boxplot, Heatmap, Dispersión)
- Estadística descriptiva completa (Media, Mediana, Moda, Máx, Mín, Varianza, Desv. Est.)
- Indicador de progreso durante análisis
- Animaciones suaves

## Dataset Incluido

Encuesta de Conocimiento sobre el Servicio Social en el ITP (20 registros, 14 variables).

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── pages/          # Login, Dashboard, Upload, Analytics, Mining, Reports
│   ├── components/     # Sidebar, Navbar, KPI, Charts/
│   ├── services/       # API client (Axios)
│   ├── context/        # ThemeContext (dark/light mode)
│   └── styles/         # Global CSS
│
backend/
├── app.py              # Flask application
├── routes/             # API endpoints
├── models/             # SQLAlchemy models
├── services/           # Business logic
├── dataset/            # Default dataset
├── uploads/            # User uploaded files
└── reports/            # Generated reports
```

## Instituto Tecnológico de Puebla - Proyecto Final 2026
