import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface Portfolio {
  id: number
  title: string
  slug: string
  excerpt: string
  description: string
  thumbnail: string
  category?: string
  tech_stack?: string[]
}

export default function PortfolioGallery() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/portfolios')
      .then(r => r.json())
      .then(data => {
        setPortfolios(data.length ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const categories: string[] = ['all', ...Array.from(new Set(portfolios.map(p => p.category).filter((c): c is string => typeof c === 'string' && c.length > 0)))]

  const visible = filter === 'all' ? portfolios : portfolios.filter(p => p.category === filter)

  return (
    <section id="portofolio" className="section-padding bg-canvas-overlay">
      <div className="container-narrow">
        <div className="text-center mb-12 lg:mb-16">
          <span className="badge-primary mb-4 inline-block">Portofolio</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-main mb-6">
            Proyek yang Telah <span className="text-brand-primary">Kami Wujudkan</span>
          </h2>
          <p className="font-body text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            Setiap proyek adalah bukti dedikasi kami dalam menghadirkan solusi digital terbaik.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-5 py-2.5 rounded-full font-body text-sm font-medium transition-all duration-200 ${filter === c ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'bg-canvas-card text-text-muted hover:text-brand-primary border border-border-minimal hover:border-brand-primary/30'}`}>
              {c === 'all' ? 'Semua' : c}
            </button>
          ))}
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 ${loading ? 'opacity-60' : ''}`}>
          {visible.map(p => (
            <article key={p.id} className="card-hover group block no-underline text-text-main">
              <div className="aspect-video bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 overflow-hidden relative">
                {p.thumbnail ? (
                  <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <span className="text-xs text-text-muted">{p.category || 'Project'}</span>
                    </div>
                  </div>
                )}
                {p.category && (
                  <div className="absolute top-3 left-3">
                    <span className="badge bg-canvas-dark/70 backdrop-blur-sm text-white text-[10px] uppercase tracking-wider">{p.category}</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-display text-lg font-bold text-text-main mb-2 group-hover:text-brand-primary transition-colors duration-200 line-clamp-1">{p.title}</h3>
                <p className="font-body text-sm text-text-muted mb-4 line-clamp-2">{p.description || p.excerpt}</p>
                {Array.isArray(p.tech_stack) && p.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.tech_stack.slice(0, 3).map(t => (
                      <span key={t} className="px-2 py-1 bg-brand-primary/5 text-brand-primary text-[11px] font-medium rounded">{t}</span>
                    ))}
                    {p.tech_stack.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-text-muted text-[11px] font-medium rounded">+{p.tech_stack.length - 3}</span>
                    )}
                  </div>
                )}
                <div className="pt-4 border-t border-border-minimal">
                  <Link to={`/portfolio/${p.slug}`} className="inline-flex items-center gap-2 text-brand-primary font-body text-sm font-semibold hover:gap-3 transition-all duration-200">
                    Lihat Detail
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Link>
                </div>
              </div>
            </article>
          ))}
          {visible.length === 0 && !loading && (
            <div className="col-span-full text-center text-text-muted py-12">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-6 text-center max-w-sm mx-auto mb-6">
                  <div className="aspect-video bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 rounded-lg mb-4 flex items-center justify-center">
                    <svg className="w-10 h-10 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <p className="font-body text-sm text-text-muted">Proyek portofolio akan segera ditampilkan</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
