import { useEffect, useState } from 'react'

type Inv = {
  id: number
  invoice_number: string
  status: string
  total: number
  paid_amount: number
  outstanding: number
  order_number: string
  project_name: string
  issued_at: string
  due_at: string
  paid_at: string
}

const hdrs = () => ({ Authorization: 'Bearer ' + (localStorage.getItem('token') || '') })
const rp = (n: number) => 'Rp ' + (n || 0).toLocaleString('id-ID')
const chip = (s: string) =>
  s === 'paid'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : s === 'overdue'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-amber-50 text-amber-700 border-amber-200'

export default function ClientInvoicesPage() {
  const [rows, setRows] = useState<Inv[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(0)

  useEffect(() => {
    fetch('/api/client/invoices', { headers: hdrs() })
      .then((r) => (r.ok ? r.json() : { invoices: [] }))
      .then((d) => setRows(d.invoices || []))
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

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-text-main">Invoice</h1>
        <p className="text-text-muted text-sm mt-1.5">
          Riwayat tagihan proyek Anda. Unduh PDF-nya untuk arsip atau keperluan pembukuan.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Memuat…</p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border-minimal shadow-sm p-8 text-center">
          <p className="text-sm text-text-muted">Belum ada invoice untuk akun Anda.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-3xl border border-border-minimal shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display font-bold text-sm text-text-main">{inv.invoice_number}</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${chip(inv.status)}`}>
                    {inv.status}
                  </span>
                </div>
                <p className="text-xs text-text-muted truncate">
                  {inv.project_name || '—'} · {inv.order_number || '-'} · terbit {inv.issued_at}
                  {inv.paid_at ? ' · lunas ' + inv.paid_at : inv.due_at ? ' · jatuh tempo ' + inv.due_at : ''}
                </p>
                <p className="text-xs text-text-main font-bold">
                  {rp(inv.total)}
                  {inv.outstanding > 0 ? (
                    <span className="text-red-600 font-black"> · sisa {rp(inv.outstanding)}</span>
                  ) : (
                    <span className="text-emerald-700 font-black"> · lunas</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => unduh(inv)}
                disabled={busy === inv.id}
                className="btn-primary text-xs py-2.5 px-6 self-start sm:self-auto disabled:opacity-60"
              >
                {busy === inv.id ? 'Menyiapkan…' : 'Unduh PDF'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
