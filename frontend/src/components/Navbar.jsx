import { useTheme } from '../context/ThemeContext'
import { FiSun, FiMoon, FiMenu, FiUser } from 'react-icons/fi'

export default function Navbar({ onToggleSidebar }) {
  const { darkMode, toggleTheme } = useTheme()
  const user = localStorage.getItem('datamining_user') || 'Admin'

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      right: 0,
      left: 0,
      height: 'var(--navbar-height)',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      zIndex: 999,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
          }}
        >
          <FiMenu size={20} />
        </button>
        <span style={{
          fontWeight: 600,
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
        }}>
          Sistema de Minería y Manipulación de Datos
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-main)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            padding: '8px 12px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
          }}
        >
          {darkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
          {darkMode ? 'Claro' : 'Oscuro'}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '8px',
          background: 'var(--bg-main)',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <FiUser color="white" size={14} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
            {user}
          </span>
        </div>
      </div>
    </nav>
  )
}
