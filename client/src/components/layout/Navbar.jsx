import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, NavLink } from 'react-router-dom'
import useAuthStore from '../../stores/auth'

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout, user } = useAuthStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  /* ----------  DESKTOP  ---------- */
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          Igisura
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive ? 'text-brand-600' : 'hover:text-brand-600 transition-colors'
            }
          >
            Shop
          </NavLink>
          <NavLink
            to="/blog"
            className={({ isActive }) =>
              isActive ? 'text-brand-600' : 'hover:text-brand-600 transition-colors'
            }
          >
            Blog
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? 'text-brand-600' : 'hover:text-brand-600 transition-colors'
            }
          >
            About
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              isActive ? 'text-brand-600' : 'hover:text-brand-600 transition-colors'
            }
          >
            Cart
          </NavLink>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="flex items-center gap-2"
              >
                <span className="w-8 h-8 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
                  {(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl py-2 z-30">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="md:hidden p-2 rounded-md hover:bg-gray-100/20 transition"
          aria-label="Open menu"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* ----------  MOBILE DRAWER  ---------- */}
      <AnimatePresence>
        {drawerOpen && (
    <>
      {/* backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setDrawerOpen(false)}
        className="fixed inset-0 bg-black/60 z-40 md:hidden"
      />

      {/* drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="font-bold text-lg text-gray-900">Menu</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* links */}
        <nav className="flex-1 flex flex-col gap-1 p-4 text-sm text-gray-800">
          <NavLink
            to="/products"
            onClick={() => setDrawerOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Shop
          </NavLink>
          <NavLink
            to="/blog"
            onClick={() => setDrawerOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Blog
          </NavLink>
          <NavLink
            to="/about"
            onClick={() => setDrawerOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            About
          </NavLink>
          <NavLink
            to="/cart"
            onClick={() => setDrawerOpen(false)}
            className="px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            Cart
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                onClick={() => setDrawerOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Profile
              </NavLink>
              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={() => setDrawerOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  Admin
                </NavLink>
              )}
              <button
                onClick={() => {
                  setDrawerOpen(false)
                  logout()
                }}
                className="text-left px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={() => setDrawerOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                onClick={() => setDrawerOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Register
              </NavLink>
            </>
          )}
        </nav>
      </motion.div>
    </>
    )}
      </AnimatePresence>
    </>
  )
}