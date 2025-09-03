import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../stores/auth'
import ConfirmModal from '../../components/ui/ConfirmModal'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ page: 1, limit: 20, search: '' })
  const [pagination, setPagination] = useState(null)
  const navigate = useNavigate()
  const { user: current } = useAuthStore()
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' })

  const load = () => {
    setLoading(true)
    api.get('/api/users', { params: { page: filters.page, limit: filters.limit, search: filters.search || undefined } })
      .then(({ data }) => { setUsers(data.users || []); setPagination(data.pagination || null) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filters.page, filters.limit, filters.search])

  const doDelete = async () => {
    const id = confirm.id
    if (current?.id === id) {
      toast.error('You cannot delete your own account')
      setConfirm({ open: false, id: null, name: '' })
      return
    }
    try {
      await api.delete(`/api/users/${id}`)
      toast.success('User deleted')
      setConfirm({ open: false, id: null, name: '' })
      load()
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Delete failed')
      setConfirm({ open: false, id: null, name: '' })
    }
  }

  // prevent row click when pressing on buttons within
  // handled via e.stopPropagation() on buttons

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Users</h2>
        <Link to="/admin/users/new" className="btn-primary">Add User</Link>
      </div>
      <div className="flex items-center justify-end gap-2">
        <input aria-label="Search users" placeholder="Search" className="border rounded px-2 py-1 text-sm" value={filters.search} onChange={(e)=> setFilters({ ...filters, page: 1, search: e.target.value })} />
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table" role="table" aria-label="Users table">
          <thead>
            <tr className="admin-thead">
              <th className="admin-th">ID</th>
              <th className="admin-th">Email</th>
              <th className="admin-th">Name</th>
              <th className="admin-th">Role</th>
              <th className="admin-th" aria-hidden></th>
            </tr>
          </thead>
          <tbody className="admin-tbody-zebra">
            {loading ? (
              <tr><td colSpan="5" className="py-6 text-center">Loading...</td></tr>
            ) : users.map((u) => (
              <tr
                key={u.id}
                className="admin-tr admin-tr-clickable"
                tabIndex={0}
                onClick={() => navigate(`/admin/users/${u.id}`)}
                onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); navigate(`/admin/users/${u.id}`) } }}
              >
                <td className="admin-td">{u.id}</td>
                <td className="admin-td">{u.email}</td>
                <td className="admin-td">{u.name || '-'}</td>
                <td className="admin-td">{u.role}</td>
                <td className="admin-td space-x-2">
                  <button className="btn" onClick={(e) => { e.stopPropagation(); navigate(`/admin/users/${u.id}`) }}>Edit</button>
                  <button className="btn" onClick={(e) => { e.stopPropagation(); setConfirm({ open: true, id: u.id, name: u.email || u.name }) }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="admin-pagination" role="navigation" aria-label="Users pagination">
        <div>Page {pagination?.currentPage || filters.page} of {pagination?.totalPages || '-'}</div>
        <div className="pager">
          <button className="btn" disabled={!pagination?.hasPrev} onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}>Previous</button>
          <button className="btn" disabled={!pagination?.hasNext} onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}>Next</button>
        </div>
      </div>

      <ConfirmModal
        open={confirm.open}
        title="Delete User"
        description={`Are you sure you want to delete ${confirm.name}?`}
        confirmText="Delete"
        onCancel={() => setConfirm({ open: false, id: null, name: '' })}
        onConfirm={doDelete}
      />
    </div>
  )
}


