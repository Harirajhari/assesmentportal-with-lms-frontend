import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login, clearError } from '../features/auth/authSlice'
import { Code2, LogIn } from 'lucide-react'
import { Spinner } from '../components/ui'

export default function LoginPage() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { loading, error, token, role } = useSelector(s => s.auth)

  const [form, setForm] = useState({ email: '', password: '' })

  // Redirect if already logged in
  useEffect(() => {
    if (token) navigate(role === 'admin' ? '/admin' : '/', { replace: true })
  }, [token, role, navigate])

  useEffect(() => { dispatch(clearError()) }, [dispatch])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(login(form))
  }

  const fillDemo = (email, password) => setForm({ email, password })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-primary-50 flex items-center justify-center p-4">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 shadow-card-md mb-4">
            <Code2 size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">CodeArena</h1>
          <p className="text-surface-400 mt-1 text-sm">Competitive Programming Platform</p>
        </div>

        {/* Card */}
        <div className="card-md p-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@college.edu"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={set('password')}
                placeholder="••••••••"
                className="input"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-2.5 text-sm justify-center mt-2">
              {loading ? <><Spinner size="sm" /> Signing in…</> : <><LogIn size={15} /> Sign in</>}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 pt-5 border-t border-surface-100">
            <p className="text-xs text-surface-400 text-center mb-3 font-medium">Quick demo access</p>
            <div className="grid grid-cols-3 gap-2">
              <DemoBtn label="Admin" email="admin@platform.com" pass="Admin@123" onClick={fillDemo} />
              <DemoBtn label="Student 1" email="arjun@iitm.ac.in" pass="Student@123" onClick={fillDemo} />
              <DemoBtn label="Student 2" email="vikram@nitt.ac.in" pass="Student@123" onClick={fillDemo} />
            </div>
            <p className="text-xs text-surface-300 text-center mt-2">Click to fill credentials, then sign in</p>
          </div>
        </div>

        <p className="text-center text-surface-300 text-xs mt-6">
          CodeArena © {new Date().getFullYear()} · All rights reserved
        </p>
      </div>
    </div>
  )
}

function DemoBtn({ label, email, pass, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(email, pass)}
      className="text-xs bg-primary-50 hover:bg-primary-100 border border-primary-200 text-primary-700 font-medium px-2 py-2 rounded-lg transition-all text-center"
    >
      {label}
    </button>
  )
}
