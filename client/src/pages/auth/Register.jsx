import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import RegisterForm from '../../components/auth/RegisterForm'

export default function Register() {
  return (
    <Layout>
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <RegisterForm />
        <p className="text-sm text-gray-600 mt-4">Already have an account? <Link to="/login" className="text-brand-700">Login</Link></p>
      </div>
    </Layout>
  )
}


