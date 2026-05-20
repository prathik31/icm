import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AlertMessage from '../components/AlertMessage'
import Card from '../components/ui/Card'

const Login = () => {
  const { login, loading, error, setError, token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (token) {
      navigate('/dashboard')
    }
  }, [token, navigate])

  const handleChange = (event) => {
    if (error) setError(null)
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage(null)
    try {
      await login(form)
      navigate('/dashboard')
    } catch (err) {
      setMessage(err?.message || 'Unable to login. Please check your credentials.')
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-96px)] max-w-3xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <Card className="w-full max-w-xl" title="Sign in to Telecom Change Management">
        <p className="mt-2 text-sm text-slate-600">Access the enterprise change workflow, risk assessments, and approval dashboards.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {(message || error) && <AlertMessage type="error" message={message || error} />}
          <label className="block space-y-3">
            <span className="text-sm font-medium text-slate-700">Email address</span>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />
          </label>
          <label className="block space-y-3">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          New to the platform?{' '}
          <Link to="/register" className="font-semibold text-slate-900 hover:text-slate-700">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default Login
