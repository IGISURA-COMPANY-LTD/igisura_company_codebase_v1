import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  useEffect(() => {
    api.get('/api/products', { params: { limit: 100 } }).then(({ data }) => setProducts(data.products || [])).catch(() => {})
  }, [])
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {products.map((p) => (
        <div key={p.id} className="card p-4">
          <div className="aspect-square rounded-xl bg-gray-100 overflow-hidden">
            {p.images?.[0] && <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />}
          </div>
          <div className="mt-3 font-medium">{p.name}</div>
          <div className="text-sm text-gray-600">${Number(p.price).toFixed(2)}</div>
        </div>
      ))}
    </div>
  )
}


