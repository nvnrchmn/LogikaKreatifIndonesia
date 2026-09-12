import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { auth } from '../../lib/api'

interface Ticket {
  id: number
  subject: string
  description: string
  priority: string
  status: string
  created_at: string
}

export default function ClientTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium' })
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/client/tickets', { headers: auth() })
      const data = await res.json().catch(() => [])
      if (!res.ok) throw new Error('Gagal memuat tiket')
      setTickets(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat tiket')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/client/tickets', {
        method: 'POST',
        headers: auth(),
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Gagal mengirim tiket')
      setForm({ subject: '', description: '', priority: 'medium' })
      load()
    } catch (err: any) {
      setError(err?.message || 'Gagal mengirim tiket')
    } finally {
      setBusy(false)
    }
  }

  const badge = (s: string) => {
    const map: Record<string, string> = {
      open: 'bg-blue-50 text-blue-700 border-blue-200',
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      closed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    }
    return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${map[s] || 'bg-gray-100 text-gray-700'}`}>{s}</span>
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-text-main">Bantuan &amp; Tiket</h1>
        <p className="text-xs text-text-muted mt-0.5">Ajukan kendala, tim Logikraf akan merespons.</p>
      </div>

      {error && <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">{error}</div>}

      <form onSubmit={submit} className="bg-white rounded-3xl border border-border-minimal shadow-sm p-6 space-y-4">
        <h2 className="font-display font-bold text-base text-text-main">Buka Tiket Baru</h2>
        <div>
          <label className="label">Subjek</label>
          <input className="form-input" type="text" value={form.subject} required onChange={e => setForm({ ...form, subject: e.target.value })} />
        </div>
        <div>
          <label className="label">Deskripsi Kendala</label>
          <textarea className="form-input resize-none" rows={4} value={form.description} required onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="label">Prioritas</label>
          <select className="form-input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button type="submit" disabled={busy} className="btn-primary text-xs py-2.5 px-6">{busy ? 'Mengirim...' : 'Kirim Tiket'}</button>
      </form>

      <div className="bg-white rounded-3xl border border-border-minimal shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border-minimal">
          <h2 className="font-display font-bold text-base text-text-main">Riwayat Tiket</h2>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : tickets.length === 0 ? (
          <p className="p-8 text-center text-sm text-text-muted">Belum ada tiket. Ajukan tiket pertama Anda di atas.</p>
        ) : (
          <div className="divide-y divide-border-minimal">
            {tickets.map(t => (
              <div key={t.id} className="px-6 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-sm text-text-main">{t.subject}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-text-muted font-mono">{t.priority}</span>
                    {badge(t.status)}
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-1 line-clamp-2">{t.description}</p>
                <Link to={'/tickets/' + t.id} className="inline-block mt-2 text-xs font-bold text-brand-primary">
                  Buka percakapan →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
