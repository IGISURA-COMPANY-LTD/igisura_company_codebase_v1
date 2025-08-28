import Layout from '../components/layout/Layout'
import useProductsStore from '../stores/products'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ProductCard from '../components/cards/ProductCard'
import api from '../lib/api'

export default function Products() {
  const { products, pagination, filters, setFilter, setFilters, fetchProducts, loading } = useProductsStore()
  const [categories, setCategories] = useState([])
  const [draft, setDraft] = useState({
    search: filters.search || '',
    category: filters.category || '',
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || '',
    inStock: Boolean(filters.inStock) || false,
    sortBy: filters.sortBy || 'createdAt',
    sortOrder: filters.sortOrder || 'desc',
  })
  const gridRef = useRef(null)

  // Load categories once
  useEffect(() => {
    api.get('/api/categories').then(({ data }) => setCategories(Array.isArray(data) ? data : data?.categories || [])).catch(() => {})
  }, [])

  // Fetch products when applied filters in store change (including page)
  useEffect(() => {
    fetchProducts().finally(() => {
      if (gridRef.current) {
        gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }, [filters.page, filters.search, filters.category, filters.minPrice, filters.maxPrice, filters.sortBy, filters.sortOrder, filters.inStock])

  const applyFilters = () => {
    setFilters({ ...draft, page: 1 })
  }

  const clearAll = () => {
    const reset = { search: '', category: '', minPrice: '', maxPrice: '', inStock: false, sortBy: 'createdAt', sortOrder: 'desc' }
    setDraft(reset)
    setFilters({ ...reset, page: 1 })
  }

  // Dual range slider using two overlapping range inputs
  const minAllowed = 0
  const maxAllowed = 1000
  const minVal = Number(draft.minPrice || 0)
  const maxVal = Number(draft.maxPrice || maxAllowed)

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Shop</h1>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          <aside className="md:col-span-3">
            <div className="md:sticky md:top-20 card p-5 space-y-4 bg-white">
              <div className="text-sm font-medium text-gray-700">Filters</div>
              <input className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-0 focus:border-brand-600" placeholder="Search" value={draft.search} onChange={(e) => setDraft({ ...draft, search: e.target.value })} />
              <select className="w-full border rounded-lg px-3 py-2" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.id} value={c.slug || c.id}>{c.name}</option>)}
              </select>
              {/* Price range slider + inputs */}
              <div className="space-y-2">
                <div className="text-sm text-gray-700">Price range</div>
                <div className="relative h-8">
                  <input type="range" min={minAllowed} max={maxAllowed} value={Math.min(minVal, maxVal - 1)} onChange={(e) => setDraft({ ...draft, minPrice: Number(e.target.value) })} className="absolute left-0 right-0 top-3 w-full appearance-none bg-transparent pointer-events-auto" />
                  <input type="range" min={minAllowed} max={maxAllowed} value={Math.max(maxVal, minVal + 1)} onChange={(e) => setDraft({ ...draft, maxPrice: Number(e.target.value) })} className="absolute left-0 right-0 top-3 w-full appearance-none bg-transparent pointer-events-auto" />
                  <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200 rounded" />
                  <div className="absolute top-5 h-1 bg-brand-500 rounded" style={{ left: `${(Math.min(minVal, maxVal) / maxAllowed) * 100}%`, right: `${(1 - Math.max(minVal, maxVal) / maxAllowed) * 100}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input className="border rounded-lg px-3 py-2" placeholder="Min" value={draft.minPrice} onChange={(e) => setDraft({ ...draft, minPrice: Number(e.target.value || 0) })} />
                  <input className="border rounded-lg px-3 py-2" placeholder="Max" value={draft.maxPrice} onChange={(e) => setDraft({ ...draft, maxPrice: Number(e.target.value || maxAllowed) })} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={!!draft.inStock} onChange={(e) => setDraft({ ...draft, inStock: e.target.checked })} />
                In Stock only
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select className="border rounded-lg px-3 py-2" value={draft.sortBy} onChange={(e) => setDraft({ ...draft, sortBy: e.target.value })}>
                  <option value="createdAt">Newest</option>
                  <option value="price">Price</option>
                  <option value="name">Name</option>
                  <option value="rating">Rating</option>
                </select>
                <select className="border rounded-lg px-3 py-2" value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })}>
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="btn-primary flex-1 disabled:opacity-70" onClick={applyFilters} disabled={loading}>
                  {loading ? 'Applying...' : 'Apply Filters'}
                </button>
                <button type="button" className="btn" onClick={clearAll} disabled={loading}>Clear All</button>
              </div>
            </div>
          </aside>
          <section className="md:col-span-9" ref={gridRef}>
            {/* Active filters and count */}
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">Showing {pagination?.totalCount ?? products.length} products</div>
              <div className="flex flex-wrap gap-2">
                {filters.search && <span className="px-2 py-1 rounded bg-gray-100">Search: {filters.search}</span>}
                {filters.category && <span className="px-2 py-1 rounded bg-gray-100">Category: {filters.category}</span>}
                {(filters.minPrice || filters.maxPrice) && <span className="px-2 py-1 rounded bg-gray-100">Price: {filters.minPrice || 0} - {filters.maxPrice || '∞'}</span>}
                {filters.inStock ? <span className="px-2 py-1 rounded bg-gray-100">In Stock</span> : null}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: pagination?.limit || 12 }).map((_, i) => (
                  <div key={i} className="card p-4">
                    <div className="skeleton h-44 rounded-xl" />
                    <div className="skeleton h-4 w-2/3 mt-3 rounded" />
                    <div className="skeleton h-4 w-1/3 mt-2 rounded" />
                  </div>
                ))
              ) : (
                <AnimatePresence>
                  {products.map((p) => (
                    <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.2 }}>
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between text-sm">
              <div className="text-gray-600">Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}</div>
              <div className="flex gap-2">
                <button className="btn" disabled={!pagination?.hasPrev} onClick={() => setFilter('page', (filters.page || 1) - 1)}>Previous</button>
                <button className="btn" disabled={!pagination?.hasNext} onClick={() => setFilter('page', (filters.page || 1) + 1)}>Next</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}


