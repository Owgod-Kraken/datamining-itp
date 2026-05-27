import { useState, useEffect } from 'react'
import { FiDatabase, FiGrid, FiFile, FiCalendar, FiActivity, FiTrendingUp, FiBarChart2 } from 'react-icons/fi'
import { getDashboard, getFrequencies, getStats } from '../services/api'
import KPI from '../components/KPI'
import BarChart from '../components/Charts/BarChart'
import PieChart from '../components/Charts/PieChart'
import LineChart from '../components/Charts/LineChart'

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [frequencies, setFrequencies] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, freqRes, statsRes] = await Promise.all([
          getDashboard(),
          getFrequencies(0).catch(() => ({ data: {} })),
          getStats(0).catch(() => ({ data: {} })),
        ])
        setDashboard(dashRes.data)
        setFrequencies(freqRes.data)
        setStats(statsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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

  const kpis = [
    {
      title: 'Total de Registros',
      value: dashboard?.total_registros || 0,
      icon: FiDatabase,
      color: '#1a237e',
      subtitle: 'Registros en el sistema',
    },
    {
      title: 'Total de Variables',
      value: dashboard?.total_variables || 0,
      icon: FiGrid,
      color: '#2962ff',
      subtitle: 'Columnas disponibles',
    },
    {
      title: 'Archivos Cargados',
      value: dashboard?.archivos_cargados || 0,
      icon: FiFile,
      color: '#10b981',
      subtitle: 'Datasets en el sistema',
    },
    {
      title: 'Fecha de Análisis',
      value: dashboard?.fecha_analisis
        ? new Date(dashboard.fecha_analisis).toLocaleDateString('es-MX')
        : 'N/A',
      icon: FiCalendar,
      color: '#f59e0b',
      subtitle: 'Último análisis realizado',
    },
  ]

  const firstFreq = frequencies ? Object.entries(frequencies)[0] : null
  const secondFreq = frequencies ? Object.entries(frequencies)[1] : null
  const thirdFreq = frequencies ? Object.entries(frequencies)[2] : null

  const statsEntries = stats && !stats.error ? Object.entries(stats) : []

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><FiActivity style={{ marginRight: '8px', verticalAlign: 'middle' }} />Dashboard</h2>
        <p>Resumen general del sistema de minería de datos</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {kpis.map((kpi, i) => (
          <KPI key={i} {...kpi} />
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '20px',
        marginBottom: '24px',
      }}>
        {firstFreq && (
          <div className="chart-container slide-up">
            <h6 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
              <FiBarChart2 style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {firstFreq[0].length > 50 ? firstFreq[0].substring(0, 50) + '...' : firstFreq[0]}
            </h6>
            <BarChart
              labels={firstFreq[1].labels}
              values={firstFreq[1].values}
            />
          </div>
        )}

        {secondFreq && (
          <div className="chart-container slide-up">
            <h6 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
              <FiTrendingUp style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              {secondFreq[0].length > 50 ? secondFreq[0].substring(0, 50) + '...' : secondFreq[0]}
            </h6>
            <PieChart
              labels={secondFreq[1].labels}
              values={secondFreq[1].values}
              doughnut
            />
          </div>
        )}
      </div>

      {thirdFreq && (
        <div className="chart-container slide-up" style={{ marginBottom: '24px' }}>
          <h6 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
            {thirdFreq[0].length > 60 ? thirdFreq[0].substring(0, 60) + '...' : thirdFreq[0]}
          </h6>
          <BarChart
            labels={thirdFreq[1].labels}
            values={thirdFreq[1].values}
            horizontal
          />
        </div>
      )}

      {statsEntries.length > 0 && (
        <div className="glass-card slide-up" style={{ padding: '20px' }}>
          <h6 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Resumen Estadístico
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
                  <th>Desv. Est.</th>
                </tr>
              </thead>
              <tbody>
                {statsEntries.map(([col, s]) => (
                  <tr key={col}>
                    <td title={col}>{col.length > 30 ? col.substring(0, 30) + '...' : col}</td>
                    <td>{s.media}</td>
                    <td>{s.mediana}</td>
                    <td>{s.moda}</td>
                    <td>{s.maximo}</td>
                    <td>{s.minimo}</td>
                    <td>{s.desviacion_estandar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
