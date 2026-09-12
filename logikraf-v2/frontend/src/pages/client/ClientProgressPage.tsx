import { useEffect, useState } from 'react'

type Termin = { name: string; amount: number; status: string; paid_at: string }
type Inv = { id: number; invoice_number: string; status: string; total: number; paid_amount: number; due_at: string }
type Proj = {
  id: number
  name: string
  description: string
  status: string
  stage: number
  start_date: string
  deadline: string
  live_url: string
  order_number: string
  order_total: number
  order_paid: number
  note: string
  termins: Termin[]
  invoices: Inv[]
}

const STAGES = ['Perencanaan', 'Pengerjaan', 'Review', 'Selesai']
const PCT = [15, 50, 80, 100]

const hdrs = () => ({ Authorization: 'Bearer ' + (localStorage.getItem('token') || '') })
const rp = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID')
const statusLabel = (s: string) =>
  ({ planning: 'Perencanaan', in_progress: 'Dikerjakan', review: 'Review', completed: 'Selesai', on_hold: 'Ditahan', cancelled: 'Dibatalkan' } as Record<string, string>)[s] || s

export default function ClientProgressPage() {
  const [rows, setRows] = useState<Proj[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(0)

  useEffect(() => {
    fetch('/api/client/progress', { headers: hdrs() })
      .then((r) => (r.ok ? r.json() : { projects: [] }))
      .then((d) => setRows(d.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const unduh = async (inv: Inv) => {
    setBusy(inv.id)
    const r = await fetch('/api/client/invoices/' + inv.id + '/pdf', { headers: hdrs() }).catch(() => null)
    setBusy(0)
    if (!r || !r.ok) return
    const b = await r.blob()
    const u = URL.createObjectURL(b)
    const a = document.createElement('a')
    a.href = u
    a.download = 'Invoice-' + inv.invoice_number + '.pdf'
    a.click()
    URL.revokeObjectURL(u)
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-3xl animate-pulse" />)}</div>
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-text-main">Progres Proyek</h1>
        <p className="text-text-muted text-sm mt-1.5">Pantau tahap pengerjaan, termin pembayaran, dan invoice tiap proyek Anda.</p>
      </div>

      {rows.length === 0 && (
        <div className="bg-white rounded-3xl border border-border-minimal p-8 text-center">
          <p className="text-sm text-text-muted">Belum ada proyek yang berjalan. Proyek akan muncul di sini setelah pesanan diproses.</p>
        </div>
      )}

      {rows.map((p) => (
        <div key={p.id} className="bg-white rounded-3xl border border-border-minimal shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-display font-bold text-lg text-text-main truncate">{p.name}</h2>
              {p.description && <p className="text-xs text-text-muted mt-1 line-clamp-2">{p.description}</p>}
              {p.order_number && <p className="text-[11px] text-text-muted font-mono mt-1">{p.order_number}</p>}
            </div>
            <span className="shrink-0 px-3 py-1 rounded-full text-[11px] font-bold bg-brand-primary/5 text-brand-primary border border-brand-primary/20">
              {statusLabel(p.status)}
            </span>
          </div>

          {p.stage < 0 ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800">
              Proyek ini sedang di luar alur normal ({statusLabel(p.status)}). Hubungi tim Logikraf bila perlu penjelasan.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-primary rounded-full transition-all" style={{ width: PCT[p.stage] + '%' }} />
              </div>
              <div className="grid grid-cols-4 gap-1">
                {STAGES.map((s, i) => (
                  <div key={s} className="text-center">
                    <div className={'mx-auto w-3 h-3 rounded-full mb-1.5 ' + (i <= p.stage ? 'bg-brand-primary' : 'bg-gray-200')} />
                    <p className={'text-[10px] sm:text-[11px] leading-tight ' + (i <= p.stage ? 'text-text-main font-bold' : 'text-text-muted')}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-text-muted">
            {p.start_date && <span>Mulai: <b className="text-text-main">{p.start_date}</b></span>}
            {p.deadline && <span>Target selesai: <b className="text-text-main">{p.deadline}</b></span>}
            {p.note && <span>Tahap saat ini: <b className="text-text-main">{p.note}</b></span>}
          </div>

          {p.live_url && (
            <a href={p.live_url} target="_blank" rel="noreferrer" className="inline-block text-xs font-bold text-brand-primary">
              Lihat hasil / situs live →
            </a>
          )}

          {p.termins.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-sm text-text-main mb-3">Termin Pembayaran</h3>
              <div className="divide-y divide-border-minimal border border-border-minimal rounded-2xl overflow-hidden">
                {p.termins.map((t, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-main truncate">{t.name}</p>
                      {t.paid_at && <p className="text-[11px] text-text-muted mt-0.5">Dibayar {t.paid_at}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-text-main">{rp(t.amount)}</p>
                      <p className={'text-[11px] font-bold ' + (t.status === 'settled' || t.status === 'paid' ? 'text-emerald-600' : 'text-amber-600')}>
                        {t.status === 'settled' || t.status === 'paid' ? 'Lunas' : 'Menunggu'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {p.order_total > 0 && (
                <p className="text-xs text-text-muted mt-2">
                  Terbayar <b className="text-text-main">{rp(p.order_paid)}</b> dari <b className="text-text-main">{rp(p.order_total)}</b>
                </p>
              )}
            </div>
          )}

          {p.invoices.length > 0 && (
            <div>
              <h3 className="font-display font-bold text-sm text-text-main mb-3">Invoice</h3>
              <div className="flex flex-wrap gap-2">
                {p.invoices.map((iv) => (
                  <button
                    key={iv.id}
                    onClick={() => unduh(iv)}
                    disabled={busy === iv.id}
                    className="px-4 py-2 rounded-xl border border-border-minimal text-xs font-bold text-text-main hover:border-brand-primary disabled:opacity-50"
                  >
                    {busy === iv.id ? 'Menyiapkan…' : 'Unduh ' + iv.invoice_number}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
