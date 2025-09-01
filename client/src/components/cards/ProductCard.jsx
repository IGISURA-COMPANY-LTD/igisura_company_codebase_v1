import { useNavigate } from 'react-router-dom'
import useCartStore from '../../stores/cart'
import { toast } from 'react-hot-toast'

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const to = `/product/${product.slug || product.id}`
  return (
    <div
      className="relative group rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-transparent overflow-hidden"
      role="article"
    >
      <button
        onClick={() => navigate(to)}
        className="block w-full text-left"
        aria-label={product.name}
      >
        {/* Smaller visual weight: keep square but leave room for text by using padding frame */}
        <div className="bg-gray-100 overflow-hidden">
          <div className="aspect-square max-h-52 mx-auto">
            {product.images?.[0] && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            )}
          </div>
        </div>
        <div className="p-4">
          <div className="font-semibold text-gray-900 truncate" title={product.name}>{product.name}</div>
          <div className="mt-1 text-sm text-gray-600 relative">
            <span
              style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {product.description || ''}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <a href={to} onClick={(e)=>{e.preventDefault(); navigate(to)}} className="text-xs text-brand-700 hover:underline">see more</a>
            <div className="text-brand-700 font-semibold">${Number(product.price).toFixed(2)}</div>
          </div>
        </div>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); addItem(product, 1); toast.success('Added to cart') }}
        className="w-full px-4 py-3 text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 active:from-brand-800 active:to-brand-800 transition-colors rounded-b-2xl font-medium"
      >
        Add to cart
      </button>
    </div>
  )
}


