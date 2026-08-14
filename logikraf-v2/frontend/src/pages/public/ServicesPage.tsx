import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

interface Service {
  id: number
  name: string
  slug: string
  short_desc: string
  color: string
  icon?: string
}

export default function ServicesPage() {
  const [items, setItems] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/services')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setItems)
      .catch(() => setError('Gagal memuat layanan'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        {/* Hero Section */}
        <div className="pt-36 sm:pt-40 pb-20 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/15 via-blue-500/10 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="container-narrow relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span>Solusi Digital & Software House</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text-main tracking-tight mb-6 leading-tight">
                Layanan Teknologi Unggulan <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-600">
                  Untuk Transformasi Bisnis
                </span>
              </h1>
              <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-body">
                Dari pengembangan platform kustom, antarmuka produk inovatif, hingga integrasi sistem enterprise berstandar tinggi.
              </p>
            </div>

            {error && (
              <div className="max-w-xl mx-auto mb-10 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            {/* Services Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-8 border border-border-minimal shadow-sm h-72 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {items.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    className="group bg-white rounded-3xl p-8 border border-border-minimal shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center p-3 text-brand-primary group-hover:scale-110 transition-transform">
                          <img src="/logo.png" alt="Logikraf" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xs font-bold font-mono text-text-muted/60 uppercase tracking-widest">
                          0{idx + 1}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-xl text-text-main group-hover:text-brand-primary transition-colors mb-3">
                        {s.name}
                      </h3>
                      <p className="text-text-muted text-sm leading-relaxed font-body mb-6">
                        {s.short_desc || 'Solusi teknologi terintegrasi dengan arsitektur modern dan skalabilitas tinggi.'}
                      </p>
                    </div>

                    <div className="pt-5 border-t border-border-minimal flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-muted">Konsultasi Gratis</span>
                      <Link
                        to="/kontak"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary/80 group-hover:translate-x-1 transition-all"
                      >
                        <span>Mulai Diskusi</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom CTA Banner */}
            <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-canvas-dark via-gray-900 to-canvas-dark text-white relative overflow-hidden shadow-xl">
              <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-2xl">
                <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider mb-4">
                  Butuh Solusi Kustom?
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-extrabold mb-4 leading-tight">
                  Diskusikan Kebutuhan Software & Arsitektur Anda Bersama Tim Expert Kami
                </h3>
                <p className="text-text-light/70 text-sm sm:text-base mb-8 font-body">
                  Kami siap membantu merancang solusi spesifik sesuai alur operasional dan target bisnis Anda.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link to="/kontak" className="btn-primary text-sm py-3 px-6 shadow-lg shadow-brand-primary/30">
                    Jadwalkan Konsultasi 📅
                  </Link>
                  <Link to="/paket" className="px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 text-sm font-semibold text-white transition-all">
                    Lihat Paket Website ⚡
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
