import axios from 'axios'

// ── Base URL ──────────────────────────────────────────────────────────────────
export const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend39.onrender.com'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// ── GET /options  →  { crops, regions, seasons } ─────────────────────────────
export const fetchOptions = () => api.get('/options')

// ── POST /predict ─────────────────────────────────────────────────────────────
export const predictSupplyChain = (payload) => api.post('/predict', payload)

export default api
