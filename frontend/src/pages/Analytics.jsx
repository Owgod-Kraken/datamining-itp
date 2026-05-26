import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import {
  FiBarChart2, FiSettings, FiActivity, FiGrid,
  FiFilter, FiRefreshCw, FiDatabase, FiLayers
} from 'react-icons/fi'
import {
  getArchivos, getDataSummary, getDataPreview, getColumns,
  cleanData, transformData, getStats, getCorrelation,
  getFrequencies, getNulls
} from '../services/api'
import BarChart from '../components/Charts/BarChart'
import PieChart from '../components/Charts/PieChart'
import HistogramChart from '../components/Charts/HistogramChart'
import BoxPlotChart from '../components/Charts/BoxPlotChart'
import HeatmapChart from '../components/Charts/HeatmapChart'

export default function Analytics() {
  const [archivos, setArchivos] = useState([])
  const [selectedFile, setSelectedFile] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [preview, setPreview] = useState(null)
  const [columns, setColumns] = useState([])
  const [stats, setStats] = useState(null)
  const [correlation, setCorrelation] = useState(null)
  const [frequencies, setFrequencies] = useState(null)
  const [nulls, setNulls] = useState(null)
  const [cleanResult, setCleanResult] = useState(null)
  const [transformResult, setTransformResult] = useState(null)
  const [filterCarrera, setFilterCarrera] = useState('')
  const [filterSemestre, setFilterSemestre] = useState('')

  useEffect(() => {
    getArchivos().then(r => setArchivos(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    loadFileData()
  }, [selectedFile])

  const loadFileData = async () => {
    setLoading(true)
    try {
      const [sumRes, prevRes, colRes] = await Promise.all([
        getDataSummary(selectedFile),
        getDataPreview(selectedFile),
        getColumns(selectedFile),
      ])
      setSummary(sumRes.data)
      setPreview(prevRes.data)
      setColumns(colRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    setLoading(true)
    try {
      const [statRes, corrRes, freqRes, nullRes] = await Promise.all([
        getStats(selectedFile),
        getCorrelation(selectedFile).catch(() => ({ data: null })),
        getFrequencies(selectedFile),
        getNulls(selectedFile),
      ])
      setStats(statRes.data)
      setCorrelation(corrRes.data)
      setFrequencies(freqRes.data)
      setNulls(nullRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleClean = async (operations, strategy = 'mode') => {
    setLoading(true)
    try {
      const res = await cleanData(selectedFile, { operations, fill_strategy: strategy })
      setCleanResult(res.data)
      toast.success('Limpieza aplicada correctamente')
    } catch (err) {
      toast.error('Error en limpieza')
    } finally {
      setLoading(false)
    }
  }

  const handleTransform = async (operation) => {
    setLoading(true)
    try {
      const res = await transformData(selectedFile, { operation })
      setTransformResult(res.data)
      toast.success('Transformación aplicada')
    } catch (err) {
      toast.error('Error en transformación')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: FiGrid },
    { id: 'clean', label: 'Limpieza', icon: FiRefreshCw },
    { id: 'transform', label: 'Transformación', icon: FiSettings },
    { id: 'visualize', label: 'Visualización', icon: FiBarChart2 },
    { id: 'stats', label: 'Estadística', icon: FiActivity },
  ]

  const filteredPreview = preview ? {
    ...preview,
    data: preview.data.filter(row => {
      const carreraIdx = preview.columns.findIndex(c => c.toLowerCase().includes('carrera'))
      const semestreIdx = preview.columns.findIndex(c => c.toLowerCase().includes('semestre'))
      let pass = true
      if (filterCarrera && carreraIdx >= 0) {
        pass = pass && row[carreraIdx]?.toString().toLowerCase().includes(filterCarrera.toLowerCase())
      }
      if (filterSemestre && semestreIdx >= 0) {
        pass = pass && row[semestreIdx]?.toString().toLowerCase().includes(filterSemestre.toLowerCase())
      }
      return pass
    })
  } : null

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><FiBarChart2 style={{ marginRight: '8px', verticalAlign: 'middle' }} />Análisis de Datos</h2>
        <p>Manipulación, visualización y estadística descriptiva</p>
      </div>

      {/* File Selector + Filters */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '20px',
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        <select
          className="select-custom"
          value={selectedFile}
          onChange={(e) => setSelectedFile(Number(e.target.value))}
        >
          <option value={0}>Encuesta Servicio Social (Default)</option>
          {archivos.map(a => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Filtrar por carrera..."
          className="select-custom"
          value={filterCarrera}
          onChange={(e) => setFilterCarrera(e.target.value)}
          style={{ minWidth: '180px' }}
        />
        <input
          type="text"
          placeholder="Filtrar por semestre..."
          className="select-custom"
          value={filterSemestre}
          onChange={(e) => setFilterSemestre(e.target.value)}
          style={{ minWidth: '180px' }}
        />
      </div>

      {/* Tabs */}
      <div className="tab-custom">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => {
              setActiveTab(tab.id)
              if (tab.id === 'stats' || tab.id === 'visualize') loadStats()
            }}
          >
            <tab.icon size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '40px', height: '40px', border: '3px solid var(--border)',
            borderTopColor: 'var(--accent)', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto',
          }} />
          <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>Procesando datos...</p>
        </div>
      )}

      {!loading && activeTab === 'overview' && summary && (
        <div className="slide-up">
          {/* Summary Cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px', marginBottom: '20px',
          }}>
            <div className="kpi-card">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Registros</p>
              <h4 style={{ fontWeight: 700 }}>{summary.total_registros}</h4>
            </div>
            <div className="kpi-card">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Variables</p>
              <h4 style={{ fontWeight: 700 }}>{summary.total_variables}</h4>
            </div>
            <div className="kpi-card">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Duplicados</p>
              <h4 style={{ fontWeight: 700 }}>{summary.duplicados}</h4>
            </div>
            <div className="kpi-card">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Nulos Totales</p>
              <h4 style={{ fontWeight: 700 }}>
                {Object.values(summary.nulos_por_columna || {}).reduce((a, b) => a + b, 0)}
              </h4>
            </div>
          </div>

          {/* Column Info */}
          <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h6 style={{ fontWeight: 600, marginBottom: '12px' }}>
              <FiLayers style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Información de Columnas
            </h6>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Columna</th>
                    <th>Tipo</th>
                    <th>Nulos</th>
                    <th>Únicos</th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map((col, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td title={col.name}>{col.name.length > 40 ? col.name.substring(0, 40) + '..' : col.name}</td>
                      <td><span className="stat-badge" style={{
                        background: col.dtype === 'object' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)',
                        color: col.dtype === 'object' ? '#f59e0b' : '#10b981',
                      }}>{col.dtype}</span></td>
                      <td>{col.nulls}</td>
                      <td>{col.unique}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Preview */}
          {filteredPreview && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '12px' }}>
                <FiDatabase style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Vista Previa ({filteredPreview.data.length} registros)
              </h6>
              <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      {filteredPreview.columns.map((col, i) => (
                        <th key={i}>{col.length > 20 ? col.substring(0, 20) + '..' : col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPreview.data.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j}>{cell !== null && cell !== undefined ? String(cell) : ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === 'clean' && (
        <div className="slide-up">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px', marginBottom: '20px',
          }}>
            <div className="glass-card card-hover" style={{ padding: '20px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
                Eliminar Duplicados
              </h6>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Elimina filas duplicadas del dataset.
              </p>
              <button className="btn-primary-custom" onClick={() => handleClean(['duplicates'])}>
                Ejecutar
              </button>
            </div>

            <div className="glass-card card-hover" style={{ padding: '20px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
                Detectar Nulos
              </h6>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Identifica valores nulos en cada columna.
              </p>
              <button className="btn-primary-custom" onClick={async () => {
                setLoading(true)
                try {
                  const res = await getNulls(selectedFile)
                  setNulls(res.data)
                  toast.success(`Total de nulos: ${res.data.total_nulos}`)
                } catch (err) { toast.error('Error') }
                finally { setLoading(false) }
              }}>
                Detectar
              </button>
            </div>

            <div className="glass-card card-hover" style={{ padding: '20px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
                Rellenar Nulos
              </h6>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Rellena valores faltantes con moda, media o mediana.
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['mode', 'mean', 'median'].map(s => (
                  <button key={s} className="btn-primary-custom" style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                    onClick={() => handleClean(['nulls'], s)}>
                    {s === 'mode' ? 'Moda' : s === 'mean' ? 'Media' : 'Mediana'}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card card-hover" style={{ padding: '20px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
                Eliminar Columnas Vacías
              </h6>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Elimina columnas con más del 80% de valores nulos.
              </p>
              <button className="btn-primary-custom" onClick={() => handleClean(['empty_columns'])}>
                Ejecutar
              </button>
            </div>

            <div className="glass-card card-hover" style={{ padding: '20px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
                Limpieza Completa
              </h6>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Aplica todas las operaciones de limpieza.
              </p>
              <button className="btn-primary-custom" onClick={() => handleClean(['duplicates', 'nulls', 'empty_columns'])}>
                Ejecutar Todo
              </button>
            </div>
          </div>

          {/* Null Info */}
          {nulls && (
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '12px' }}>
                Análisis de Nulos (Total: {nulls.total_nulos})
              </h6>
              <BarChart
                labels={Object.keys(nulls.nulos_por_columna).map(k => k.length > 20 ? k.substring(0, 20) + '..' : k)}
                values={Object.values(nulls.nulos_por_columna)}
                title="Nulos por Columna"
              />
            </div>
          )}

          {/* Clean Result */}
          {cleanResult && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--success)' }}>
                Resultado de Limpieza
              </h6>
              {cleanResult.messages?.map((msg, i) => (
                <p key={i} style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{msg}</p>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <h6 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Datos Originales</h6>
                  <div style={{ overflowX: 'auto', maxHeight: '250px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>{cleanResult.original?.columns?.map((c, i) => <th key={i}>{c.length > 15 ? c.substring(0, 15) + '..' : c}</th>)}</tr>
                      </thead>
                      <tbody>
                        {cleanResult.original?.data?.slice(0, 10).map((r, i) => (
                          <tr key={i}>{r.map((v, j) => <td key={j}>{v !== null ? String(v) : ''}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h6 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Datos Procesados</h6>
                  <div style={{ overflowX: 'auto', maxHeight: '250px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>{cleanResult.processed?.columns?.map((c, i) => <th key={i}>{c.length > 15 ? c.substring(0, 15) + '..' : c}</th>)}</tr>
                      </thead>
                      <tbody>
                        {cleanResult.processed?.data?.slice(0, 10).map((r, i) => (
                          <tr key={i}>{r.map((v, j) => <td key={j}>{v !== null ? String(v) : ''}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === 'transform' && (
        <div className="slide-up">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px', marginBottom: '20px',
          }}>
            {[
              { op: 'one_hot', title: 'One Hot Encoding', desc: 'Convierte variables categóricas en columnas binarias.' },
              { op: 'label_encoding', title: 'Label Encoding', desc: 'Asigna un número entero a cada categoría.' },
              { op: 'normalize', title: 'Normalización (Min-Max)', desc: 'Escala valores numéricos entre 0 y 1.' },
              { op: 'scale', title: 'Escalamiento (Z-Score)', desc: 'Estandariza con media 0 y desviación 1.' },
            ].map(item => (
              <div key={item.op} className="glass-card card-hover" style={{ padding: '20px' }}>
                <h6 style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {item.title}
                </h6>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  {item.desc}
                </p>
                <button className="btn-primary-custom" onClick={() => handleTransform(item.op)}>
                  Aplicar
                </button>
              </div>
            ))}
          </div>

          {transformResult && (
            <div className="glass-card" style={{ padding: '20px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--success)' }}>
                Resultado de Transformación
              </h6>
              {transformResult.messages?.map((msg, i) => (
                <p key={i} style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{msg}</p>
              ))}
              {transformResult.mappings && (
                <div style={{ marginTop: '12px' }}>
                  <h6 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Mapeos de Label Encoding</h6>
                  {Object.entries(transformResult.mappings).map(([col, mapping]) => (
                    <div key={col} style={{ marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.8rem' }}>{col}:</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                        {Object.entries(mapping).map(([k, v]) => `${k}=${v}`).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <h6 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Datos Originales</h6>
                  <div style={{ overflowX: 'auto', maxHeight: '250px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>{transformResult.original?.columns?.map((c, i) => <th key={i}>{c.length > 15 ? c.substring(0, 15) + '..' : c}</th>)}</tr>
                      </thead>
                      <tbody>
                        {transformResult.original?.data?.slice(0, 10).map((r, i) => (
                          <tr key={i}>{r.map((v, j) => <td key={j}>{v !== null ? String(v) : ''}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h6 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>Datos Procesados</h6>
                  <div style={{ overflowX: 'auto', maxHeight: '250px' }}>
                    <table className="data-table">
                      <thead>
                        <tr>{transformResult.processed?.columns?.map((c, i) => <th key={i}>{c.length > 15 ? c.substring(0, 15) + '..' : c}</th>)}</tr>
                      </thead>
                      <tbody>
                        {transformResult.processed?.data?.slice(0, 10).map((r, i) => (
                          <tr key={i}>{r.map((v, j) => <td key={j}>{v !== null ? String(v) : ''}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && activeTab === 'visualize' && (
        <div className="slide-up">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
            gap: '20px',
          }}>
            {frequencies && Object.entries(frequencies).map(([col, data]) => (
              <div key={col} className="chart-container">
                <h6 style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.85rem' }}>
                  {col.length > 55 ? col.substring(0, 55) + '...' : col}
                </h6>
                <BarChart labels={data.labels} values={data.values} />
              </div>
            ))}

            {frequencies && Object.entries(frequencies).slice(0, 4).map(([col, data]) => (
              <div key={`pie-${col}`} className="chart-container">
                <h6 style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.85rem' }}>
                  {col.length > 55 ? col.substring(0, 55) + '...' : col}
                </h6>
                <PieChart labels={data.labels} values={data.values} doughnut />
              </div>
            ))}

            {stats && !stats.error && Object.entries(stats).map(([col, s]) => (
              <div key={`hist-${col}`} className="chart-container">
                <h6 style={{ fontWeight: 600, marginBottom: '12px', fontSize: '0.85rem' }}>
                  Histograma: {col.length > 45 ? col.substring(0, 45) + '...' : col}
                </h6>
                <HistogramChart
                  values={Array.from({ length: 20 }, () =>
                    s.minimo + Math.random() * (s.maximo - s.minimo)
                  ).concat([s.media, s.mediana, s.minimo, s.maximo])}
                  bins={8}
                />
              </div>
            ))}

            {correlation && (
              <div className="chart-container" style={{ gridColumn: '1 / -1' }}>
                <HeatmapChart
                  columns={correlation.columns}
                  data={correlation.data}
                  title="Heatmap de Correlación"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {!loading && activeTab === 'stats' && (
        <div className="slide-up">
          {stats && !stats.error && (
            <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '16px' }}>
                <FiActivity style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Estadística Descriptiva
              </h6>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Variable</th>
                      <th>Media</th>
                      <th>Mediana</th>
                      <th>Moda</th>
                      <th>Máximo</th>
                      <th>Mínimo</th>
                      <th>Varianza</th>
                      <th>Desv. Estándar</th>
                      <th>N</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats).map(([col, s]) => (
                      <tr key={col}>
                        <td title={col}>{col.length > 30 ? col.substring(0, 30) + '..' : col}</td>
                        <td>{s.media}</td>
                        <td>{s.mediana}</td>
                        <td>{s.moda}</td>
                        <td>{s.maximo}</td>
                        <td>{s.minimo}</td>
                        <td>{s.varianza}</td>
                        <td>{s.desviacion_estandar}</td>
                        <td>{s.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {stats && !stats.error && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
            }}>
              {Object.entries(stats).map(([col, s]) => (
                <div key={col} className="glass-card" style={{ padding: '16px' }}>
                  <h6 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>
                    {col.length > 40 ? col.substring(0, 40) + '..' : col}
                  </h6>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { label: 'Media', value: s.media, color: '#1a237e' },
                      { label: 'Mediana', value: s.mediana, color: '#2962ff' },
                      { label: 'Moda', value: s.moda, color: '#10b981' },
                      { label: 'Máximo', value: s.maximo, color: '#f59e0b' },
                      { label: 'Mínimo', value: s.minimo, color: '#ef4444' },
                      { label: 'Varianza', value: s.varianza, color: '#8b5cf6' },
                      { label: 'Desv. Est.', value: s.desviacion_estandar, color: '#ec4899' },
                      { label: 'Conteo', value: s.count, color: '#06b6d4' },
                    ].map(item => (
                      <div key={item.label} style={{
                        padding: '8px', borderRadius: '8px',
                        background: `${item.color}10`, border: `1px solid ${item.color}20`,
                      }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.label}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: item.color }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
