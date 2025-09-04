import { useEffect, useState } from 'react'
import Layout from '../components/layout/Layout'
import api from '../lib/api'

export default function BlogList() {
  const [posts, setPosts] = useState([])
  useEffect(() => {
    api.get('/api/blog').then(({ data }) => setPosts(data.posts || [])).catch(() => {})
  }, [])
  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Blog</h1>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {posts.map((p) => (
            <a key={p.id} href={`/blog/${p.slug || p.id}`} className="card p-4">
              <div className="aspect-[16/10] rounded-xl bg-gray-100 overflow-hidden">
                {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />}
              </div>
              <div className="mt-3 font-medium">{p.title}</div>
              <div className="text-sm text-gray-600">{p.author}</div>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  )
}


