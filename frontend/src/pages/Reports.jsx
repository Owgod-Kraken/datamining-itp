import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import {
  FiFileText, FiDownload, FiFile, FiDatabase
} from 'react-icons/fi'
import { getArchivos, getDataSummary, getStats, exportExcel, exportPdf } from '../services/api'

export default function Reports() {
  const [archivos, setArchivos] = useState([])
  const [selectedFile, setSelectedFile] = useState(0)
  const [summary, setSummary] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getArchivos().then(r => setArchivos(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    loadData()
  }, [selectedFile])

  const loadData = async () => {
    setLoading(true)
    try {
      const [sumRes, statRes] = await Promise.all([
        getDataSummary(selectedFile),
        getStats(selectedFile).catch(() => ({ data: {} })),
      ])
      setSummary(sumRes.data)
      setStats(statRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = (format) => {
    const url = format === 'excel' ? exportExcel(selectedFile) : exportPdf(selectedFile)
    window.open(url, '_blank')
    toast.success(`Descargando reporte en ${format.toUpperCase()}`)
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><FiFileText style={{ marginRight: '8px', verticalAlign: 'middle' }} />Reportes</h2>
        <p>Genera y exporta reportes con estadísticas y resultados</p>
      </div>

      {/* File Selector */}
      <div style={{ marginBottom: '24px' }}>
        <select
          className="select-custom"
          value={selectedFile}
          onChange={(e) => setSelectedFile(Number(e.target.value))}
        >
          <option value={0}>Encuesta Servicio Social (Default)</option>
          {archivos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
        </select>
      </div>

      {/* Export Buttons */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px', marginBottom: '24px',
      }}>
        <div className="glass-card card-hover" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiFile size={22} color="#10b981" />
            </div>
            <div>
              <h5 style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Exportar Excel</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                Formato XLSX con múltiples hojas
              </p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Incluye datos completos, estadísticas descriptivas y resumen general en hojas separadas.
          </p>
          <button
            className="btn-primary-custom"
            onClick={() => handleExport('excel')}
            style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiDownload size={16} /> Descargar Excel
          </button>
        </div>

        <div className="glass-card card-hover" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiFileText size={22} color="#ef4444" />
            </div>
            <div>
              <h5 style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Exportar PDF</h5>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                Reporte profesional en PDF
              </p>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Documento con resumen general, estadísticas descriptivas y vista previa de datos.
          </p>
          <button
            className="btn-primary-custom"
            onClick={() => handleExport('pdf')}
            style={{
              width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            }}
          >
            <FiDownload size={16} /> Descargar PDF
          </button>
        </div>
      </div>

      {/* Report Preview */}
      {!loading && summary && (
        <div className="slide-up">
          <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
            <h5 style={{ fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>
              <FiDatabase style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Vista Previa del Reporte
            </h5>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px', marginBottom: '24px',
            }}>
              {[
                { label: 'Total de Registros', value: summary.total_registros, color: '#1a237e' },
                { label: 'Total de Variables', value: summary.total_variables, color: '#2962ff' },
                { label: 'Total de Nulos', value: Object.values(summary.nulos_por_columna || {}).reduce((a, b) => a + b, 0), color: '#f59e0b' },
                { label: 'Duplicados', value: summary.duplicados, color: '#ef4444' },
              ].map(item => (
                <div key={item.label} style={{
                  padding: '16px', borderRadius: '10px',
                  background: `${item.color}08`,
                  border: `1px solid ${item.color}20`,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: item.color }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Column List */}
            <div style={{ marginBottom: '20px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>
                Variables del Dataset
              </h6>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {summary.columnas?.map((col, i) => (
                  <span key={i} className="stat-badge" style={{
                    background: 'rgba(41, 98, 255, 0.08)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(41, 98, 255, 0.15)',
                  }}>
                    {col.length > 30 ? col.substring(0, 30) + '..' : col}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics Table */}
          {stats && !stats.error && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
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
                      <th>Máx</th>
                      <th>Mín</th>
                      <th>Varianza</th>
                      <th>Desv. Est.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats).map(([col, s]) => (
                      <tr key={col}>
                        <td title={col}>{col.length > 25 ? col.substring(0, 25) + '..' : col}</td>
                        <td>{s.media}</td>
                        <td>{s.mediana}</td>
                        <td>{s.moda}</td>
                        <td>{s.maximo}</td>
                        <td>{s.minimo}</td>
                        <td>{s.varianza}</td>
                        <td>{s.desviacion_estandar}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
