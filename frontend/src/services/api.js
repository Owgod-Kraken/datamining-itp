import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
})

export const healthCheck = () => api.get('/api/health')
export const getDashboard = () => api.get('/api/dashboard')

export const uploadFile = (formData, onProgress) =>
  api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
  })

export const getArchivos = () => api.get('/api/archivos')
export const deleteArchivo = (id) => api.delete(`/api/archivos/${id}`)
export const previewArchivo = (id) => api.get(`/api/archivos/${id}/preview`)

export const getDataSummary = (id) => api.get(`/api/data/${id}/summary`)
export const getDataPreview = (id, n = 50) => api.get(`/api/data/${id}/preview?n=${n}`)
export const getColumns = (id) => api.get(`/api/data/${id}/columns`)
export const cleanData = (id, body) => api.post(`/api/data/${id}/clean`, body)
export const transformData = (id, body) => api.post(`/api/data/${id}/transform`, body)
export const getStats = (id) => api.get(`/api/data/${id}/stats`)
export const getCorrelation = (id) => api.get(`/api/data/${id}/correlation`)
export const getFrequencies = (id) => api.get(`/api/data/${id}/frequencies`)
export const getNulls = (id) => api.get(`/api/data/${id}/nulls`)

export const runClassification = (id, body) => api.post(`/api/mining/${id}/classify`, body)
export const runClustering = (id, body) => api.post(`/api/mining/${id}/cluster`, body)

export const exportExcel = (id) => `${API_BASE}/api/report/${id}/excel`
export const exportPdf = (id) => `${API_BASE}/api/report/${id}/pdf`

export default api
