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
        <h2 className="text-xl font-semibold">Blog</h2>
        <Link to="/admin/blog/new" className="btn-primary">New Post</Link>
      </div>
      <div className="flex items-center justify-end gap-2">
        <input aria-label="Search posts" placeholder="Search" className="border rounded px-2 py-1 text-sm" value={filters.search} onChange={(e)=> setFilters({ ...filters, page: 1, search: e.target.value })} />
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table" role="table" aria-label="Blog posts table">
          <thead>
            <tr className="admin-thead">
              <th className="admin-th">Title</th>
              <th className="admin-th">Author</th>
              <th className="admin-th">Tags</th>
              <th className="admin-th" aria-hidden></th>
            </tr>
          </thead>
          <tbody className="admin-tbody-zebra">
            {loading ? (
              <tr><td colSpan="4" className="py-6 text-center">Loading...</td></tr>
            ) : posts.map((p) => (
              <tr key={p.id} className="admin-tr admin-tr-clickable" tabIndex={0}
                  onClick={() => navigate(`/admin/blog/${p.id}`)}
                  onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); navigate(`/admin/blog/${p.id}`) } }}>
                <td className="admin-td">{p.title}</td>
                <td className="admin-td">{p.author}</td>
                <td className="admin-td">{Array.isArray(p.tags) ? p.tags.join(', ') : ''}</td>
                <td className="admin-td space-x-2">
                  <button className="btn" onClick={() => navigate(`/admin/blog/${p.id}`)}>Edit</button>
                  <button className="btn" onClick={() => setConfirm({ open: true, id: p.id, name: p.title })}>Delete</button>
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


