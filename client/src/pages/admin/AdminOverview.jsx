// pages/admin/AdminOverview.jsx
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

export default function AdminOverview() {
  const [stats, setStats]   = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [orders, setOrders]  = useState(null);

  useEffect(() => {
    api.get('/api/admin/dashboard/stats').then(({ data }) => setStats(data)).catch(() => {});
    api.get('/api/admin/dashboard/revenue-trend').then(({ data }) => setRevenue(data?.series || [])).catch(() => {});
    api.get('/api/admin/dashboard/orders-trend').then(({ data }) => setOrders(data?.series || [])).catch(() => {});
  }, []);

  const formatCompact  = (v) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(Number(v) || 0);
  const formatCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v) || 0);

  const MetricCard = ({ label, value }) => (
    <div className="card p-5 flex flex-col justify-between">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-900">
        {value ?? <span className="skeleton h-8 w-20 rounded-md inline-block" />}
      </div>
    </div>
  );

  const Chart = ({ series, color = '#16a34a', valueFormatter = formatCompact }) => (
    <div className="h-60 w-full">
      {!Array.isArray(series) || series.length === 0 ? (
        <div className="skeleton h-full rounded-lg" />
      ) : (
        <ResponsiveContainer>
          <AreaChart
            data={series.map(d => ({ name: d.label?.split('-')[1] || d.label, value: Number(d.value) || 0 }))}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <defs>
              <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={valueFormatter} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,.06)' }}
              formatter={(v) => [valueFormatter(v), null]}
            />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${color})`} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-500 mt-1">Key metrics and recent activity</p>
      </header>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard label="Revenue" value={stats && formatCurrency(stats.totalRevenue)} />
        <MetricCard label="Orders" value={stats && formatCompact(stats.totalOrders)} />
        <MetricCard label="Products" value={stats && formatCompact(stats.totalProducts)} />
        <MetricCard label="Pending Orders" value={stats && formatCompact(stats.pendingOrders)} />
        <MetricCard label="Users" value={stats && formatCompact(stats.totalUsers)} />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Revenue (last 12 months)</h3>
          <Chart series={revenue} color="#16a34a" valueFormatter={formatCurrency} />
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Orders (last 12 months)</h3>
          <Chart series={orders} color="#2563eb" valueFormatter={formatCompact} />
        </div>
      </div>

      {/* Lists */}
      <div className="grid md:grid-cols-2 gap-6">
        {stats?.lowStockProducts?.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Low Stock Products</h3>
            <ul className="space-y-3">
              {stats.lowStockProducts.slice(0, 6).map(p => (
                <li key={p.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-gray-100 shrink-0" />
                    <span className={p.stockQuantity <= 5 ? 'text-red-600 font-medium' : ''}>
                      {p.name} ({p.stockQuantity})
                    </span>
                  </div>
                  <Link to={`/admin/products/${p.id}`} className="btn-link">Edit</Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {stats?.recentOrders?.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Recent Orders</h3>
            <ul className="space-y-3">
              {stats.recentOrders.slice(0, 6).map(o => (
                <li key={o.id} className="flex items-center justify-between gap-3">
                  <div>
                    <span className="font-medium">#{o.id}</span> — {o.user?.email}
                    <span
                      className={`ml-2 badge ${o.status === 'NEW' ? 'bg-amber-100 text-amber-800' :
                          o.status === 'CONTACTED' ? 'bg-blue-100 text-blue-800' :
                          o.status === 'PAYMENT_CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                          o.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'}`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <Link to={`/admin/orders/${o.id}`} className="btn-link">View</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}