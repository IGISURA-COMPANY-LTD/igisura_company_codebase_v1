import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'

export default function AdminProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const [showFull, setShowFull] = useState(false)
  const mainImageRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    api.get(`/api/products/${encodeURIComponent(id)}`)
      .then(({ data }) => { setProduct(data); setCurrentImageIdx(0) })
      .catch((e) => toast.error(e?.response?.data?.error || 'Failed to load product'))
      .finally(() => setLoading(false))
  }, [id])

  const images = useMemo(() => product?.images || [], [product])

  if (loading) return <div className="card p-4">Loading...</div>
  if (!product) return <div className="card p-4">Not found</div>

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <button className="btn mb-4" onClick={() => window.history.back()}>← Back</button>
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left – main image */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="w-full max-w-md aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-md">
              {images[currentImageIdx] && (
                <img
                  ref={mainImageRef}
                  src={images[currentImageIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {/* Thumbnails (below on mobile) */}
          </div>

          {/* Right – details */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{product.name}</h1>
              <button className="btn-primary" onClick={() => navigate(`/admin/products/${product.id}/edit`)}>Edit</button>
            </div>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
              <span className="text-gray-600">Category: <span className="font-medium">{product.category?.name || '-'}</span></span>
              <span className="text-gray-500">SKU: <span className="font-mono">{product.slug}</span></span>
            </div>
            <div className="mt-3 text-3xl font-bold text-gray-900">{Number(product.price).toFixed(2)} RWF</div>

            {/* Description with clamp */}
            <div className="mt-4 text-gray-600 leading-relaxed">
              <p className={`whitespace-pre-line ${showFull ? '' : 'line-clamp-3'}`} style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {product.description}
              </p>
              {(product.description?.length ?? 0) > 120 && (
                <button className="text-brand-600 font-medium text-sm mt-1" onClick={() => setShowFull(!showFull)}>
                  {showFull ? 'Read less' : 'Read more'}
                </button>
              )}
            </div>

            {/* Benefits & Instructions boxes */}
            <div className="mt-6 grid md:grid-cols-2 gap-x-6 gap-y-4">
              {product.benefits && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Benefits</h3>
                  <div className="text-gray-700 whitespace-pre-line">{product.benefits}</div>
                </div>
              )}
              {product.instructions && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Instructions</h3>
                  <div className="text-gray-700 whitespace-pre-line">{product.instructions}</div>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-6">
                <div className="flex space-x-2 overflow-x-auto pb-2">
                  {images.map((src, idx) => (
                    <button
                      key={src + idx}
                      onClick={() => setCurrentImageIdx(idx)}
                      className={`shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition ${idx === currentImageIdx ? 'border-brand-600 shadow' : 'border-transparent hover:border-brand-400'}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
