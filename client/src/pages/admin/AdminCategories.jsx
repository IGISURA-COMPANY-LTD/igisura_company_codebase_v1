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
        <h2 className="text-xl font-semibold">Categories</h2>
        <Link to="/admin/categories/new" className="btn-primary">Add New Category</Link>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table" role="table" aria-label="Categories table">
          <thead>
            <tr className="admin-thead">
              <th className="admin-th">Name</th>
              <th className="admin-th">Slug</th>
              <th className="admin-th">Products</th>
              <th className="admin-th" aria-hidden>Actions</th>
            </tr>
          </thead>
          <tbody className="admin-tbody-zebra">
            {loading ? (
              <tr><td colSpan="4" className="py-6 text-center">Loading...</td></tr>
            ) : categories.map((c) => (
              <tr key={c.id} className="admin-tr admin-tr-clickable" tabIndex={0}
                  onClick={() => navigate(`/admin/categories/${c.id}/view`)}
                  onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); navigate(`/admin/categories/${c.id}/view`) } }}>
                <td className="admin-td">{c.name}</td>
                <td className="admin-td">{String(c.slug || '')}</td>
                <td className="admin-td">{c._count?.products ?? c.productsCount ?? '-'}</td>
                <td className="admin-td space-x-2">
                  <button className="btn" onClick={() => navigate(`/admin/categories/${c.id}`)}>Edit</button>
                  <button className="btn" onClick={() => navigate(`/admin/categories/${c.id}/view`)}>View</button>
                  <a className="btn" href={`/products?category=${encodeURIComponent(String(c.slug || c.id))}`} target="_blank" rel="noreferrer">View Products</a>
                  <button className="btn" onClick={() => setConfirm({ open: true, id: c.id, name: c.name })}>Delete</button>
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
