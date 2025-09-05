import { Link, useLocation } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import RegisterForm from '../../components/auth/RegisterForm'

export default function Register() {
  const location = useLocation()
  const search = new URLSearchParams(location.search)
  const next = search.get('next')
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : '/login'
  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <RegisterForm />
        <p className="text-sm text-gray-600 mt-4">Already have an account? <Link to={loginHref} className="text-brand-700">Login</Link></p>
      </div>
    </Layout>
  )
}


