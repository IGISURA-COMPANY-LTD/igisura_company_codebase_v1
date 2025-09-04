import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import ConfirmModal from '../../components/ui/ConfirmModal'

export default function AdminBlog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '' })
  const [pagination, setPagination] = useState(null)
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' })

  const load = () => {
    setLoading(true)
    api.get('/api/blog', { params: { page: filters.page, limit: filters.limit, search: filters.search || undefined } })
      .then(({ data }) => { setPosts(data.posts || []); setPagination(data.pagination || null) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filters.page, filters.limit, filters.search])

  const doDelete = async () => {
    try {
      const id = confirm.id
      await api.delete(`/api/blog/${id}`)
      toast.success('Post deleted')
      setConfirm({ open: false, id: null, name: '' })
      load()
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Delete failed')
      setConfirm({ open: false, id: null, name: '' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Blog</h2>
        <div className="flex items-center gap-3">
          <Link to="/admin/blog/new" className="btn-primary">New Post</Link>
          <input aria-label="Search posts" placeholder="Search posts..." className="border rounded-lg px-4 py-2 text-base w-64" value={filters.search} onChange={(e)=> setFilters({ ...filters, page: 1, search: e.target.value })} />
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table" role="table" aria-label="Blog posts table">
          <thead>
            <tr className="admin-thead">
              <th className="admin-th">Title</th>
              <th className="admin-th">Author</th>
              <th className="admin-th">Tags</th>
              <th className="admin-th">Published</th>
              <th className="admin-th" aria-hidden></th>
            </tr>
          </thead>
          <tbody className="admin-tbody-zebra">
            {loading ? (
              <tr><td colSpan="5" className="py-6 text-center">Loading...</td></tr>
            ) : posts.map((p) => (
              <tr key={p.id} className="admin-tr admin-tr-clickable" tabIndex={0}
                  onClick={() => navigate(`/admin/blog/${p.id}/view`)}
                  onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); navigate(`/admin/blog/${p.id}/view`) } }}>
                <td className="admin-td">
                  <div>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm text-gray-500">{p.slug}</div>
                  </div>
                </td>
                <td className="admin-td text-base">{p.author}</td>
                <td className="admin-td">
                  {Array.isArray(p.tags) && p.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {p.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          {tag}
                        </span>
                      ))}
                      {p.tags.length > 3 && (
                        <span className="text-sm text-gray-500">+{p.tags.length - 3} more</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-base">No tags</span>
                  )}
                </td>
                <td className="admin-td text-base text-gray-600">
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}
                </td>
                <td className="admin-td space-x-3">
                  <button className="btn-secondary text-base px-4 py-2" onClick={(e)=>{ e.stopPropagation(); navigate(`/admin/blog/${p.id}`) }}>Edit</button>
                  <button className="btn-danger text-base px-4 py-2" onClick={(e)=>{ e.stopPropagation(); setConfirm({ open: true, id: p.id, name: p.title }) }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-pagination" role="navigation" aria-label="Blog pagination">
        <div>Page {pagination?.currentPage || filters.page} of {pagination?.totalPages || '-'}</div>
        <div className="pager">
          <button className="btn" disabled={!pagination?.hasPrev} onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}>Previous</button>
          <button className="btn" disabled={!pagination?.hasNext} onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}>Next</button>
        </div>
      </div>

      <ConfirmModal
        open={confirm.open}
        title="Delete Post"
        description={`Are you sure you want to delete ${confirm.name}?`}
        confirmText="Delete"
        onCancel={() => setConfirm({ open: false, id: null, name: '' })}
        onConfirm={doDelete}
      />
    </div>
  )
}


