import { useEffect, useState } from 'react'
import api from '../../lib/api'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../stores/auth'
import ConfirmModal from '../../components/ui/ConfirmModal'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user: current } = useAuthStore()
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' })

  const load = () => {
    setLoading(true)
    api.get('/api/users', { params: { limit: 50 } })
      .then(({ data }) => setUsers(data.users || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Users</h2>
        <Link to="/admin/users/new" className="btn-primary">Add User</Link>
      </div>
      <div className="card p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2">ID</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="py-6 text-center">Loading...</td></tr>
            ) : users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/admin/users/${u.id}`)}
              >
                <td className="py-4">{u.id}</td>
                <td className="py-4">{u.email}</td>
                <td className="py-4">{u.name}</td>
                <td className="py-4">{u.role}</td>
                <td className="space-x-2">
                  <button className="btn" onClick={(e) => { e.stopPropagation(); navigate(`/admin/users/${u.id}`) }}>Edit</button>
                  <button className="btn" onClick={(e) => { e.stopPropagation(); setConfirm({ open: true, id: u.id, name: u.email || u.name }) }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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


