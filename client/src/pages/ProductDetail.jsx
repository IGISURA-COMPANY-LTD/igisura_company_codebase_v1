import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Layout from '../components/layout/Layout'
import api from '../lib/api'
import useCartStore from '../stores/cart'
import Skeleton from '../components/ui/Skeleton'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const addItem = useCartStore((s) => s.addItem)
  const mainImageRef = useRef(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    api
      .get(`/api/products/${slug}`)
      .then(({ data }) => {
        if (!mounted) return
        setProduct(data)
        setCurrentImageIdx(0)
      })
      .catch((err) => {
        if (!mounted) return
        const status = err?.response?.status
        if (status === 404) {
          setError('Product not found')
        } else {
          setError('Failed to load product')
        }
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [slug])

  const images = useMemo(() => product?.images || [], [product])

  const handleAddToCart = () => {
    if (!product) return
    const qty = Math.max(1, Math.min(99, Number(quantity) || 1))
    addItem(product, qty)
    toast.success('Added to cart')
    triggerFlyToCart()
  }

  const triggerFlyToCart = () => {
    const imgEl = mainImageRef.current
    const cartEl = document.getElementById('nav-cart-link')
    if (!imgEl || !cartEl) return
    const rect = imgEl.getBoundingClientRect()
    const cartRect = cartEl.getBoundingClientRect()
    const ghost = document.createElement('img')
    ghost.src = images[currentImageIdx] || product?.images?.[0] || ''
    ghost.alt = product?.name || 'product image'
    ghost.style.position = 'fixed'
    ghost.style.left = rect.left + 'px'
    ghost.style.top = rect.top + 'px'
    ghost.style.width = rect.width + 'px'
    ghost.style.height = rect.height + 'px'
    ghost.style.objectFit = 'cover'
    ghost.style.borderRadius = '12px'
    ghost.style.zIndex = '1000'
    ghost.style.transition = 'transform 500ms ease, opacity 500ms ease, width 500ms ease, height 500ms ease'
    document.body.appendChild(ghost)
    const translateX = cartRect.left - rect.left
    const translateY = cartRect.top - rect.top
    requestAnimationFrame(() => {
      ghost.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.1)`
      ghost.style.opacity = '0.2'
      ghost.style.width = rect.width * 0.2 + 'px'
      ghost.style.height = rect.height * 0.2 + 'px'
    })
    setTimeout(() => {
      document.body.removeChild(ghost)
    }, 550)
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96 rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-36" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-2">{error}</h2>
            <p className="text-gray-600">The product you are looking for does not exist.</p>
            <button className="btn mt-6" onClick={() => navigate('/products')}>Back to Products</button>
          </div>
        ) : product ? (
          <div className="grid md:grid-cols-2 gap-8 md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1">
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                {images[currentImageIdx] && (
                  <img
                    ref={mainImageRef}
                    src={images[currentImageIdx]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                )}
              </div>
              {images.length > 1 && (
                <div className="mt-3 flex gap-3 overflow-x-auto">
                  {images.map((src, idx) => (
                    <button
                      key={src + idx}
                      onClick={() => setCurrentImageIdx(idx)}
                      className={`shrink-0 size-20 rounded-lg overflow-hidden border ${idx === currentImageIdx ? 'border-brand-600' : 'border-transparent'}`}
                      aria-label={`Show image ${idx + 1}`}
                    >
                      <img src={src} alt="thumb" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-semibold">{product.name}</h1>
              <div className="mt-2 text-brand-700 text-2xl">${Number(product.price).toFixed(2)}</div>
              <div className="mt-3 text-sm">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <p className="mt-5 text-gray-600 italic leading-relaxed">{product.description}</p>

              {product.benefits && (
                <div className="mt-6">
                  <h3 className="font-medium">Benefits</h3>
                  <p className="text-gray-600 italic mt-1 whitespace-pre-line">{product.benefits}</p>
                </div>
              )}
              {product.instructions && (
                <div className="mt-4">
                  <h3 className="font-medium">Instructions</h3>
                  <p className="text-gray-600 italic mt-1 whitespace-pre-line">{product.instructions}</p>
                </div>
              )}

              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center rounded-lg border px-2">
                  <button className="px-3 py-2" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">-</button>
                  <input
                    type="number"
                    className="w-14 text-center py-2 outline-none"
                    min={1}
                    max={99}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(99, Number(e.target.value) || 1)))}
                  />
                  <button className="px-3 py-2" onClick={() => setQuantity((q) => Math.min(99, q + 1))} aria-label="Increase quantity">+</button>
                </div>
                <button
                  className="btn-primary"
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  )
}


