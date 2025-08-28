import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  useEffect(() => {
    api.get('/api/orders', { params: { limit: 50 } }).then(({ data }) => setOrders(data.orders || [])).catch(() => {})
  }, [])
  return (
    <div className="card p-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="py-2">ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="py-2">{o.id}</td>
              <td>{o.user?.email}</td>
              <td>{o.status}</td>
              <td>${o.items?.reduce((s,i)=>s+i.price*i.quantity,0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


