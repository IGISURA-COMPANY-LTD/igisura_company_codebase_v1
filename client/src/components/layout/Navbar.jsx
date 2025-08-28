import { useState } from 'react'
import useAuthStore from '../../stores/auth'

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout, user } = useAuthStore()
  const [open, setOpen] = useState(false)
  return (
    <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
      <a href="/" className="text-xl font-semibold tracking-tight">Igisura</a>
      <nav className="flex items-center gap-4 text-sm">
        <a href="/products" className="hover:text-brand-700">Shop</a>
        <a href="/blog" className="hover:text-brand-700">Blog</a>
        <a href="/about" className="hover:text-brand-700">About</a>
        <a href="/cart" className="hover:text-brand-700">Cart</a>
        {isAuthenticated ? (
          <div className="relative">
            <button className="inline-flex items-center gap-2" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-brand-600 text-white text-xs">{(user?.name || user?.email || 'U').slice(0,1).toUpperCase()}</span>
              <span className="max-w-[10ch] truncate">{user?.name || user?.email}</span>
            </button>
            {open && (
              <div role="menu" className="absolute right-0 mt-2 w-44 rounded-lg border border-gray-200 bg-white shadow-lg p-1">
                <a href="/profile" className="block px-3 py-2 rounded hover:bg-gray-100" role="menuitem">Profile</a>
                {isAdmin && <a href="/admin" className="block px-3 py-2 rounded hover:bg-gray-100" role="menuitem">Admin</a>}
                <button className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100" onClick={() => { setOpen(false); logout() }} role="menuitem">Logout</button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <a href="/login" className="btn">Login</a>
            <a href="/register" className="btn-primary">Register</a>
          </div>
        )}
      </nav>
    </div>
  )
}


