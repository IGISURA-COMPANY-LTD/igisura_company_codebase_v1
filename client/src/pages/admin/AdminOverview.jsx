import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Link } from 'react-router-dom'

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    api.get('/api/admin/dashboard/stats').then(({ data }) => setStats(data)).catch(() => {})
  }, [])
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          ['totalRevenue','Revenue'],
          ['totalOrders','Orders'],
          ['totalProducts','Products'],
          ['pendingOrders','Pending Orders'],
          ['totalUsers','Users'],
        ].map(([k, label]) => (
          <div key={k} className="rounded-lg border bg-white shadow-md p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">{label}</div>
              <div className="text-gray-400">★</div>
            </div>
            <div className="text-3xl font-semibold mt-1">{stats ? (stats[k] ?? '-') : <span className="skeleton inline-block h-7 w-24 rounded" />}</div>
            <div className="mt-2 h-8 bg-gray-100 rounded">
              {/* sparkline placeholder */}
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-white shadow-md p-4">
          <div className="text-sm font-medium">Low Stock Products</div>
          <ul className="mt-2 space-y-2 text-sm">
            {(Array.isArray(stats?.lowStockProducts) ? stats.lowStockProducts : [])
              .slice(0, 6)
              .map((p) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="inline-block size-8 rounded bg-gray-100" />
                    <span className={p.stockQuantity <= 5 ? 'text-red-600 font-medium' : ''}>{p.name} ({p.stockQuantity})</span>
                  </span>
                  <Link className="btn" to={`/admin/products/${p.id}`}>Edit</Link>
                </li>
              ))}
            {!stats && <li className="skeleton h-4 w-48 rounded" />}
          </ul>
        </div>
        <div className="rounded-lg border bg-white shadow-md p-4">
          <div className="text-sm font-medium">Recent Orders</div>
          <ul className="mt-2 space-y-2 text-sm">
            {(Array.isArray(stats?.recentOrders) ? stats.recentOrders : [])
              .slice(0, 6)
              .map((o) => (
                <li key={o.id} className="flex items-center justify-between">
                  <span>#{o.id} — {o.user?.email} <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs ${
                    o.status === 'NEW' ? 'bg-amber-100 text-amber-800' :
                    o.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                    o.status === 'PAYMENT_CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                    o.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{o.status}</span></span>
                  <Link className="btn" to={`/admin/orders/${o.id}`}>View</Link>
                </li>
              ))}
            {!stats && <li className="skeleton h-4 w-48 rounded" />}
          </ul>
        </div>
      </div>
    </div>
  )
}


