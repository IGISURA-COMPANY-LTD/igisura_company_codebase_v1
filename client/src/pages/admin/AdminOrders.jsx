import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Link } from 'react-router-dom'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ page: 1, limit: 20, status: '' })
  const [pagination, setPagination] = useState(null)

  useEffect(() => {
    setLoading(true)
    api
      .get('/api/orders', { params: { page: filters.page, limit: filters.limit, status: filters.status || undefined } })
      .then(({ data }) => {
        setOrders(data.orders || [])
        setPagination(data.pagination || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filters.page, filters.limit, filters.status])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Orders</h2>
        <div className="flex items-center gap-2 text-sm">
          <select className="border rounded px-2 py-1" value={filters.status} onChange={(e) => setFilters({ ...filters, page: 1, status: e.target.value })}>
            <option value="">All Statuses</option>
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="PAYMENT_CONFIRMED">PAYMENT_CONFIRMED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>
      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2">ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="py-6 text-center">Loading...</td></tr>
            ) : orders.map((o) => (
              <tr
                key={o.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => window.location.assign(`/admin/orders/${o.id}`)}
              >
                <td className="py-2">{o.id}</td>
                <td className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span>{o.user?.name || o.user?.email}</span>
                    {o.phoneNumber ? (
                      <a href={`tel:${o.phoneNumber}`} onClick={(e)=>e.stopPropagation()} className="text-brand-700 underline text-xs">Contact</a>
                    ) : null}
                  </div>
                </td>
                <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
                <td>{String(o.status || '')}</td>
                <td className="font-semibold">${(Array.isArray(o.items) ? o.items.reduce((s,i)=>s+Number(i.price)*Number(i.quantity),0) : 0).toFixed(2)}</td>
                <td>
                  <Link className="btn" to={`/admin/orders/${o.id}`} onClick={(e)=>e.stopPropagation()}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div>Page {pagination?.currentPage || filters.page} of {pagination?.totalPages || '-'}</div>
        <div className="flex gap-2">
          <button className="btn" disabled={!pagination?.hasPrev} onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}>Previous</button>
          <button className="btn" disabled={!pagination?.hasNext} onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}>Next</button>
        </div>
      </div>
    </div>
  )
}


