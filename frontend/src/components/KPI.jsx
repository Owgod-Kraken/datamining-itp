export default function KPI({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="kpi-card fade-in" style={{ animationDelay: '0.1s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '8px',
          }}>
            {title}
          </p>
          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}>
            {value}
          </h3>
          {subtitle && (
            <p style={{
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              marginTop: '6px',
            }}>
              {subtitle}
            </p>
          )}
        </div>
        <div className="kpi-icon" style={{ background: `${color}15`, color }}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}
