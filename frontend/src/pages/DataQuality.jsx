import { useState, useEffect } from 'react'
import {
  FiShield, FiAlertTriangle, FiCopy, FiSearch, FiTrendingUp,
  FiColumns, FiZap, FiDownload, FiFilter, FiCheck, FiRefreshCw
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { Bar, Scatter, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js'
import { getArchivos, getQualityAnalysis, autoCorrectQuality, exportQualityPdf } from '../services/api'
import KPI from '../components/KPI'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, ArcElement, Title, Tooltip, Legend)

export default function DataQuality() {
  const [archivos, setArchivos] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [correcting, setCorrecting] = useState(false)
  const [activeTab, setActiveTab] = useState('resumen')
  const [filterType, setFilterType] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('tipo')
  const [sortDir, setSortDir] = useState('asc')

  useEffect(() => {
    getArchivos().then(res => {
      setArchivos(res.data)
      if (res.data.length > 0) {
        setSelectedFile(res.data[0].id)
      }
    }).catch(() => toast.error('Error al cargar archivos'))
  }, [])

  useEffect(() => {
    if (selectedFile !== null) {
      runAnalysis(selectedFile)
    }
  }, [selectedFile])

  const runAnalysis = async (fileId) => {
    setLoading(true)
    try {
      const res = await getQualityAnalysis(fileId)
      setAnalysis(res.data)
    } catch (err) {
      toast.error('Error al analizar calidad de datos')
    } finally {
      setLoading(false)
    }
  }

  const handleAutoCorrect = async (operations) => {
    if (!selectedFile) return
    setCorrecting(true)
    try {
      const res = await autoCorrectQuality(selectedFile, { operations })
      setAnalysis(res.data.analysis)
      toast.success('Corrección aplicada exitosamente')
      res.data.messages.forEach(m => toast.info(m))
    } catch (err) {
      toast.error('Error al corregir datos')
    } finally {
      setCorrecting(false)
    }
  }

  const filteredErrors = analysis?.errores
    ?.filter(e => !filterType || e.tipo === filterType)
    ?.filter(e => {
      if (!searchTerm) return true
      const term = searchTerm.toLowerCase()
      return (
        (e.columna || '').toLowerCase().includes(term) ||
        (e.descripcion || '').toLowerCase().includes(term) ||
        (e.tipo || '').toLowerCase().includes(term) ||
        String(e.registro || '').includes(term)
      )
    })
    ?.sort((a, b) => {
      const valA = a[sortField] || ''
      const valB = b[sortField] || ''
      if (sortDir === 'asc') return String(valA).localeCompare(String(valB))
      return String(valB).localeCompare(String(valA))
    }) || []

  const errorTypes = [...new Set(analysis?.errores?.map(e => e.tipo) || [])]

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

  const qualityColor = analysis?.quality_level?.color || '#6b7280'
  const score = analysis?.quality_score || 0

  const kpis = analysis ? [
    { title: 'Calidad General', value: `${score}%`, icon: FiShield, color: qualityColor, subtitle: analysis.quality_level?.level },
    { title: 'Errores Detectados', value: analysis.kpis.total_errores, icon: FiAlertTriangle, color: '#ef4444', subtitle: 'Total de problemas' },
    { title: 'Valores Nulos', value: analysis.kpis.valores_nulos, icon: FiSearch, color: '#f59e0b', subtitle: `De ${analysis.kpis.total_celdas} celdas` },
    { title: 'Duplicados', value: analysis.kpis.duplicados, icon: FiCopy, color: '#8b5cf6', subtitle: 'Registros repetidos' },
    { title: 'Outliers', value: analysis.kpis.outliers, icon: FiTrendingUp, color: '#2962ff', subtitle: 'Valores atípicos' },
    { title: 'Columnas Problemáticas', value: analysis.kpis.columnas_problematicas, icon: FiColumns, color: '#ec4899', subtitle: '>80% vacías' },
  ] : []

  const errorDistribution = analysis ? {
    labels: ['Nulos', 'Duplicados', 'Tipo Incorrecto', 'Outliers', 'Inconsistencias'],
    datasets: [{
      data: [
        analysis.kpis.valores_nulos,
        analysis.kpis.duplicados,
        analysis.kpis.tipo_errores,
        analysis.kpis.outliers,
        analysis.kpis.inconsistencias,
      ],
      backgroundColor: ['#f59e0b', '#8b5cf6', '#ec4899', '#2962ff', '#ef4444'],
      borderWidth: 0,
    }],
  } : null

  const tabs = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'errores', label: 'Tabla de Errores' },
    { id: 'outliers', label: 'Outliers' },
    { id: 'recomendaciones', label: 'Recomendaciones' },
    { id: 'correccion', label: 'Corrección' },
  ]

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2><FiShield style={{ marginRight: '8px', verticalAlign: 'middle' }} />Calidad de Datos</h2>
          <p>Análisis automático de calidad y detección de errores</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="select-custom"
            value={selectedFile || ''}
            onChange={e => setSelectedFile(Number(e.target.value))}
          >
            {archivos.map(a => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
          <button className="btn-primary-custom" onClick={() => selectedFile && runAnalysis(selectedFile)}>
            <FiRefreshCw size={14} style={{ marginRight: '4px' }} />Re-analizar
          </button>
          {analysis && (
            <a
              href={exportQualityPdf(selectedFile)}
              className="btn-primary-custom"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiDownload size={14} style={{ marginRight: '4px' }} />PDF
            </a>
          )}
        </div>
      </div>

      {analysis && (
        <>
          {/* Semáforo de Calidad */}
          <div className="glass-card" style={{
            padding: '20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            borderLeft: `4px solid ${qualityColor}`,
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: `${qualityColor}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: 800, color: qualityColor,
            }}>
              {score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴'}
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Data Quality Score: <span style={{ color: qualityColor }}>{score}%</span>
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {analysis.quality_level?.level} — {analysis.kpis.total_registros} registros, {analysis.kpis.total_columnas} columnas analizadas
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            marginBottom: '20px',
          }}>
            {kpis.map((kpi, i) => (
              <KPI key={i} {...kpi} />
            ))}
          </div>

          {/* Tabs */}
          <div className="tab-custom">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Resumen */}
          {activeTab === 'resumen' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              <div className="chart-container slide-up">
                <h6 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                  Distribución de Errores
                </h6>
                {errorDistribution && (
                  <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                    <Doughnut
                      data={errorDistribution}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: 'bottom' },
                        },
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Boxplot data */}
              {analysis.boxplot_data && Object.keys(analysis.boxplot_data).length > 0 && (
                <div className="chart-container slide-up">
                  <h6 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                    Rango de Variables (Boxplot)
                  </h6>
                  <div style={{ height: '300px' }}>
                    <Bar
                      data={{
                        labels: Object.keys(analysis.boxplot_data).map(c => c.length > 18 ? c.substring(0, 18) + '..' : c),
                        datasets: [
                          {
                            label: 'Rango (Min-Max)',
                            data: Object.values(analysis.boxplot_data).map(d => d.max - d.min),
                            backgroundColor: 'rgba(41, 98, 255, 0.2)',
                            borderColor: 'rgba(41, 98, 255, 0.8)',
                            borderWidth: 1,
                          },
                          {
                            label: 'IQR (Q1-Q3)',
                            data: Object.values(analysis.boxplot_data).map(d => d.q3 - d.q1),
                            backgroundColor: 'rgba(26, 35, 126, 0.6)',
                            borderColor: 'rgba(26, 35, 126, 1)',
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          tooltip: {
                            callbacks: {
                              afterBody: (ctx) => {
                                const col = Object.keys(analysis.boxplot_data)[ctx[0].dataIndex]
                                const d = analysis.boxplot_data[col]
                                return [`Min: ${d.min?.toFixed(2)}`, `Q1: ${d.q1?.toFixed(2)}`, `Med: ${d.median?.toFixed(2)}`, `Q3: ${d.q3?.toFixed(2)}`, `Max: ${d.max?.toFixed(2)}`]
                              }
                            }
                          }
                        },
                        scales: {
                          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                          y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true },
                        },
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Null distribution bar */}
              {analysis.kpis.valores_nulos > 0 && (
                <div className="chart-container slide-up">
                  <h6 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                    Valores Nulos por Columna
                  </h6>
                  <div style={{ height: '300px' }}>
                    <Bar
                      data={{
                        labels: (analysis?.errores || [])
                          .filter(e => e.tipo === 'Nulo')
                          .map(e => e.columna && e.columna.length > 18 ? e.columna.substring(0, 18) + '..' : (e.columna || '')),
                        datasets: [{
                          label: 'Registros afectados',
                          data: (analysis?.errores || []).filter(e => e.tipo === 'Nulo').map(e => e.registros_afectados),
                          backgroundColor: 'rgba(245, 158, 11, 0.6)',
                          borderColor: '#f59e0b',
                          borderWidth: 1,
                          borderRadius: 4,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                          y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true },
                        },
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Tabla de Errores */}
          {activeTab === 'errores' && (
            <div className="glass-card slide-up" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                  <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Buscar errores..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 8px 8px 34px',
                      border: '1px solid var(--border)', borderRadius: '8px',
                      background: 'var(--bg-card)', color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>
                <select className="select-custom" value={filterType} onChange={e => setFilterType(e.target.value)}>
                  <option value="">Todos los tipos</option>
                  {errorTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {['tipo', 'columna', 'registro', 'descripcion'].map(field => (
                        <th
                          key={field}
                          onClick={() => {
                            if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
                            else { setSortField(field); setSortDir('asc') }
                          }}
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
                          {field === 'tipo' ? 'Tipo de Error' : field === 'columna' ? 'Columna' : field === 'registro' ? 'Registro' : 'Descripción'}
                          {sortField === field && (sortDir === 'asc' ? ' ▲' : ' ▼')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredErrors.slice(0, 100).map((err, i) => (
                      <tr key={i}>
                        <td>
                          <span style={{
                            padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                            background:
                              err.tipo === 'Nulo' ? '#fef3c7' :
                              err.tipo === 'Duplicado' ? '#ede9fe' :
                              err.tipo === 'Outlier' ? '#dbeafe' :
                              err.tipo === 'Tipo incorrecto' ? '#fce7f3' :
                              err.tipo === 'Inconsistencia' ? '#fee2e2' : '#e5e7eb',
                            color:
                              err.tipo === 'Nulo' ? '#92400e' :
                              err.tipo === 'Duplicado' ? '#5b21b6' :
                              err.tipo === 'Outlier' ? '#1e40af' :
                              err.tipo === 'Tipo incorrecto' ? '#9d174d' :
                              err.tipo === 'Inconsistencia' ? '#991b1b' : '#374151',
                          }}>
                            {err.tipo}
                          </span>
                        </td>
                        <td>{err.columna || '-'}</td>
                        <td>{err.registro !== undefined ? err.registro : (err.registros_afectados || '-')}</td>
                        <td title={err.descripcion}>{err.descripcion?.length > 60 ? err.descripcion.substring(0, 60) + '...' : err.descripcion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredErrors.length > 100 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '10px' }}>
                  Mostrando 100 de {filteredErrors.length} errores
                </p>
              )}
            </div>
          )}

          {/* Tab: Outliers */}
          {activeTab === 'outliers' && (
            <div>
              {analysis.boxplot_data && Object.keys(analysis.boxplot_data).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
                  {/* Boxplot */}
                  <div className="chart-container slide-up">
                    <h6 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                      Boxplot — Rango y IQR
                    </h6>
                    <div style={{ height: '350px' }}>
                      <Bar
                        data={{
                          labels: Object.keys(analysis.boxplot_data).map(c => c.length > 15 ? c.substring(0, 15) + '..' : c),
                          datasets: [
                            {
                              label: 'Min',
                              data: Object.values(analysis.boxplot_data).map(d => d.min),
                              backgroundColor: 'rgba(239, 68, 68, 0.5)',
                              borderColor: '#ef4444',
                              borderWidth: 1,
                            },
                            {
                              label: 'Q1',
                              data: Object.values(analysis.boxplot_data).map(d => d.q1),
                              backgroundColor: 'rgba(245, 158, 11, 0.5)',
                              borderColor: '#f59e0b',
                              borderWidth: 1,
                            },
                            {
                              label: 'Mediana',
                              data: Object.values(analysis.boxplot_data).map(d => d.median),
                              backgroundColor: 'rgba(16, 185, 129, 0.5)',
                              borderColor: '#10b981',
                              borderWidth: 1,
                            },
                            {
                              label: 'Q3',
                              data: Object.values(analysis.boxplot_data).map(d => d.q3),
                              backgroundColor: 'rgba(41, 98, 255, 0.5)',
                              borderColor: '#2962ff',
                              borderWidth: 1,
                            },
                            {
                              label: 'Max',
                              data: Object.values(analysis.boxplot_data).map(d => d.max),
                              backgroundColor: 'rgba(139, 92, 246, 0.5)',
                              borderColor: '#8b5cf6',
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'top' } },
                          scales: {
                            x: { grid: { display: false } },
                            y: { grid: { color: 'rgba(0,0,0,0.05)' } },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Scatter plots */}
                  {analysis.scatter_data && Object.entries(analysis.scatter_data).slice(0, 4).map(([col, data]) => (
                    <div key={col} className="chart-container slide-up">
                      <h6 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                        Dispersión — {col.length > 30 ? col.substring(0, 30) + '..' : col}
                      </h6>
                      <div style={{ height: '350px' }}>
                        <Scatter
                          data={{
                            datasets: [
                              {
                                label: 'Normal',
                                data: (data?.values || []).filter((_, i) => !data?.is_outlier?.[i]).map((v, i) => ({ x: (data?.indices || []).filter((_, j) => !data?.is_outlier?.[j])[i], y: v })),
                                backgroundColor: 'rgba(41, 98, 255, 0.5)',
                                pointRadius: 4,
                              },
                              {
                                label: 'Outlier',
                                data: (data?.values || []).filter((_, i) => data?.is_outlier?.[i]).map((v, i) => ({ x: (data?.indices || []).filter((_, j) => data?.is_outlier?.[j])[i], y: v })),
                                backgroundColor: 'rgba(239, 68, 68, 0.8)',
                                pointRadius: 6,
                                pointStyle: 'triangle',
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'top' } },
                            scales: {
                              x: { title: { display: true, text: 'Índice' }, grid: { color: 'rgba(0,0,0,0.05)' } },
                              y: { title: { display: true, text: col }, grid: { color: 'rgba(0,0,0,0.05)' } },
                            },
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                  <FiTrendingUp size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>No se detectaron outliers en los datos.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Recomendaciones */}
          {activeTab === 'recomendaciones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {analysis.recommendations?.length > 0 ? analysis.recommendations.map((rec, i) => (
                <div key={i} className="glass-card slide-up" style={{
                  padding: '16px 20px',
                  borderLeft: `4px solid ${rec.prioridad === 'Alta' ? '#ef4444' : '#f59e0b'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                      color: rec.prioridad === 'Alta' ? '#ef4444' : '#f59e0b',
                    }}>
                      {rec.tipo} — Prioridad {rec.prioridad}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {rec.mensaje}
                  </p>
                </div>
              )) : (
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                  <FiCheck size={40} style={{ color: '#10b981', marginBottom: '12px' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>No hay recomendaciones. Los datos están en buen estado.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Corrección Automática */}
          {activeTab === 'correccion' && (
            <div className="glass-card slide-up" style={{ padding: '24px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>
                <FiZap style={{ marginRight: '8px', verticalAlign: 'middle', color: '#f59e0b' }} />
                Corrección Automática
              </h6>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                Seleccione las operaciones de corrección que desea aplicar. Los cambios se guardarán directamente en el archivo.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {[
                  { id: 'duplicates', label: 'Eliminar Duplicados', desc: 'Elimina filas completamente duplicadas', icon: FiCopy, color: '#8b5cf6', count: analysis.kpis.duplicados },
                  { id: 'nulls', label: 'Sustituir Nulos', desc: 'Rellena con mediana (numérico) o moda (texto)', icon: FiSearch, color: '#f59e0b', count: analysis.kpis.valores_nulos },
                  { id: 'types', label: 'Convertir Tipos', desc: 'Convierte texto a numérico donde sea posible', icon: FiFilter, color: '#ec4899', count: analysis.kpis.tipo_errores },
                  { id: 'normalize', label: 'Normalizar Datos', desc: 'Escala valores numéricos entre 0 y 1', icon: FiTrendingUp, color: '#2962ff', count: null },
                ].map(op => (
                  <button
                    key={op.id}
                    onClick={() => handleAutoCorrect([op.id])}
                    disabled={correcting}
                    className="glass-card card-hover"
                    style={{
                      padding: '16px',
                      border: '1px solid var(--border)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      background: 'var(--bg-card)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: `${op.color}15`, color: op.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <op.icon size={18} />
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{op.label}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>{op.desc}</p>
                    {op.count !== null && op.count > 0 && (
                      <span style={{
                        display: 'inline-block', marginTop: '8px',
                        padding: '2px 8px', borderRadius: '12px',
                        fontSize: '0.75rem', fontWeight: 600,
                        background: `${op.color}15`, color: op.color,
                      }}>
                        {op.count} encontrados
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <button
                className="btn-primary-custom"
                onClick={() => handleAutoCorrect(['duplicates', 'nulls', 'types'])}
                disabled={correcting}
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              >
                {correcting ? (
                  <><FiRefreshCw size={16} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />Corrigiendo...</>
                ) : (
                  <><FiZap size={16} style={{ marginRight: '8px' }} />Corregir Todo Automáticamente</>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {!analysis && !loading && (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <FiShield size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h5 style={{ color: 'var(--text-primary)' }}>Seleccione un archivo para analizar</h5>
          <p style={{ color: 'var(--text-secondary)' }}>Cargue un archivo CSV o Excel desde la sección de Gestión de Archivos</p>
        </div>
      )}
    </div>
  )
}
