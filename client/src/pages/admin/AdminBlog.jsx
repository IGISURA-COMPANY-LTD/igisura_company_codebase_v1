import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function AdminBlog() {
  const [posts, setPosts] = useState([])
  useEffect(() => {
    api.get('/api/blog', { params: { limit: 50 } }).then(({ data }) => setPosts(data.posts || [])).catch(() => {})
  }, [])
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {posts.map((p) => (
        <div key={p.id} className="card p-4">
          <div className="aspect-[16/10] rounded-xl bg-gray-100 overflow-hidden">
            {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover" />}
          </div>
          <div className="mt-3 font-medium">{p.title}</div>
          <div className="text-sm text-gray-600">{p.author}</div>
        </div>
      ))}
    </div>
  )
}


