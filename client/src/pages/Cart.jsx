import Layout from '../components/layout/Layout'
import useCartStore from '../stores/cart'
import { Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function Cart() {
  const { items, removeItem, updateQuantity, increment, decrement, total } = useCartStore()
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Your Cart</h1>
        {items.length === 0 ? (
          <p className="mt-4 text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => {
                const maxStock = typeof product.stockQuantity === 'number' ? Math.max(0, product.stockQuantity) : 99
                const outOfStock = maxStock === 0 || !product.inStock
                return (
                <div key={product.id} className="card p-4 flex gap-4 items-center">
                  <div className="size-20 rounded-lg overflow-hidden bg-gray-100">
                    {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">${Number(product.price).toFixed(2)}</div>
                    <div className="text-xs mt-1 text-gray-500">{outOfStock ? 'Out of stock' : `In stock: ${maxStock}`}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2 py-1 rounded border" onClick={() => decrement(product.id)} aria-label="Decrease">-</button>
                    <input
                      type="number"
                      min="1"
                      max={maxStock || 99}
                      value={quantity}
                      onChange={(e) => updateQuantity(product.id, Number(e.target.value))}
                      className="w-20 border rounded-lg px-2 py-1 text-center"
                    />
                    <button className="px-2 py-1 rounded border" onClick={() => increment(product.id)} aria-label="Increase">+</button>
                  </div>
                  <button className="btn" onClick={() => removeItem(product.id)}>Remove</button>
                </div>
              )})}
            </div>
            <div className="card p-4">
              <div className="flex justify-between font-medium"><span>Subtotal</span><span>${total().toFixed(2)}</span></div>
              <Link
                to="/checkout"
                onClick={(e) => { if (items.length === 0) { e.preventDefault(); toast('Your cart is empty.') } }}
                className="btn-primary w-full mt-4 text-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}


