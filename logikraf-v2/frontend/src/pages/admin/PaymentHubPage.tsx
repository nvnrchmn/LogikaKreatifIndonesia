import { useState, useEffect } from 'react'
import { apiPost } from '../../lib/api'

interface Gateway { id: string; name: string; active: boolean; policies?: string }

export default function PaymentHubPage() {
  const [gateways, setGateways] = useState<Gateway[]>([])
  const [form, setForm] = useState({ external_id: '', amount: '', payer_email: '', description: '' })
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/payment-gateways').then(r => r.json()).then(d => setGateways(Array.isArray(d) ? d : [])).catch(() => setGateways([]))
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent, id: string) => {
    e.preventDefault()
    setLoading(true); setError(''); setResult(null); setActiveId(id)
    try {
      const endpoint = id === 'midtrans' ? '/api/payment/midtrans/snap' : `/api/payment/${id}/invoice`
      const r = await apiPost(endpoint, { ...form, amount: Number(form.amount) })
      setResult(r)
    } catch (err: any) {
      setError(err?.message || 'Gagal memproses pembayaran')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-text-main">Payment Hub</h1>
        <p className="text-text-muted text-sm mt-0.5">Buat dan kelola invoice pembayaran untuk klien.</p>
      </div>

      {gateways.length === 0 && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          Belum ada payment gateway yang aktif. Hubungkan gateway di pengaturan.
        </div>
      )}

      {gateways.map(g => (
        <div key={g.id} className="bg-white rounded-2xl border border-border-minimal shadow-sm p-6">
          <h2 className="font-display font-bold text-text-main mb-4">Buat Invoice {g.name}</h2>

          {g.id === 'midtrans' ? (
            <p className="text-sm text-text-muted">
              {g.policies
                ? `${g.name} terhubung. Snap.js aktif saat server key dikonfigurasi.`
                : `${g.name} terhubung.`}
            </p>
          ) : (
            <form onSubmit={e => submit(e, g.id)} className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="label">External ID</label>
                <input className="form-input" placeholder="INV-001" required value={form.external_id} onChange={e => set('external_id', e.target.value)} />
              </div>
              <div className="sm:col-span-1">
                <label className="label">Amount (IDR)</label>
                <input className="form-input" type="number" min="1" placeholder="100000" required value={form.amount} onChange={e => set('amount', e.target.value)} />
              </div>
              <div className="sm:col-span-1">
                <label className="label">Payer Email</label>
                <input className="form-input" type="email" placeholder="client@email.com" required value={form.payer_email} onChange={e => set('payer_email', e.target.value)} />
              </div>
              <div className="sm:col-span-1">
                <label className="label">Deskripsi</label>
                <input className="form-input" placeholder="Pembayaran milestone 1" value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <button disabled={loading} className="btn-primary sm:col-span-2">
                {loading && activeId === g.id ? 'Memproses...' : 'Buat Invoice'}
              </button>
            </form>
          )}

          {activeId === g.id && error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}
          {activeId === g.id && result && (
            <div className="mt-4 rounded-xl bg-canvas-light p-4 text-sm">
              {result.invoice_url && (
                <a href={result.invoice_url} target="_blank" rel="noreferrer" className="font-semibold text-brand-primary underline">
                  Buka halaman pembayaran
                </a>
              )}
              <pre className="mt-3 overflow-x-auto text-xs text-text-muted">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
