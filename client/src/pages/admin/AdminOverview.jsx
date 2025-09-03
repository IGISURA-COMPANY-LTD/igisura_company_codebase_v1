import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Link } from 'react-router-dom'

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [revenue, setRevenue] = useState(null)
  const [orders, setOrders] = useState(null)

  useEffect(() => {
    api.get('/api/admin/dashboard/stats').then(({ data }) => setStats(data)).catch(() => {})
    api.get('/api/admin/dashboard/revenue-trend').then(({ data }) => setRevenue(data?.series || [])).catch(() => {})
    api.get('/api/admin/dashboard/orders-trend').then(({ data }) => setOrders(data?.series || [])).catch(() => {})
  }, [])

  const MiniLineChart = ({ data, height = 120, color = '#2563eb' }) => {
    if (!Array.isArray(data) || data.length === 0) {
      return <div className="h-[120px] bg-gray-50 rounded" />
    }
    const width = 520
    const padding = 24
    const values = data.map(d => Number(d.value) || 0)
    const labels = data.map(d => d.label)
    const max = Math.max(...values, 1)
    const min = Math.min(...values, 0)
    const range = Math.max(max - min, 1)
    const stepX = (width - padding * 2) / Math.max(values.length - 1, 1)
    const points = values.map((v, i) => {
      const x = padding + i * stepX
      const y = padding + (height - padding * 2) * (1 - (v - min) / range)
      return `${x},${y}`
    }).join(' ')
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[160px]">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="#e5e7eb" strokeWidth="1" points={`${padding},${height - padding} ${width - padding},${height - padding}`} />
        <polyline fill="none" stroke="#e5e7eb" strokeWidth="1" points={`${padding},${padding} ${width - padding},${padding}`} />
        <polyline fill="none" stroke={color} strokeWidth="2.5" points={points} />
        <polygon fill="url(#grad)" points={`${points} ${width - padding},${height - padding} ${padding},${height - padding}`} />
        {values.map((v, i) => {
          const x = padding + i * stepX
          const y = padding + (height - padding * 2) * (1 - (v - min) / range)
          return <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
        })}
        <g>
          {labels.map((l, i) => {
            if (i % 2 !== 0) return null
            const x = padding + i * stepX
            const y = height - 6
            return <text key={l} x={x} y={y} fontSize="10" textAnchor="middle" fill="#6b7280">{l.split('-')[1]}</text>
          })}
        </g>
      </svg>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-gray-500 mt-1">Key metrics and recent activity</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          ['totalRevenue','Revenue'],
          ['totalOrders','Orders'],
          ['totalProducts','Products'],
          ['pendingOrders','Pending Orders'],
          ['totalUsers','Users'],
        ].map(([k, label]) => (
          <div key={k} className="rounded-xl border bg-white shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">{label}</div>
              <div className="text-gray-300">★</div>
            </div>
            <div className="text-3xl font-semibold mt-2">{stats ? (stats[k] ?? '-') : <span className="skeleton inline-block h-7 w-24 rounded" />}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Revenue (last 12 months)</div>
          </div>
          {!revenue ? (
            <div className="h-[160px] skeleton rounded mt-2" />
          ) : (
            <MiniLineChart data={revenue} color="#16a34a" />
          )}
        </div>
        <div className="rounded-xl border bg-white shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Orders (last 12 months)</div>
          </div>
          {!orders ? (
            <div className="h-[160px] skeleton rounded mt-2" />
          ) : (
            <MiniLineChart data={orders} color="#2563eb" />
          )}
        </div>
      </div>

      {(Array.isArray(stats?.lowStockProducts) && stats.lowStockProducts.length > 0) ||
       (Array.isArray(stats?.recentOrders) && stats.recentOrders.length > 0) ? (
        <div className="grid md:grid-cols-2 gap-6">
          {Array.isArray(stats?.lowStockProducts) && stats.lowStockProducts.length > 0 && (
            <div className="rounded-xl border bg-white shadow-sm p-5">
              <div className="text-sm font-medium">Low Stock Products</div>
              <ul className="mt-2 space-y-2 text-sm">
                {stats.lowStockProducts.slice(0, 6).map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="inline-block size-8 rounded bg-gray-100" />
                      <span className={p.stockQuantity <= 5 ? 'text-red-600 font-medium' : ''}>{p.name} ({p.stockQuantity})</span>
                    </span>
                    <Link className="btn" to={`/admin/products/${p.id}`}>Edit</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {Array.isArray(stats?.recentOrders) && stats.recentOrders.length > 0 && (
            <div className="rounded-xl border bg-white shadow-sm p-5">
              <div className="text-sm font-medium">Recent Orders</div>
              <ul className="mt-2 space-y-2 text-sm">
                {stats.recentOrders.slice(0, 6).map((o) => (
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
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}


