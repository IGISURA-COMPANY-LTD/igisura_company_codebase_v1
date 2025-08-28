import Layout from '../components/layout/Layout'
import useCartStore from '../stores/cart'
import { Link } from 'react-router-dom'

export default function Cart() {
  const { items, removeItem, updateQuantity, total } = useCartStore()
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Your Cart</h1>
        {items.length === 0 ? (
          <p className="mt-4 text-gray-600">Your cart is empty.</p>
        ) : (
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="card p-4 flex gap-4 items-center">
                  <div className="size-20 rounded-lg overflow-hidden bg-gray-100">
                    {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">${Number(product.price).toFixed(2)}</div>
                  </div>
                  <input type="number" min="1" value={quantity} onChange={(e) => updateQuantity(product.id, Number(e.target.value))} className="w-20 border rounded-lg px-2 py-1" />
                  <button className="btn" onClick={() => removeItem(product.id)}>Remove</button>
                </div>
              ))}
            </div>
            <div className="card p-4">
              <div className="flex justify-between font-medium"><span>Subtotal</span><span>${total().toFixed(2)}</span></div>
              <Link to="/checkout" className="btn-primary w-full mt-4 text-center">Proceed to Checkout</Link>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}


