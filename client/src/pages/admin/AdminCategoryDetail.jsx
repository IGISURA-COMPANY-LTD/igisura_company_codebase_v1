import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'

export default function AdminCategoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    // Load category
    const load = async () => {
      try {
        const { data } = await api.get(`/api/categories/${encodeURIComponent(id)}`)
        setCategory(data)
        // Try to fetch products via category endpoint if available, else filter client-side
        const catKey = data.slug || data.id
        const res = await api.get('/api/products', { params: { category: catKey, limit: 100 } })
        setProducts(res.data?.products || [])
      } catch (e) {
        toast.error(e?.response?.data?.error || 'Failed to load category')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <div className="card p-4">Loading...</div>
  if (!category) return <div className="card p-4">Category not found</div>

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <button className="btn mb-3" onClick={() => window.history.back()}>← Back</button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{category.name}</h2>
            {category.description ? <p className="text-gray-600 mt-1">{category.description}</p> : null}
          </div>
          <button className="btn" onClick={() => navigate(`/admin/categories/${category.id}`)}>Edit Category</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <div key={p.id} className="card p-3 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/products/${p.id}`)}>
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
            </div>
            <div className="mt-2 font-medium truncate">{p.name}</div>
            <div className="text-sm text-gray-600">{Number(p.price).toFixed(2)} RWF</div>
          </div>
        ))}
        {products.length === 0 && <div className="text-gray-600 col-span-full">No products found for this category.</div>}
      </div>
    </div>
  )
}
