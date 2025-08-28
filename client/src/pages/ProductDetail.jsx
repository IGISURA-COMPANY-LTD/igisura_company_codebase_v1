import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Layout from '../components/layout/Layout'
import api from '../lib/api'
import useCartStore from '../stores/cart'

export default function ProductDetail() {
  const { idOrSlug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    api
      .get(`/api/products/${idOrSlug}`)
      .then(({ data }) => {
        if (mounted) setProduct(data)
      })
      .catch(() => toast.error('Failed to load product'))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [idOrSlug])

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="skeleton h-80 rounded-2xl" />
            <div className="space-y-3">
              <div className="skeleton h-8 w-1/2 rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton h-4 w-1/3 rounded" />
            </div>
          </div>
        ) : product ? (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" loading="lazy" />}
            </div>
            <div>
              <h1 className="text-3xl font-semibold">{product.name}</h1>
              <div className="mt-2 text-brand-700 text-xl">${Number(product.price).toFixed(2)}</div>
              <p className="mt-4 text-gray-600">{product.description}</p>
              <button className="btn-primary mt-6" onClick={() => { addItem(product, 1); toast.success('Added to cart') }}>Add to Cart</button>
            </div>
          </div>
        ) : (
          <div>Not found</div>
        )}
      </div>
    </Layout>
  )
}


