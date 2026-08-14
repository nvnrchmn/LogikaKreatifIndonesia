import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  body: string
  published_at: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/posts')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => setPosts(Array.isArray(d) ? d : []))
      .catch(() => setError('Gagal memuat artikel'))
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
                <span>Publikasi &amp; Insight</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text-main tracking-tight mb-6 leading-tight">
                Artikel, Tren &amp; <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-blue-600">
                  Wawasan Teknologi
                </span>
              </h1>
              <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-body">
                Pelajari strategi pengembangan software, inovasi UI/UX terkini, dan panduan digitalisasi bisnis.
              </p>
            </div>

            {error && (
              <div className="max-w-xl mx-auto mb-10 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                {error}
              </div>
            )}

            {/* Posts Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-8 border border-border-minimal shadow-sm h-64 animate-pulse" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-border-minimal p-8 max-w-md mx-auto">
                <p className="text-text-muted text-sm">Belum ada artikel yang dipublikasikan saat ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {posts.map(post => {
                  const dateStr = post.published_at
                    ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Terbaru'

                  return (
                    <article
                      key={post.id}
                      className="group bg-white rounded-3xl p-7 lg:p-8 border border-border-minimal shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-4">
                          <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[11px] font-bold">
                            Artikel
                          </span>
                          <span className="text-xs text-text-muted font-mono">{dateStr}</span>
                        </div>

                        <h3 className="font-display font-bold text-lg text-text-main group-hover:text-brand-primary transition-colors line-clamp-2 mb-3">
                          {post.title}
                        </h3>
                        <p className="text-text-muted text-xs sm:text-sm leading-relaxed font-body line-clamp-3 mb-6">
                          {post.excerpt || 'Baca artikel lengkap untuk memahami insight dan analisa mendalam seputar topik ini.'}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border-minimal flex items-center justify-between">
                        <span className="text-xs font-semibold text-text-muted">3 min baca</span>
                        <Link
                          to={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary/80 group-hover:translate-x-1 transition-all"
                        >
                          <span>Baca Selengkapnya</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
