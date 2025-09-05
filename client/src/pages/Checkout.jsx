import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Layout from '../components/layout/Layout'
import FieldFloat from '../components/ui/FieldFloat'
import useCartStore from '../stores/cart'
import useAuthStore from '../stores/auth'
import api from '../lib/api'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, clear, total } = useCartStore()
  const { fetchProfile, user, isAuthenticated, hydrate } = useAuthStore()
  const [form, setForm] = useState({ phoneNumber: '', address: '', notes: '' })
  const [touched, setTouched] = useState({ phoneNumber: false, address: false })
  const isRwPhone = (v) => /^\+?2507[2389]\d{7}$/.test(String(v).trim())
  const knownDistricts = ['Kigali','Gasabo','Kicukiro','Nyarugenge','Rubavu','Musanze','Huye','Muhanga','Nyagatare','Gicumbi','Bugesera','Rwamagana','Kayonza','Ngoma','Kirehe','Gisagara','Nyanza','Ruhango','Kamonyi','Nyamagabe','Nyaruguru','Karongi','Rutsiro','Nyabihu','Ngororero','Gakenke','Burera']
  const isRwLocation = (v) => {
    const text = String(v || '').toLowerCase()
    return knownDistricts.some((d) => text.includes(d.toLowerCase()))
  }
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) hydrate()
  }, [])
  useEffect(() => { if (!user && isAuthenticated) fetchProfile() }, [isAuthenticated])
  useEffect(() => {
    if (items.length === 0) {
      toast('Your cart is empty.')
      navigate('/cart', { replace: true })
    }
  }, [items])

  const placeOrder = async (e) => {
    e.preventDefault()
    if (items.length === 0) return
    setTouched({ phoneNumber: true, address: true })
    if (!isRwPhone(form.phoneNumber) || !isRwLocation(form.address)) {
      toast.error('Please correct the highlighted fields')
      return
    }
    if (!isAuthenticated) {
      toast.error('Please login to place an order')
      navigate('/login')
      return
    }
    try {
      setPlacing(true)
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
    } finally {
      setPlacing(false)
    }
  }

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-8 grid md:grid-cols-2 gap-8">
        <div>
          <h1 className="text-2xl font-semibold">Checkout</h1>
          {user && (
            <div className="mt-2 text-sm text-gray-600">Ordering as <span className="font-medium">{user.name || user.email}</span> ({user.email})</div>
          )}
          <form className="mt-6 space-y-4" onSubmit={placeOrder}>
            <div className="grid grid-cols-2 gap-4">
              <FieldFloat id="name" label="Name" value={user?.name || ''} onChange={()=>{}} onBlur={()=>{}} className="opacity-70" />
              <FieldFloat id="email" label="Email" value={user?.email || ''} onChange={()=>{}} onBlur={()=>{}} className="opacity-70" />
            </div>
            <FieldFloat
              id="phone"
              label="Phone number"
              value={form.phoneNumber}
              onChange={(v) => setForm({ ...form, phoneNumber: v })}
              onBlur={() => setTouched((t) => ({ ...t, phoneNumber: true }))}
              invalid={touched.phoneNumber && !isRwPhone(form.phoneNumber)}
              errorId="phone-err"
              errorText={touched.phoneNumber && !isRwPhone(form.phoneNumber) ? 'Enter a valid Rwanda number (e.g. +2507XXXXXXXX)' : ''}
              required
            />
            <FieldFloat
              id="address"
              label="Address (District/Sector)"
              value={form.address}
              onChange={(v) => setForm({ ...form, address: v })}
              onBlur={() => setTouched((t) => ({ ...t, address: true }))}
              invalid={touched.address && !isRwLocation(form.address)}
              errorId="address-err"
              errorText={touched.address && !isRwLocation(form.address) ? 'Please include a known Rwandan district or sector' : ''}
              required
            />
            <div>
              <label className="block text-sm mb-1">Notes</label>
              <textarea className="w-full border rounded-lg px-3 py-2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button className="btn-primary" disabled={placing}>{placing ? 'Placing...' : 'Place Order'}</button>
          </form>
        </div>
        <div>
          <div className="card p-4">
            <h2 className="font-medium">Order Summary</h2>
            <div className="mt-3 space-y-2">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span>{product.name} × {quantity}</span>
                  <span>{(product.price * quantity).toFixed(2)} RWF</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between font-medium"><span>Subtotal</span><span>{total().toFixed(2)} RWF</span></div>
            <div className="mt-1 flex justify-between text-sm text-gray-600"><span>Estimated Shipping</span><span> 0.00 RWF</span></div>
            <div className="mt-2 flex justify-between font-semibold"><span>Estimated Total</span><span>{total().toFixed(2)} RWF</span></div>
          </div>
        </div>
      </div>
    </Layout>
  )
}


