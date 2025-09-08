import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/'

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
  } catch {
    void 0
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      try {
        localStorage.removeItem('auth')
      } catch {
        void 0
      }
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname + window.location.search
        if (!currentPath.startsWith('/login')) {
          window.location.replace(`/login?next=${encodeURIComponent(currentPath)}`)
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api


