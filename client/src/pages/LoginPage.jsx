import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    const creds = {
      admin: { email: 'admin@vortex26.com', password: 'Admin@vortex26' },
      gate: { email: 'gate@vortex26.com', password: 'Admin@vortex26' },
      housing: { email: 'housing@vortex26.com', password: 'Admin@vortex26' },
    }
    setForm(creds[role])
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">VORTEX'26 EMS</h1>
          <p className="text-gray-400 text-sm">Event Operations Control Center</p>
          <p className="text-gray-500 text-xs">National Symposium — Authorized Personnel Only</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass-card p-7 space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@vortex26.com"
              className="input-field"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="input-field pr-10"
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2.5 text-sm">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Authenticating...</> : 'Sign In to Control Center'}
          </button>
        </form>

        {/* Demo credentials */}
        <div className="glass-card p-4 space-y-2">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wide text-center">Demo Accounts</p>
          <div className="grid grid-cols-3 gap-2">
            {[['admin','Super Admin'],['gate','Gate Staff'],['housing','Housing']].map(([r,l]) => (
              <button key={r} onClick={() => fillDemo(r)}
                className="text-xs py-1.5 px-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-md transition-colors">
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

