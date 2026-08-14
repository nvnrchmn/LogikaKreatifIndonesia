import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import PublicLayout from '../../components/layout/PublicLayout'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  body: string
  published_at: string
}

export default function BlogDetailPage() {
  const { slug } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then((posts: Post[]) => {
        const found = posts.find(p => p.slug === slug)
        if (found) setPost(found)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-canvas-light pt-40 pb-20">
          <div className="container-narrow max-w-4xl bg-white p-10 rounded-3xl border border-border-minimal animate-pulse h-96" />
        </div>
      </PublicLayout>
    )
  }

  if (!post) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-canvas-light pt-40 pb-20 text-center">
          <div className="container-narrow max-w-md bg-white p-8 rounded-3xl border border-border-minimal shadow-sm">
            <h2 className="text-xl font-bold text-text-main mb-2">Artikel Tidak Ditemukan</h2>
            <p className="text-text-muted text-xs mb-6">Artikel yang Anda cari mungkin telah dipindahkan atau dihapus.</p>
            <Link to="/blog" className="btn-primary text-xs py-2.5 px-5">← Kembali ke Blog</Link>
          </div>
        </div>
      </PublicLayout>
    )
  }

  const dateStr = post.published_at
    ? new Date(post.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Terbaru'

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        <div className="pt-36 sm:pt-40 pb-24 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/10 via-blue-500/5 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="container-narrow max-w-4xl relative z-10">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-text-muted hover:text-brand-primary font-body text-xs font-semibold transition-colors mb-8 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Kembali ke Daftar Artikel</span>
            </Link>

            <article className="bg-white p-8 sm:p-12 md:p-16 rounded-3xl shadow-sm border border-border-minimal">
              <div className="flex items-center gap-3 text-xs text-text-muted mb-6 pb-6 border-b border-border-minimal">
                <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-bold">
                  Artikel Logikraf
                </span>
                <span>•</span>
                <span>{dateStr}</span>
                <span>•</span>
                <span>3 min membaca</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-text-main mb-8 leading-tight tracking-tight">
                {post.title}
              </h1>

              <div className="prose prose-blue max-w-none text-text-main font-body text-base leading-relaxed whitespace-pre-line space-y-4">
                {post.body || post.excerpt}
              </div>

              <div className="mt-12 pt-8 border-t border-border-minimal flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center p-2">
                    <img src="/logo.png" alt="Logikraf" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-main">Editorial Logikraf</h4>
                    <p className="text-[11px] text-text-muted">Digital Strategy &amp; Engineering Team</p>
                  </div>
                </div>
                <Link to="/kontak" className="btn-primary text-xs py-2 px-4 shadow-sm">
                  Konsultasikan Topik Ini 🚀
                </Link>
              </div>
            </article>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
