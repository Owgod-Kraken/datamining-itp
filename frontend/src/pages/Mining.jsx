import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiCpu, FiTarget, FiLayers } from 'react-icons/fi'
import { getArchivos, getColumns, runClassification, runClustering } from '../services/api'
import BarChart from '../components/Charts/BarChart'
import PieChart from '../components/Charts/PieChart'
import ScatterChart from '../components/Charts/ScatterChart'

export default function Mining() {
  const [archivos, setArchivos] = useState([])
  const [selectedFile, setSelectedFile] = useState(0)
  const [columns, setColumns] = useState([])
  const [activeTab, setActiveTab] = useState('classification')
  const [loading, setLoading] = useState(false)

  const [targetCol, setTargetCol] = useState('')
  const [algorithm, setAlgorithm] = useState('decision_tree')
  const [classResult, setClassResult] = useState(null)

  const [nClusters, setNClusters] = useState(3)
  const [clusterResult, setClusterResult] = useState(null)

  useEffect(() => {
    getArchivos().then(r => setArchivos(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    getColumns(selectedFile)
      .then(r => {
        setColumns(r.data)
        if (r.data.length > 0) setTargetCol(r.data[r.data.length - 1].name)
      })
      .catch(() => {})
  }, [selectedFile])

  const handleClassify = async () => {
    if (!targetCol) { toast.error('Seleccione la variable objetivo'); return }
    setLoading(true)
    try {
      const res = await runClassification(selectedFile, {
        target_column: targetCol,
        algorithm,
        test_size: 0.3,
      })
      setClassResult(res.data)
      toast.success(`${res.data.algorithm} ejecutado correctamente`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error en clasificación')
    } finally {
      setLoading(false)
    }
  }

  const handleCluster = async () => {
    setLoading(true)
    try {
      const res = await runClustering(selectedFile, { n_clusters: nClusters })
      setClusterResult(res.data)
      toast.success('K-Means ejecutado correctamente')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error en clustering')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><FiCpu style={{ marginRight: '8px', verticalAlign: 'middle' }} />Minería de Datos</h2>
        <p>Clasificación con ML y Clustering con K-Means</p>
      </div>

      {/* File Selector */}
      <div style={{ marginBottom: '20px' }}>
        <select
          className="select-custom"
          value={selectedFile}
          onChange={(e) => setSelectedFile(Number(e.target.value))}
        >
          <option value={0}>Encuesta Servicio Social (Default)</option>
          {archivos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="tab-custom">
        <button
          className={activeTab === 'classification' ? 'active' : ''}
          onClick={() => setActiveTab('classification')}
        >
          <FiTarget size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Clasificación
        </button>
        <button
          className={activeTab === 'clustering' ? 'active' : ''}
          onClick={() => setActiveTab('clustering')}
        >
          <FiLayers size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          Clustering
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '50px', height: '50px', border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto',
          }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '12px', fontWeight: 500 }}>
            Ejecutando algoritmo de minería de datos...
          </p>
          <div className="progress-bar-custom" style={{ maxWidth: '300px', margin: '12px auto' }}>
            <div className="fill" style={{ width: '60%', animation: 'pulse 1.5s infinite' }} />
          </div>
        </div>
      )}

      {!loading && activeTab === 'classification' && (
        <div className="slide-up">
          {/* Config */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h6 style={{ fontWeight: 600, marginBottom: '16px' }}>Configuración de Clasificación</h6>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Variable Objetivo
                </label>
                <select className="select-custom" value={targetCol} onChange={(e) => setTargetCol(e.target.value)}>
                  {columns.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Algoritmo
                </label>
                <select className="select-custom" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                  <option value="decision_tree">Árbol de Decisión</option>
                  <option value="random_forest">Random Forest</option>
                </select>
              </div>
              <button className="btn-primary-custom" onClick={handleClassify}>
                <FiTarget size={14} style={{ marginRight: '6px' }} />
                Ejecutar Clasificación
              </button>
            </div>
          </div>

          {/* Results */}
          {classResult && (
            <div>
              {/* Metrics */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px', marginBottom: '20px',
              }}>
                {[
                  { label: 'Accuracy', value: (classResult.accuracy * 100).toFixed(2) + '%', color: '#1a237e' },
                  { label: 'Precision', value: (classResult.precision * 100).toFixed(2) + '%', color: '#2962ff' },
                  { label: 'Recall', value: (classResult.recall * 100).toFixed(2) + '%', color: '#10b981' },
                  { label: 'F1 Score', value: (classResult.f1_score * 100).toFixed(2) + '%', color: '#f59e0b' },
                ].map(m => (
                  <div key={m.label} className="kpi-card">
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>{m.label}</p>
                    <h3 style={{ fontWeight: 800, color: m.color, fontSize: '1.6rem' }}>{m.value}</h3>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '20px',
              }}>
                {/* Confusion Matrix */}
                <div className="glass-card" style={{ padding: '20px' }}>
                  <h6 style={{ fontWeight: 600, marginBottom: '16px' }}>Matriz de Confusión</h6>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ borderCollapse: 'collapse', margin: '0 auto' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '8px', fontSize: '0.75rem' }}></th>
                          {classResult.confusion_matrix[0]?.map((_, i) => (
                            <th key={i} style={{
                              padding: '8px', fontSize: '0.75rem',
                              color: 'var(--text-secondary)',
                            }}>
                              Pred {i}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {classResult.confusion_matrix.map((row, i) => (
                          <tr key={i}>
                            <td style={{
                              padding: '8px', fontSize: '0.75rem',
                              fontWeight: 600, color: 'var(--text-secondary)',
                            }}>
                              Real {i}
                            </td>
                            {row.map((val, j) => (
                              <td key={j} className="matrix-cell" style={{
                                padding: '12px 16px',
                                background: i === j
                                  ? `rgba(16, 185, 129, ${0.2 + val / Math.max(...row) * 0.6})`
                                  : `rgba(239, 68, 68, ${val > 0 ? 0.1 + val / Math.max(...row) * 0.3 : 0})`,
                                border: '1px solid var(--border)',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                              }}>
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Feature Importance */}
                {classResult.feature_importance && (
                  <div className="chart-container">
                    <h6 style={{ fontWeight: 600, marginBottom: '16px' }}>Importancia de Variables</h6>
                    <BarChart
                      labels={Object.keys(classResult.feature_importance).map(k =>
                        k.length > 20 ? k.substring(0, 20) + '..' : k
                      )}
                      values={Object.values(classResult.feature_importance)}
                      horizontal
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === 'clustering' && (
        <div className="slide-up">
          {/* Config */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h6 style={{ fontWeight: 600, marginBottom: '16px' }}>Configuración de K-Means</h6>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Número de Clusters (K)
                </label>
                <input
                  type="number"
                  className="select-custom"
                  value={nClusters}
                  onChange={(e) => setNClusters(Math.max(2, parseInt(e.target.value) || 2))}
                  min={2}
                  max={10}
                  style={{ width: '100px' }}
                />
              </div>
              <button className="btn-primary-custom" onClick={handleCluster}>
                <FiLayers size={14} style={{ marginRight: '6px' }} />
                Ejecutar K-Means
              </button>
            </div>
          </div>

          {/* Results */}
          {clusterResult && !clusterResult.error && (
            <div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px', marginBottom: '20px',
              }}>
                <div className="kpi-card">
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Clusters</p>
                  <h3 style={{ fontWeight: 800, color: '#1a237e', fontSize: '1.6rem' }}>{clusterResult.n_clusters}</h3>
                </div>
                <div className="kpi-card">
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Inercia</p>
                  <h3 style={{ fontWeight: 800, color: '#2962ff', fontSize: '1.6rem' }}>{clusterResult.inertia}</h3>
                </div>
              </div>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '20px', marginBottom: '20px',
              }}>
                {/* Scatter Plot */}
                <div className="chart-container">
                  <ScatterChart
                    scatterData={clusterResult.scatter}
                    axisLabels={clusterResult.axis_labels}
                    title="Gráfico de Dispersión - Clusters"
                  />
                </div>

                {/* Cluster Size Pie */}
                <div className="chart-container">
                  <PieChart
                    labels={clusterResult.profiles.map(p => `Cluster ${p.cluster}`)}
                    values={clusterResult.profiles.map(p => p.size)}
                    title="Distribución por Cluster"
                    doughnut
                  />
                </div>
              </div>

              {/* Cluster Profiles */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <h6 style={{ fontWeight: 600, marginBottom: '16px' }}>Perfil de Cada Grupo</h6>
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px',
                }}>
                  {clusterResult.profiles.map(p => (
                    <div key={p.cluster} style={{
                      padding: '16px', borderRadius: '12px',
                      border: '1px solid var(--border)',
                      background: 'var(--bg-main)',
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: '12px',
                      }}>
                        <h6 style={{ fontWeight: 700, margin: 0 }}>Cluster {p.cluster}</h6>
                        <span className="stat-badge" style={{
                          background: 'rgba(41, 98, 255, 0.1)', color: 'var(--accent)',
                        }}>
                          {p.size} registros ({p.percentage}%)
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem' }}>
                        {Object.entries(p.means).map(([key, val]) => (
                          <div key={key} style={{
                            display: 'flex', justifyContent: 'space-between',
                            padding: '4px 0', borderBottom: '1px solid var(--border)',
                          }}>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              {key.length > 25 ? key.substring(0, 25) + '..' : key}
                            </span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                              {typeof val === 'number' ? val.toFixed(2) : val}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {clusterResult?.error && (
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--danger)' }}>{clusterResult.error}</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  )
}
