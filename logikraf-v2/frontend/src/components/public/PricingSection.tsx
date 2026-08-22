import { useEffect, useState } from 'react'

interface Pkg {
  id: number
  name: string
  tagline: string
  features: string | string[]
  color: string
  is_featured: boolean
  price: number
  strike_price?: number
  formatted_price?: string
}

const colorFor = (name: string) =>
  name.includes('Starter') ? '#34C759' : name.includes('Business') ? '#0052FF' : '#FF9500'

const fmt = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export default function PricingSection() {
  const [packages, setPackages] = useState<Pkg[]>([])
  const [gateways, setGateways] = useState<{ id: string; name: string }[]>([])
  const [selectedPkg, setSelectedPkg] = useState<Pkg | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((d) => setPackages(Array.isArray(d) ? d : []))
      .catch(() => setPackages([]))
    fetch('/api/payment-gateways')
      .then((r) => r.json())
      .then((d) => setGateways(Array.isArray(d) ? d.map((g: any) => ({ id: g.id, name: g.name })) : []))
      .catch(() => setGateways([]))
  }, [])

  const openCheckout = (pkg: Pkg) => {
    setSelectedPkg(pkg)
    setErr('')
    setCheckoutOpen(true)
  }

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPkg) return
    setBusy(true)
    setErr('')
    const gw = gateways.length > 0 ? gateways[0] : { id: 'ipaymu', name: 'iPaymu' }
    const endpoint = gw.id === 'xendit' ? '/api/payment/xendit/invoice' : `/api/payment/${gw.id}/snap`
    const payload = {
      order_id: `LK-${Date.now()}-${selectedPkg.id}`,
      amount: Number(selectedPkg.price),
      first_name: form.name,
      email: form.email,
      phone: form.phone,
      description: `Paket ${selectedPkg.name} - Logikraf`,
      paymentMethod: 'qris',
      paymentChannel: 'qris',
    }
    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || data?.Message || 'Gagal memproses pembayaran.')
      const url = data.redirect_url || data.invoice_url || data.payment_url || data.Data?.Url || data.url
      if (url) window.location.href = url
      else throw new Error('Tautan pembayaran tidak ditemukan.')
    } catch (e: any) {
      setErr(e.message || 'Gagal memproses pembayaran. Hubungi admin via WhatsApp.')
    } finally {
      setBusy(false)
    }
  }

  if (!packages.length) return null
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">Paket Layanan</h2>
        <p className="text-center text-gray-500 mb-10">Pilih paket yang sesuai kebutuhan bisnis Anda.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((p) => {
            const color = p.color || colorFor(p.name)
            const feats = Array.isArray(p.features) ? p.features : String(p.features || '').split('\n').filter(Boolean)
            return (
              <div
                key={p.id}
                className={`relative bg-white rounded-2xl shadow-lg p-6 flex flex-col ${p.is_featured ? 'ring-2 ring-blue-600' : ''}`}
              >
                {p.is_featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Populer
                  </span>
                )}
                <h3 className="text-xl font-bold mb-1" style={{ color }}>{p.name}</h3>
                {p.tagline && <p className="text-sm text-gray-400 mb-4">{p.tagline}</p>}
                <ul className="space-y-2 text-sm text-gray-700 flex-1">
                  {feats.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span style={{ color }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {p.price > 0 && (
                  <div className="mt-4 text-center">
                    <span className="text-2xl font-bold text-gray-900">{p.formatted_price || fmt(p.price)}</span>
                    {p.strike_price > 0 && (
                      <span className="ml-2 text-sm text-gray-400 line-through">{fmt(p.strike_price)}</span>
                    )}
                  </div>
                )}
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => openCheckout(p)}
                    className="block text-center text-white font-semibold py-2 rounded-xl"
                    style={{ backgroundColor: color }}
                  >
                    Pesan Sekarang
                  </button>
                  <a
                    href="https://wa.me/628983342429?text=Halo,%20saya%20tertarik%20dengan%20paket%20Logikraf"
                    target="_blank"
                    rel="noopener"
                    className="block text-center text-sm font-medium py-2 rounded-xl border"
                    style={{ borderColor: color, color }}
                  >
                    Chat WhatsApp
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {checkoutOpen && selectedPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setCheckoutOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 text-lg font-bold p-1"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                Konfirmasi Pembayaran
              </span>
              <h3 className="text-xl font-extrabold text-gray-900">Pesan {selectedPkg.name}</h3>
              <p className="text-xs text-gray-500 mt-1">
                Lengkapi identitas PIC pemesan untuk penerbitan faktur dan alur pembayaran QRIS.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-bold text-gray-900">{selectedPkg.name}</p>
                <p className="text-[11px] text-gray-500 font-mono">Metode: QRIS Nasional (iPaymu)</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-extrabold text-base text-emerald-700">
                  {selectedPkg.formatted_price || fmt(selectedPkg.price)}
                </p>
                <span className="text-[10px] text-gray-500">Termasuk PPN &amp; Server</span>
              </div>
            </div>

            {err && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">{err}</div>
            )}

            <form onSubmit={handlePay} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-900 mb-1 block">Nama Lengkap PIC *</label>
                <input
                  type="text" required
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                  placeholder="Budi Santoso"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-900 mb-1 block">Email Aktif *</label>
                  <input
                    type="email" required
                    className="w-full border rounded-xl px-3 py-2 text-sm"
                    placeholder="budi@perusahaan.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-900 mb-1 block">WhatsApp / No HP *</label>
                  <input
                    type="tel" required
                    className="w-full border rounded-xl px-3 py-2 text-sm font-mono"
                    placeholder="08123456789"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-900 mb-1 block">Catatan (opsional)</label>
                <input
                  type="text"
                  className="w-full border rounded-xl px-3 py-2 text-sm"
                  placeholder="Tambahan informasi pesanan"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                  <span>🔒</span>
                  <span>Transaksi Terenkripsi SSL</span>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-blue-600 text-white text-xs font-semibold py-2.5 px-6 rounded-xl disabled:opacity-60"
                >
                  {busy ? 'Memproses QRIS...' : 'Lanjut Bayar QRIS →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
