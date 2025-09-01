import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import ConfirmModal from '../../components/ui/ConfirmModal'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' })
  const navigate = useNavigate()
  useEffect(() => {
    api.get('/api/products', { params: { limit: 100 } })
      .then(({ data }) => setProducts(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <Link to="/admin/products/new" className="btn-primary">Add New Product</Link>
      </div>
      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2">Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-gray-50">
            {loading ? (
              <tr><td colSpan="7" className="py-6 text-center">Loading...</td></tr>
            ) : products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-gray-200 align-middle hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/admin/products/${p.id}`)}
              >
                <td className="py-2">
                  <div className="size-14 rounded bg-gray-100 overflow-hidden">
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                </td>
                <td className="py-4">{p.name}</td>
                <td className="py-4">${Number(p.price).toFixed(2)}</td>
                <td className={p.stockQuantity <= 5 ? 'text-red-600 font-medium' : ''}>{p.stockQuantity ?? (p.inStock ? 'In stock' : 'Out')}</td>
                <td>{p.category?.name || '-'}</td>
                <td>{p.featured ? 'Yes' : 'No'}</td>
                <td className="space-x-2">
                  <button className="btn" onClick={(e) => { e.stopPropagation(); navigate(`/admin/products/${p.id}`) }}>View</button>
                  <button className="btn" onClick={(e) => { e.stopPropagation(); navigate(`/admin/products/${p.id}/edit`) }}>✏️ Edit</button>
                  <button className="btn" onClick={(e) => { e.stopPropagation(); setConfirm({ open: true, id: p.id, name: p.name }) }}>🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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


