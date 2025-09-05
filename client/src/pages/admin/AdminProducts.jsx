import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import ConfirmModal from '../../components/ui/ConfirmModal'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '' })
  const [pagination, setPagination] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' })
  const navigate = useNavigate()
  useEffect(() => {
    setLoading(true)
    api.get('/api/products', { params: { page: filters.page, limit: filters.limit, search: filters.search || undefined } })
      .then(({ data }) => { setProducts(data.products || []); setPagination(data.pagination || null) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filters.page, filters.limit, filters.search])

  const doDelete = async () => {
    try {
      const id = confirm.id
      await api.delete(`/api/products/${id}`)
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast.success('Product deleted')
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Delete failed')
    } finally {
      setConfirm({ open: false, id: null, name: '' })
    }
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Products</h2>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div />
        <div className="flex items-center gap-3">
          <Link to="/admin/products/new" className="btn-primary">Add New Product</Link>
          <input aria-label="Search products" placeholder="Search products..." className="border rounded-lg px-4 py-2 text-base w-64" value={filters.search} onChange={(e)=> setFilters({ ...filters, page: 1, search: e.target.value })} />
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table" role="table" aria-label="Products table">
          <thead>
            <tr className="admin-thead">
              <th className="admin-th">Image</th>
              <th className="admin-th">Name</th>
              <th className="admin-th">Price</th>
              <th className="admin-th">Stock</th>
              <th className="admin-th">Category</th>
              <th className="admin-th">Status</th>
              <th className="admin-th" aria-hidden>Actions</th>
            </tr>
          </thead>
          <tbody className="admin-tbody-zebra">
            {loading ? (
              <tr><td colSpan="7" className="py-4 text-center">Loading...</td></tr>
            ) : products.map((p) => (
              <tr
                key={p.id}
                className="admin-tr admin-tr-clickable align-middle"
                tabIndex={0}
                onClick={() => navigate(`/admin/products/${p.id}`)}
                onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); navigate(`/admin/products/${p.id}`) } }}
              >
                <td className="admin-td">
                  <div className="size-10 rounded bg-gray-100 overflow-hidden">
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                </td>
                <td className="admin-td">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    {/* <div className="text-sm text-gray-500">{p.slug}</div> */}
                  </div>
                </td>
                <td className="admin-td font-semibold text-brand-700 text-lg">{Number(p.price).toFixed(2)} RWF</td>
                <td className={`admin-td text-base ${p.stockQuantity <= 5 ? 'text-red-600 font-medium' : ''}`}>
                  {p.stockQuantity ?? (p.inStock ? 'In stock' : 'Out')}
                </td>
                <td className="admin-td text-base">{p.category?.name || '-'}</td>
                <td className="admin-td">
                  <div className="flex flex-col gap-2">
                    {/* {p.featured && (
                      <span className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )} */}
                    <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                      p.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </td>
                <td className="admin-td space-x-3">
                  <button className="btn-secondary text-base px-4 py-2" onClick={(e) => { e.stopPropagation(); navigate(`/admin/products/${p.id}/edit`) }}>✏️ Edit</button>
                  <button className="btn-danger text-base px-4 py-2" onClick={(e) => { e.stopPropagation(); setConfirm({ open: true, id: p.id, name: p.name }) }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-pagination" role="navigation" aria-label="Products pagination">
        <div>Page {pagination?.currentPage || filters.page} of {pagination?.totalPages || '-'}</div>
        <div className="pager">
          <button className="btn" disabled={!pagination?.hasPrev} onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}>Previous</button>
          <button className="btn" disabled={!pagination?.hasNext} onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}>Next</button>
        </div>
      </div>

      <ConfirmModal
        open={confirm.open}
        title="Delete Product"
        description={`Are you sure you want to delete ${confirm.name}?`}
        confirmText="Delete"
        onCancel={() => setConfirm({ open: false, id: null, name: '' })}
        onConfirm={doDelete}
      />
    </div>
  )
}


