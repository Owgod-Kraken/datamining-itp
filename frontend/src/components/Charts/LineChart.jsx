import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function LineChart({ labels, values, title }) {
  const data = {
    labels,
    datasets: [{
      label: title || 'Valores',
      data: values,
      borderColor: 'rgba(41, 98, 255, 1)',
      backgroundColor: 'rgba(41, 98, 255, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: 'rgba(26, 35, 126, 1)',
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
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' }, beginAtZero: true },
    },
  }

  return (
    <div style={{ height: '300px' }}>
      <Line data={data} options={options} />
    </div>
  )
}
