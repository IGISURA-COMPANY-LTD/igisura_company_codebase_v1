import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './stores/auth'
import Layout from './components/layout/Layout'
import { AnimatePresence, motion } from 'framer-motion'
import HomePage from './pages/Home'
import ProductsPage from './pages/Products'
import ProductDetailPage from './pages/ProductDetail'
import CartPage from './pages/Cart'
import CheckoutPage from './pages/Checkout'
import BlogListPage from './pages/BlogList'
import BlogPostPage from './pages/BlogPost'
import AboutPage from './pages/About'
import HealthBenefitsPage from './pages/HealthBenefits'
import LoginPage from './pages/auth/Login'
import RegisterPage from './pages/auth/Register'
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminBlog from './pages/admin/AdminBlog'
import AdminUsers from './pages/admin/AdminUsers'
import './index.css'

const ProtectedRoute = ({ requireAdmin }) => {
  const { isAuthenticated, isAdmin, hydrate } = useAuthStore()
  if (!isAuthenticated && typeof window !== 'undefined') {
    hydrate()
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}

 


const Placeholder = ({ title }) => (
  <Layout>
    <div className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-gray-600 mt-2">This page will be implemented next.</p>
    </div>
  </Layout>
)

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/product/:idOrSlug" element={<ProductDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/health-benefits" element={<HealthBenefitsPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route element={<ProtectedRoute />}> 
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<Placeholder title="Profile" />} />
          </Route>
          <Route element={<ProtectedRoute requireAdmin />}> 
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="users" element={<AdminUsers />} />
            </Route>
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
