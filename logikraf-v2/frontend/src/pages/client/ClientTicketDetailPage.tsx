import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

type Reply = { id: number; author: string; author_name: string; body: string; created_at: string }
type Ticket = {
  id: number
  subject: string
  description: string
  priority: string
  status: string
  created_at: string
  order_id?: number | null
}

const hdrs = (json = false) => {
  const t = localStorage.getItem('token') || ''
  return json
    ? { 'Content-Type': 'application/json', Authorization: 'Bearer ' + t }
    : { Authorization: 'Bearer ' + t }
}

const when = (s: string) => (s ? new Date(s).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '')

export default function ClientTicketDetailPage() {
  const { id = '' } = useParams()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [body, setBody] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = () =>
    fetch('/api/client/tickets/' + id, { headers: hdrs() })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setTicket(d.ticket)
          setReplies(d.replies || [])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const kirim = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr('')
    setMsg('')
    if (!body.trim()) {
      setErr('Tulis balasan dulu.')
      return
    }
    setBusy(true)
    const res = await fetch('/api/client/tickets/' + id + '/replies', {
      method: 'POST',
      headers: hdrs(true),
      body: JSON.stringify({ body }),
    }).catch(() => null)
    setBusy(false)
    if (res && res.ok) {
      setBody('')
      setMsg('Balasan terkirim. Tim Logikraf akan segera menanggapi.')
      load()
    } else {
      const d = (res ? await res.json().catch(() => ({})) : {}) as { error?: string }
      setErr(d.error || 'Gagal mengirim balasan.')
    }
  }

  if (loading) return <p className="text-sm text-text-muted">Memuat…</p>
  if (!ticket)
    return (
      <div className="bg-white rounded-3xl border border-border-minimal shadow-sm p-8 text-center space-y-3">
        <p className="text-sm text-text-muted">Tiket tidak ditemukan atau bukan milik akun Anda.</p>
        <Link to="/tickets" className="text-xs font-bold text-brand-primary">
          ← Kembali ke daftar tiket
        </Link>
      </div>
    )

  return (
    <div className="space-y-6">
      <div>
        <Link to="/tickets" className="text-xs font-bold text-brand-primary">
          ← Kembali ke daftar tiket
        </Link>
        <h1 className="font-display font-black text-xl sm:text-2xl text-text-main mt-2">{ticket.subject}</h1>
        <p className="text-xs text-text-muted mt-1">
          Tiket #{ticket.id} · {ticket.priority} · status <b className="uppercase">{ticket.status}</b> · dibuka {when(ticket.created_at)}
          {ticket.order_id ? ' · pesanan #' + ticket.order_id : ''}
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">{msg}</div>
      )}
      {err && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">{err}</div>
      )}

      <div className="space-y-4">
        <div className="bg-white rounded-3xl border border-border-minimal shadow-sm p-5 sm:p-6">
          <p className="text-[11px] font-black uppercase tracking-wider text-text-muted mb-2">Pesan awal</p>
          <p className="text-sm text-text-main whitespace-pre-wrap">{ticket.description}</p>
        </div>

        {replies.map((r) => (
          <div
            key={r.id}
            className={
              'rounded-3xl border shadow-sm p-5 sm:p-6 ' +
              (r.author === 'admin'
                ? 'bg-brand-primary/5 border-brand-primary/20'
                : 'bg-white border-border-minimal')
            }
          >
            <p className="text-[11px] font-black uppercase tracking-wider text-text-muted mb-2">
              {r.author === 'admin' ? r.author_name || 'Tim Logikraf' : 'Anda'} · {when(r.created_at)}
            </p>
            <p className="text-sm text-text-main whitespace-pre-wrap">{r.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={kirim} className="bg-white rounded-3xl border border-border-minimal shadow-sm p-5 sm:p-6 space-y-4">
        <div>
          <label className="label">Balas Tiket</label>
          <textarea
            className="form-input text-sm min-h-[110px]"
            placeholder="Tulis tanggapan atau informasi tambahan…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <button className="btn-primary text-xs py-2.5 px-6" type="submit" disabled={busy}>
          {busy ? 'Mengirim…' : 'Kirim Balasan'}
        </button>
      </form>
    </div>
  )
}
