import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

interface Pkg {
  id: number
  name: string
  tagline: string
  features: string
  price: number
  strike_price?: number
  is_featured: boolean
}

const colorFor = (name: string) =>
  name.includes('Starter') ? '#34C759' : name.includes('Business') ? '#0052FF' : '#FF9500'

export default function ServicesPage() {
  const [items, setItems] = useState<Pkg[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/packages')
      .then(r => (r.ok ? r.json() : []))
      .then(d => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        <div className="pt-36 sm:pt-40 pb-20 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/15 via-blue-500/10 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="container-narrow relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span>Paket Layanan Logikraf</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text-main tracking-tight mb-6 leading-tight">
                Pilih Paket yang
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-blue-600 to-indigo-600">
                  {' '}Sesuai Kebutuhan
                </span>
              </h1>
              <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-body">
                Dari landing page sederhana hingga toko online lengkap dengan pembayaran. Semua paket sudah termasuk hosting, SSL, dan CMS sederhana.
              </p>
            </div>

            {loading ? (
              <p className="text-center text-text-muted text-sm">Memuat paket…</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
                {items.map((p, idx) => {
                  const color = p.is_featured ? '#0052FF' : colorFor(p.name)
                  const feats = p.features.split('\n').filter(Boolean)
                  return (
                    <div
                      key={p.id || idx}
                      className={`group bg-white rounded-3xl p-8 border shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between ${p.is_featured ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-border-minimal'}`}
                    >
                      <div>
                        {p.is_featured && (
                          <span className="inline-block mb-3 px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                            ★ Populer
                          </span>
                        )}
                        <h3 className="font-display font-bold text-lg text-text-main mb-2 leading-snug" style={{ color }}>
                          {p.name}
                        </h3>
                        {p.tagline && (
                          <p className="text-text-muted text-xs sm:text-sm leading-relaxed font-body mb-4">{p.tagline}</p>
                        )}

                        <div className="space-y-2 mb-6 pt-4 border-t border-border-minimal/50">
                          {feats.slice(0, 8).map((f, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2 text-xs text-text-muted">
                              <span className="font-bold" style={{ color }}>✓</span>
                              <span>{f}</span>
                            </div>
                          ))}
                          {feats.length > 8 && (
                            <div className="text-xs text-text-muted/70">+{feats.length - 8} fitur lainnya</div>
                          )}
                        </div>

                        {p.price > 0 && (
                          <div className="mb-4">
                            <span className="text-2xl font-bold text-gray-900">Rp{p.price.toLocaleString('id-ID')}</span>
                            {p.strike_price > 0 && (
                              <span className="ml-2 text-sm text-gray-400 line-through">Rp{p.strike_price.toLocaleString('id-ID')}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="pt-5 border-t border-border-minimal flex items-center justify-between">
                        <span className="text-xs font-semibold text-text-muted">Konsultasi Gratis</span>
                        <Link
                          to="/kontak"
                          className="inline-flex items-center gap-1.5 text-xs font-bold hover:opacity-80 group-hover:translate-x-1 transition-all"
                          style={{ color }}
                        >
                          <span>Pesan Sekarang</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="rounded-3xl bg-gradient-to-r from-canvas-dark via-gray-900 to-canvas-dark p-8 sm:p-12 text-white border border-white/10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
                  Mengapa Logikraf
                </span>
                <h3 className="font-display font-extrabold text-2xl text-white">
                  Sudah Termasuk Semua Kebutuhan Dasar
                </h3>
                <p className="text-xs sm:text-sm text-text-light/70 leading-relaxed">
                  Setiap paket sudah mencakup SSL, hosting, mobile responsive, SEO dasar, dan CMS sederhana — siap live tanpa ribet.
                </p>
              </div>
              <Link
                to="/kontak"
                className="px-5 py-3 rounded-xl bg-brand-primary text-white text-sm font-bold shadow-xs shrink-0"
              >
                Konsultasi Gratis
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
