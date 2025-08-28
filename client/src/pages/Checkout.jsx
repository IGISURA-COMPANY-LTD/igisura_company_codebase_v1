import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Layout from '../components/layout/Layout'
import useCartStore from '../stores/cart'
import useAuthStore from '../stores/auth'
import api from '../lib/api'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, clear, total } = useCartStore()
  const { fetchProfile, user } = useAuthStore()
  const [form, setForm] = useState({ phoneNumber: '', address: '', notes: '' })

  useEffect(() => { if (!user) fetchProfile() }, [])

  const placeOrder = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        items: items.map(({ product, quantity }) => ({ productId: product.id, quantity, price: product.price })),
        phoneNumber: form.phoneNumber,
        address: form.address,
        notes: form.notes,
      }
      await api.post('/api/orders', payload)
      clear()
      toast.success('Order placed! We will contact you for payment and delivery.')
      navigate('/profile')
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to place order')
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-8 grid md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-2xl font-semibold">Checkout</h1>
          <form className="mt-6 space-y-4" onSubmit={placeOrder}>
            <div>
              <label className="block text-sm mb-1">Phone number</label>
              <input className="w-full border rounded-lg px-3 py-2" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Address</label>
              <input className="w-full border rounded-lg px-3 py-2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Notes</label>
              <textarea className="w-full border rounded-lg px-3 py-2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button className="btn-primary">Place Order</button>
          </form>
        </div>
        <div>
          <div className="card p-4">
            <h2 className="font-medium">Order Summary</h2>
            <div className="mt-3 space-y-2">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span>{product.name} × {quantity}</span>
                  <span>${(product.price * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between font-medium"><span>Total</span><span>${total().toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </Layout>
  )
}


