import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import ConfirmModal from '../../components/ui/ConfirmModal'

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' })
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    api.get('/api/categories')
      .then(({ data }) => setCategories(Array.isArray(data) ? data : data?.categories || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const doDelete = async () => {
    try {
      const id = confirm.id
      await api.delete(`/api/categories/${id}`)
      toast.success('Category deleted')
      setConfirm({ open: false, id: null, name: '' })
      load()
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Delete failed')
      setConfirm({ open: false, id: null, name: '' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Categories</h2>
      </div>
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-3">
          <Link to="/admin/categories/new" className="btn-primary">Add New Category</Link>
          <input
            aria-label="Search categories"
            placeholder="Search categories..."
            className="border rounded-lg px-4 py-2 text-base w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table" role="table" aria-label="Categories table">
          <thead>
            <tr className="admin-thead">
              <th className="admin-th">Name</th>
              <th className="admin-th">Slug</th>
              <th className="admin-th">Products</th>
              <th className="admin-th">Created</th>
              <th className="admin-th" aria-hidden>Actions</th>
            </tr>
          </thead>
          <tbody className="admin-tbody-zebra">
            {loading ? (
              <tr><td colSpan="5" className="py-6 text-center">Loading...</td></tr>
            ) : categories
              .filter((c) => {
                const term = search.trim().toLowerCase()
                if (!term) return true
                return (
                  (c.name || '').toLowerCase().includes(term) ||
                  String(c.slug || '').toLowerCase().includes(term) ||
                  String(c.description || '').toLowerCase().includes(term)
                )
              })
              .map((c) => (
              <tr key={c.id} className="admin-tr admin-tr-clickable border-b border-gray-300" tabIndex={0}
                  onClick={() => navigate(`/admin/categories/${c.id}/view`)}
                  onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); navigate(`/admin/categories/${c.id}/view`) } }}>
                <td className="admin-td">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    {/* {c.description && (
                      <div className="text-sm text-gray-500 line-clamp-2">{c.description}</div>
                    )} */}
                  </div>
                </td>
                <td className="admin-td">
                  <code className="text-sm bg-gray-100 px-3 py-2 rounded">{String(c.slug || '')}</code>
                </td>
                <td className="admin-td">
                  <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                    (c._count?.products ?? c.productsCount ?? 0) > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {c._count?.products ?? c.productsCount ?? 0} products
                  </span>
                </td>
                <td className="admin-td text-base text-gray-600">
                  {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="admin-td space-x-3">
                  <button className="btn-secondary text-base px-4 py-1.5" onClick={(e)=>{ e.stopPropagation(); navigate(`/admin/categories/${c.id}`) }}>Edit</button>
                  <button className="btn-danger text-base px-4 py-1.5" onClick={(e)=>{ e.stopPropagation(); setConfirm({ open: true, id: c.id, name: c.name }) }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={confirm.open}
        title="Delete Category"
        description={`Are you sure you want to delete ${confirm.name}?`}
        confirmText="Delete"
        onCancel={() => setConfirm({ open: false, id: null, name: '' })}
        onConfirm={doDelete}
      />
    </div>
  )
}
