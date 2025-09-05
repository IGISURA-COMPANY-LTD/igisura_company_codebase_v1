import { Link, useLocation } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import LoginForm from '../../components/auth/LoginForm'

export default function Login() {
  const location = useLocation()
  const search = new URLSearchParams(location.search)
  const next = search.get('next')
  const registerHref = next ? `/register?next=${encodeURIComponent(next)}` : '/register'
  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-semibold">Login</h1>
        <LoginForm />
        <p className="text-sm text-gray-600 mt-4">No account? <Link to={registerHref} className="text-brand-700">Register</Link></p>
      </div>
    </Layout>
  )
}


