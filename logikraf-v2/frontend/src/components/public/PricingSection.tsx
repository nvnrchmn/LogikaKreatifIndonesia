import { useEffect, useState } from 'react'
import CheckoutModal from '../ui/CheckoutModal'

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
  const [selectedPkg, setSelectedPkg] = useState<Pkg | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((d) => setPackages(Array.isArray(d) ? d : []))
      .catch(() => setPackages([]))
  }, [])

  const openCheckout = (pkg: Pkg) => {
    setSelectedPkg(pkg)
    setCheckoutOpen(true)
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

      <CheckoutModal open={checkoutOpen} pkg={selectedPkg} onClose={() => setCheckoutOpen(false)} />
    </section>
  )
}
