import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  Title, Tooltip, Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const COLORS = [
  'rgba(26, 35, 126, 0.8)', 'rgba(41, 98, 255, 0.8)',
  'rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)',
  'rgba(239, 68, 68, 0.8)', 'rgba(139, 92, 246, 0.8)',
  'rgba(236, 72, 153, 0.8)', 'rgba(6, 182, 212, 0.8)',
]

export default function BarChart({ labels, values, title, horizontal = false }) {
  const data = {
    labels,
    datasets: [{
      label: title || 'Frecuencia',
      data: values,
      backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
      borderColor: labels.map((_, i) => COLORS[i % COLORS.length].replace('0.8', '1')),
      borderWidth: 1,
      borderRadius: 6,
    }],
  }

  const options = {
    indexAxis: horizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title, font: { size: 14, weight: 600 } },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true },
    },
  }

  return (
    <div style={{ height: '300px' }}>
      <Bar data={data} options={options} />
    </div>
  )
}
