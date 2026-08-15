import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

interface Portfolio {
  id: number
  title: string
  slug: string
  excerpt: string
  description?: string
  thumbnail: string
  client_name?: string
  service_category?: string
  is_published?: boolean
}

export default function PortfolioPage() {
  const [items, setItems] = useState<Portfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('Semua')

  useEffect(() => {
    fetch('/api/portfolios')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => {
        const list = Array.isArray(d) ? d : []
        setItems(list)
      })
      .catch(() => setError('Gagal memuat portofolio'))
      .finally(() => setLoading(false))
  }, [])

  const categories = ['Semua', 'Web Application', 'Website UMKM', 'Mobile App', 'UI/UX Design']

  const filteredItems = items.filter(item => {
    if (filter === 'Semua') return true
    const cat = item.service_category || ''
    const title = item.title.toLowerCase()
    const desc = (item.description || item.excerpt || '').toLowerCase()
    const f = filter.toLowerCase()

    if (f === 'web application') return cat.includes('web') || title.includes('app') || desc.includes('aplikasi')
    if (f === 'website umkm') return cat.includes('umkm') || title.includes('umkm') || title.includes('landing')
    if (f === 'mobile app') return cat.includes('mobile') || title.includes('mobile') || title.includes('ios') || title.includes('android')
    if (f === 'ui/ux design') return cat.includes('design') || title.includes('ui') || title.includes('ux')
    return true
  })

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        {/* Hero Section */}
        <div className="pt-36 sm:pt-40 pb-20 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/15 via-purple-500/10 to-blue-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="container-narrow relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-14 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span>Studi Kasus &amp; Karya Digital</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text-main tracking-tight mb-6 leading-tight">
                Portofolio Proyek <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-600">
                  Logika Kreatif Indonesia
                </span>
              </h1>
              <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-body">
                Jelajahi rekam jejak solusi software, aplikasi web skala enterprise, website UMKM siap pakai, dan desain pengalaman digital yang kami bangun untuk klien kami.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mb-14 px-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    filter === cat
                      ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25 scale-105'
                      : 'bg-white text-text-muted hover:text-text-main border border-border-minimal hover:border-brand-primary/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {error && (
              <div className="max-w-xl mx-auto mb-10 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            {/* Portfolio Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 border border-border-minimal shadow-sm h-80 animate-pulse" />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-border-minimal p-8 max-w-md mx-auto">
                <p className="text-text-main font-bold mb-1">Belum Ada Proyek di Kategori Ini</p>
                <p className="text-text-muted text-xs mb-4">Coba pilih kategori lain atau lihat semua portofolio kami.</p>
                <button
                  onClick={() => setFilter('Semua')}
                  className="btn-primary text-xs py-2 px-4"
                >
                  Tampilkan Semua Proyek
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map(item => (
                  <Link
                    key={item.id}
                    to={`/portfolio/${item.slug}`}
                    className="group bg-white rounded-3xl overflow-hidden border border-border-minimal shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail with Overlay */}
                      <div className="aspect-video w-full bg-canvas-dark relative overflow-hidden">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-canvas-dark flex items-center justify-center p-6 text-center">
                            <span className="font-display font-bold text-white text-lg opacity-60">
                              {item.title}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <span className="text-xs font-bold text-white bg-brand-primary px-3 py-1 rounded-full shadow-sm">
                            Lihat Studi Kasus ↗
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-6 sm:p-7">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold uppercase tracking-wider">
                            {item.service_category || 'Solusi Digital'}
                          </span>
                          {item.client_name && (
                            <span className="text-[11px] font-semibold text-text-muted">
                              {item.client_name}
                            </span>
                          )}
                        </div>

                        <h3 className="font-display font-bold text-lg text-text-main group-hover:text-brand-primary transition-colors line-clamp-2 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-text-muted text-xs sm:text-sm leading-relaxed line-clamp-2 font-body">
                          {item.excerpt || item.description || 'Lihat arsitektur sistem, tantangan teknis, dan hasil eksekusi dari proyek ini.'}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 sm:px-7 pb-6 pt-2 border-t border-border-minimal/60 flex items-center justify-between text-xs font-bold text-brand-primary">
                      <span>Detail Proyek</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Bottom CTA Card */}
            <div className="mt-20 rounded-3xl bg-gradient-to-br from-canvas-dark via-gray-900 to-canvas-dark p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
                  Kolaborasi &amp; Kemitraan
                </span>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                  Siap Membangun Solusi Digital Anda Selanjutnya?
                </h2>
                <p className="text-xs sm:text-sm text-text-light/70 leading-relaxed">
                  Konsultasikan kebutuhan aplikasi, website UMKM, atau modernisasi sistem bisnis Anda bersama tim engineer Logikraf.
                </p>
                <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                  <Link to="/kontak" className="btn-primary text-xs sm:text-sm py-3 px-6 shadow-lg shadow-brand-primary/25">
                    Konsultasi Gratis Sekarang 🚀
                  </Link>
                  <Link to="/paket" className="bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-2xl border border-white/10 transition-all">
                    Lihat Paket Website UMKM →
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
