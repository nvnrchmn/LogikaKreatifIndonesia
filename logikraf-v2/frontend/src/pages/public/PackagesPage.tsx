import { useEffect, useState } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'

interface Package {
  id: number
  name: string
  tagline: string
  price: number
  formatted_price: string
  features: string[]
  is_featured: boolean
  slug: string
}

export default function PackagesPage() {
  const [items, setItems] = useState<Package[]>([])
  const [gateways, setGateways] = useState<{id:string;name:string}[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length) {
          setItems(data)
          setSelected(data[0].id)
        }
      })
    fetch('/api/payment-gateways')
      .then(r => r.json())
      .then(d => setGateways(Array.isArray(d) ? d.map((g: any) => ({ id: g.id, name: g.name })) : []))
      .catch(() => setGateways([]))
  }, [])

  const selectedPackage = items.find(p => p.id === selected) || items[0]
  const gatewayText = gateways.length ? gateways.map(g => g.name).join(' & ') : 'gerbang pembayaran resmi'

  const checkout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPackage || gateways.length === 0) {
      setErr('Belum ada payment gateway yang aktif.')
      return
    }
    setBusy(true); setErr('')
    const gw = gateways[0]
    const payload = {
      order_id: `LK-${Date.now()}-${selectedPackage.id}`,
      amount: Number(selectedPackage.price),
      first_name: form.name,
      email: form.email,
      phone: form.phone,
      description: selectedPackage.name,
    }
    try {
      const r = await fetch(`/api/payment/${gw.id}/snap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || 'Gagal membuat pembayaran')
      const url = data.redirect_url || data.invoice_url
      if (url) {
        window.location.href = url
      } else if (data.token) {
        alert('Snap token: ' + data.token)
      } else {
        throw new Error('Tidak ada URL pembayaran')
      }
    } catch (e: any) {
      setErr(e.message || 'Gagal memproses pembayaran')
    } finally {
      setBusy(false)
    }
  }

  return (
    <PublicLayout>
    <div className="min-h-screen bg-canvas-light">
      <div className="pt-36 sm:pt-40 pb-24 relative overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/15 via-blue-500/10 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="container-narrow relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14 px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              <span>Storefront & Checkout Resmi Logikraf</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text-main tracking-tight mb-6 leading-tight">
              Paket Layanan Digital <br className="hidden sm:inline" /><span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-600">& Website UMKM</span>
            </h1>
            <p className="text-text-muted text-base sm:text-lg leading-relaxed mb-8 max-w-2xl mx-auto font-body">
              Pilih paket layanan yang sesuai dengan skala bisnis Anda. Pembayaran aman dan terverifikasi secara otomatis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
            {items.map(p => (
              <div key={p.id} className={`group relative bg-white rounded-3xl p-7 lg:p-8 flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl border ${p.is_featured ? 'border-2 border-brand-primary shadow-lg ring-4 ring-brand-primary/10' : 'border-border-minimal shadow-sm hover:border-brand-primary/40'}`}>
                {p.is_featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-primary to-blue-600 text-white text-[11px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                    ⭐ Paling Populer
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display text-xl font-bold text-text-main group-hover:text-brand-primary transition-colors mb-2">{p.name}</h3>
                  {p.tagline && <p className="text-xs text-text-muted leading-relaxed min-h-[36px]">{p.tagline}</p>}
                </div>
                <div className="mb-6 p-4 rounded-2xl bg-canvas-light border border-border-minimal/60">
                  <div className="font-display text-3xl font-extrabold text-brand-primary">Rp {Number(p.price).toLocaleString('id-ID')}</div>
                  <span className="text-[11px] text-text-muted font-medium mt-1 block">Harga Sudah Termasuk PPN</span>
                </div>
                {p.features && (Array.isArray(p.features) ? p.features : (() => { try { return JSON.parse(p.features) } catch { return [] } })())?.length > 0 && (
                  <div className="mb-8 flex-1">
                    <span className="text-[11px] font-bold text-text-main uppercase tracking-wider block mb-3">Fitur Layanan:</span>
                    <ul className="space-y-3">
                      {(Array.isArray(p.features) ? p.features : (() => { try { return JSON.parse(p.features) } catch { return [] } })()).map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-text-muted leading-relaxed">
                          <div className="w-4 h-4 rounded-full bg-status-success/15 text-status-success flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <button type="button" onClick={() => setSelected(p.id)} className={`w-full font-bold py-3.5 rounded-xl transition-all duration-200 text-sm flex items-center justify-center gap-2 ${selected === p.id ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white'}`}>
                  <span>Pesan Paket Ini</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            ))}
          </div>

          {selectedPackage && (
            <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-border-minimal shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border-minimal">
                <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary block">Langkah 2: Informasi Pembayaran</span>
                  <h3 className="font-display font-bold text-xl sm:text-2xl text-text-main">Formulir Checkout & Data Pembeli</h3>
                </div>
              </div>
              <div className="p-4 sm:p-5 bg-gradient-to-r from-brand-primary/5 via-blue-500/5 to-transparent rounded-2xl border border-brand-primary/20 flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-primary block mb-0.5">Paket Yang Dipilih</span>
                  <h4 className="font-bold text-text-main text-lg">{selectedPackage.name}</h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-text-muted block">Total Biaya</span>
                  <span className="font-display font-extrabold text-xl text-brand-primary">Rp {Number(selectedPackage.price).toLocaleString('id-ID')}</span>
                </div>
              </div>
              <form onSubmit={checkout} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="label">Nama Lengkap / Pelanggan</label>
                    <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Alamat Email Pembayar</label>
                    <input className="form-input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label">Nomor Telepon / WhatsApp</label>
                  <input className="form-input" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label className="label">Catatan / Brief Pesanan (Opsional)</label>
                  <textarea className="form-input resize-none" rows={3} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
                </div>
                {err && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{err}</div>}
                <button type="submit" disabled={busy} className="w-full bg-gradient-to-r from-brand-primary to-blue-600 text-white font-extrabold py-4 rounded-xl hover:opacity-95 transition-all shadow-xl shadow-brand-primary/25 text-base disabled:opacity-60">
                  {busy ? 'Memproses...' : `Lanjut ke ${gatewayText}`}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
    </PublicLayout>
  )
}
