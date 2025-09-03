import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import api from '../../lib/api'

export default function AdminBlogDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/api/blog/${encodeURIComponent(id)}`)
      .then(({ data }) => setPost(data))
      .catch((e) => toast.error(e?.response?.data?.error || 'Failed to load post'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="card p-4">Loading...</div>
  if (!post) return <div className="card p-4">Post not found</div>

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <button className="btn mb-3" onClick={() => window.history.back()}>← Back</button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{post.title}</h2>
            <div className="mt-1 text-sm text-gray-600">By {post.author || '-'} {post.createdAt ? `• ${new Date(post.createdAt).toLocaleString()}` : ''}</div>
            {Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span key={t} className="badge badge-green">{t}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="btn" onClick={() => navigate('/admin/blog')}>List</button>
            <button className="btn-primary" onClick={() => navigate(`/admin/blog/${post.id}`)}>Edit</button>
          </div>
        </div>
        {post.image && (
          <div className="mt-4 rounded-xl overflow-hidden bg-gray-100">
            <img src={post.image} alt="cover" className="w-full max-h-96 object-cover" />
          </div>
        )}
        <div className="mt-4">
          <div className="font-medium">Content</div>
          <div className="mt-1 whitespace-pre-wrap text-gray-800">{post.content}</div>
        </div>
      </div>
    </div>
  )
}


