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
  const [related, setRelated] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then((posts: Post[]) => {
        if (Array.isArray(posts) && posts.length > 0) {
          const found = posts.find(p => p.slug === slug)
          if (found) {
            setPost(found)
            setRelated(posts.filter(p => p.slug !== slug).slice(0, 3))
          }
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-canvas-light pt-40 pb-20">
          <div className="container-narrow max-w-4xl bg-white p-10 rounded-3xl border border-border-minimal animate-pulse h-96" />
        </div>
      </PublicLayout>
    )
  }

  // Fallback rich post content if specific slug is mock
  const activePost = post || {
    id: 1,
    title: 'Arsitektur Software & Inovasi Digital untuk Akselerasi Bisnis Modern',
    slug: slug || 'arsitektur-software-modern',
    excerpt: 'Membedah strategi transformasi digital, integrasi payment gateway QRIS resmi, dan arsitektur aplikasi berkinerja tinggi.',
    body: `Dalam lanskap industri digital yang bergerak cepat saat ini, kecepatan dan keandalan sistem software menjadi faktor penentu utama daya saing sebuah perusahaan. Aplikasi yang dirancang dengan fondasi arsitektur yang kokoh mampu beradaptasi terhadap lonjakan traffic, meminimalkan latensi transaksi, dan memberikan pengalaman pengguna yang tanpa hambatan.

### 1. Fondasi Arsitektur Berkelanjutan
Membangun produk digital yang scalable tidak selalu berarti langsung mengadopsi puluhan microservices yang rumit. Seringkali, pendekatan modular monolith dengan boundary domain yang bersih (Clean Architecture) memberikan keseimbangan optimal antara kecepatan pengembangan awal dan kemudahan pemeliharaan jangka panjang.

### 2. Integrasi Pembayaran Real-Time dengan QRIS Dinamis
Penggunaan QRIS Dinamis telah terbukti meningkatkan conversion rate transaksi online hingga lebih dari 35%. Dengan QRIS dinamis, setiap pesanan memiliki kode QR unik yang secara otomatis mendeteksi status settlement tanpa mengharuskan pelanggan mengunggah bukti transfer manual.

### 3. Pengalaman Pengguna (UI/UX) Berstandar Global
Estetika visual modern yang dipadukan dengan responsivitas tinggi menciptakan rasa percaya (trust) yang kuat bagi calon pelanggan. Desain antarmuka yang intuitif mengurangi cognitive load dan mempercepat alur konversi dari pengunjung menjadi pelanggan setia.`,
    published_at: '2026-08-12',
  }

  const dateStr = activePost.published_at
    ? new Date(activePost.published_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Terbaru'

  const shareTitle = encodeURIComponent(activePost.title)
  const shareUrl = encodeURIComponent(window.location.href)

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        {/* Ambient Top Mesh */}
        <div className="pt-36 sm:pt-40 pb-24 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/10 via-blue-500/5 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="container-narrow max-w-4xl relative z-10">
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted mb-8">
              <Link to="/" className="hover:text-brand-primary">Beranda</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-brand-primary">Artikel &amp; Wawasan</Link>
              <span>/</span>
              <span className="text-text-main truncate max-w-xs">{activePost.title}</span>
            </div>

            {/* Article Main Paper Card */}
            <article className="bg-white p-8 sm:p-12 md:p-16 rounded-3xl shadow-sm border border-border-minimal">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-border-minimal mb-8">
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="px-3.5 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-bold">
                    ★ Insight Redaksi
                  </span>
                  <span>•</span>
                  <span className="font-mono">{dateStr}</span>
                  <span>•</span>
                  <span>4 min membaca</span>
                </div>

                {/* Social Share Buttons */}
                <div className="flex items-center gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center hover:bg-emerald-100 transition-colors text-xs font-bold"
                    title="Bagikan via WhatsApp"
                  >
                    WA
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center hover:bg-blue-100 transition-colors text-xs font-bold"
                    title="Bagikan ke X / Twitter"
                  >
                    𝕏
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center hover:bg-indigo-100 transition-colors text-xs font-bold"
                    title="Bagikan ke LinkedIn"
                  >
                    in
                  </a>
                  <button
                    onClick={copyUrl}
                    className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-text-main text-xs font-semibold transition-colors"
                  >
                    {copied ? '✓ Tersalin' : '🔗 Salin Link'}
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold text-text-main mb-6 leading-tight tracking-tight">
                {activePost.title}
              </h1>

              {/* Key Takeaways Callout */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 mb-10 space-y-2">
                <div className="flex items-center gap-2 text-brand-primary text-xs font-bold uppercase tracking-wider">
                  <span>📌</span>
                  <span>Intisari &amp; Ringkasan Eksekutif</span>
                </div>
                <p className="text-text-main text-xs sm:text-sm leading-relaxed font-body">
                  {activePost.excerpt ||
                    'Pelajari prinsip arsitektur sistem modern, efisiensi pembayaran digital otomatis dengan QRIS, dan peningkatan conversion rate produk digital Anda.'}
                </p>
              </div>

              {/* Article Content */}
              <div className="prose prose-blue max-w-none text-text-main font-body text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-6">
                {activePost.body || activePost.excerpt}
              </div>

              {/* Author Bio Box */}
              <div className="mt-14 pt-8 border-t border-border-minimal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-canvas-overlay p-6 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white font-display font-black flex items-center justify-center text-base shadow-sm">
                    LK
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-main">Tim Redaksi &amp; Engineering Logikraf</h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Ditulis oleh tim arsitek software dan konsultan transformasi digital di PT. Logika Kreatif Indonesia.
                    </p>
                  </div>
                </div>

                <Link
                  to="/kontak"
                  className="btn-primary text-xs py-2 px-4 whitespace-nowrap shadow-sm"
                >
                  Konsultasi Proyek →
                </Link>
              </div>
            </article>

            {/* Related Articles Footer */}
            {related.length > 0 && (
              <div className="mt-16 space-y-6">
                <h3 className="font-display font-bold text-xl text-text-main">
                  Rekomendasi Artikel Lainnya
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {related.map(r => (
                    <Link
                      key={r.id}
                      to={`/blog/${r.slug}`}
                      className="bg-white p-6 rounded-3xl border border-border-minimal shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-2 block">
                          Insight
                        </span>
                        <h4 className="font-bold text-sm text-text-main line-clamp-2 leading-snug mb-2">
                          {r.title}
                        </h4>
                      </div>
                      <span className="text-xs font-bold text-brand-primary mt-4">
                        Baca Selengkapnya →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
