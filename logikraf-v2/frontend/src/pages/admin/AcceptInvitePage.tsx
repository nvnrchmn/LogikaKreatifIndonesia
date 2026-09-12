import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

// AcceptInvitePage — halaman publik untuk menerima undangan anggota tim.
// Token diambil dari query string, lalu pengguna membuat passwordnya sendiri.
export default function AcceptInvitePage() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const token = params.get('token') || ''
  const [name, setName] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!token) setErr('Tautan undangan tidak lengkap (token tidak ada).')
  }, [token])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(''); setMsg('')
    if (pw.length < 8) { setErr('Password minimal 8 karakter.'); return }
    if (pw !== pw2) { setErr('Konfirmasi password tidak sama.'); return }
    setBusy(true)
    try {
      const r = await fetch('/api/auth/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name, password: pw }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) { setErr(d.error || 'Undangan tidak bisa diaktifkan.'); return }
      setMsg('Akun aktif. Mengalihkan ke halaman masuk…')
      setTimeout(() => nav('/admin/login'), 1200)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-soft px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-3xl border border-border-minimal shadow-sm p-7 space-y-4">
        <h1 className="font-display font-black text-xl text-text-main">Aktifkan Akses Panel</h1>
        <p className="text-sm text-text-muted">
          Buat password untuk akun Anda. Setelah aktif, Anda bisa masuk lewat halaman login admin.
        </p>
        {err && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{err}</p>}
        {msg && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">{msg}</p>}
        <label className="block text-sm">
          <span className="text-text-muted">Nama</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda"
            className="mt-1 w-full rounded-xl border border-border-minimal px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-text-muted">Password baru (min. 8 karakter)</span>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border-minimal px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="text-text-muted">Ulangi password</span>
          <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border-minimal px-3 py-2" />
        </label>
        <button disabled={busy || !token} type="submit"
          className="w-full rounded-xl bg-blue-600 text-white font-semibold py-2.5 disabled:opacity-50">
          {busy ? 'Memproses…' : 'Aktifkan akun'}
        </button>
      </form>
    </div>
  )
}
