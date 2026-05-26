import { NavLink, useNavigate } from 'react-router-dom'
import {
  FiHome, FiUpload, FiBarChart2, FiCpu, FiFileText,
  FiLogOut, FiDatabase, FiChevronLeft, FiChevronRight
} from 'react-icons/fi'

const menuItems = [
  { path: '/app', icon: FiHome, label: 'Dashboard', end: true },
  { path: '/app/upload', icon: FiUpload, label: 'Gestión de Archivos' },
  { path: '/app/analytics', icon: FiBarChart2, label: 'Análisis de Datos' },
  { path: '/app/mining', icon: FiCpu, label: 'Minería de Datos' },
  { path: '/app/reports', icon: FiFileText, label: 'Reportes' },
]

export default function Sidebar({ isOpen, onToggle }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('datamining_auth')
    localStorage.removeItem('datamining_user')
    navigate('/login')
  }

  return (
    <aside style={{
      width: isOpen ? 'var(--sidebar-width)' : '70px',
      background: 'var(--bg-sidebar)',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      transition: 'var(--transition)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: isOpen ? '20px' : '20px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        minHeight: '64px',
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #2962ff, #1a237e)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <FiDatabase color="white" size={18} />
        </div>
        {isOpen && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap' }}>
              DataMining ITP
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>
              Sistema de Minería de Datos
            </div>
          </div>
        )}
      </div>

      <nav style={{ flex: 1, padding: '16px 8px' }}>
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: isOpen ? '12px 16px' : '12px',
              borderRadius: '10px',
              color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
              background: isActive ? 'linear-gradient(135deg, rgba(41,98,255,0.3), rgba(26,35,126,0.3))' : 'transparent',
              textDecoration: 'none',
              marginBottom: '4px',
              transition: 'var(--transition)',
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 400,
              justifyContent: isOpen ? 'flex-start' : 'center',
            })}
          >
            <item.icon size={20} style={{ flexShrink: 0 }} />
            {isOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={onToggle}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            border: 'none',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            marginBottom: '4px',
            fontSize: '0.85rem',
          }}
        >
          {isOpen ? <FiChevronLeft size={18} /> : <FiChevronRight size={18} />}
          {isOpen && 'Colapsar'}
        </button>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isOpen ? 'flex-start' : 'center',
            gap: '12px',
            width: '100%',
            padding: '12px 16px',
            border: 'none',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          <FiLogOut size={18} />
          {isOpen && 'Cerrar Sesión'}
        </button>
      </div>
    </aside>
  )
}
