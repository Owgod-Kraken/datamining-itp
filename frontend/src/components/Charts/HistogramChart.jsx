import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function HistogramChart({ values = [], title, bins = 10 }) {
  const numericValues = (values || []).filter(v => typeof v === 'number' && !isNaN(v))
  if (numericValues.length === 0) return <p>No hay datos numéricos</p>

  const min = Math.min(...numericValues)
  const max = Math.max(...numericValues)
  const binWidth = (max - min) / bins || 1
  const binCounts = Array(bins).fill(0)
  const binLabels = []

  for (let i = 0; i < bins; i++) {
    const lo = min + i * binWidth
    const hi = lo + binWidth
    binLabels.push(`${lo.toFixed(1)}-${hi.toFixed(1)}`)
  }

  numericValues.forEach(v => {
    let idx = Math.floor((v - min) / binWidth)
    if (idx >= bins) idx = bins - 1
    if (idx < 0) idx = 0
    binCounts[idx]++
  })

  const data = {
    labels: binLabels,
    datasets: [{
      label: 'Frecuencia',
      data: binCounts,
      backgroundColor: 'rgba(41, 98, 255, 0.7)',
      borderColor: 'rgba(26, 35, 126, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title, font: { size: 14, weight: 600 } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true },
    },
  }

  return (
    <div style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  )
}
