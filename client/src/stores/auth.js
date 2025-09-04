import { create } from 'zustand'
import api from '../lib/api'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
  error: null,

  _isTokenExpired(token) {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return true
      const payload = JSON.parse(atob(parts[1]))
      if (!payload?.exp) return true
      const nowInSeconds = Math.floor(Date.now() / 1000)
      return payload.exp <= nowInSeconds
    } catch {
      return true
    }
  },

  hydrate() {
    try {
      const raw = localStorage.getItem('auth')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!parsed?.token || get()._isTokenExpired(parsed.token)) {
        localStorage.removeItem('auth')
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false })
        return
      }
      set({
        user: parsed.user || null,
        token: parsed.token || null,
        isAuthenticated: Boolean(parsed.token),
        isAdmin: parsed?.user?.role === 'ADMIN',
      })
    } catch {}
  },

  async login(credentials) {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/api/auth/login', credentials)
      const payload = { user: data.user, token: data.token }
      localStorage.setItem('auth', JSON.stringify(payload))
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isAdmin: data?.user?.role === 'ADMIN',
        loading: false,
      })
      return data
    } catch (e) {
      set({ error: e?.response?.data?.error || 'Login failed', loading: false })
      throw e
    }
  },

  async register(payload) {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/api/auth/register', payload)
      const auth = { user: data.user, token: data.token }
      localStorage.setItem('auth', JSON.stringify(auth))
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isAdmin: data?.user?.role === 'ADMIN',
        loading: false,
      })
      return data
    } catch (e) {
      set({ error: e?.response?.data?.error || 'Registration failed', loading: false })
      throw e
    }
  },

  async fetchProfile() {
    try {
      const { data } = await api.get('/api/auth/profile')
      const { token } = get()
      const auth = { user: data, token }
      localStorage.setItem('auth', JSON.stringify(auth))
      set({ user: data, isAdmin: data?.role === 'ADMIN' })
      return data
    } catch (e) {
      set({ error: e?.response?.data?.error || 'Failed to load profile' })
      throw e
    }
  },

  async updateProfile(patch) {
    set({ loading: true, error: null })
    try {
      const { data } = await api.put('/api/auth/profile', patch)
      const { token } = get()
      localStorage.setItem('auth', JSON.stringify({ user: data, token }))
      set({ user: data, loading: false })
      return data
    } catch (e) {
      set({ error: e?.response?.data?.error || 'Update failed', loading: false })
      throw e
    }
  },

  async changePassword(payload) {
    set({ loading: true, error: null })
    try {
      const { data } = await api.patch('/api/auth/password', payload)
      set({ loading: false })
      return data
    } catch (e) {
      set({ error: e?.response?.data?.error || 'Password change failed', loading: false })
      throw e
    }
  },

  logout() {
    localStorage.removeItem('auth')
    set({ user: null, token: null, isAuthenticated: false, isAdmin: false })
  },
}))

export default useAuthStore


