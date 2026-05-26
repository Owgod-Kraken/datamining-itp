import { Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS, LinearScale, PointElement,
  Title, Tooltip, Legend
} from 'chart.js'

ChartJS.register(LinearScale, PointElement, Title, Tooltip, Legend)

const COLORS = [
  'rgba(26, 35, 126, 0.7)', 'rgba(41, 98, 255, 0.7)',
  'rgba(16, 185, 129, 0.7)', 'rgba(245, 158, 11, 0.7)',
  'rgba(239, 68, 68, 0.7)', 'rgba(139, 92, 246, 0.7)',
  'rgba(236, 72, 153, 0.7)', 'rgba(6, 182, 212, 0.7)',
]

export default function ScatterChart({ scatterData, axisLabels, title }) {
  if (!scatterData) return null

  const datasets = scatterData.map((cluster, i) => ({
    label: `Cluster ${cluster.cluster}`,
    data: cluster.x.map((x, j) => ({ x, y: cluster.y[j] })),
    backgroundColor: COLORS[i % COLORS.length],
    borderColor: COLORS[i % COLORS.length].replace('0.7', '1'),
    pointRadius: 6,
    pointHoverRadius: 8,
  }))

  const data = { datasets }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: !!title, text: title, font: { size: 14, weight: 600 } },
      legend: { position: 'top' },
    },
    scales: {
      x: {
        title: { display: true, text: axisLabels?.x || 'X' },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        title: { display: true, text: axisLabels?.y || 'Y' },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  }

  return (
    <div style={{ height: '400px' }}>
      <Scatter data={data} options={options} />
    </div>
  )
}
