import { useTheme } from '../../context/ThemeContext'

export default function HeatmapChart({ columns, data, title }) {
  const { darkMode } = useTheme()
  if (!data || !columns) return <p>No hay datos de correlación</p>

  const getColor = (value) => {
    const absVal = Math.abs(value)
    if (value > 0) {
      const r = Math.round(26 + (255 - 26) * (1 - absVal))
      const g = Math.round(35 + (255 - 35) * (1 - absVal))
      const b = 255
      return `rgba(${r}, ${g}, ${b}, ${0.3 + absVal * 0.7})`
    } else {
      const r = 239
      const g = Math.round(68 + (255 - 68) * (1 - absVal))
      const b = Math.round(68 + (255 - 68) * (1 - absVal))
      return `rgba(${r}, ${g}, ${b}, ${0.3 + absVal * 0.7})`
    }
  }

  const cellSize = Math.min(60, 500 / columns.length)

  return (
    <div>
      {title && <h6 style={{ fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>{title}</h6>}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '4px', fontSize: '0.7rem' }}></th>
              {columns.map((col, i) => (
                <th key={i} style={{
                  padding: '4px',
                  fontSize: '0.65rem',
                  color: 'var(--text-secondary)',
                  maxWidth: `${cellSize}px`,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'left bottom',
                  height: '80px',
                }}>
                  {col.length > 12 ? col.substring(0, 12) + '..' : col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td style={{
                  padding: '4px 8px',
                  fontSize: '0.65rem',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                }}>
                  {columns[i]?.length > 15 ? columns[i].substring(0, 15) + '..' : columns[i]}
                </td>
                {row.map((val, j) => (
                  <td key={j} style={{
                    width: `${cellSize}px`,
                    height: `${cellSize}px`,
                    background: getColor(val),
                    textAlign: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    color: Math.abs(val) > 0.5 ? 'white' : (darkMode ? '#e5e7eb' : '#1a1a2e'),
                    border: `1px solid ${darkMode ? '#2d3154' : '#e5e7eb'}`,
                    cursor: 'default',
                  }}
                  title={`${columns[i]} vs ${columns[j]}: ${val}`}
                  >
                    {val?.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
