import { useCallback, useEffect, useState } from 'react'

type Member = {
  id: number
  name: string
  email: string
  scope: string
  status: string
  invite_expires_at?: string | null
  created_at: string
}

const hdrs = (json = false) => {
  const h: Record<string, string> = { Authorization: 'Bearer ' + (localStorage.getItem('token') || '') }
  if (json) h['Content-Type'] = 'application/json'
  return h
}

const scopeLabel = (s: string) => (s === 'ops' ? 'Operasional' : 'Penuh (Pemilik)')

const statusChip = (s: string) =>
  s === 'active'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : s === 'invited'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-red-50 text-red-700 border-red-200'

const statusLabel = (s: string) => (s === 'active' ? 'aktif' : s === 'invited' ? 'undangan tertunda' : 'akses dicabut')

export default function AdminTeamPage() {
  const [rows, setRows] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [scope, setScope] = useState('ops')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [link, setLink] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/team', { headers: hdrs() })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) { setErr(d.error || 'Gagal memuat daftar tim.'); setRows([]); return }
      setRows(d.members || [])
      setErr('')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const post = async (url: string, body?: unknown, method = 'POST') => {
    setBusy(true); setErr(''); setInfo('')
    try {
      const r = await fetch(url, { method, headers: hdrs(!!body), body: body ? JSON.stringify(body) : undefined })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) { setErr(d.error || 'Aksi gagal.'); return null }
      return d
    } finally {
      setBusy(false)
    }
  }

  const invite = async (e: React.FormEvent) => {
    e.preventDefault()
    const d = await post('/api/team/invite', { name, email, scope })
    if (!d) return
    setLink(d.invite_link || '')
    setInfo(d.email_sent ? 'Undangan dibuat dan email terkirim.' : 'Undangan dibuat, tapi email gagal terkirim — salin tautannya manual.')
    setName(''); setEmail('')
    await load()
  }

  const act = async (id: number, action: 'resend' | 'revoke' | 'restore') => {
    const d = await post(`/api/team/${id}/${action}`)
    if (!d) return
    if (action === 'resend') { setLink(d.invite_link || ''); setInfo('Tautan undangan diperbarui dan dikirim ulang.') }
    else setInfo(action === 'revoke' ? 'Akses dicabut.' : 'Akses diaktifkan kembali.')
    await load()
  }

  const changeScope = async (id: number, s: string) => {
    const d = await post(`/api/team/${id}`, { scope: s }, 'PATCH')
    if (!d) return
    setInfo('Tingkat akses diperbarui.')
    await load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-text-main">Tim &amp; Akses</h1>
        <p className="text-text-muted text-sm mt-1.5">
          Undang anggota tim ke panel ini dan tentukan modul yang boleh mereka buka.
          <strong> Penuh</strong>: semua modul. <strong>Operasional</strong>: semua kecuali Keuangan &amp; Sistem (termasuk halaman ini).
        </p>
      </div>

      {err && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">{err}</p>}
      {info && <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">{info}</p>}

      {link && (
        <div className="bg-white rounded-3xl border border-border-minimal shadow-sm p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Tautan undangan</p>
          <div className="mt-2 flex flex-col sm:flex-row gap-2">
            <input readOnly value={link} className="flex-1 rounded-xl border border-border-minimal px-3 py-2 text-xs" />
            <button type="button" onClick={() => navigator.clipboard?.writeText(link)}
              className="rounded-xl border border-border-minimal px-4 py-2 text-sm font-semibold">Salin</button>
          </div>
          <p className="text-xs text-text-muted mt-2">Berlaku 7 hari. Tautan ini juga dikirim ke email yang diundang.</p>
        </div>
      )}

      <form onSubmit={invite} className="bg-white rounded-3xl border border-border-minimal shadow-sm p-5 space-y-3">
        <p className="font-display font-bold text-text-main">Undang anggota baru</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama"
            className="rounded-xl border border-border-minimal px-3 py-2 text-sm" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.id" type="email" required
            className="rounded-xl border border-border-minimal px-3 py-2 text-sm" />
          <select value={scope} onChange={(e) => setScope(e.target.value)}
            className="rounded-xl border border-border-minimal px-3 py-2 text-sm">
            <option value="ops">Operasional (tanpa Keuangan &amp; Sistem)</option>
            <option value="full">Penuh (Pemilik)</option>
          </select>
        </div>
        <button disabled={busy} type="submit"
          className="rounded-xl bg-blue-600 text-white font-semibold px-5 py-2.5 text-sm disabled:opacity-50">
          {busy ? 'Memproses\u2026' : 'Kirim undangan'}
        </button>
      </form>

      <div className="bg-white rounded-3xl border border-border-minimal shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border-minimal">
          <p className="font-display font-bold text-text-main">Anggota ({rows.length})</p>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-text-muted">Memuat\u2026</p>
        ) : rows.length === 0 ? (
          <p className="p-5 text-sm text-text-muted">Belum ada anggota.</p>
        ) : (
          <ul className="divide-y divide-border-minimal">
            {rows.map((m) => (
              <li key={m.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-text-main">{m.name || m.email}</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${statusChip(m.status)}`}>
                      {statusLabel(m.status)}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-1 truncate">{m.email}</p>
                  {m.status === 'invited' && m.invite_expires_at && (
                    <p className="text-xs text-text-muted">Tautan berlaku sampai {String(m.invite_expires_at).slice(0, 10)}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={m.scope} onChange={(e) => changeScope(m.id, e.target.value)} disabled={busy}
                    className="rounded-xl border border-border-minimal px-3 py-1.5 text-xs">
                    <option value="ops">{scopeLabel('ops')}</option>
                    <option value="full">{scopeLabel('full')}</option>
                  </select>
                  {m.status === 'invited' && (
                    <button type="button" onClick={() => act(m.id, 'resend')} disabled={busy}
                      className="rounded-xl border border-border-minimal px-3 py-1.5 text-xs font-semibold">Kirim ulang</button>
                  )}
                  {m.status === 'active' ? (
                    <button type="button" onClick={() => act(m.id, 'revoke')} disabled={busy}
                      className="rounded-xl border border-red-200 text-red-600 px-3 py-1.5 text-xs font-semibold">Cabut akses</button>
                  ) : (
                    <button type="button" onClick={() => act(m.id, 'restore')} disabled={busy}
                      className="rounded-xl border border-border-minimal px-3 py-1.5 text-xs font-semibold">Aktifkan</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
