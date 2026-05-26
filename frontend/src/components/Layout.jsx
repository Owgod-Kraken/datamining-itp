import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useState } from 'react'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div style={{
        flex: 1,
        marginLeft: sidebarOpen ? 'var(--sidebar-width)' : '70px',
        transition: 'var(--transition)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main style={{
          padding: '24px',
          marginTop: 'var(--navbar-height)',
          flex: 1,
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
