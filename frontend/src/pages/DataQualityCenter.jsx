import { useState, useEffect } from 'react'
import {
  FiAward, FiShield, FiAlertTriangle, FiCopy, FiSearch,
  FiTrendingUp, FiColumns, FiCheckCircle, FiRefreshCw, FiDownload
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend
} from 'chart.js'
import { getArchivos, getQualityAnalysis, exportQualityPdf } from '../services/api'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function QualityGauge({ score, level, color }) {
  const circumference = 2 * Math.PI * 80
  const offset = circumference - (score / 100) * circumference

  return (
    <div style={{ position: 'relative', width: '200px', height: '200px' }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="var(--border)" strokeWidth="12" />
        <circle
          cx="100" cy="100" r="80" fill="none"
          stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 100 100)"
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2.4rem', fontWeight: 800, color, lineHeight: 1 }}>{score}%</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '4px' }}>{level}</div>
      </div>
    </div>
  )
}

function ProgressBar({ value, max, color, label }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color }}>{value}</span>
      </div>
      <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, background: color,
          borderRadius: '4px', transition: 'width 0.8s ease',
        }} />
      </div>
    </div>
  )
}

export default function DataQualityCenter() {
  const [archivos, setArchivos] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getArchivos().then(res => {
      setArchivos(res.data)
      if (res.data.length > 0) setSelectedFile(res.data[0].id)
    }).catch(() => toast.error('Error al cargar archivos'))
  }, [])

  useEffect(() => {
    if (selectedFile !== null) runAnalysis()
  }, [selectedFile])

  const runAnalysis = async () => {
    setLoading(true)
    try {
      const res = await getQualityAnalysis(selectedFile)
      setAnalysis(res.data)
    } catch {
      toast.error('Error al analizar')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{
          width: '40px', height: '40px', border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const score = analysis?.quality_score || 0
  const qualityColor = analysis?.quality_level?.color || '#6b7280'
  const level = analysis?.quality_level?.level || ''
  const kpis = analysis?.kpis || {}

  const maxErrors = Math.max(
    kpis.valores_nulos || 0,
    kpis.duplicados || 0,
    kpis.outliers || 0,
    kpis.tipo_errores || 0,
    kpis.inconsistencias || 0,
    1
  )

  const errorBreakdown = analysis ? {
    labels: ['Nulos', 'Duplicados', 'Outliers', 'Tipo Incorrecto', 'Inconsistencias', 'Col. Vacías'],
    datasets: [{
      data: [
        kpis.valores_nulos, kpis.duplicados, kpis.outliers,
        kpis.tipo_errores, kpis.inconsistencias, kpis.columnas_problematicas,
      ],
      backgroundColor: ['#f59e0b', '#8b5cf6', '#2962ff', '#ec4899', '#ef4444', '#6b7280'],
      borderWidth: 0,
    }],
  } : null

  const metrics = [
    { label: 'Valores Nulos', value: kpis.valores_nulos || 0, color: '#f59e0b', icon: FiSearch },
    { label: 'Duplicados', value: kpis.duplicados || 0, color: '#8b5cf6', icon: FiCopy },
    { label: 'Outliers', value: kpis.outliers || 0, color: '#2962ff', icon: FiTrendingUp },
    { label: 'Tipos Incorrectos', value: kpis.tipo_errores || 0, color: '#ec4899', icon: FiAlertTriangle },
    { label: 'Inconsistencias', value: kpis.inconsistencias || 0, color: '#ef4444', icon: FiAlertTriangle },
    { label: 'Columnas Problemáticas', value: kpis.columnas_problematicas || 0, color: '#6b7280', icon: FiColumns },
  ]

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2><FiAward style={{ marginRight: '8px', verticalAlign: 'middle' }} />Data Quality Center</h2>
          <p>Centro integral de análisis y monitoreo de calidad de datos</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select className="select-custom" value={selectedFile || ''} onChange={e => setSelectedFile(Number(e.target.value))}>
            {archivos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
          <button className="btn-primary-custom" onClick={runAnalysis}>
            <FiRefreshCw size={14} style={{ marginRight: '4px' }} />Analizar
          </button>
          {analysis && (
            <a
              href={exportQualityPdf(selectedFile)}
              className="btn-primary-custom"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiDownload size={14} style={{ marginRight: '4px' }} />Exportar PDF
            </a>
          )}
        </div>
      </div>

      {analysis ? (
        <>
          {/* Main Score Card */}
          <div className="glass-card slide-up" style={{
            padding: '30px',
            marginBottom: '24px',
            background: `linear-gradient(135deg, ${qualityColor}08, ${qualityColor}15)`,
            borderLeft: `5px solid ${qualityColor}`,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-around',
              flexWrap: 'wrap', gap: '30px',
            }}>
              <QualityGauge score={score} level={level} color={qualityColor} />

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Data Quality Score
                </div>
                <div style={{ fontSize: '3.5rem', fontWeight: 800, color: qualityColor, lineHeight: 1 }}>
                  {score}%
                </div>
                <div style={{
                  display: 'inline-block', marginTop: '10px',
                  padding: '4px 16px', borderRadius: '20px',
                  background: `${qualityColor}20`, color: qualityColor,
                  fontWeight: 700, fontSize: '0.85rem',
                }}>
                  {score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴'} {level}
                </div>
              </div>

              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="kpi-card" style={{ padding: '14px', minWidth: '140px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Registros</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{kpis.total_registros}</div>
                  </div>
                  <div className="kpi-card" style={{ padding: '14px', minWidth: '140px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Columnas</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{kpis.total_columnas}</div>
                  </div>
                  <div className="kpi-card" style={{ padding: '14px', minWidth: '140px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Errores</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444' }}>{kpis.total_errores}</div>
                  </div>
                  <div className="kpi-card" style={{ padding: '14px', minWidth: '140px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Celdas</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{kpis.total_celdas}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '24px',
          }}>
            {metrics.map((m, i) => (
              <div key={i} className="glass-card card-hover" style={{
                padding: '16px',
                borderTop: `3px solid ${m.color}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: `${m.color}15`, color: m.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <m.icon size={16} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{m.label}</span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{m.value}</div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', marginTop: '10px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '3px',
                    width: `${maxErrors > 0 ? Math.min((m.value / maxErrors) * 100, 100) : 0}%`,
                    background: m.color, transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {errorBreakdown && (
              <div className="chart-container slide-up">
                <h6 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                  Distribución de Problemas
                </h6>
                <div style={{ height: '280px', display: 'flex', justifyContent: 'center' }}>
                  <Doughnut
                    data={errorBreakdown}
                    options={{
                      responsive: true, maintainAspectRatio: false,
                      cutout: '65%',
                      plugins: {
                        legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true } },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            <div className="chart-container slide-up">
              <h6 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                Errores por Categoría
              </h6>
              <div style={{ height: '280px' }}>
                <Bar
                  data={{
                    labels: ['Nulos', 'Duplicados', 'Outliers', 'Tipos', 'Inconsist.', 'Col. Vacías'],
                    datasets: [{
                      label: 'Cantidad',
                      data: [
                        kpis.valores_nulos, kpis.duplicados, kpis.outliers,
                        kpis.tipo_errores, kpis.inconsistencias, kpis.columnas_problematicas,
                      ],
                      backgroundColor: ['#f59e0b', '#8b5cf6', '#2962ff', '#ec4899', '#ef4444', '#6b7280'],
                      borderRadius: 6,
                    }],
                  }}
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false } },
                      y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations?.length > 0 && (
            <div className="glass-card slide-up" style={{ padding: '24px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                <FiCheckCircle style={{ marginRight: '8px', verticalAlign: 'middle', color: '#2962ff' }} />
                Recomendaciones de IA
              </h6>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analysis.recommendations.slice(0, 10).map((rec, i) => (
                  <div key={i} style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: rec.prioridad === 'Alta' ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.05)',
                    borderLeft: `3px solid ${rec.prioridad === 'Alta' ? '#ef4444' : '#f59e0b'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                        padding: '2px 6px', borderRadius: '4px',
                        background: rec.prioridad === 'Alta' ? '#fee2e2' : '#fef3c7',
                        color: rec.prioridad === 'Alta' ? '#991b1b' : '#92400e',
                      }}>
                        {rec.prioridad}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {rec.tipo}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.88rem', margin: 0, lineHeight: 1.5 }}>
                      {rec.mensaje}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="glass-card" style={{ padding: '80px', textAlign: 'center' }}>
          <FiAward size={56} style={{ color: 'var(--text-muted)', marginBottom: '20px' }} />
          <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Data Quality Center</h4>
          <p style={{ color: 'var(--text-secondary)' }}>Seleccione un dataset para obtener un análisis completo de calidad</p>
        </div>
      )}
    </div>
  )
}
