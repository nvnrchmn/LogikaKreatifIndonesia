import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@logikraf.id')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, token, loading: authLoading } = useAuth()

  useEffect(() => {
    if (token && !authLoading) {
      const role = localStorage.getItem('role')
      window.location.href = role === 'client' ? '/client/dashboard' : '/admin/dashboard'
    }
  }, [token, authLoading])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const ok = await login(email, password)
      if (!ok) setError('Kredensial tidak valid')
    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-canvas-dark to-canvas-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-border-minimal p-8">
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Logikraf" className="w-14 h-14 object-contain mb-4" />
            <h1 className="text-2xl font-display font-extrabold text-text-main tracking-tight">Admin Portal</h1>
            <p className="text-text-muted text-sm mt-2">Masuk untuk mengelola konten.</p>
          </div>
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">{loading ? 'Memproses...' : 'Masuk'}</button>
          </form>
          <p className="text-xs text-text-muted mt-6 text-center">
            <Link to="/" className="text-brand-primary hover:underline">Kembali ke website</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
