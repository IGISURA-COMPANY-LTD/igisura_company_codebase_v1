import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useAuthStore from '../../stores/auth'

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const navLink = (to, label, icon) => (
    <NavLink to={to} end={to === '.'} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded transition ${isActive ? 'bg-brand-600/20 text-brand-50' : 'hover:bg-gray-700'}`} onClick={() => setOpen(false)}>
      <span className="inline-flex w-5 h-5 items-center justify-center">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="md:hidden inline-flex items-center justify-center size-9 rounded-md hover:bg-gray-200" aria-label="Open menu" onClick={() => setOpen(true)}>
              <span className="i">≡</span>
            </button>
            <h1 className="text-xl font-semibold tracking-tight">Admin Dashboard</h1>
          </div>
          <div className="text-sm text-gray-700">{user ? <>Signed in as <span className="font-medium">{user.name || user.email}</span></> : null}</div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <aside className="hidden md:block md:col-span-3 lg:col-span-2">
          <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-auto rounded-lg bg-gray-800 text-white p-3 space-y-1">
            {navLink('.', 'Overview', '🏠')}
            {navLink('products', 'Products', '📦')}
            {navLink('categories', 'Categories', '🏷️')}
            {navLink('orders', 'Orders', '🧾')}
            {navLink('blog', 'Blog', '✍️')}
            {navLink('users', 'Users', '👥')}
            <button className="w-full text-left px-3 py-2 rounded hover:bg-red-600/20 text-red-200" onClick={() => { logout(); navigate('/') }}>Logout</button>
          </div>
        </aside>
        <section className="md:col-span-9 lg:col-span-10">
          <Outlet />
        </section>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-72 bg-gray-800 text-white z-50 p-3 space-y-1">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Menu</div>
              <button className="inline-flex items-center justify-center size-8 rounded hover:bg-gray-700" onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>
            {navLink('.', 'Overview', '🏠')}
            {navLink('products', 'Products', '📦')}
            {navLink('categories', 'Categories', '🏷️')}
            {navLink('orders', 'Orders', '🧾')}
            {navLink('blog', 'Blog', '✍️')}
            {navLink('users', 'Users', '👥')}
            <button className="w-full text-left px-3 py-2 rounded hover:bg-red-600/20 text-red-200" onClick={() => { setOpen(false); logout(); navigate('/') }}>Logout</button>
          </div>
        </>
      )}
    </div>
  )
}


