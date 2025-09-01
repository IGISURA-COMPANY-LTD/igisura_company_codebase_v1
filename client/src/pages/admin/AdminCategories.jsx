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
      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2">Name</th>
              <th>Slug</th>
              <th>Products</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="py-6 text-center">Loading...</td></tr>
            ) : categories.map((c) => (
              <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-4">{c.name}</td>
                <td className="py-4">{String(c.slug || '')}</td>
                <td className="py-4">{c._count?.products ?? c.productsCount ?? '-'}</td>
                <td className="space-x-2">
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
