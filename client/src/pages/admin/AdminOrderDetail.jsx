import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'
import ConfirmModal from '../../components/ui/ConfirmModal'

export default function AdminOrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [confirmChange, setConfirmChange] = useState({ open: false })

  const load = () => {
    setLoading(true)
    api.get(`/api/orders/${encodeURIComponent(id)}`)
      .then(({ data }) => { setOrder(data); setSelectedStatus(data?.status || '') })
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
          <div>
            <h2 className="text-2xl font-semibold">Order Details</h2>
            <div className="text-sm text-gray-600 mt-1">Placed {order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</div>
          </div>
          <div className="text-sm">
            <span className="mr-2">Status:</span>
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
              order.status === 'NEW' ? 'bg-amber-100 text-amber-800' :
              order.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
              order.status === 'PAYMENT_CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
              order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>{order.status}</span>
          </div>
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

      <div className="admin-table-wrap">
        <table className="admin-table" role="table" aria-label="Order items table">
          <thead>
            <tr className="admin-thead">
              <th className="admin-th">Product</th>
              <th className="admin-th">Price</th>
              <th className="admin-th">Qty</th>
              <th className="admin-th">Subtotal</th>
            </tr>
          </thead>
          <tbody className="admin-tbody-zebra">
            {order.items?.map((i) => (
              <tr key={i.productId} className="admin-tr">
                <td className="admin-td">{i.product?.name || i.productId}</td>
                <td className="admin-td">{Number(i.price).toFixed(2)} RWF</td>
                <td className="admin-td">{i.quantity}</td>
                <td className="admin-td">{(i.price * i.quantity).toFixed(2)} RWF</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 flex justify-end text-sm"><span className="font-medium">Total:&nbsp;</span> {total.toFixed(2)} RWF</div>
      </div>

      <div className="card p-4 flex items-center justify-between">
        <div className="text-sm">Update order status</div>
        <div className="flex items-center gap-3">
          <select
            className="border rounded-lg px-3 py-2 text-base"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={updating}
            aria-label="Select new status"
          >
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="PAYMENT_CONFIRMED">PAYMENT_CONFIRMED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          <button
            className="btn-primary text-base px-5 py-2"
            disabled={updating || selectedStatus === order.status}
            onClick={() => setConfirmChange({ open: true })}
          >
            Change Status
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirmChange.open}
        title="Change order status?"
        description={`Change status to '${selectedStatus}'? This action may update inventory or notifications.`}
        confirmText={updating ? 'Updating...' : 'Confirm'}
        onCancel={() => setConfirmChange({ open: false })}
        onConfirm={async () => { setConfirmChange({ open: false }); await updateStatus(selectedStatus) }}
      />
    </div>
  )
}
