import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setMsg('')
    if (pw.length < 8) {
      setErr('Kata sandi minimal 8 karakter.')
      return
    }
    if (pw !== pw2) {
      setErr('Konfirmasi kata sandi tidak sama.')
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: pw }),
    }).catch(() => null)
    const d = (res ? await res.json().catch(() => ({})) : {}) as { error?: string }
    setLoading(false)
    if (res && res.ok) {
      setMsg('Kata sandi berhasil diubah. Silakan masuk memakai kata sandi baru Anda.')
      setPw('')
      setPw2('')
    } else {
      setErr(d.error || 'Tautan reset tidak valid atau sudah kedaluwarsa.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-light p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-border-minimal shadow-sm p-8">
        <h1 className="font-display font-black text-2xl text-text-main mb-1">Buat Kata Sandi Baru</h1>
        <p className="text-sm text-text-muted mb-6">Masukkan kata sandi baru untuk akun portal Logikraf Anda.</p>
        {msg && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">{msg}</div>
        )}
        {err && (
          <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">{err}</div>
        )}
        {!token && !msg && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
            Tautan tidak memuat token. Silakan minta tautan reset baru.
          </div>
        )}
        <form onSubmit={submit} className="space-y-4">
          <input
            className="form-input text-sm"
            type="password"
            placeholder="Kata sandi baru (min. 8 karakter)"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            required
          />
          <input
            className="form-input text-sm"
            type="password"
            placeholder="Ulangi kata sandi baru"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            required
          />
          <button className="btn-primary w-full py-3 text-sm" type="submit" disabled={loading}>
            {loading ? 'Menyimpan…' : 'Simpan Kata Sandi Baru'}
          </button>
        </form>
        <p className="text-xs text-text-muted mt-6 text-center">
          <Link to="/login" className="text-brand-primary font-bold">
            Masuk ke portal
          </Link>{' '}
          ·{' '}
          <Link to="/forgot-password" className="text-brand-primary font-bold">
            Minta tautan baru
          </Link>
        </p>
      </div>
    </div>
  )
}
