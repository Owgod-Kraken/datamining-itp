import { Pie, Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const COLORS = [
  'rgba(26, 35, 126, 0.85)', 'rgba(41, 98, 255, 0.85)',
  'rgba(16, 185, 129, 0.85)', 'rgba(245, 158, 11, 0.85)',
  'rgba(239, 68, 68, 0.85)', 'rgba(139, 92, 246, 0.85)',
  'rgba(236, 72, 153, 0.85)', 'rgba(6, 182, 212, 0.85)',
  'rgba(251, 146, 60, 0.85)', 'rgba(34, 197, 94, 0.85)',
]

export default function PieChart({ labels, values, title, doughnut = false }) {
  const data = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: labels.map((_, i) => COLORS[i % COLORS.length]),
      borderColor: '#fff',
      borderWidth: 2,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } },
      title: { display: !!title, text: title, font: { size: 14, weight: 600 } },
    },
  }

  const ChartComponent = doughnut ? Doughnut : Pie
  return (
    <div style={{ height: '300px' }}>
      <ChartComponent data={data} options={options} />
    </div>
  )
}
