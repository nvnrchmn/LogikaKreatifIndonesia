import { useEffect, useState } from 'react'

const auth = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
})

interface InvoiceRow {
  id: number
  invoice_number: string
  total: number
  paid_amount: number
  outstanding: number
  days_overdue: number
  status: string
  due_date: string | null
  client_name: string
  order_number: string
}

interface Bucket {
  label: string
  count: number
  total: number
  items: InvoiceRow[]
}

interface Receivables {
  total_outstanding: number
  overdue_outstanding: number
  invoice_count: number
  buckets: Bucket[]
}

const rp = (n: number) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

// Buckets escalate in urgency, so colour escalates with them.
const bucketTone = (label: string) => {
  if (label.startsWith('Belum')) return { bar: 'bg-gray-300', text: 'text-text-main', ring: 'border-border-minimal' }
  if (label.startsWith('1-30')) return { bar: 'bg-amber-500', text: 'text-amber-700', ring: 'border-amber-200' }
  if (label.startsWith('31-60')) return { bar: 'bg-orange-500', text: 'text-orange-700', ring: 'border-orange-200' }
  return { bar: 'bg-rose-500', text: 'text-rose-700', ring: 'border-rose-200' }
}

export default function ReceivablesPage() {
  const [data, setData] = useState<Receivables | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/receivables', { headers: auth() })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d?.error || 'Gagal memuat data piutang')
      setData(d)
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data piutang')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Ages issued invoices past their due date to "overdue" before re-reading,
  // so the page reflects today rather than whatever status was last written.
  const refreshStatuses = async () => {
    setRefreshing(true)
    try {
      await fetch('/api/invoices/refresh-status', { method: 'POST', headers: auth() })
      await load()
    } finally {
      setRefreshing(false)
    }
  }

  // Sends reminders only for invoices whose cadence falls due today
  // (3 days before due, on due, then day 1/3/7/14 and every 14 days after).
  const sendReminders = async () => {
    setSending(true)
    setSendResult('')
    try {
      const res = await fetch('/api/invoices/send-reminders', { method: 'POST', headers: auth() })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d?.error || 'Gagal mengirim pengingat')
      setSendResult(
        `${d.sent} terkirim, ${d.skipped} dilewati, ${d.failed} gagal (dari ${d.checked} invoice belum lunas).`
      )
      await load()
    } catch (err: any) {
      setSendResult(err?.message || 'Gagal mengirim pengingat')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-56 bg-gray-100 rounded animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-border-minimal animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-3xl border border-border-minimal animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl border border-border-minimal p-8 text-center">
        <p className="text-text-main font-semibold text-sm mb-2">{error}</p>
        <button onClick={load} className="btn-primary text-xs py-2 px-4">Coba Lagi</button>
      </div>
    )
  }

  const d = data!
  const onTime = d.total_outstanding - d.overdue_outstanding

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-text-main text-lg">Piutang Klien</h2>
          <p className="text-text-muted text-xs mt-0.5">
            Tagihan yang belum lunas, dikelompokkan berdasarkan lama keterlambatan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={sendReminders}
            disabled={sending || d.invoice_count === 0}
            className="btn-primary text-xs py-2 px-4 disabled:opacity-50"
          >
            {sending ? 'Mengirim…' : 'Kirim Pengingat Jatuh Tempo'}
          </button>
          <button
            onClick={refreshStatuses}
            disabled={refreshing}
            className="btn-secondary text-xs py-2 px-4 disabled:opacity-50"
          >
            {refreshing ? 'Memperbarui…' : 'Perbarui Status Jatuh Tempo'}
          </button>
        </div>
      </div>

      {sendResult && (
        <p className="text-xs bg-blue-50 border border-blue-200 text-blue-800 rounded-xl px-4 py-2.5">
          {sendResult}
        </p>
      )}

      {/* Summary: total owed, how much is already late, how much is still on time */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-2xl border border-border-minimal shadow-sm p-4">
          <p className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">Total Piutang</p>
          <p className="font-mono font-bold text-text-main text-xl mt-1">{rp(d.total_outstanding)}</p>
          <p className="text-[11px] text-text-muted mt-1">{d.invoice_count} invoice belum lunas</p>
        </div>
        <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-4">
          <p className="text-[11px] uppercase tracking-wider text-rose-700 font-semibold">Sudah Jatuh Tempo</p>
          <p className="font-mono font-bold text-rose-700 text-xl mt-1">{rp(d.overdue_outstanding)}</p>
          <p className="text-[11px] text-text-muted mt-1">perlu ditagih segera</p>
        </div>
        <div className="bg-white rounded-2xl border border-border-minimal shadow-sm p-4">
          <p className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">Belum Jatuh Tempo</p>
          <p className="font-mono font-bold text-text-main text-xl mt-1">{rp(onTime)}</p>
          <p className="text-[11px] text-text-muted mt-1">masih dalam tenggat</p>
        </div>
      </div>

      {d.invoice_count === 0 ? (
        <div className="bg-white rounded-3xl border border-border-minimal p-12 text-center">
          <p className="text-text-main font-semibold text-sm mb-1">Tidak ada piutang.</p>
          <p className="text-text-muted text-xs">
            Semua invoice yang sudah dikirim ke klien berstatus lunas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {d.buckets
            .filter(b => b.count > 0)
            .map(b => {
              const tone = bucketTone(b.label)
              return (
                <div key={b.label} className={`bg-white rounded-3xl border shadow-sm overflow-hidden ${tone.ring}`}>
                  <div className="flex items-center justify-between gap-3 px-5 py-3 bg-canvas-overlay/60 border-b border-border-minimal">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2 h-2 rounded-full ${tone.bar}`} />
                      <span className="font-bold text-text-main text-sm">{b.label}</span>
                      <span className="text-[11px] text-text-muted">({b.count} invoice)</span>
                    </div>
                    <span className={`font-mono font-bold text-sm ${tone.text}`}>{rp(b.total)}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-border-minimal text-left">
                          <th className="font-bold text-text-main py-2.5 px-4">Invoice</th>
                          <th className="font-bold text-text-main py-2.5 px-4">Klien</th>
                          <th className="font-bold text-text-main py-2.5 px-4">Jatuh Tempo</th>
                          <th className="font-bold text-text-main py-2.5 px-4 text-right">Sisa Tagihan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-minimal">
                        {b.items.map(it => (
                          <tr key={it.id} className="hover:bg-canvas-light/60 transition-colors">
                            <td className="py-2.5 px-4">
                              <span className="font-mono font-bold text-text-main">{it.invoice_number}</span>
                              {it.order_number && (
                                <span className="block text-[11px] text-text-muted font-mono">{it.order_number}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-text-main">{it.client_name || '—'}</td>
                            <td className="py-2.5 px-4">
                              <span className="text-text-main">
                                {it.due_date ? new Date(it.due_date).toLocaleDateString('id-ID') : '—'}
                              </span>
                              {it.days_overdue > 0 && (
                                <span className="block text-[11px] font-bold text-rose-600">
                                  telat {it.days_overdue} hari
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <span className="font-mono font-bold text-text-main">{rp(it.outstanding)}</span>
                              <span className="block text-[11px] text-text-muted font-mono">
                                dari {rp(it.total)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
