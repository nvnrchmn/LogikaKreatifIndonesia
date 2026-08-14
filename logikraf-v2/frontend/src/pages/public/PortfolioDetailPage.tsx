import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import PublicLayout from '../../components/layout/PublicLayout'

interface Portfolio {
  id: number
  title: string
  slug: string
  excerpt: string
  description: string
  thumbnail: string
  client_name: string
  service_category?: string
}

export default function PortfolioDetailPage() {
  const { slug } = useParams()
  const [item, setItem] = useState<Portfolio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/portfolios')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then((items: Portfolio[]) => {
        const found = items.find(p => p.slug === slug)
        if (found) {
          setItem(found)
        } else {
          setError('Portofolio tidak ditemukan')
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Gagal memuat detail portofolio')
        setLoading(false)
      })
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

  if (error || !item) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-canvas-light pt-40 pb-20 text-center">
          <div className="container-narrow max-w-md bg-white p-8 rounded-3xl border border-border-minimal shadow-sm">
            <h2 className="text-xl font-bold text-text-main mb-2">Proyek Tidak Ditemukan</h2>
            <p className="text-text-muted text-xs mb-6">{error || 'Detail studi kasus tidak tersedia.'}</p>
            <Link to="/portfolio" className="btn-primary text-xs py-2.5 px-5">← Lihat Semua Portofolio</Link>
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-canvas-light">
        <div className="pt-36 sm:pt-40 pb-24 relative overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-brand-primary/10 via-blue-500/5 to-purple-500/5 blur-3xl pointer-events-none rounded-full" />

          <div className="container-narrow max-w-4xl relative z-10">
            <Link
              to="/#portfolio"
              className="inline-flex items-center gap-2 text-text-muted hover:text-brand-primary font-body text-xs font-semibold transition-colors mb-8 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Kembali ke Portofolio</span>
            </Link>

            <article className="bg-white rounded-3xl shadow-sm border border-border-minimal overflow-hidden">
              {item.thumbnail && (
                <div className="aspect-video w-full bg-canvas-dark relative overflow-hidden border-b border-border-minimal">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8 sm:p-12 md:p-14">
                <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-border-minimal">
                  <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold">
                    Studi Kasus Digital
                  </span>
                  {item.client_name && (
                    <span className="text-xs font-semibold text-text-muted">
                      Klien: <strong className="text-text-main">{item.client_name}</strong>
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-text-main mb-6 leading-tight">
                  {item.title}
                </h1>

                <div className="prose prose-blue max-w-none text-text-main font-body text-base leading-relaxed whitespace-pre-line space-y-4">
                  {item.description || item.excerpt}
                </div>

                <div className="mt-12 p-6 sm:p-8 bg-canvas-light rounded-2xl border border-border-minimal flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display font-bold text-base text-text-main">Tertarik Membuat Proyek Serupa?</h3>
                    <p className="text-xs text-text-muted mt-1">Konsultasikan ide Anda bersama tim arsitek software kami.</p>
                  </div>
                  <Link to="/kontak" className="btn-primary text-xs py-2.5 px-5 shadow-sm shrink-0">
                    Mulai Diskusi Proyek 🚀
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
