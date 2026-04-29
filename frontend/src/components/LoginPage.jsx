import { useState } from 'react'
import { API_BASE } from '../constants'

const DEMO_CREDENTIALS = {
  student: [
    { email: 'aarav@student.edu', password: 'pass123', name: 'Aarav Mehta' },
    { email: 'sneha@student.edu', password: 'pass456', name: 'Sneha Patel' },
    { email: 'rohan@student.edu', password: 'pass789', name: 'Rohan Verma' },
  ],
  moderator: [
    { email: 'priya@college.edu', password: 'mod123', name: 'Dr. Priya Sharma' },
    { email: 'arjun@college.edu', password: 'mod456', name: 'Prof. Arjun Nair' },
  ],
}

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState('student')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fillDemo = (cred) => {
    setEmail(cred.email)
    setPassword(cred.password)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Email and password cannot be empty')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed. Please check your credentials.')
      onLogin(data)
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 font-bold text-lg">C</div>
            <span className="text-2xl font-bold text-zinc-100">ClubConnect</span>
          </div>
          <p className="mt-2 text-sm text-zinc-400">College Event Management System</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-[0_0_60px_rgba(16,185,129,0.06)]">
          <h2 className="text-xl font-semibold text-zinc-100">Sign in to your account</h2>
          <p className="mt-1 text-sm text-zinc-400">Choose your role and enter credentials</p>

          {/* Role Toggle */}
          <div className="mt-5 flex rounded-xl border border-zinc-700 bg-zinc-950 p-1">
            {['student', 'moderator'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError('') }}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                  role === r
                    ? r === 'student'
                      ? 'bg-emerald-500 text-zinc-950'
                      : 'bg-cyan-400 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {r === 'student' ? '🎓 Student' : '🛡️ Moderator'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-zinc-100 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-zinc-100 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg py-2.5 font-medium transition disabled:opacity-60 ${
                role === 'student'
                  ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
                  : 'bg-cyan-400 text-zinc-950 hover:bg-cyan-300'
              }`}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>


        </div>

        <p className="mt-4 text-center text-xs text-zinc-600">
          DAA-T160 · Heap Top-K · KMP Search · Greedy Scheduling
        </p>
      </div>
    </div>
  )
}
