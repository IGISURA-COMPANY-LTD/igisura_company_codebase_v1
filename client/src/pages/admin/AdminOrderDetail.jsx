import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'

export default function AdminOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const load = () => {
    setLoading(true)
    api.get(`/api/orders/${encodeURIComponent(id)}`)
      .then(({ data }) => setOrder(data))
      .catch((e) => {
        const msg = e?.response?.data?.error || e?.message || 'Failed to load order'
        console.log(msg)
        // toast.error(msg)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const updateStatus = async (status) => {
    try {
      setUpdating(true)
      await api.patch(`/api/orders/${id}/status`, { status })
      toast.success('Status updated')
      load()
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="card p-4">Loading...</div>
  if (!order) return <div className="card p-4">Could not load order. Please check the URL and try again.</div>

  const total = Array.isArray(order.items) ? order.items.reduce((s, i) => s + Number(i.price) * Number(i.quantity), 0) : 0

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <button className="btn mb-3" onClick={() => window.history.back()}>← Back</button>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Order #{order.id}</h2>
          <div className="text-sm">{new Date(order.createdAt).toLocaleString()}</div>
        </div>
        <div className="mt-3 grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium">Buyer</div>
            <div>{order.user?.name || order.customerName || order.user?.email}</div>
            <div className="text-gray-600">{order.user?.email || order.email}</div>
          </div>
          <div>
            <div className="font-medium">Phone</div>
            <div>
              {order.phoneNumber}
              {order.phoneNumber ? (
                <a className="ml-2 text-brand-700 underline" href={`tel:${order.phoneNumber}`}>Contact</a>
              ) : null}
            </div>
            <div className="text-gray-600">Address</div>
            <div className="text-gray-700">{order.address}</div>
          </div>
          <div>
            <div className="font-medium">Notes</div>
            <div className="text-gray-700 whitespace-pre-wrap">{order.notes || '-'}</div>
          </div>
        </div>
      </div>

      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2">Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-gray-50">
            {order.items?.map((i) => (
              <tr key={i.productId} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-4">{i.product?.name || i.productId}</td>
                <td className="py-4">${Number(i.price).toFixed(2)}</td>
                <td className="py-4">{i.quantity}</td>
                <td className="py-4">${(i.price * i.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex justify-end text-sm"><span className="font-medium">Total:&nbsp;</span>${total.toFixed(2)}</div>
      </div>

      <div className="card p-4 flex items-center justify-between">
        <div className="text-sm">Current status: <span className="font-medium">{order.status}</span></div>
        <div className="flex items-center gap-2">
          <select
            className="border rounded px-3 py-2"
            defaultValue={order.status}
            onChange={(e) => {
              const next = e.target.value
              const ok = window.confirm(`Are you sure you want to change order #${order.id} to '${next}'?`)
              if (ok) updateStatus(next)
            }}
            disabled={updating}
          >
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="PAYMENT_CONFIRMED">PAYMENT_CONFIRMED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>
    </div>
  )
}
