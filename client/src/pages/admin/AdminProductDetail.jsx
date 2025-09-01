import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'

export default function AdminProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/api/products/${encodeURIComponent(id)}`)
      .then(({ data }) => setProduct(data))
      .catch((e) => toast.error(e?.response?.data?.error || 'Failed to load product'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="card p-4">Loading...</div>
  if (!product) return <div className="card p-4">Not found</div>

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <button className="btn mb-3" onClick={() => window.history.back()}>← Back</button>
        <div className="flex items-start gap-6">
          <div className="w-full max-w-sm">
            <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden">
              {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
            </div>
            {product.images?.length > 1 && (
              <div className="mt-2 grid grid-cols-5 gap-2">
                {product.images.slice(1).map((src, i) => (
                  <div key={src + i} className="aspect-square rounded bg-gray-100 overflow-hidden">
                    <img src={src} alt="thumb" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-semibold">{product.name}</h2>
              <button className="btn-primary" onClick={() => navigate(`/admin/products/${product.id}/edit`)}>Edit</button>
            </div>
            <div className="mt-2 text-brand-700 text-xl">${Number(product.price).toFixed(2)}</div>
            <div className="mt-2 text-sm">Category: <span className="font-medium">{product.category?.name || '-'}</span></div>
            <div className="mt-2 text-sm">Stock: <span className={product.stockQuantity <= 5 ? 'text-red-600 font-medium' : ''}>{product.stockQuantity ?? (product.inStock ? 'In stock' : 'Out')}</span></div>
            <div className="mt-4">
              <div className="font-medium">Description</div>
              <p className="text-gray-700 whitespace-pre-wrap mt-1">{product.description}</p>
            </div>
            {product.benefits && (
              <div className="mt-4">
                <div className="font-medium">Benefits</div>
                <p className="text-gray-700 whitespace-pre-wrap mt-1">{product.benefits}</p>
              </div>
            )}
            {product.instructions && (
              <div className="mt-4">
                <div className="font-medium">Instructions</div>
                <p className="text-gray-700 whitespace-pre-wrap mt-1">{product.instructions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
