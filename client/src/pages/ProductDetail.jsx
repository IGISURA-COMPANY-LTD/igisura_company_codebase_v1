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
  const [showFull, setShowFull] = useState(false)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {loading ? (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 flex items-center">
              <Skeleton className="w-full aspect-square rounded-2xl" />
            </div>
            <div className="lg:col-span-6 space-y-4">
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-7 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-11 w-40 mt-6" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-gray-800">{error}</h2>
            <p className="mt-2 text-gray-500">The product you are looking for does not exist.</p>
            <button className="btn-primary-lg mt-6" onClick={() => navigate('/products')}>
              Back to Products
            </button>
          </div>
        ) : product ? (
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left – square image */}
            <div className="lg:col-span-6 flex items-center justify-center">
              <div className="w-full max-w-md aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-md">
                <img
                  ref={mainImageRef}
                  src={images[currentImageIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right – details & thumbs */}
            <div className="lg:col-span-6 flex flex-col">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {product.name}
              </h1>

              <div className="mt-2 flex items-center space-x-2 text-sm">
                <span className="flex text-yellow-400">★★★★★</span>
                <span className="text-gray-500">(150 Reviews)</span>
                <span className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  | {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold text-gray-900">
                ${Number(product.price).toFixed(2)}
              </p>

              {/* collapsible text */}
              <div className="mt-4 text-gray-600 leading-relaxed">
                <p
                  className={`whitespace-pre-line ${showFull ? '' : 'line-clamp-3'}`}
                  style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                >
                  {product.description}
                </p>
                {(product.description?.length ?? 0) > 120 && (
                  <button
                    className="text-brand-600 font-medium text-sm mt-1"
                    onClick={() => setShowFull(!showFull)}
                  >
                    {showFull ? 'Read less' : 'Read more'}
                  </button>
                )}
              </div>

              {/* Benefits & Instructions – horizontal on md+, stacked on mobile */}
              <div className="mt-6 grid md:grid-cols-2 gap-x-6 gap-y-4">
                {product.benefits && (
                  <TextClampBox title="Benefits" raw={product.benefits} />
                )}
                {product.instructions && (
                  <TextClampBox title="Instructions" raw={product.instructions} />
                )}
              </div>

              {/* Vertical thumbnail rail */}
                {images.length > 1 && (
                  <div className="mt-6">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {images.map((src, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIdx(idx)}
                          className={`shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition
                            ${idx === currentImageIdx
                              ? 'border-brand-600 shadow'
                              : 'border-transparent hover:border-brand-400'}`}
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              {/* Quantity + Add to Cart */}
              <div className="mt-auto pt-6 flex items-center space-x-4">
                <div className="qty-picker">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                  <input value={quantity} readOnly />
                  <button onClick={() => setQuantity(q => Math.min(99, q + 1))}>+</button>
                </div>
                <button
                  className="btn-primary-lg"
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

function TextClampBox({ title, raw }) {
  const [open, setOpen] = useState(false)
  const limit = 120 // chars
  const needToggle = raw.length > limit
  const preview = needToggle ? raw.slice(0, limit).trim() + '…' : raw

  return (
    <div
      className={`bg-gray-50 rounded-xl p-4 flex flex-col
        md:h-40 md:max-h-40 overflow-hidden`}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-1 shrink-0">{title}</h3>
      <div
        className={`flex-1 text-gray-600 whitespace-pre-line overflow-y-auto
          ${!open && needToggle ? 'line-clamp-3' : ''}`}
      >
        {open ? raw : preview}
      </div>
      {needToggle && (
        <button
          onClick={() => setOpen(!open)}
          className="text-sm text-brand-600 font-medium mt-1 self-start hover:underline"
        >
          {open ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  )
}