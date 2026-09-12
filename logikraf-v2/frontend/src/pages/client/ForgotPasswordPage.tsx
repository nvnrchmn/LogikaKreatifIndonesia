import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => null)
    const d = (res ? await res.json().catch(() => ({})) : {}) as { message?: string; error?: string }
    setMsg(d.message || d.error || 'Permintaan dikirim — silakan cek email Anda.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-light p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-border-minimal shadow-sm p-8">
        <h1 className="font-display font-black text-2xl text-text-main mb-1">Lupa Kata Sandi</h1>
        <p className="text-sm text-text-muted mb-6">
          Masukkan email akun portal Anda. Kami kirim tautan untuk membuat kata sandi baru (berlaku 1 jam).
        </p>
        {msg && (
          <div className="mb-5 p-4 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 text-xs font-bold text-brand-primary">
            {msg}
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <input
            className="form-input text-sm"
            type="email"
            placeholder="nama@perusahaan.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="btn-primary w-full py-3 text-sm" type="submit" disabled={loading}>
            {loading ? 'Mengirim…' : 'Kirim Tautan Reset'}
          </button>
        </form>
        <p className="text-xs text-text-muted mt-6 text-center">
          Ingat kata sandi Anda?{' '}
          <Link to="/login" className="text-brand-primary font-bold">
            Kembali masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
