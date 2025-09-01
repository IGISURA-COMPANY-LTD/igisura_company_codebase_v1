import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import useAuthStore from '../../stores/auth'

const validateEmail = (value) => /.+@.+\..+/.test(value)

export default function LoginForm() {
  const navigate = useNavigate()
  const { login, loading, error } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({})
  const [apiError, setApiError] = useState('')

  useEffect(() => { setApiError(error || '') }, [error])

  const errors = useMemo(() => {
    return {
      email: form.email ? (validateEmail(form.email) ? '' : 'Enter a valid email') : 'Email is required',
      password: form.password ? (form.password.length >= 6 ? '' : 'Minimum 6 characters') : 'Password is required',
    }
  }, [form])

  const isValid = !errors.email && !errors.password

  const onSubmit = async (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!isValid) return
    try {
      const data = await login(form)
      toast.success('Welcome back!')
      if (data?.user?.role === 'ADMIN') navigate('/admin')
      else navigate('/')
    } catch (e) {
      setApiError(e?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
      {apiError && <div className="text-sm text-red-600">{apiError}</div>}
      <FieldFloat
        id="email"
        type="email"
        label="Email"
        value={form.email}
        onChange={(v) => setForm({ ...form, email: v })}
        onBlur={() => setTouched({ ...touched, email: true })}
        invalid={!!(touched.email && errors.email)}
        errorId="email-error"
        errorText={touched.email ? errors.email : ''}
      />
      <FieldFloat
        id="password"
        type="password"
        label="Password"
        value={form.password}
        onChange={(v) => setForm({ ...form, password: v })}
        onBlur={() => setTouched({ ...touched, password: true })}
        invalid={!!(touched.password && errors.password)}
        errorId="password-error"
        errorText={touched.password ? errors.password : ''}
      />
      <button className="btn-primary w-full" disabled={loading || !isValid}>{loading ? 'Signing in...' : 'Sign In'}</button>
    </form>
  )
}

function FieldFloat({ id, type = 'text', label, value, onChange, onBlur, invalid, errorId, errorText }) {
  const [focused, setFocused] = useState(false)
  const hasText = value && String(value).length > 0
  return (
    <div>
      <motion.div
        initial={false}
        animate={{ scale: focused ? 1.01 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative"
      >
        <input
          id={id}
          type={type}
          className={`peer w-full border rounded-lg px-3 py-3 transition placeholder-transparent focus:outline-none focus:ring-0 ${invalid ? 'border-red-500' : 'border-gray-300 focus:border-brand-500'}`}
          placeholder={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); onBlur?.(e) }}
          required
          aria-invalid={invalid}
          aria-describedby={errorId}
        />
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-3 top-3 text-gray-500 transition-all duration-150
            ${focused || hasText ? '-translate-y-3 text-xs text-brand-700' : ''}`}
        >
          {label}
        </label>
      </motion.div>
      {errorText ? <p id={errorId} className="text-xs text-red-600 mt-1">{errorText}</p> : null}
    </div>
  )
}


