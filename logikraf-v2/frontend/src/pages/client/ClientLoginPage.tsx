import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function ClientLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, token, loading: authLoading } = useAuth()

  useEffect(() => {
    if (token && !authLoading) {
      const role = localStorage.getItem('role')
      const p = window.location.pathname.startsWith('/client') ? '/client' : ''
      window.location.href = role === 'client' ? p + '/dashboard' : '/admin/dashboard'
    }
  }, [token, authLoading])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const ok = await login(email, password)
      if (!ok) setError('Email atau password salah')
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
            <h1 className="text-2xl font-display font-extrabold text-text-main tracking-tight">Client Portal</h1>
            <p className="text-text-muted text-sm mt-2">Masuk untuk memantau proyek Anda.</p>
          </div>
          {error && <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs font-bold text-brand-primary hover:underline">Lupa kata sandi?</Link>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">{loading ? 'Memproses...' : 'Masuk'}</button>
          </form>
          <p className="text-xs text-text-muted mt-6 text-center">
            Belum punya akun? <Link to="/client/register" className="text-brand-primary hover:underline">Daftar dengan kode undangan</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
