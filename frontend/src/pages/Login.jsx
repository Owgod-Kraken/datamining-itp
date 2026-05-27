import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiUser, FiLock, FiLogIn, FiDatabase, FiEye, FiEyeOff } from 'react-icons/fi'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('datamining_auth', 'true')
        localStorage.setItem('datamining_user', 'Admin')
        toast.success('Bienvenido al sistema DataMining ITP')
        navigate('/app')
      } else {
        toast.error('Credenciales incorrectas. Intente de nuevo.')
      }
      setLoading(false)
    }, 800)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0d1642 0%, #1a237e 50%, #2962ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <div className="scale-in" style={{
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: '48px 40px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #1a237e, #2962ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 20px rgba(26, 35, 126, 0.3)',
          }}>
            <FiDatabase color="white" size={28} />
          </div>
          <h2 style={{ fontWeight: 800, color: '#1a237e', fontSize: '1.6rem' }}>
            DataMining ITP
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '4px' }}>
            Sistema de Minería de Datos
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block', fontSize: '0.85rem', fontWeight: 600,
              color: '#374151', marginBottom: '8px',
            }}>
              Usuario
            </label>
            <div style={{
              display: 'flex', alignItems: 'center',
              border: '2px solid #e5e7eb', borderRadius: '10px',
              padding: '0 12px', transition: 'all 0.3s',
            }}>
              <FiUser color="#9ca3af" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  padding: '12px 10px', fontSize: '0.95rem',
                  background: 'transparent',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block', fontSize: '0.85rem', fontWeight: 600,
              color: '#374151', marginBottom: '8px',
            }}>
              Contraseña
            </label>
            <div style={{
              display: 'flex', alignItems: 'center',
              border: '2px solid #e5e7eb', borderRadius: '10px',
              padding: '0 12px', transition: 'all 0.3s',
            }}>
              <FiLock color="#9ca3af" size={18} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  padding: '12px 10px', fontSize: '0.95rem',
                  background: 'transparent',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', padding: '4px',
                }}
              >
                {showPass ? <FiEyeOff color="#9ca3af" size={18} /> : <FiEye color="#9ca3af" size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading
                ? '#9ca3af'
                : 'linear-gradient(135deg, #1a237e, #2962ff)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.3s',
            }}
          >
            {loading ? (
              <div style={{
                width: '20px', height: '20px', border: '2px solid white',
                borderTopColor: 'transparent', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            ) : (
              <>
                <FiLogIn size={18} />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        <p style={{
          textAlign: 'center', color: '#9ca3af',
          fontSize: '0.75rem', marginTop: '20px',
        }}>
          Instituto Tecnológico de Puebla &copy; 2026
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
