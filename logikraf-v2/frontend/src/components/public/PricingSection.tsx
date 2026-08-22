import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Pkg {
  id: number
  name: string
  tagline: string
  features: string | string[] // newline-separated or JSON array from API
  color: string
  is_featured: boolean
  price: number
  strike_price?: number
}

const colorFor = (name: string) =>
  name.includes('Starter') ? '#34C759' : name.includes('Business') ? '#0052FF' : '#FF9500'

export default function PricingSection() {
  const [packages, setPackages] = useState<Pkg[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedPkg, setSelectedPkg] = useState<Pkg | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((d) => setPackages(Array.isArray(d) ? d : []))
      .catch(() => setPackages([]))
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
      const r = await fetch('/api/payment/ipaymu/snap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data?.error || data?.Message || 'Gagal memproses pembayaran.')
      const url = data.redirect_url || data.invoice_url || data.payment_url || data.url
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
                    <span className="text-2xl font-bold text-gray-900">Rp{p.price.toLocaleString('id-ID')}</span>
                    {p.strike_price > 0 && (
                      <span className="ml-2 text-sm text-gray-400 line-through">Rp{p.strike_price.toLocaleString('id-ID')}</span>
                    )}
                  </div>
                )}
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    onClick={() => openCheckout(p)}
                    className="block text-center text-white font-semibold py-2 rounded-xl"
                    style={{ backgroundColor: color }}
                  >
                    Lanjut Bayar
                  </button>
                  <Link
                    to="/kontak"
                    className="block text-center text-white font-semibold py-2 rounded-xl"
                    style={{ backgroundColor: color, opacity: 0.85 }}
                  >
                    Pesan Sekarang
                  </Link>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setCheckoutOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-1">Bayar {selectedPkg.name}</h3>
            <p className="text-sm text-gray-500 mb-4">Rp{selectedPkg.price.toLocaleString('id-ID')} · Pembayaran QRIS</p>
            <form onSubmit={handlePay} className="space-y-3">
              <input
                required placeholder="Nama Lengkap"
                className="w-full border rounded-xl px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                required type="email" placeholder="Email"
                className="w-full border rounded-xl px-3 py-2 text-sm"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                required placeholder="No. WhatsApp"
                className="w-full border rounded-xl px-3 py-2 text-sm"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              {err && <p className="text-xs text-red-600">{err}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-blue-600 text-white font-semibold py-2 rounded-xl disabled:opacity-60"
              >
                {busy ? 'Memproses…' : 'Bayar Sekarang'}
              </button>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="w-full text-sm text-gray-500 py-1"
              >
                Batal
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
