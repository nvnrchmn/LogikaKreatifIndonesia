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

const toneFor = (name: string): string =>
  name.includes('Starter') ? 'text-brand-accent' : name.includes('Business') ? 'text-brand-primary' : 'text-status-warning'

const bgFor = (name: string): string =>
  name.includes('Starter') ? 'bg-brand-accent' : name.includes('Business') ? 'bg-brand-primary' : 'bg-status-warning'

const fmt = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`

export default function PricingSection() {
  const [packages, setPackages] = useState<Pkg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [selectedPkg, setSelectedPkg] = useState<Pkg | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((d) => {
        setPackages(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  const openCheckout = (pkg: Pkg) => {
    setSelectedPkg(pkg)
    setCheckoutOpen(true)
  }

  return (
    <section className="section-padding bg-canvas-light">
      <div className="container-narrow">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-text-main mb-3">Paket Layanan</h2>
          <p className="text-text-muted font-body max-w-xl mx-auto">Pilih paket yang sesuai kebutuhan bisnis Anda.</p>
        </div>

        {/* H1: Loading skeleton */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card p-6 space-y-4">
                <div className="skeleton h-6 w-2/3" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton h-4 w-4/6" />
                <div className="skeleton h-10 w-full mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* H9: Error state */}
        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-text-muted mb-4">Gagal memuat paket layanan. Silakan coba lagi.</p>
            <button onClick={() => window.location.reload()} className="btn-secondary btn-sm">Muat Ulang</button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && packages.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((p) => {
              const tone = toneFor(p.name)
              const bg = bgFor(p.name)
              const feats = Array.isArray(p.features) ? p.features : String(p.features || '').split('\n').filter(Boolean)
              return (
                <div
                  key={p.id}
                  className={`relative card-hover p-6 flex flex-col ${p.is_featured ? 'ring-2 ring-brand-primary' : ''}`}
                >
                  {p.is_featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Populer
                    </span>
                  )}
                  <h3 className={`text-xl font-bold mb-1 ${tone}`}>{p.name}</h3>
                  {p.tagline && <p className="text-sm text-text-muted mb-4">{p.tagline}</p>}
                  <ul className="space-y-2 text-sm text-text-main flex-1">
                    {feats.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className={tone}>✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {p.price > 0 && (
                    <div className="mt-4 text-center">
                      <span className="text-2xl font-bold text-text-main">{p.formatted_price || fmt(p.price)}</span>
                      {(p.strike_price ?? 0) > 0 && (
                        <span className="ml-2 text-sm text-text-muted line-through">{fmt(p.strike_price!)}</span>
                      )}
                    </div>
                  )}
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => openCheckout(p)}
                      className={`block w-full text-center text-white font-semibold py-2.5 rounded-xl transition-opacity hover:opacity-90 active:scale-[0.98] ${bg}`}
                    >
                      Pesan Sekarang
                    </button>
                    <a
                      href="https://wa.me/628983342429?text=Halo,%20saya%20tertarik%20dengan%20paket%20Logikraf"
                      target="_blank"
                      rel="noopener"
                      className="block text-center text-sm font-medium py-2 rounded-xl border border-border-minimal text-text-main hover:bg-canvas-light transition-colors"
                    >
                      Chat WhatsApp
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* H10: Empty state */}
        {!loading && !error && packages.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <p className="mb-2">Belum ada paket tersedia saat ini.</p>
            <a href="/kontak" className="text-brand-primary font-semibold hover:underline">Hubungi kami untuk penawaran kustom →</a>
          </div>
        )}
      </div>

      <CheckoutModal open={checkoutOpen} pkg={selectedPkg} onClose={() => setCheckoutOpen(false)} />
    </section>
  )
}
