import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${parsed.token}`,
        }
      }
    }
  } catch {}
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      // Optionally clear invalid token
      // localStorage.removeItem('auth')
    }
    return Promise.reject(error)
  },
)

export default api


