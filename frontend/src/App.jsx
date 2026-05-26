import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { ThemeProvider } from './context/ThemeContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Upload from './pages/Upload'
import Analytics from './pages/Analytics'
import Mining from './pages/Mining'
import Reports from './pages/Reports'
import Layout from './components/Layout'

function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem('datamining_auth') === 'true'
  return isAuth ? children : <Navigate to="/login" />
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="upload" element={<Upload />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="mining" element={<Mining />} />
            <Route path="reports" element={<Reports />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
