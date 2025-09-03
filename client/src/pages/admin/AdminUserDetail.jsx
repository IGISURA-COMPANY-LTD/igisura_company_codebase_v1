import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'

export default function AdminUserDetail() {
  const { id } = useParams()
  const isCreate = id === 'new'
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', name: '', role: 'CUSTOMER', password: '' })
  const [loading, setLoading] = useState(!isCreate)
  const [saving, setSaving] = useState(false)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(!isCreate)

  useEffect(() => {
    if (isCreate) return
    setLoading(true)
    api.get(`/api/users/${id}`)
      .then(({ data }) => {
        setForm({ email: data.email || '', name: data.name || '', role: data.role || 'CUSTOMER', password: '' })
      })
      .catch((e) => toast.error(e?.response?.data?.error || 'Failed to load user'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (isCreate) return
    setOrdersLoading(true)
    api.get(`/api/orders/user/${id}`, { params: { page: 1, limit: 10 } })
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setOrdersLoading(false))
  }, [id])

  const submit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (isCreate) {
        const payload = { email: form.email, name: form.name, role: form.role, password: form.password }
        await api.post('/api/users', payload)
        toast.success('User created')
      } else {
        const payload = { email: form.email, name: form.name, role: form.role }
        await api.put(`/api/users/${id}`, payload)
        toast.success('User updated')
      }
      navigate('/admin/users')
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="card p-4">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <button className="btn mb-3" onClick={() => window.history.back()} type="button">← Back</button>
        <h2 className="text-xl font-semibold">{isCreate ? 'New User' : 'Edit User'}</h2>
        <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submit} aria-label={isCreate ? 'Create user form' : 'Edit user form'}>
          <div>
            <label htmlFor="email" className="block text-sm mb-1">Email</label>
            <input id="email" type="email" required className="w-full border rounded-lg px-3 py-2" value={form.email} onChange={(e)=> setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm mb-1">Name</label>
            <input id="name" className="w-full border rounded-lg px-3 py-2" value={form.name} onChange={(e)=> setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm mb-1">Role</label>
            <select id="role" className="w-full border rounded-lg px-3 py-2" value={form.role} onChange={(e)=> setForm({ ...form, role: e.target.value })}>
              <option value="CUSTOMER">CUSTOMER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          {isCreate && (
            <div>
              <label htmlFor="password" className="block text-sm mb-1">Password</label>
              <input id="password" type="password" required className="w-full border rounded-lg px-3 py-2" value={form.password} onChange={(e)=> setForm({ ...form, password: e.target.value })} />
            </div>
          )}
          <div className="md:col-span-2">
            <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" className="btn ml-2" onClick={() => navigate('/admin/users')}>Cancel</button>
          </div>
        </form>
      </div>

      {!isCreate && (
        <div className="admin-table-wrap">
          <div className="text-lg font-semibold mb-2">Recent Orders</div>
          <table className="admin-table" role="table" aria-label="User orders table">
            <thead>
              <tr className="admin-thead">
                <th className="admin-th">Order ID</th>
                <th className="admin-th">Date</th>
                <th className="admin-th">Status</th>
                <th className="admin-th">Total</th>
              </tr>
            </thead>
            <tbody className="admin-tbody-zebra">
              {ordersLoading ? (
                <tr><td className="admin-td" colSpan="4">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td className="admin-td" colSpan="4">No orders.</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="admin-tr admin-tr-clickable" tabIndex={0} onClick={()=> navigate(`/admin/orders/${o.id}`)} onKeyDown={(e)=>{ if(e.key==='Enter'|| e.key===' '){ e.preventDefault(); navigate(`/admin/orders/${o.id}`)} }}>
                  <td className="admin-td">{o.id}</td>
                  <td className="admin-td">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
                  <td className="admin-td">{String(o.status || '')}</td>
                  <td className="admin-td font-semibold">${(Array.isArray(o.items) ? o.items.reduce((s,i)=>s+Number(i.price)*Number(i.quantity),0) : 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


