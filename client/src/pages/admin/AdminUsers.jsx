import { useEffect, useState } from 'react'
import api from '../../lib/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  useEffect(() => {
    api.get('/api/users', { params: { limit: 50 } }).then(({ data }) => setUsers(data.users || [])).catch(() => {})
  }, [])
  return (
    <div className="card p-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="py-2">ID</th>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="py-2">{u.id}</td>
              <td>{u.email}</td>
              <td>{u.name}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


