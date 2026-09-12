import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ClientRegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', invite_code: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await fetch('/api/client/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Registrasi gagal')
      setSuccess('Registrasi berhasil! Silakan login.')
      setForm({ name: '', email: '', password: '', invite_code: '' })
    } catch (err: any) {
      setError(err?.message || 'Terjadi kesalahan jaringan')
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
            <h1 className="text-2xl font-display font-extrabold text-text-main tracking-tight">Daftar Client Portal</h1>
            <p className="text-text-muted text-sm mt-2">Masukkan kode undangan dari tim Logikraf.</p>
          </div>
          {error && <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
          {success && <div className="mb-6 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{success}</div>}
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label">Nama Lengkap</label>
              <input className="form-input" type="text" value={form.name} onChange={set('name')} required autoFocus />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="form-input" type="password" value={form.password} onChange={set('password')} minLength={8} required placeholder="Minimal 8 karakter" />
            </div>
            <div>
              <label className="label">Kode Undangan</label>
              <input className="form-input font-mono uppercase" type="text" value={form.invite_code} onChange={set('invite_code')} required placeholder="contoh: A1B2C3" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? 'Memproses...' : 'Daftar'}
            </button>
          </form>
          <p className="text-xs text-text-muted mt-6 text-center">
            Sudah punya akun? <Link to="/login" className="text-brand-primary hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
