import { create } from 'zustand'
import api from '../lib/api'

export const useProductsStore = create((set, get) => ({
  products: [],
  pagination: { currentPage: 1, totalPages: 1, totalCount: 0, limit: 12 },
  filters: { page: 1, limit: 12, search: '', category: '', minPrice: '', maxPrice: '', sortBy: 'createdAt', sortOrder: 'desc', inStock: '' },
  featured: [],
  loading: false,
  error: null,

  setFilter(name, value) {
    set({ filters: { ...get().filters, [name]: value, page: 1 } })
  },
  setFilters(next) {
    set({ filters: { ...get().filters, ...next, page: 1 } })
  },

  async fetchProducts(params) {
    set({ loading: true, error: null })
    try {
      const query = { ...get().filters, ...(params || {}) }
      const { data } = await api.get('/api/products', { params: query })
      set({ products: data.products || [], pagination: data.pagination || {}, loading: false })
      return data
    } catch (e) {
      set({ error: e?.response?.data?.error || 'Failed to load products', loading: false })
      throw e
    }
  },

  async fetchFeatured(limit = 8) {
    try {
      const { data } = await api.get('/api/products/featured', { params: { limit } })
      const list = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : []
      set({ featured: list })
      return data
    } catch (e) {
      set({ error: e?.response?.data?.error || 'Failed to load featured' })
      throw e
    }
  },
}))

export default useProductsStore


