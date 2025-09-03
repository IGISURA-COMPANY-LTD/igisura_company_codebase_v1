import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Link, useNavigate } from 'react-router-dom'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ page: 1, limit: 20, status: '' })
  const [pagination, setPagination] = useState(null)
  const navigate = useNavigate()

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
        <h2 className="text-2xl font-semibold">Orders</h2>
        <div className="flex items-center gap-3 text-base" role="group" aria-label="Order filters">
          <select className="border rounded-lg px-4 py-2 text-base" value={filters.status} onChange={(e) => setFilters({ ...filters, page: 1, status: e.target.value })}>
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
              <th className="admin-th">Customer</th>
              <th className="admin-th">Date</th>
              <th className="admin-th">Status</th>
              <th className="admin-th">Total</th>
              <th className="admin-th">Items</th>
              <th className="admin-th" aria-hidden></th>
            </tr>
          </thead>
          <tbody className="admin-tbody-zebra">
            {loading ? (
              <tr><td colSpan="6" className="py-4 text-center">Loading...</td></tr>
            ) : orders.map((o) => (
              <tr
                key={o.id}
                className="admin-tr admin-tr-clickable"
                tabIndex={0}
                onClick={() => navigate(`/admin/orders/${o.id}`)}
                onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); navigate(`/admin/orders/${o.id}`) } }}
              >
                <td className="admin-td whitespace-nowrap">
                  <div>
                    <div className="font-medium">{o.user?.name || o.customerName || o.user?.email}</div>
                    {/* <div className="text-base text-gray-600">{o.user?.email || o.email}</div> */}
                    {o.phoneNumber && (
                      <a href={`tel:${o.phoneNumber}`} onClick={(e)=>e.stopPropagation()} className="text-brand-700 underline text-sm">📞 {o.phoneNumber}</a>
                    )}
                  </div>
                </td>
                <td className="admin-td">
                  <div className="text-base">
                    <div>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '-'}</div>
                    <div className="text-gray-500">{o.createdAt ? new Date(o.createdAt).toLocaleTimeString() : ''}</div>
                  </div>
                </td>
                <td className="admin-td">
                  <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                    o.status === 'NEW' ? 'bg-amber-100 text-amber-800' :
                    o.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                    o.status === 'PAYMENT_CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                    o.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    o.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {String(o.status || '')}
                  </span>
                </td>
                <td className="admin-td font-semibold text-brand-700 ">{(Array.isArray(o.items) ? o.items.reduce((s,i)=>s+Number(i.price)*Number(i.quantity),0) : 0).toFixed(2)} RFW</td>
                <td className="admin-td text-base text-gray-600">
                  {Array.isArray(o.items) ? `${o.items.length} item${o.items.length !== 1 ? 's' : ''}` : '0 items'}
                </td>
                <td className="admin-td">
                  <Link className="btn-secondary text-base px-4 py-1.5" to={`/admin/orders/${o.id}`} onClick={(e)=>e.stopPropagation()}>View</Link>
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


