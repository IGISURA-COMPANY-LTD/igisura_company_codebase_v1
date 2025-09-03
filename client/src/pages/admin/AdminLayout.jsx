import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../../stores/auth';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLink = (to, label, icon) => (
    <NavLink
      to={to}
      end={to === '.'}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded transition-colors duration-150 ` +
        (isActive
          ? 'bg-emerald-grey text-emerald-700 bg-cyan-700/10 shadow-sm'
          : 'hover:bg-gray-400/15 text-slate-600 hover:text-slate-900')
      }
      onClick={() => setMobileOpen(false)}
    >
      <span className="text-lg w-5 text-center">{icon}</span>
      <span className='font-medium'>{label}</span>
    </NavLink>
  );

  /* ----------  Sidebar content (logo + nav)  ---------- */
  const sidebarContent = (
    <>
      {/* Logo section */}
      <div className="flex items-center gap-3 px-3 pb-8 pt-2 mb-2">
        <img
          src="../assets/images/stinging_nettle_4.png"       
          alt="Logo"
          className="h-8 w-8 rounded object-cover "
        />
        <span className="font-bold text-lg tracking-tight text-slate-600 hover:text-slate-900 ">Admin</span>
      </div>

      {/* Close button (mobile only) */}
      <div className="flex md:hidden items-center justify-between mb-3 px-1">
        <span className="font-semibold text-sm">Menu</span>
        <button
          onClick={() => setMobileOpen(false)}
          className="p-1 rounded hover:bg-slate-700"
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navLink('.', 'Overview', '🏠')}
        {navLink('products', 'Products', '📦')}
        {navLink('categories', 'Categories', '🏷️')}
        {navLink('orders', 'Orders', '🧾')}
        {navLink('blog', 'Blog', '✍️')}
        {navLink('users', 'Users', '👥')}
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full text-left px-3 py-2 rounded hover:bg-red-600/20 text-red-200 transition-colors"
        >
          Logout
        </button>
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen"> {/* change the contents bg*/}
      {/* ===== DESKTOP SIDEBAR (fixed left) ===== */}
      <aside className="hidden md:flex flex-col w-64 fixed top-0 left-0 h-full bg-gray-200 border-r border-r-gray-300 px-3 py-4 space-y-4">
        {sidebarContent}
      </aside>

      {/* ===== MOBILE SIDEBAR (overlay) ===== */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: mobileOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="md:hidden fixed inset-y-0 left-0 w-72 bg-gray-200 text-slate-600 hover:text-slate-900 px-3 py-4 space-y-4 z-40"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile scrim */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ===== MAIN AREA (pushed right on desktop) ===== */}
      <div className="flex-1 md:ml-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/80 bg-white/90 border-b border-b-gray-300 shadow-md">
          <div className="max-w-full px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden inline-flex items-center justify-center size-9 rounded-md hover:bg-gray-200"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
              >
                ≡
              </button>
              <h1 className="text-xl font-semibold tracking-tight">Admin Dashboard</h1>
            </div>
            <div className="text-sm text-gray-700">
              {user && (
                <>
                  Signed in as{' '}
                  <span className="font-medium">{user.name || user.email}</span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}