import Layout from '../components/layout/Layout'
import useProductsStore from '../stores/products'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ProductCard from '../components/cards/ProductCard'
import api from '../lib/api'
import 'rc-slider/assets/index.css'
import Slider from 'rc-slider'

export default function Products() {
  /* ── 100 % ORIGINAL LOGIC ───────────────────────────────────────── */
  const { products, pagination, filters, setFilter, setFilters, fetchProducts, loading } =
    useProductsStore()
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

  useEffect(() => {
    api.get('/api/categories')
      .then(({ data }) => setCategories(Array.isArray(data) ? data : data?.categories || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchProducts().finally(() => {
      gridRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    })
  }, [filters])

  const applyFilters = () => setFilters({ ...draft, page: 1 })
  const clearAll = () => {
    const reset = { search:'',category:'',minPrice:'',maxPrice:'',inStock:false,sortBy:'createdAt',sortOrder:'desc' }
    setDraft(reset)
    setFilters({ ...reset, page: 1 })
  }

  const minAllowed = 0
  const maxAllowed = 100000
  const minVal = Number(draft.minPrice || 0)
  const maxVal = Number(draft.maxPrice || maxAllowed)
  /* ───────────────────────────────────────────────────────────────── */

  /* ── STYLING ONLY BELOW ──────────────────────────────────────────── */
  return (
    <Layout>
      <main className="bg-slate-50 min-h-screen">
        <div className="max-w-screen-2xl mx-auto px-10 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Header */}
          <div className="mb-8 pl-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Shop
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {pagination?.totalCount || products.length} products ready to ship
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* ── DESKTOP FILTER SIDEBAR ─────────────────────────────── */}
            <aside className="hidden lg:block ">
              <form
                onSubmit={(e) => { e.preventDefault(); applyFilters() }}
                className="sticky top-24 space-y-6 rounded-2xl border border-gray-200 shadow-xs shadow-brand-300"
              >
                <FilterCard title="Filters">
                  <Input
                    placeholder="Search products..."
                    value={draft.search}
                    onChange={(e) => setDraft({ ...draft, search: e.target.value })}
                  />

                  <Select
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  >
                    <option value="">All categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>

                  <div>
                    <Label>Price range</Label>
                    <Slider
                      range
                      min={minAllowed}
                      max={maxAllowed}
                      value={[minVal, maxVal]}
                      onChange={(v) => {
                        const [min, max] = Array.isArray(v) ? v : [minVal, maxVal]
                        setDraft({ ...draft, minPrice: min, maxPrice: max })
                      }}
                      styles={{
                        track: { background: '#e2e8f0', height: 4 },
                        rail: { background: '#e2e8f0', height: 4 },
                        handle: {
                          borderColor: '#169361',
                          background: '#fff',
                          opacity: 1,
                          width: 16,
                          height: 16,
                          marginTop: -6,
                        },
                        dot: { display: 'none' },
                      }}
                    />
                    <div className="flex items-center gap-2 mt-3">
                      <PriceInput
                        value={draft.minPrice}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0)
                          const next = Math.min(Math.max(v, minAllowed), maxVal - 1)
                          setDraft({ ...draft, minPrice: next })
                        }}
                      />
                      <span className="text-slate-400">—</span>
                      <PriceInput
                        value={draft.maxPrice}
                        onChange={(e) => {
                          const v = Number(e.target.value || maxAllowed)
                          const next = Math.max(Math.min(v, maxAllowed), minVal + 1)
                          setDraft({ ...draft, maxPrice: next })
                        }}
                      />
                    </div>
                  </div>

                  <Checkbox
                    id="instock"
                    checked={draft.inStock}
                    onChange={(e) => setDraft({ ...draft, inStock: e.target.checked })}
                  >
                    In stock only
                  </Checkbox>
                </FilterCard>

                <FilterCard>
                  <Label>Sort</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={draft.sortBy}
                      onChange={(e) => setDraft({ ...draft, sortBy: e.target.value })}
                    >
                      <option value="createdAt">Newest</option>
                      <option value="price">Price</option>
                      <option value="name">Name</option>
                      <option value="rating">Rating</option>
                    </Select>

                    <Select
                      value={draft.sortOrder}
                      onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })}
                    >
                      <option value="desc">Desc</option>
                      <option value="asc">Asc</option>
                    </Select>
                  </div>
                </FilterCard>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary"
                  >
                    {loading ? 'Applying…' : 'Apply'}
                  </button>
                  <button type="button" onClick={clearAll} className="btn">
                    Clear
                  </button>
                </div>
              </form>
            </aside>

            {/* ── PRODUCT GRID ────────────────────────────────────────── */}
            <section ref={gridRef} className="lg:col-span-3 pl-8">
              {/* Active filter chips */}
              <div className="mb-4 flex flex-wrap gap-2 text-xs">
                {filters.search && <Chip>Search: {filters.search}</Chip>}
                {filters.category && <Chip>Category: {filters.category}</Chip>}
                {(filters.minPrice || filters.maxPrice) && (
                  <Chip>
                    ${filters.minPrice || 0} – ${filters.maxPrice || '∞'}
                  </Chip>
                )}
                {filters.inStock && <Chip>In stock</Chip>}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {loading ? (
                  Array.from({ length: pagination?.limit || 12 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                ) : (
                  <AnimatePresence>
                    {products.map((p) => (
                      <motion.div
                        key={p.id}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ProductCard product={p} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Pagination */}
              <div className="mt-10 flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
                </span>
                <div className="flex gap-2">
                  <button
                    className="btn"
                    disabled={!pagination?.hasPrev}
                    onClick={() => setFilter('page', (filters.page || 1) - 1)}
                  >
                    Prev
                  </button>
                  <button
                    className="btn"
                    disabled={!pagination?.hasNext}
                    onClick={() => setFilter('page', (filters.page || 1) + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ── MOBILE FILTER SHEET ──────────────────────────────────── */}
        {draft._mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDraft({ ...draft, _mobileOpen: false })}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Filters</h2>
                <button
                  onClick={() => setDraft({ ...draft, _mobileOpen: false })}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Search products..."
                  value={draft.search}
                  onChange={(e) => setDraft({ ...draft, search: e.target.value })}
                />

                <Select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                >
                  <option value="">All categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug || c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>

                <div>
                  <Label>Price range</Label>
                  <Slider
                    range
                    min={minAllowed}
                    max={maxAllowed}
                    value={[minVal, maxVal]}
                    onChange={(v) => {
                      const [min, max] = Array.isArray(v) ? v : [minVal, maxVal]
                      setDraft({ ...draft, minPrice: min, maxPrice: max })
                    }}
                    styles={{
                      track: { background: '#e2e8f0', height: 4 },
                      rail: { background: '#e2e8f0', height: 4 },
                      handle: { borderColor: '#169361', background: '#fff', width: 16, height: 16 },
                    }}
                  />
                  <div className="flex items-center gap-2 mt-3">
                    <PriceInput
                      value={draft.minPrice}
                      onChange={(e) =>
                        setDraft({ ...draft, minPrice: Number(e.target.value || 0) })
                      }
                    />
                    <span className="text-slate-400">—</span>
                    <PriceInput
                      value={draft.maxPrice}
                      onChange={(e) =>
                        setDraft({ ...draft, maxPrice: Number(e.target.value || maxAllowed) })
                      }
                    />
                  </div>
                </div>

                <Checkbox
                  checked={draft.inStock}
                  onChange={(e) => setDraft({ ...draft, inStock: e.target.checked })}
                >
                  In stock only
                </Checkbox>

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={draft.sortBy}
                    onChange={(e) => setDraft({ ...draft, sortBy: e.target.value })}
                  >
                    <option value="createdAt">Newest</option>
                    <option value="price">Price</option>
                    <option value="name">Name</option>
                    <option value="rating">Rating</option>
                  </Select>

                  <Select
                    value={draft.sortOrder}
                    onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })}
                  >
                    <option value="desc">Desc</option>
                    <option value="asc">Asc</option>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    className="flex-1 btn-primary"
                    onClick={() => {
                      applyFilters()
                      setDraft({ ...draft, _mobileOpen: false })
                    }}
                    disabled={loading}
                  >
                    {loading ? 'Applying…' : 'Apply'}
                  </button>
                  <button type="button" onClick={clearAll} className="btn">
                    Clear
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* FAB to open mobile filters */}
        <button
          className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-5 py-3 bg-white/80 backdrop-blur shadow-xl rounded-full text-sm font-medium"
          onClick={() => setDraft({ ...draft, _mobileOpen: true })}
        >
          Filters
        </button>
      </main>
    </Layout>
  )
}

/* ── ATOMIC COMPONENTS (only for styling) ────────────────────────── */
const FilterCard = ({ title, children }) => (
  <div className="bg-white/60 backdrop-blur-md border border-slate-200/50 rounded-2xl p-4 space-y-4 shadow-sm">
    {title && <h3 className="font-semibold text-sm text-slate-700">{title}</h3>}
    {children}
  </div>
)

const Label = ({ children }) => (
  <label className="block text-sm font-medium text-slate-700 mb-1">{children}</label>
)

const Input = (props) => (
  <input
    {...props}
    className="w-full border border-slate-300/70 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/80"
  />
)

const PriceInput = (props) => (
  <input
    {...props}
    className="w-full text-center border border-slate-300/70 rounded-lg px-2 py-1.5 text-sm"
  />
)

const Select = ({ children, ...props }) => (
  <select
    {...props}
    className="w-full border border-slate-300/70 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/80"
  >
    {children}
  </select>
)

const Checkbox = ({ children, ...props }) => (
  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
    <input type="checkbox" {...props} className="rounded text-brand-600 focus:ring-brand-500" />
    {children}
  </label>
)

const Chip = ({ children }) => (
  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
    {children}
  </span>
)

const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-3 animate-pulse">
    <div className="aspect-square bg-slate-200 rounded-xl" />
    <div className="h-4 w-3/4 bg-slate-200 rounded mt-3" />
    <div className="h-4 w-1/2 bg-slate-200 rounded mt-2" />
  </div>
)