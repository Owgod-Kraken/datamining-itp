import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'react-toastify'
import {
  FiUpload, FiFile, FiTrash2, FiEye,
  FiDownload, FiX, FiCheckCircle
} from 'react-icons/fi'
import { uploadFile, getArchivos, deleteArchivo, previewArchivo } from '../services/api'

export default function Upload() {
  const [archivos, setArchivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState(null)
  const [dragover, setDragover] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchArchivos()
  }, [])

  const fetchArchivos = async () => {
    try {
      const res = await getArchivos()
      setArchivos(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return

    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase()
      if (!['csv', 'xlsx', 'xls'].includes(ext)) {
        toast.error(`Formato no soportado: ${file.name}`)
        continue
      }

      setUploading(true)
      setProgress(0)

      const formData = new FormData()
      formData.append('file', file)

      try {
        await uploadFile(formData, (e) => {
          const pct = Math.round((e.loaded * 100) / e.total)
          setProgress(pct)
        })
        toast.success(`${file.name} subido exitosamente`)
        fetchArchivos()
      } catch (err) {
        toast.error(err.response?.data?.error || 'Error al subir archivo')
      } finally {
        setUploading(false)
        setProgress(0)
      }
    }
  }

  const handleDelete = async (id, nombre) => {
    if (!confirm(`¿Eliminar ${nombre}?`)) return
    try {
      await deleteArchivo(id)
      toast.success('Archivo eliminado')
      fetchArchivos()
    } catch (err) {
      toast.error('Error al eliminar')
    }
  }

  const handlePreview = async (id) => {
    try {
      const res = await previewArchivo(id)
      setPreview(res.data)
    } catch (err) {
      toast.error('Error al cargar vista previa')
    }
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragover(false)
    handleUpload(e.dataTransfer.files)
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragover(true) }
  const onDragLeave = () => setDragover(false)

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2><FiUpload style={{ marginRight: '8px', verticalAlign: 'middle' }} />Gestión de Archivos</h2>
        <p>Sube y administra tus archivos CSV y Excel</p>
      </div>

      {/* Upload Zone */}
      <div
        className={`upload-zone ${dragover ? 'dragover' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{ marginBottom: '24px' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          multiple
          onChange={(e) => handleUpload(e.target.files)}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              border: '3px solid var(--border)', borderTopColor: 'var(--accent)',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
            }} />
            <p style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              Subiendo archivo... {progress}%
            </p>
            <div className="progress-bar-custom" style={{ maxWidth: '300px', margin: '12px auto' }}>
              <div className="fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <FiUpload size={48} color="var(--primary-light)" style={{ marginBottom: '16px' }} />
            <h5 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '8px' }}>
              Arrastra y suelta tus archivos aquí
            </h5>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              o haz clic para seleccionar archivos CSV o XLSX
            </p>
            <div style={{
              display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px',
            }}>
              {['CSV', 'XLSX', 'XLS'].map(f => (
                <span key={f} className="stat-badge" style={{
                  background: 'rgba(41, 98, 255, 0.1)', color: 'var(--accent)',
                }}>
                  .{f}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* File List */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h6 style={{ fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
          Archivos Cargados ({archivos.length})
        </h6>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
            Cargando...
          </p>
        ) : archivos.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
            No hay archivos cargados. Sube tu primer archivo para comenzar.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Registros</th>
                  <th>Columnas</th>
                  <th>Fecha de Subida</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {archivos.map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiFile size={16} color="var(--accent)" />
                        {a.nombre}
                      </div>
                    </td>
                    <td>{a.num_registros}</td>
                    <td>{a.num_columnas}</td>
                    <td>{new Date(a.fecha_subida).toLocaleString('es-MX')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handlePreview(a.id)}
                          style={{
                            background: 'rgba(41, 98, 255, 0.1)', border: 'none',
                            borderRadius: '6px', padding: '6px 10px', cursor: 'pointer',
                            color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '0.8rem',
                          }}
                        >
                          <FiEye size={14} /> Ver
                        </button>
                        <button
                          onClick={() => handleDelete(a.id, a.nombre)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)', border: 'none',
                            borderRadius: '6px', padding: '6px 10px', cursor: 'pointer',
                            color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '0.8rem',
                          }}
                        >
                          <FiTrash2 size={14} /> Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '20px',
        }} onClick={() => setPreview(null)}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: '16px',
            padding: '24px', maxWidth: '90vw', maxHeight: '80vh',
            overflow: 'auto', width: '100%',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h5 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Vista Previa</h5>
              <button
                onClick={() => setPreview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <FiX size={20} />
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {preview.columns?.map((col, i) => (
                      <th key={i}>{col.length > 25 ? col.substring(0, 25) + '..' : col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.data?.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j}>{cell !== null && cell !== undefined ? String(cell) : ''}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
