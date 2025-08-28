import { Outlet, NavLink } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <nav className="mt-6 flex flex-wrap gap-3 text-sm">
        <NavLink to="." end className={({ isActive }) => `px-3 py-1 rounded ${isActive ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Overview</NavLink>
        <NavLink to="orders" className={({ isActive }) => `px-3 py-1 rounded ${isActive ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Orders</NavLink>
        <NavLink to="products" className={({ isActive }) => `px-3 py-1 rounded ${isActive ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Products</NavLink>
        <NavLink to="blog" className={({ isActive }) => `px-3 py-1 rounded ${isActive ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Blog</NavLink>
        <NavLink to="users" className={({ isActive }) => `px-3 py-1 rounded ${isActive ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Users</NavLink>
      </nav>
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  )
}


