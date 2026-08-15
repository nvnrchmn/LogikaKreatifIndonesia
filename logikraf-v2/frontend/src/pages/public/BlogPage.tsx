import { useEffect, useState, useMemo } from 'react'
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

const CATEGORIES = ['Semua', 'Teknologi', 'Bisnis & UMKM', 'UI/UX Design', 'Payment & QRIS', 'Studi Kasus']

const stripHtml = (html: string) => (html || '').replace(/<[^>]*>?/gm, '').trim()

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    fetch('/api/posts')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => setPosts(Array.isArray(d) ? d : []))
      .catch(() => setError('Gagal memuat artikel dari server'))
      .finally(() => setLoading(false))
  }, [])

  // Dummy fallback articles if backend post count is low to ensure rich editorial look
  const displayPosts: Post[] = useMemo(() => {
    if (posts.length > 0) return posts
    return [
      {
        id: 101,
        title: 'Arsitektur Microservices Modern vs Monolith: Mana yang Tepat untuk Startup & Bisnis Indonesia?',
        slug: 'arsitektur-microservices-vs-monolith',
        excerpt: 'Panduan komprehensif membedah trade-off arsitektur software, skalabilitas infrastruktur, dan efisiensi biaya server untuk produk digital modern.',
        body: '',
        published_at: '2026-08-10',
      },
      {
        id: 102,
        title: 'Mengapa Pembayaran QRIS Dinamis Menjadi Standar Wajib E-Commerce dan Aplikasi UMKM Masa Kini',
        slug: 'qris-dinamis-standar-wajib-ecommerce',
        excerpt: 'Bagaimana integrasi QRIS real-time meningkatkan conversion rate checkout hingga 40% dan mengeliminasi proses konfirmasi transfer manual.',
        body: '',
        published_at: '2026-08-08',
      },
      {
        id: 103,
        title: 'Prinsip UI/UX Design Berbasis Neuro-Design: Meningkatkan Retensi Pengguna Aplikasi Web',
        slug: 'prinsip-ui-ux-neuro-design',
        excerpt: 'Menerapkan hierarki visual, micro-interactions, dan cognitive load reduction untuk menciptakan pengalaman pengguna yang mulus dan intuitif.',
        body: '',
        published_at: '2026-08-05',
      },
      {
        id: 104,
        title: 'Panduan Migrasi Database Aman Tanpa Downtime untuk Aplikasi Finansial & Enterprise',
        slug: 'migrasi-database-zero-downtime',
        excerpt: 'Langkah taktis menerapkan blue-green deployment, schema versioning, dan locking strategy pada database relasional berkapasitas tinggi.',
        body: '',
        published_at: '2026-08-02',
      },
    ]
  }, [posts])

  const filteredPosts = useMemo(() => {
    return displayPosts.filter(p => {
      const matchQ = (p.title + ' ' + p.excerpt).toLowerCase().includes(searchQuery.toLowerCase())
      return matchQ
    })
  }, [displayPosts, searchQuery])

  const leadPost = filteredPosts[0] || displayPosts[0]
  const sidePosts = filteredPosts.slice(1, 4)
  const remainingPosts = filteredPosts.slice(4)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail) {
      setSubscribed(true)
      setTimeout(() => {
        setNewsletterEmail('')
        setSubscribed(false)
      }, 4000)
    }
  }

  const fmtDate = (s: string) =>
    s
      ? new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Baru Saja'

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        {/* Editorial Top Headline Banner */}
        <div className="pt-36 sm:pt-40 pb-12 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/15 via-blue-500/10 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="container-narrow relative z-10">
            {/* Header Title */}
            <div className="text-center max-w-3xl mx-auto mb-12 px-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                <span>Logikraf Tech &amp; Business Journal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-text-main tracking-tight mb-4 leading-tight">
                Wawasan, Analisis &amp; <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-blue-600 to-indigo-600">
                  Tren Rekayasa Digital
                </span>
              </h1>
              <p className="text-text-muted text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-body">
                Kupas tuntas arsitektur software, transformasi digital UMKM, inovasi UI/UX, dan ekosistem payment gateway Indonesia.
              </p>
            </div>

            {/* Search & Category Filter Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-border-minimal">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20 scale-105'
                        : 'bg-white border border-border-minimal text-text-muted hover:border-brand-primary/30 hover:text-text-main'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72 shrink-0">
                <input
                  type="text"
                  placeholder="Cari topik artikel..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="form-input text-xs pl-9 pr-4 py-2.5 w-full bg-white rounded-full border-border-minimal shadow-xs focus:ring-brand-primary"
                />
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs">🔍</span>
              </div>
            </div>

            {error && (
              <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs text-center font-semibold">
                {error} (Menampilkan artikel redaksi pilihan).
              </div>
            )}

            {/* Lead Story & Trending Sidebar (Media Publication Layout) */}
            {leadPost && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
                {/* Main Hero Article Card */}
                <div className="lg:col-span-8 group">
                  <Link
                    to={`/blog/${leadPost.slug}`}
                    className="block bg-white rounded-3xl border border-border-minimal shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-64 sm:h-80 bg-gradient-to-br from-gray-900 via-canvas-dark to-slate-900 overflow-hidden flex items-end p-6 sm:p-8">
                      <div className="absolute inset-0 bg-radial-gradient opacity-40 pointer-events-none" />
                      <div className="absolute top-6 left-6 z-10">
                        <span className="px-3.5 py-1 rounded-full bg-brand-primary text-white text-[11px] font-extrabold uppercase tracking-wider shadow-lg">
                          ★ Liputan Utama
                        </span>
                      </div>
                      <div className="relative z-10 text-white max-w-2xl">
                        <span className="text-xs font-mono text-brand-accent mb-2 block font-semibold">
                          {fmtDate(leadPost.published_at)} • 5 min read
                        </span>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-extrabold text-white leading-snug group-hover:text-brand-accent transition-colors">
                          {leadPost.title}
                        </h2>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 flex flex-col justify-between">
                      <p className="text-text-muted text-sm sm:text-base leading-relaxed font-body mb-6">
                        {stripHtml(leadPost.excerpt || leadPost.body) ||
                          'Pelajari analisa mendalam, studi kasus lapangan, dan panduan teknis yang disusun langsung oleh tim rekayasa software Logikraf.'}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-border-minimal">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-primary/20 text-brand-primary font-bold flex items-center justify-center text-xs">
                            LK
                          </div>
                          <div>
                            <p className="text-xs font-bold text-text-main">Redaksi Logikraf</p>
                            <p className="text-[11px] text-text-muted">Engineering &amp; Research Team</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-brand-primary inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          Baca Lengkap →
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Trending & Popular Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white rounded-3xl border border-border-minimal p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-border-minimal mb-4">
                      <h3 className="font-display font-bold text-sm text-text-main flex items-center gap-2">
                        <span>🔥</span>
                        <span>Artikel Populer</span>
                      </h3>
                      <span className="text-[11px] text-text-muted font-bold">Top Picks</span>
                    </div>

                    <div className="space-y-4 divide-y divide-border-minimal">
                      {sidePosts.map((sp, idx) => (
                        <Link
                          key={sp.id}
                          to={`/blog/${sp.slug}`}
                          className={`block pt-4 first:pt-0 group hover:opacity-90 transition-opacity`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl font-display font-black text-brand-primary/40 group-hover:text-brand-primary transition-colors shrink-0">
                              0{idx + 2}
                            </span>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary block mb-1">
                                Wawasan
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-text-main group-hover:text-brand-primary line-clamp-2 leading-snug">
                                {sp.title}
                              </h4>
                              <span className="text-[11px] text-text-muted font-mono mt-1 block">
                                {fmtDate(sp.published_at)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Quick Subscribe Card */}
                  <div className="rounded-3xl bg-gradient-to-br from-canvas-dark via-gray-900 to-canvas-dark p-6 text-white border border-white/10 shadow-md">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand-accent block mb-1">
                      Newsletter Mingguan
                    </span>
                    <h4 className="font-display font-bold text-base text-white mb-2">
                      Dapatkan Digest Teknologi
                    </h4>
                    <p className="text-xs text-text-light/70 mb-4 leading-relaxed">
                      Langganan artikel terbaru seputar web architecture, payment gateway, dan UI/UX tanpa spam.
                    </p>

                    {subscribed ? (
                      <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center">
                        ✓ Berhasil Terdaftar!
                      </div>
                    ) : (
                      <form onSubmit={handleSubscribe} className="space-y-2">
                        <input
                          type="email"
                          placeholder="nama@email.com"
                          value={newsletterEmail}
                          onChange={e => setNewsletterEmail(e.target.value)}
                          required
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-text-light/40 focus:outline-none focus:ring-1 focus:ring-brand-accent"
                        />
                        <button
                          type="submit"
                          className="w-full btn-primary text-xs py-2 px-4 shadow-sm"
                        >
                          Langganan Gratis ✉️
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Remaining Articles Grid */}
            {remainingPosts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8 pb-3 border-b border-border-minimal">
                  <h3 className="font-display font-bold text-xl text-text-main">Artikel Terbaru Lainnya</h3>
                  <span className="text-xs text-text-muted font-bold">{remainingPosts.length} Artikel</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {remainingPosts.map(post => {
                    return (
                      <article
                        key={post.id}
                        className="group bg-white rounded-3xl p-7 border border-border-minimal shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[11px] font-bold">
                              Insight
                            </span>
                            <span className="text-xs text-text-muted font-mono">{fmtDate(post.published_at)}</span>
                          </div>

                          <h3 className="font-display font-bold text-base text-text-main group-hover:text-brand-primary transition-colors line-clamp-2 mb-3">
                            {post.title}
                          </h3>
                          <p className="text-text-muted text-xs sm:text-sm leading-relaxed font-body line-clamp-3 mb-6">
                            {stripHtml(post.excerpt || post.body) ||
                              'Baca artikel lengkap untuk memahami insight dan analisa mendalam seputar topik ini.'}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-border-minimal flex items-center justify-between">
                          <span className="text-xs font-semibold text-text-muted">4 min baca</span>
                          <Link
                            to={`/blog/${post.slug}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-primary/80 group-hover:translate-x-1 transition-all"
                          >
                            <span>Baca Selengkapnya</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </Link>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
