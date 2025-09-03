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
        <div className="flex items-center gap-2 text-sm" role="group" aria-label="Order filters">
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
      <div className="admin-table-wrap">
        <table className="admin-table" role="table" aria-label="Orders table">
          <thead>
            <tr className="admin-thead">
              <th className="admin-th">ID</th>
              <th className="admin-th">Customer</th>
              <th className="admin-th">Date</th>
              <th className="admin-th">Status</th>
              <th className="admin-th">Total</th>
              <th className="admin-th" aria-hidden></th>
            </tr>
          </thead>
          <tbody className="admin-tbody-zebra">
            {loading ? (
              <tr><td colSpan="6" className="py-6 text-center">Loading...</td></tr>
            ) : orders.map((o) => (
              <tr
                key={o.id}
                className="admin-tr admin-tr-clickable"
                tabIndex={0}
                onClick={() => window.location.assign(`/admin/orders/${o.id}`)}
                onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); window.location.assign(`/admin/orders/${o.id}`) } }}
              >
                <td className="admin-td">{o.id}</td>
                <td className="admin-td whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span>{o.user?.name || o.user?.email}</span>
                    {o.phoneNumber ? (
                      <a href={`tel:${o.phoneNumber}`} onClick={(e)=>e.stopPropagation()} className="text-brand-700 underline text-xs">Contact</a>
                    ) : null}
                  </div>
                </td>
                <td className="admin-td">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
                <td className="admin-td">{String(o.status || '')}</td>
                <td className="admin-td font-semibold">${(Array.isArray(o.items) ? o.items.reduce((s,i)=>s+Number(i.price)*Number(i.quantity),0) : 0).toFixed(2)}</td>
                <td className="admin-td">
                  <Link className="btn" to={`/admin/orders/${o.id}`} onClick={(e)=>e.stopPropagation()}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-pagination" role="navigation" aria-label="Orders pagination">
        <div>Page {pagination?.currentPage || filters.page} of {pagination?.totalPages || '-'}</div>
        <div className="pager">
          <button className="btn" disabled={!pagination?.hasPrev} onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}>Previous</button>
          <button className="btn" disabled={!pagination?.hasNext} onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}>Next</button>
        </div>
      </div>
    </div>
  )
}


