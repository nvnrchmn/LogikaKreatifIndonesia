import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

interface SearchItem {
  id: string | number
  title: string
  desc: string
  url: string
  category: 'Layanan' | 'Paket' | 'Artikel' | 'Portofolio'
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [items, setItems] = useState<SearchItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/services').then(r => r.json()).catch(() => []),
      fetch('/api/packages').then(r => r.json()).catch(() => []),
      fetch('/api/posts').then(r => r.json()).catch(() => []),
      fetch('/api/portfolios').then(r => r.json()).catch(() => []),
    ]).then(([services, packages, posts, portfolios]) => {
      const all: SearchItem[] = []

      if (Array.isArray(services)) {
        services.forEach((s: any) => {
          all.push({
            id: `svc-${s.id}`,
            title: s.name,
            desc: s.short_desc || '',
            url: '/layanan',
            category: 'Layanan',
          })
        })
      }

      if (Array.isArray(packages)) {
        packages.forEach((p: any) => {
          all.push({
            id: `pkg-${p.id}`,
            title: p.name,
            desc: `${p.tagline || ''} • Rp ${Number(p.price).toLocaleString('id-ID')}`,
            url: '/paket',
            category: 'Paket',
          })
        })
      }

      if (Array.isArray(posts)) {
        posts.forEach((post: any) => {
          all.push({
            id: `post-${post.id}`,
            title: post.title,
            desc: post.excerpt || '',
            url: `/blog/${post.slug}`,
            category: 'Artikel',
          })
        })
      }

      if (Array.isArray(portfolios)) {
        portfolios.forEach((port: any) => {
          all.push({
            id: `port-${port.id}`,
            title: port.title,
            desc: port.client_name ? `Klien: ${port.client_name} • ${port.excerpt || ''}` : port.excerpt || '',
            url: `/portfolio/${port.slug}`,
            category: 'Portofolio',
          })
        })
      }

      setItems(all)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const q = query.trim().toLowerCase()
  const results = q
    ? items.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.desc.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      )
    : items

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        {/* Hero Search Box */}
        <div className="pt-36 sm:pt-40 pb-20 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/15 via-blue-500/10 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="container-narrow max-w-3xl relative z-10">
            <div className="text-center mb-10 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
                <span>🔍 Direktori &amp; Pencarian Global</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-text-main tracking-tight mb-4">
                Pencarian Layanan &amp; Konten
              </h1>
              <p className="text-text-muted text-sm max-w-xl mx-auto">
                Cari paket website UMKM, jenis layanan custom software, artikel insight, atau portofolio proyek Logikraf.
              </p>
            </div>

            {/* Live Search Input */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-border-minimal shadow-lg mb-10 flex items-center gap-3">
              <div className="pl-3 text-text-muted">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ketik kata kunci (misal: 'Website UMKM', 'iPaymu', 'UI/UX', 'Go')..."
                className="w-full bg-transparent text-sm sm:text-base text-text-main focus:outline-none placeholder:text-text-muted/60 py-2"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="px-3 py-1 text-xs text-text-muted hover:text-text-main font-semibold"
                >
                  ✕ Hapus
                </button>
              )}
            </div>

            {/* Results Count & Badges */}
            <div className="flex items-center justify-between gap-4 mb-6 px-1 text-xs text-text-muted">
              <span>
                {loading
                  ? 'Memuat data...'
                  : q
                  ? `Ditemukan ${results.length} hasil untuk "${query}"`
                  : `Menampilkan semua ${items.length} konten`}
              </span>
              <span className="hidden sm:inline font-mono text-[11px] bg-canvas-light px-2 py-1 rounded border border-border-minimal">
                Live Filter Real-Time
              </span>
            </div>

            {/* Results List */}
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-border-minimal animate-pulse h-20" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-border-minimal p-8">
                <p className="text-text-main font-bold mb-1">Tidak Ada Hasil Ditemukan</p>
                <p className="text-text-muted text-xs">Coba gunakan kata kunci lain seperti "UMKM", "Aplikasi", atau "Layanan".</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {results.map(item => (
                  <Link
                    key={item.id}
                    to={item.url}
                    className="group block bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border-minimal shadow-sm hover:shadow-md hover:border-brand-primary/40 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                            item.category === 'Paket'
                              ? 'bg-blue-100 text-blue-800'
                              : item.category === 'Layanan'
                              ? 'bg-purple-100 text-purple-800'
                              : item.category === 'Artikel'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.category}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-base text-text-main group-hover:text-brand-primary transition-colors">
                          {item.title}
                        </h3>
                        {item.desc && (
                          <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
                            {item.desc}
                          </p>
                        )}
                      </div>
                      <span className="text-brand-primary text-sm font-bold shrink-0 mt-2 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
