import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function computeBoxStats(values = []) {
  const sorted = [...(values || [])].filter(v => !isNaN(v)).sort((a, b) => a - b)
  if (sorted.length === 0) return null
  const q1 = sorted[Math.floor(sorted.length * 0.25)]
  const median = sorted[Math.floor(sorted.length * 0.5)]
  const q3 = sorted[Math.floor(sorted.length * 0.75)]
  const min = sorted[0]
  const max = sorted[sorted.length - 1]
  return { min, q1, median, q3, max }
}

export default function BoxPlotChart({ data: rawData = [], columns = [], title }) {
  if (!columns || columns.length === 0) return <p>No hay columnas numéricas</p>

  const stats = columns.map(col => {
    const vals = rawData.map(row => parseFloat(row[col])).filter(v => !isNaN(v))
    return { col, ...computeBoxStats(vals) }
  }).filter(s => s.min !== undefined)

  if (stats.length === 0) return <p>No hay datos suficientes</p>

  const chartData = {
    labels: stats.map(s => s.col.length > 20 ? s.col.substring(0, 20) + '..' : s.col),
    datasets: [
      {
        label: 'Rango (Min-Max)',
        data: stats.map(s => s.max - s.min),
        backgroundColor: 'rgba(41, 98, 255, 0.2)',
        borderColor: 'rgba(41, 98, 255, 0.8)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'IQR (Q1-Q3)',
        data: stats.map(s => s.q3 - s.q1),
        backgroundColor: 'rgba(26, 35, 126, 0.6)',
        borderColor: 'rgba(26, 35, 126, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: !!title, text: title, font: { size: 14, weight: 600 } },
      tooltip: {
        callbacks: {
          afterBody: (ctx) => {
            const idx = ctx[0].dataIndex
            const s = stats[idx]
            return [
              `Min: ${s.min?.toFixed(2)}`,
              `Q1: ${s.q1?.toFixed(2)}`,
              `Mediana: ${s.median?.toFixed(2)}`,
              `Q3: ${s.q3?.toFixed(2)}`,
              `Max: ${s.max?.toFixed(2)}`,
            ]
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true },
    },
  }

  return (
    <div style={{ height: '300px' }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
