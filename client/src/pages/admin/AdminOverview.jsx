import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    api.get('/api/admin/dashboard/stats').then(({ data }) => setStats(data)).catch(() => {})
  }, [])
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {['totalRevenue','totalOrders','totalProducts','totalUsers','ordersThisMonth','revenueThisMonth'].map((k) => (
        <div key={k} className="card p-4">
          <div className="text-sm text-gray-500">{k}</div>
          <div className="text-2xl font-semibold mt-1">{stats ? (stats[k] ?? '-') : <span className="skeleton inline-block h-7 w-24 rounded" />}</div>
        </div>
      ))}
      <div className="md:col-span-3 card p-4">
        <div className="text-sm text-gray-500">Low Stock Products</div>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {stats?.lowStockProducts?.map((p) => (
            <li key={p.id}>{p.name} — {p.stockQuantity}</li>
          )) || <li className="skeleton h-4 w-48 rounded" />}
        </ul>
      </div>
    </div>
  )
}


