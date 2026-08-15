import { useState, useEffect } from 'react'
import { apiPost } from '../../lib/api'

interface Gateway {
  id: string
  name: string
  active: boolean
  policies?: string
}

export default function PaymentHubPage() {
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [form, setForm] = useState({
    external_id: '',
    amount: '',
    payer_email: '',
    description: '',
  })
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/payment-gateways')
      .then(r => r.json())
      .then(d => setGateways(Array.isArray(d) ? d : []))
      .catch(() => setGateways([]))
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent, id: string) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    setActiveId(id)

    const payload = {
      external_id: form.external_id,
      order_id: form.external_id,
      amount: Number(form.amount),
      email: form.payer_email,
      payer_email: form.payer_email,
      first_name: form.payer_email.split('@')[0] || 'Klien',
      description: form.description || `Tagihan #${form.external_id}`,
    }

    try {
      const endpoint =
        id === 'midtrans'
          ? '/api/payment/midtrans/snap'
          : id === 'ipaymu'
          ? '/api/payment/ipaymu/snap'
          : `/api/payment/${id}/invoice`

      const r = await apiPost(endpoint, payload)
      setResult(r)
    } catch (err: any) {
      setError(err?.message || 'Gagal memproses tagihan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 admin-page pb-12">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-text-main">Payment Hub</h1>
        <p className="text-text-muted text-sm mt-0.5">
          Buat dan kirimkan invoice pembayaran digital QRIS/Gateway secara langsung ke klien.
        </p>
      </div>

      {gateways.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center justify-between">
          <span>⚠️ Belum ada payment gateway yang aktif. Hubungkan Master VA &amp; API Key di menu Pengaturan.</span>
          <a href="/admin/settings" className="font-bold underline ml-3 shrink-0">Buka Pengaturan →</a>
        </div>
      )}

      {gateways.map(g => {
        const isCurrent = activeId === g.id
        const isIPaymu = g.id === 'ipaymu'
        const invoiceUrl =
          result?.invoice_url ||
          result?.redirect_url ||
          result?.payment_url ||
          result?.Data?.Url ||
          result?.url

        return (
          <div
            key={g.id}
            className="bg-white rounded-3xl border border-border-minimal shadow-sm p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-border-minimal pb-4">
              <div className="flex items-center gap-3">
                <span className={`w-3.5 h-3.5 rounded-full ${isIPaymu ? 'bg-emerald-500' : 'bg-brand-primary'}`} />
                <h2 className="font-display font-bold text-lg text-text-main">
                  Buat Tagihan {g.name} {isIPaymu && '(QRIS Instan)'}
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs border border-emerald-200">
                ● Aktif
              </span>
            </div>

            <form onSubmit={e => submit(e, g.id)} className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-text-main mb-1.5 block">
                  Nomor Invoice / Order ID *
                </label>
                <input
                  className="form-input text-sm font-mono"
                  placeholder="INV-20260815-001"
                  required
                  value={form.external_id}
                  onChange={e => set('external_id', e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-main mb-1.5 block">
                  Nominal Pembayaran (Rp) *
                </label>
                <input
                  className="form-input text-sm font-mono"
                  type="number"
                  min="1000"
                  placeholder="500000"
                  required
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-main mb-1.5 block">
                  Email Pembayar / Klien *
                </label>
                <input
                  className="form-input text-sm"
                  type="email"
                  placeholder="klien@perusahaan.com"
                  required
                  value={form.payer_email}
                  onChange={e => set('payer_email', e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-main mb-1.5 block">
                  Deskripsi Layanan / Termin
                </label>
                <input
                  className="form-input text-sm"
                  placeholder="Pembayaran Termin 1 Pembuatan Website"
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={loading && isCurrent}
                  className="btn-primary text-sm py-2.5 px-6 shadow-md shadow-brand-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading && isCurrent ? 'Membuat Invoice...' : `Generate Invoice ${g.name} ⚡`}
                </button>
              </div>
            </form>

            {isCurrent && error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            {isCurrent && result && (
              <div className="rounded-2xl bg-canvas-light p-5 border border-border-minimal space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                    ✓ Invoice Berhasil Dibuat
                  </span>
                  {invoiceUrl && (
                    <a
                      href={invoiceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary text-xs py-1.5 px-3 shadow-sm"
                    >
                      Buka Tautan Pembayaran ↗
                    </a>
                  )}
                </div>
                {invoiceUrl && (
                  <div className="p-3 bg-white rounded-xl border border-border-minimal text-xs font-mono text-text-main break-all">
                    {invoiceUrl}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
