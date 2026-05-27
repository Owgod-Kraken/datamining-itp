import { useNavigate } from 'react-router-dom'
import { FiDatabase, FiBarChart2, FiCpu, FiUpload, FiArrowRight, FiCheckCircle } from 'react-icons/fi'

const features = [
  { icon: FiUpload, title: 'Carga de Datos', desc: 'Sube archivos CSV y Excel con drag & drop' },
  { icon: FiBarChart2, title: 'Visualización', desc: 'Gráficas interactivas y dashboards en tiempo real' },
  { icon: FiDatabase, title: 'Manipulación', desc: 'Limpieza, transformación y análisis estadístico' },
  { icon: FiCpu, title: 'Minería de Datos', desc: 'Clasificación y clustering con Machine Learning' },
]

const stats = [
  { value: '7+', label: 'Tipos de Gráficas' },
  { value: '4+', label: 'Algoritmos ML' },
  { value: '8+', label: 'Estadísticas' },
  { value: '2', label: 'Formatos de Exportación' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing-hero">
      <div className="floating-shapes">
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
        <div className="shape"></div>
      </div>

      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Navbar */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.15)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <FiDatabase color="white" size={20} />
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '1.2rem' }}>
              DataMining ITP
            </span>
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s',
            }}
          >
            Iniciar Sesión
          </button>
        </nav>

        {/* Hero */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}>
          <div style={{ textAlign: 'center', maxWidth: '800px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.1)', padding: '8px 16px',
              borderRadius: '20px', marginBottom: '24px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              <FiCheckCircle color="#10b981" size={14} />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                PROYECTO FINAL-INGENIERÍA DEL CONOCIMIENTO
              </span>
            </div>

            <h1 style={{
              color: 'white', fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 800, lineHeight: 1.2, marginBottom: '20px',
            }}>
              Sistema de Minería y{' '}
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Manipulación de Datos
              </span>
            </h1>

            <p style={{
              color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem',
              maxWidth: '600px', margin: '0 auto 32px',
              lineHeight: 1.6,
            }}>
              PROFA MARTHA YA PONGANOS 100
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary-custom"
                style={{
                  padding: '14px 32px', fontSize: '1rem',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                Comenzar Ahora <FiArrowRight />
              </button>
            </div>

            {/* Stats */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px', marginTop: '60px',
            }}>
              {stats.map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '16px', borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800 }}>{s.value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{
          padding: '60px 40px',
          background: 'rgba(0,0,0,0.2)',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px', maxWidth: '1000px', margin: '0 auto',
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '24px', borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s',
              }}>
                <f.icon color="#60a5fa" size={28} style={{ marginBottom: '12px' }} />
                <h4 style={{ color: 'white', fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
                  {f.title}
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', padding: '20px',
          color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem',
        }}>
          DataMining ITP &copy; 2026 - Instituto Tecnológico de Puebla
        </div>
      </div>
    </div>
  )
}
